import React from 'react';
import '@/styles/TradesChat.css';

interface NewsItem {
    title: string;
    summary?: string;
    source?: string;
    url?: string;
    date?: string;
    sentiment?: string;
}

interface NewsCarouselProps {
    newsItems: NewsItem[];
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({ newsItems }) => {
    if (!newsItems || newsItems.length === 0) return null;

    // Helper to ensure URL is absolute
    const getSafeUrl = (url?: string, title?: string) => {
        if (!url) return `https://www.google.com/search?q=${encodeURIComponent(title || '')}`;
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    // Helper for sentiment color
    const getSentimentClass = (sentiment?: string) => {
        if (!sentiment) return '';
        const s = sentiment.toLowerCase();
        if (s.includes('positive')) return 'sentiment-positive';
        if (s.includes('negative')) return 'sentiment-negative';
        return 'sentiment-neutral';
    };

    return (
        <div className="news-carousel-container">
            <div className="news-carousel">
                {newsItems.map((item, index) => (
                    <a
                        key={index}
                        href={getSafeUrl(item.url, item.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-card"
                    >
                        <div className="news-content">
                            <div className="news-card-header">
                                <div className="news-source-row">
                                    <div className="news-source">
                                        <span>{item.source || 'News'}</span>
                                    </div>
                                    {item.sentiment && (
                                        <span className={`news-sentiment ${getSentimentClass(item.sentiment)}`}>
                                            {item.sentiment}
                                        </span>
                                    )}
                                </div>
                                {item.date && <span className="news-date">{item.date}</span>}
                            </div>
                            <h3 className="news-title">{item.title}</h3>
                            {item.summary && (
                                <p className="news-summary">{item.summary}</p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsCarousel;
