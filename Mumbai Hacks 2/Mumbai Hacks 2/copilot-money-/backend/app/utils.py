import re
from typing import Optional

TICKER_REGEX = re.compile(r"\b([A-Z]{1,5})(?:\b|$)")

def extract_ticker_from_text(text: str) -> Optional[str]:
    # naive: find first uppercase token 1-5 chars (ex: AAPL, TSLA)
    m = TICKER_REGEX.search(text)
    if m:
        return m.group(1)
    return None
