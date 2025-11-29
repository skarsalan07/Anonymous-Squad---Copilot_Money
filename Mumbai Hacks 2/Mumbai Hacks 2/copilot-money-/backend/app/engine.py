import time
import threading
import yfinance as yf
from sqlmodel import Session, select
from app.db import engine as db_engine
from app.trading_models import AutoTradeRule, Portfolio, Holding, Transaction, Portfolio
from datetime import datetime

class TradingEngine:
    def __init__(self):
        self.running = False
        self.thread = None

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._run_loop, daemon=True)
            self.thread.start()
            print("✅ Trading Engine Started")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()
            print("🛑 Trading Engine Stopped")

    def _run_loop(self):
        while self.running:
            try:
                with Session(db_engine) as session:
                    self._check_rules(session)
            except Exception as e:
                print(f"❌ Error in trading engine loop: {e}")
            
            time.sleep(10) # Check every 10 seconds

    def _check_rules(self, session: Session):
        rules = session.exec(select(AutoTradeRule).where(AutoTradeRule.active == True)).all()
        if not rules:
            return

        print(f"🔄 Engine checking {len(rules)} active rules...")
        
        for rule in rules:
            try:
                # Fetch price
                symbol = rule.symbol
                if symbol == "APPL":
                    symbol = "AAPL"
                
                ticker = yf.Ticker(symbol)
                try:
                    price = ticker.fast_info.last_price
                except:
                    try:
                        hist = ticker.history(period="1d")
                        if not hist.empty:
                            price = hist['Close'].iloc[-1]
                        else:
                            print(f"⚠️ No price data for {symbol}")
                            continue
                    except Exception as e:
                        print(f"⚠️ Failed to fetch price for {symbol}: {e}")
                        continue

                if not price:
                    continue
                
                # Evaluate condition
                # Condition format expected: "price < 150" or "price > 200"
                condition_met = False
                parts = rule.condition.split()
                if len(parts) >= 3 and parts[0] == "price":
                    operator = parts[1]
                    target = float(parts[2])
                    
                    if operator == "<" and price < target:
                        condition_met = True
                    elif operator == ">" and price > target:
                        condition_met = True
                
                if condition_met:
                    print(f"⚡ Rule triggered: {rule.symbol} {rule.action} at {price}")
                    self._execute_trade(session, rule, price)
                    
            except Exception as e:
                print(f"⚠️ Error processing rule {rule.id}: {e}")

    def _execute_trade(self, session: Session, rule: AutoTradeRule, price: float):
        # Get portfolio
        portfolio = session.exec(select(Portfolio).where(Portfolio.user_id == rule.user_id)).first()
        if not portfolio:
            # Create if not exists (though usually should exist)
            portfolio = Portfolio(user_id=rule.user_id)
            session.add(portfolio)
            session.commit()
            session.refresh(portfolio)
            
        cost = price * rule.quantity
        
        if rule.action == "BUY":
            if portfolio.balance >= cost:
                portfolio.balance -= cost
                
                # Update holding
                holding = session.exec(select(Holding).where(Holding.portfolio_id == portfolio.id, Holding.symbol == rule.symbol)).first()
                if holding:
                    total_cost = (holding.quantity * holding.average_price) + cost
                    total_qty = holding.quantity + rule.quantity
                    holding.average_price = total_cost / total_qty
                    holding.quantity = total_qty
                else:
                    holding = Holding(portfolio_id=portfolio.id, symbol=rule.symbol, quantity=rule.quantity, average_price=price)
                    session.add(holding)
                
                self._record_transaction(session, portfolio.id, rule, price)
                rule.active = False # Deactivate after execution
                session.add(rule)
                session.add(portfolio)
                session.commit()
                print(f"✅ Auto-Trade Executed: BUY {rule.symbol}")
                
        elif rule.action == "SELL":
            holding = session.exec(select(Holding).where(Holding.portfolio_id == portfolio.id, Holding.symbol == rule.symbol)).first()
            if holding and holding.quantity >= rule.quantity:
                portfolio.balance += cost
                holding.quantity -= rule.quantity
                if holding.quantity == 0:
                    session.delete(holding)
                
                self._record_transaction(session, portfolio.id, rule, price)
                rule.active = False
                session.add(rule)
                session.add(portfolio)
                session.commit()
                print(f"✅ Auto-Trade Executed: SELL {rule.symbol}")

    def _record_transaction(self, session: Session, portfolio_id: int, rule: AutoTradeRule, price: float):
        txn = Transaction(
            portfolio_id=portfolio_id,
            symbol=rule.symbol,
            type=rule.action,
            quantity=rule.quantity,
            price=price,
            timestamp=datetime.utcnow()
        )
        session.add(txn)

trading_engine = TradingEngine()
