from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

# Use Supabase PostgreSQL if available, otherwise fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data_v2.db")

# Fallback to SQLite if PostgreSQL host is unreachable
if "postgresql" in DATABASE_URL:
    try:
        import socket
        from urllib.parse import urlparse
        hostname = urlparse(DATABASE_URL).hostname
        if hostname:
            socket.gethostbyname(hostname)
    except Exception as e:
        print(f"⚠️ Could not resolve host for {DATABASE_URL}: {e}")
        print("⚠️ Falling back to SQLite")
        DATABASE_URL = "sqlite:///./data_v2.db"

# Configure connection arguments based on database type
connect_args = {}
if "sqlite" in DATABASE_URL.lower():
    connect_args = {"check_same_thread": False}
elif "postgresql" in DATABASE_URL.lower():
    # PostgreSQL connection pool settings
    connect_args = {
        "connect_timeout": 10,
    }

engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=5,  # Connection pool size
    max_overflow=10  # Max connections beyond pool_size
)

from app.models import ChatSession, ChatMessage, Preference
from app.trading_models import Portfolio, Holding, Transaction, AutoTradeRule

async def init_db():
    # For simple apps, synchronous table creation is fine
    print("Creating tables:", SQLModel.metadata.tables.keys())
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
