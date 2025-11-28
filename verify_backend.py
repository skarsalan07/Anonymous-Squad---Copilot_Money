import requests
import uuid
import json

BASE_URL = "http://localhost:8000"
USER_ID = f"test_user_{uuid.uuid4()}"

def test_backend():
    print(f"Testing with User ID: {USER_ID}")

    # 1. Create a new chat session via /trades
    print("\n1. Testing POST /trades (New Session)...")
    payload = {
        "query": "Hello, this is a test message.",
        "user_id": USER_ID,
        "session_id": None
    }
    try:
        response = requests.post(f"{BASE_URL}/trades", json=payload)
        response.raise_for_status()
        data = response.json()
        print("Response:", json.dumps(data, indent=2))
        
        session_id = data.get("session_id")
        if not session_id:
            print("FAILED: No session_id returned.")
            return
        print(f"SUCCESS: Created session {session_id}")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    # 2. Get Sessions for User
    print(f"\n2. Testing GET /sessions/{USER_ID}...")
    try:
        response = requests.get(f"{BASE_URL}/sessions/{USER_ID}")
        response.raise_for_status()
        data = response.json()
        print("Response:", json.dumps(data, indent=2))
        
        sessions = data.get("sessions", [])
        if not any(s["session_id"] == session_id for s in sessions):
            print("FAILED: Created session not found in user sessions.")
            return
        print("SUCCESS: Session found in list.")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    # 3. Get Messages for Session
    print(f"\n3. Testing GET /sessions/{session_id}/messages...")
    try:
        response = requests.get(f"{BASE_URL}/sessions/{session_id}/messages")
        response.raise_for_status()
        data = response.json()
        print("Response:", json.dumps(data, indent=2))
        
        messages = data.get("messages", [])
        if len(messages) < 2: # Should have user query and assistant response
            print("FAILED: Expected at least 2 messages.")
            return
        print("SUCCESS: Messages retrieved.")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    # 4. Delete Session
    print(f"\n4. Testing DELETE /sessions/{session_id}...")
    try:
        response = requests.delete(f"{BASE_URL}/sessions/{session_id}")
        response.raise_for_status()
        print("SUCCESS: Session deleted.")
    except Exception as e:
        print(f"FAILED: {e}")
        return

    # 5. Verify Deletion
    print(f"\n5. Verifying Deletion (GET /sessions/{USER_ID})...")
    try:
        response = requests.get(f"{BASE_URL}/sessions/{USER_ID}")
        response.raise_for_status()
        data = response.json()
        sessions = data.get("sessions", [])
        if any(s["session_id"] == session_id for s in sessions):
            print("FAILED: Session still exists after deletion.")
            return
        print("SUCCESS: Session verified deleted.")
    except Exception as e:
        print(f"FAILED: {e}")
        return

if __name__ == "__main__":
    test_backend()
