# Copilot Money Hub - Run Guide

This repository contains the full source code for the Copilot Money Hub application, including the frontend and backend.

## Prerequisites

- Node.js (v18 or later)
- Python (v3.10 or later)
- PostgreSQL (Optional, defaults to SQLite if not configured)

## Directory Structure

- **Frontend**: `copilot-money-hub/`
- **Backend**: `Mumbai Hacks 2/Mumbai Hacks 2/copilot-money-/backend/`

## 1. Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd "Mumbai Hacks 2/Mumbai Hacks 2/copilot-money-/backend"
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure Environment Variables:
   - Create a `.env` file in the backend directory.
   - Add your API keys (GROQ_API_KEY, etc.) and Database URL.

5. Run the server:
   ```bash
   python main.py
   ```
   The backend will start at `http://localhost:8000`.

## 2. Setting up the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd copilot-money-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:8080` (or similar).

## 3. Accessing the App

Open your browser and navigate to the frontend URL (usually `http://localhost:8080`).
The app will connect to the backend running on port 8000.
