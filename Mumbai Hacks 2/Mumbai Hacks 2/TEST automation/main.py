import requests
import json
import time
from datetime import datetime
import csv
import os

class StockTradingBot:
    def __init__(self, api_key, initial_balance=10000):
        self.api_key = "4M919YMMBD39BRFO"
        self.balance = initial_balance
        self.portfolio = {}
        self.trade_history = []
        self.base_url = "https://www.alphavantage.co/query"
        
    def get_stock_price(self, symbol):
        """Fetch real-time stock price"""
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key
            }
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if "Global Quote" in data and data["Global Quote"]:
                return float(data["Global Quote"]["05. price"])
            return None
        except Exception as e:
            print(f"Error fetching price: {e}")
            return None
    
    def get_sma(self, symbol, interval="60min", time_period=20):
        """Get Simple Moving Average"""
        try:
            params = {
                "function": "SMA",
                "symbol": symbol,
                "interval": interval,
                "time_period": time_period,
                "series_type": "close",
                "apikey": self.api_key
            }
            response = requests.get(self.base_url, params=params)
            data = response.json()
            
            if "Technical Analysis: SMA" in data:
                latest = list(data["Technical Analysis: SMA"].values())[0]
                return float(latest["SMA"])
            return None
        except Exception as e:
            print(f"Error fetching SMA: {e}")
            return None
    
    def calculate_signal(self, symbol):
        """Calculate buy/sell signal using simple moving average crossover"""
        current_price = self.get_stock_price(symbol)
        if current_price is None:
            return None, None
        
        time.sleep(12)  # Alpha Vantage free tier: 5 calls/min
        sma = self.get_sma(symbol)
        
        if sma is None:
            return None, current_price
        
        # Simple strategy: Buy if price > SMA, Sell if price < SMA
        if current_price > sma * 1.02:  # 2% above SMA
            return "BUY", current_price
        elif current_price < sma * 0.98:  # 2% below SMA
            return "SELL", current_price
        else:
            return "HOLD", current_price
    
    def buy_stock(self, symbol, quantity, price):
        """Execute buy order"""
        total_cost = quantity * price
        
        if total_cost > self.balance:
            print(f"Insufficient balance. Need ${total_cost:.2f}, have ${self.balance:.2f}")
            return False
        
        self.balance -= total_cost
        if symbol in self.portfolio:
            self.portfolio[symbol]["quantity"] += quantity
            self.portfolio[symbol]["avg_price"] = (
                (self.portfolio[symbol]["avg_price"] * (self.portfolio[symbol]["quantity"] - quantity) + 
                 price * quantity) / self.portfolio[symbol]["quantity"]
            )
        else:
            self.portfolio[symbol] = {"quantity": quantity, "avg_price": price}
        
        trade = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "action": "BUY",
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "total": total_cost,
            "balance": self.balance
        }
        self.trade_history.append(trade)
        self.save_trade_to_csv(trade)
        
        print(f"✓ BUY: {quantity} shares of {symbol} at ${price:.2f} | Total: ${total_cost:.2f}")
        return True
    
    def sell_stock(self, symbol, quantity, price):
        """Execute sell order"""
        if symbol not in self.portfolio or self.portfolio[symbol]["quantity"] < quantity:
            print(f"Insufficient shares of {symbol}")
            return False
        
        total_revenue = quantity * price
        self.balance += total_revenue
        self.portfolio[symbol]["quantity"] -= quantity
        
        if self.portfolio[symbol]["quantity"] == 0:
            del self.portfolio[symbol]
        
        trade = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "action": "SELL",
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "total": total_revenue,
            "balance": self.balance
        }
        self.trade_history.append(trade)
        self.save_trade_to_csv(trade)
        
        print(f"✓ SELL: {quantity} shares of {symbol} at ${price:.2f} | Total: ${total_revenue:.2f}")
        return True
    
    def save_trade_to_csv(self, trade):
        """Save trade to CSV file"""
        file_exists = os.path.isfile('trades.csv')
        
        with open('trades.csv', 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=trade.keys())
            if not file_exists:
                writer.writeheader()
            writer.writerow(trade)
    
    def get_portfolio_value(self):
        """Calculate total portfolio value"""
        total = self.balance
        for symbol, data in self.portfolio.items():
            current_price = self.get_stock_price(symbol)
            if current_price:
                total += data["quantity"] * current_price
            time.sleep(12)
        return total
    
    def run_strategy(self, symbols, quantity_per_trade=1):
        """Run automated trading strategy"""
        print(f"\n{'='*60}")
        print(f"Starting Trading Bot - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Initial Balance: ${self.balance:.2f}")
        print(f"{'='*60}\n")
        
        for symbol in symbols:
            print(f"\nAnalyzing {symbol}...")
            signal, price = self.calculate_signal(symbol)
            
            if signal is None or price is None:
                print(f"Could not analyze {symbol}")
                continue
            
            print(f"Signal: {signal} | Current Price: ${price:.2f}")
            
            if signal == "BUY":
                self.buy_stock(symbol, quantity_per_trade, price)
            elif signal == "SELL" and symbol in self.portfolio:
                quantity = min(quantity_per_trade, self.portfolio[symbol]["quantity"])
                self.sell_stock(symbol, quantity, price)
            else:
                print(f"HOLD - No action taken")
            
            time.sleep(12)  # Rate limiting
        
        print(f"\n{'='*60}")
        print(f"Current Balance: ${self.balance:.2f}")
        print(f"Portfolio: {self.portfolio}")
        print(f"{'='*60}\n")
    
    def get_status(self):
        """Get current bot status"""
        return {
            "balance": self.balance,
            "portfolio": self.portfolio,
            "trade_count": len(self.trade_history),
            "recent_trades": self.trade_history[-5:] if self.trade_history else []
        }


if __name__ == "__main__":
    # Get API key from user
    API_KEY = input("Enter your Alpha Vantage API Key (get free at https://www.alphavantage.co/support/#api-key): ")
    
    # Initialize bot
    bot = StockTradingBot(api_key=API_KEY, initial_balance=10000)
    
    # Symbols to trade
    symbols = ["AAPL", "MSFT", "GOOGL"]
    
    # Run the strategy
    print("\n🤖 Stock Trading Bot Started!")
    print("This demo will run one trading cycle.")
    print("In production, you would run this in a loop with time intervals.\n")
    
    bot.run_strategy(symbols, quantity_per_trade=5)
    
    # Display final status
    status = bot.get_status()
    print("\n📊 Final Status:")
    print(f"Balance: ${status['balance']:.2f}")
    print(f"Portfolio: {status['portfolio']}")
    print(f"Total Trades: {status['trade_count']}")