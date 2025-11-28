import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_chat():
    print("Testing Chat API...")
    
    # 1. Create Session
    try:
        resp = requests.post(f"{BASE_URL}/chat/sessions", json={"title": "Test Session"})
        print(f"Create Session Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error: {resp.text}")
            return
        
        session_id = resp.json()["session_id"]
        print(f"Session ID: {session_id}")
        
        # 2. Send Message
        msg = {"content": "What is the price of AAPL?"}
        print(f"Sending message: {msg}")
        resp = requests.post(f"{BASE_URL}/chat/sessions/{session_id}/messages", json=msg)
        print(f"Send Message Status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error: {resp.text}")
            return
            
        print("Response:", json.dumps(resp.json(), indent=2))
        
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_chat()
