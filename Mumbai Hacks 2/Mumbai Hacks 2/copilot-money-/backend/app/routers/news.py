from fastapi import APIRouter, HTTPException
from app.groq_client import ask_groq
import json

router = APIRouter()

@router.get("/ticker/{ticker}")
def news_for_ticker(ticker: str):
    # Build prompt: ask Groq to search web and return JSON array of news items
    prompt = f"""
Find the 6 most recent news articles about the stock ticker '{ticker}' (include Indian markets + international news that affects that company). For each article return a JSON object with keys:
- title
- source
- timestamp (ISO8601 if possible)
- summary (1-2 sentences)
- sentiment (positive|negative|neutral)
- impact (high|medium|low)
- url

Return a JSON array only. Do not add commentary.
"""
    resp = ask_groq(prompt)
    text = resp["content"]

    # try to parse JSON from assistant
    try:
        parsed = json.loads(text)
        return parsed
    except Exception:
        # try to extract JSON in text
        import re
        m = re.search(r"(\[.*\])", text, re.S)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                pass
    # fallback: return minimal message
    raise HTTPException(500, detail="Unable to parse news results from LLM")
