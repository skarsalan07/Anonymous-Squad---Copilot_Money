from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/chart/{ticker}")
def get_chart(ticker: str, days: int = 30):
    try:
        ticker_obj = yf.Ticker(ticker)
        # get historical data
        hist = ticker_obj.history(period=f"{days}d")
        if hist.empty:
            raise HTTPException(404, detail="No chart data")
        # convert to simple format expected by frontend: [{time: 'YYYY-MM-DD', value: price}, ...]
        data = []
        for idx, row in hist.iterrows():
            data.append({
                "time": idx.strftime("%Y-%m-%d"),
                "value": float(row["Close"]),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"])
            })
        current = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2]) if len(hist) > 1 else current
        change = current - prev
        change_percent = (change / prev) * 100 if prev != 0 else 0.0
        return {"ticker": ticker, "data": data, "currentPrice": current, "change": change, "changePercent": change_percent}
    except Exception as e:
        raise HTTPException(500, detail=str(e))
