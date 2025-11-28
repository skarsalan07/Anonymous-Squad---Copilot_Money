from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import uuid

class Portfolio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    balance: float = Field(default=100000.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    holdings: List["Holding"] = Relationship(back_populates="portfolio")
    transactions: List["Transaction"] = Relationship(back_populates="portfolio")

class Holding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id")
    symbol: str = Field(index=True)
    quantity: int
    average_price: float
    
    portfolio: Optional[Portfolio] = Relationship(back_populates="holdings")

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id")
    symbol: str
    type: str # "BUY" or "SELL"
    quantity: int
    price: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    portfolio: Optional[Portfolio] = Relationship(back_populates="transactions")

class AutoTradeRule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    symbol: str
    condition: str # e.g. "price < 150"
    action: str # "BUY" or "SELL"
    quantity: int
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
