
import { TrendingUp, Globe, AlertCircle, Newspaper } from "lucide-react";

export interface FeedItem {
    category: string;
    headline: string;
    summary: string;
    sentiment: "Optimistic" | "Neutral" | "Cautious";
    source: string;
    time: string;
    icon: any;
    link: string;
}

const RSS_URL = "https://finance.yahoo.com/news/rssindex";
const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

const determineSentiment = (text: string): "Optimistic" | "Neutral" | "Cautious" => {
    const lowerText = text.toLowerCase();
    const optimisticKeywords = ["surge", "jump", "gain", "record", "bull", "growth", "profit", "up", "rise", "positive", "strong"];
    const cautiousKeywords = ["drop", "fall", "decline", "bear", "loss", "risk", "down", "negative", "weak", "concern", "warning", "crash"];

    let score = 0;
    optimisticKeywords.forEach(word => {
        if (lowerText.includes(word)) score++;
    });
    cautiousKeywords.forEach(word => {
        if (lowerText.includes(word)) score--;
    });

    if (score > 0) return "Optimistic";
    if (score < 0) return "Cautious";
    return "Neutral";
};

const getCategory = (title: string): string => {
    if (title.includes("Stock") || title.includes("Market")) return "Market Update";
    if (title.includes("Crypto") || title.includes("Bitcoin")) return "Crypto";
    if (title.includes("Economy") || title.includes("Fed") || title.includes("Rate")) return "Macro Economy";
    if (title.includes("Tech") || title.includes("AI")) return "Technology";
    return "General News";
};

const getIcon = (category: string) => {
    switch (category) {
        case "Market Update": return TrendingUp;
        case "Macro Economy": return Globe;
        case "Crypto": return AlertCircle; // Or another relevant icon
        default: return Newspaper;
    }
};

const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const fetchFinancialNews = async (): Promise<FeedItem[]> => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.status === "ok") {
            return data.items.map((item: any) => {
                const sentiment = determineSentiment(item.title + " " + item.description);
                const category = getCategory(item.title);

                // Clean up description (remove HTML tags if any)
                const summary = item.description.replace(/<[^>]*>?/gm, '').slice(0, 300) + "...";

                return {
                    category,
                    headline: item.title,
                    summary,
                    sentiment,
                    source: data.feed.title || "Yahoo Finance",
                    time: timeAgo(item.pubDate),
                    icon: getIcon(category),
                    link: item.link
                };
            });
        } else {
            console.error("Failed to fetch news:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};
