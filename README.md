# 🚀 Copilot_Money - Your AI-Powered Investment Psychologist

<div align="center">

![Copilot Money Banner](https://img.shields.io/badge/Mumbai%20Hacks%202-Finalist-FFD700?style=for-the-badge&logo=trophy)
![AI-Powered](https://img.shields.io/badge/AI--Powered-Groq-blueviolet?style=for-the-badge&logo=openai)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**Transforming financial chaos into crystal-clear wisdom.**
*Don't just trade. Trade with conviction.*

[View Demo](#-demo) • [The Problem](#-the-problem--the-paradox) • [Architecture](#-high-level-architecture) • [Run Locally](#-quick-start)

</div>

---

## 💡 The Problem: The Paradox of Choice

Every day, millions of Indian retail investors face a paradox. They have more access to information than ever before—broker tips, flashy news headlines, and constant app alerts. Yet, this **Information Overload** leaves them confused, not confident.

This pushes investors into two dangerous traps:
1.  **The Analysis Paralysis Trap:** Fear of making a misstep leads to inaction, watching opportunities pass by.
2.  **The FOMO Trap:** Hype-driven, emotional decisions that lead to painful losses.

**The missing piece isn't more data. It's a trusted guide.**

---

## 💎 The Solution: Copilot_Money

**Copilot_Money** is an intelligent source of truth designed to cut through the noise. We built a 3-step engine to turn chaos into actionable wealth creation:

1.  **Gather Intelligence:** We aggregate data from trusted brokers, financial analysts, and real-time market news.
2.  **Find the Signal (AI):** Our Groq-powered LLM stress-tests ideas, compares conflicting viewpoints, and performs sentiment analysis to find high-conviction opportunities.
3.  **Actionable Guidance:** We translate complex analysis into simple "Buy, Sell, or Hold" signals, with an automated engine to execute trades or paper-trade risk-free.

---

## 🏗 High-Level Architecture

We designed a modular, event-driven architecture to handle real-time market data and AI processing simultaneously.

```mermaid
graph TD
    subgraph Client_Side
        UI[React + Vite UI]
        Voice[Voice Input/Output]
    end

    subgraph API_Gateway
        FastAPI[FastAPI Backend]
        Auth[Supabase Auth]
    end

    subgraph Intelligence_Layer
        Groq[Groq LLM Engine]
        Sent[Sentiment Analyzer]
    end

    subgraph Data_Aggregator
        Yahoo[Yahoo Finance API]
        News[DuckDuckGo News]
        DB[(PostgreSQL/SQLite)]
    end

    subgraph Execution_Engine
        Paper[Paper Trading Sim]
        Rules[Rule-Based Trigger]
    end

    UI -->|REST/WebSockets| FastAPI
    Voice -->|Audio Stream| FastAPI
    FastAPI -->|Validate| Auth
    FastAPI -->|Query| Groq
    FastAPI -->|Fetch Data| Yahoo
    FastAPI -->|Fetch News| News
    FastAPI -->|Store/Retrieve| DB
    
    Groq -->|Context| DB
    Groq -->|Analyze| Sent
    
    FastAPI -->|Execute| Execution_Engine
    Execution_Engine -->|Update Portfolio| DB
