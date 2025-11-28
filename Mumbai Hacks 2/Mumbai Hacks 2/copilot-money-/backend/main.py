from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from app.db import init_db
from app.routers import chat, preferences, news, stocks, trades, trading

app = FastAPI(title="TradeAI Backend")

# CORS - allow your frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ Database initialized")

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["preferences"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])

from app.engine import trading_engine

@app.on_event("startup")
async def start_engine():
    trading_engine.start()

@app.on_event("shutdown")
async def stop_engine():
    trading_engine.stop()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=os.getenv("API_HOST", "127.0.0.1"), port=int(os.getenv("API_PORT", 8000)), reload=True)
