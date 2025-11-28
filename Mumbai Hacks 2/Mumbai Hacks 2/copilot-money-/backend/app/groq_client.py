import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("Please set GROQ_API_KEY in environment variables (.env)")

client = Groq(api_key=GROQ_API_KEY)

def ask_groq(prompt: str, model: str = "llama-3.1-8b-instant", temperature: float = 0.2, max_tokens: int = 512):
    messages = [
        {"role": "system", "content": "You are an expert trading assistant. Return concise JSON when requested."},
        {"role": "user", "content": prompt},
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    result = response.choices[0].message.content
    executed = getattr(response.choices[0].message, "executed_tools", None)
    return {"content": result, "executed_tools": executed}
