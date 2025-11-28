from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db import get_session
from app.trading_models import Portfolio, Holding, Transaction, AutoTradeRule
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import yfinance as yf
import requests
import os
from groq import Groq
import json

router = APIRouter()

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# --- Schemas ---
class TradeRequest(BaseModel):
    user_id: str
    symbol: str
    type: str # "BUY" or "SELL"
    quantity: int
    price: Optional[float] = None # If None, use market price
    stop_loss: Optional[float] = None
    target_price: Optional[float] = None

class RuleRequest(BaseModel):
    user_id: str
    symbol: str
    condition: str
    action: str
    quantity: int

class PortfolioResponse(BaseModel):
    balance: float
    total_value: float
    holdings: List[dict]
    total_pl: float
    total_pl_percent: float

# --- Helper ---
def get_or_create_portfolio(user_id: str, db: Session) -> Portfolio:
    portfolio = db.exec(select(Portfolio).where(Portfolio.user_id == user_id)).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user_id)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio

def get_current_price(symbol: str) -> float:
    try:
        ticker = yf.Ticker(symbol)
        return ticker.fast_info.last_price
    except:
        return 0.0

@router.get("/search")
def search_symbols(query: str):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        resp = requests.get(url, headers=headers)
        data = resp.json()
        
        results = []
        for quote in data.get("quotes", []):
            if "symbol" in quote:
                results.append({
                    "symbol": quote["symbol"],
                    "name": quote.get("shortname") or quote.get("longname") or quote["symbol"],
                    "type": quote.get("quoteType", "EQUITY"),
                    "exchange": quote.get("exchange", "")
                })
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return []

@router.get("/price/{symbol}")
def get_price(symbol: str):
    price = get_current_price(symbol)
    return {"symbol": symbol, "price": price}

# --- Endpoints ---

@router.get("/paper/portfolio/{user_id}", response_model=PortfolioResponse)
def get_portfolio(user_id: str, db: Session = Depends(get_session)):
    portfolio = get_or_create_portfolio(user_id, db)
    
    holdings_data = []
    total_holdings_value = 0.0
    
    for holding in portfolio.holdings:
        current_price = get_current_price(holding.symbol)
        current_value = holding.quantity * current_price
        invested_value = holding.quantity * holding.average_price
        pl = current_value - invested_value
        pl_percent = (pl / invested_value * 100) if invested_value > 0 else 0
        
        holdings_data.append({
            "symbol": holding.symbol,
            "quantity": holding.quantity,
            "avg_price": holding.average_price,
            "current_price": current_price,
            "current_value": current_value,
            "pl": pl,
            "pl_percent": pl_percent
        })
        total_holdings_value += current_value
        
    total_value = portfolio.balance + total_holdings_value
    # Assuming initial balance was 100000 for PL calc, or we track deposits. 
    # For simplicity, let's just sum PL of holdings + (balance - initial_balance) if we tracked that.
    # But simpler: Total PL = Current Total Value - Initial Balance (100k)
    total_pl = total_value - 100000.0 
    total_pl_percent = (total_pl / 100000.0) * 100
    
    return PortfolioResponse(
        balance=portfolio.balance,
        total_value=total_value,
        holdings=holdings_data,
        total_pl=total_pl,
        total_pl_percent=total_pl_percent
    )

@router.post("/paper/trade")
def place_trade(req: TradeRequest, db: Session = Depends(get_session)):
    portfolio = get_or_create_portfolio(req.user_id, db)
    
    price = req.price
    # If price is provided for BUY, it's a LIMIT order -> Create Rule
    if req.type == "BUY" and price is not None:
        rule = AutoTradeRule(
            user_id=req.user_id,
            symbol=req.symbol,
            condition=f"price < {price}",
            action="BUY",
            quantity=req.quantity
        )
        db.add(rule)
        db.commit()
        return {"success": True, "message": f"Buy Limit order placed for {req.symbol} at {price}"}

    # Market Order (or Sell Market)
    if not price:
        price = get_current_price(req.symbol)
        if price == 0:
            raise HTTPException(status_code=400, detail="Could not fetch market price")
            
    cost = price * req.quantity
    
    if req.type == "BUY":
        if portfolio.balance < cost:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        
        portfolio.balance -= cost
        
        # Update or create holding
        holding = db.exec(select(Holding).where(Holding.portfolio_id == portfolio.id, Holding.symbol == req.symbol)).first()
        if holding:
            # Avg price calculation
            total_cost = (holding.quantity * holding.average_price) + cost
            total_qty = holding.quantity + req.quantity
            holding.average_price = total_cost / total_qty
            holding.quantity = total_qty
        else:
            holding = Holding(portfolio_id=portfolio.id, symbol=req.symbol, quantity=req.quantity, average_price=price)
            db.add(holding)
            
    elif req.type == "SELL":
        holding = db.exec(select(Holding).where(Holding.portfolio_id == portfolio.id, Holding.symbol == req.symbol)).first()
        if not holding or holding.quantity < req.quantity:
            raise HTTPException(status_code=400, detail="Insufficient holdings")
            
        portfolio.balance += cost
        holding.quantity -= req.quantity
        if holding.quantity == 0:
            db.delete(holding)
            
    # Record transaction
    txn = Transaction(
        portfolio_id=portfolio.id,
        symbol=req.symbol,
        type=req.type,
        quantity=req.quantity,
        price=price
    )
    db.add(txn)
    db.add(portfolio)
    db.commit()
    
    return {"success": True, "message": f"{req.type} order executed for {req.symbol} at {price}"}

@router.get("/paper/history/{user_id}")
def get_history(user_id: str, db: Session = Depends(get_session)):
    portfolio = get_or_create_portfolio(user_id, db)
    
    # 1. Executed Transactions
    txns = db.exec(select(Transaction).where(Transaction.portfolio_id == portfolio.id).order_by(Transaction.timestamp.desc())).all()
    
    # 2. Pending Rules
    rules = db.exec(select(AutoTradeRule).where(AutoTradeRule.user_id == user_id, AutoTradeRule.active == True)).all()
    
    history = []
    
    # Add Pending Rules
    for r in rules:
        # Extract price from condition if possible
        target_price = 0.0
        try:
            parts = r.condition.split()
            if len(parts) >= 3:
                target_price = float(parts[2])
        except:
            pass
            
        history.append({
            "id": f"rule-{r.id}",
            "symbol": r.symbol,
            "type": r.action,
            "quantity": r.quantity,
            "price": target_price,
            "timestamp": r.created_at,
            "status": "PENDING"
        })
        
    # Add Executed Transactions
    for t in txns:
        history.append({
            "id": f"txn-{t.id}",
            "symbol": t.symbol,
            "type": t.type,
            "quantity": t.quantity,
            "price": t.price,
            "timestamp": t.timestamp,
            "status": "EXECUTED"
        })
        
    # Sort by timestamp desc
    history.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return history

# --- Auto Trade Rules ---

@router.post("/auto-trade/rules")
def add_rule(rule: RuleRequest, db: Session = Depends(get_session)):
    new_rule = AutoTradeRule(
        user_id=rule.user_id,
        symbol=rule.symbol,
        condition=rule.condition,
        action=rule.action,
        quantity=rule.quantity
    )
    db.add(new_rule)
    db.commit()
    return {"success": True, "id": new_rule.id}

@router.get("/auto-trade/rules/{user_id}")
def get_rules(user_id: str, db: Session = Depends(get_session)):
    rules = db.exec(select(AutoTradeRule).where(AutoTradeRule.user_id == user_id)).all()
    return rules

@router.delete("/auto-trade/rules/{rule_id}")
def delete_rule(rule_id: int, db: Session = Depends(get_session)):
    rule = db.get(AutoTradeRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"success": True}

# --- AI Rebalancing ---

@router.get("/rebalance/{user_id}")
def get_rebalancing_suggestions(user_id: str, db: Session = Depends(get_session)):
    portfolio = get_or_create_portfolio(user_id, db)
    holdings = db.exec(select(Holding).where(Holding.portfolio_id == portfolio.id)).all()
    
    if not holdings:
        return []
        
    # Prepare portfolio data for LLM
    portfolio_text = "Current Portfolio:\n"
    total_value = 0
    for h in holdings:
        current_price = get_current_price(h.symbol)
        value = h.quantity * current_price
        total_value += value
        portfolio_text += f"- {h.symbol}: {h.quantity} shares, Value: ₹{value:.2f}\n"
        
    portfolio_text += f"Total Portfolio Value: ₹{total_value:.2f}\n"
    
    prompt = f"""
    You are a financial advisor. Analyze the following portfolio and provide 3 specific rebalancing suggestions to improve diversification and reduce risk.
    Focus on Indian stocks if possible or general sectors.
    
    {portfolio_text}
    
    Return the response ONLY as a JSON array of objects with the following keys:
    - action: Short title of the action (e.g., "Reduce Tech exposure")
    - from: Symbol or Sector to reduce (e.g., "TCS" or "Cash")
    - to: Symbol or Sector to increase (e.g., "HDFCBANK")
    - rationale: Brief explanation of why.
    - impact: Expected impact (e.g., "+2.3% expected return" or "Lower risk").
    
    Do not include any markdown formatting or code blocks. Just the raw JSON string.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful financial trading assistant. Output valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
        )
        
        response_content = chat_completion.choices[0].message.content
        # Clean up potential markdown code blocks if present
        response_content = response_content.replace("```json", "").replace("```", "").strip()
        suggestions = json.loads(response_content)
        return suggestions
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        # Fallback suggestions if LLM fails
        return [
            {
                "action": "Diversify Portfolio",
                "from": "Cash",
                "to": "NIFTYBEES",
                "rationale": "Add index exposure for stability.",
                "impact": "Market correlation"
            }
        ]
