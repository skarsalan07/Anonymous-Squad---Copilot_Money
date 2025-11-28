import React from 'react';
import '@/styles/TradesChat.css';

interface Stock {
    symbol: string;
    name: string;
    type?: string;
    risk_level?: string;
    match_reason?: string;
    reason?: string;
    source?: string;
}

interface StockCarouselProps {
    stocks: Stock[];
    onSelect: (symbol: string) => void;
}

const StockCarousel: React.FC<StockCarouselProps> = ({ stocks, onSelect }) => {
    if (!stocks || stocks.length === 0) return null;

    const getRiskClass = (level?: string) => {
        if (!level) return '';
        const l = level.toLowerCase();
        if (l.includes('low')) return 'risk-low';
        if (l.includes('medium')) return 'risk-medium';
        if (l.includes('high')) return 'risk-high';
        return '';
    };

    return (
        <div className="stock-carousel-container">
            <div className="stock-carousel">
                {stocks.map((stock, index) => (
                    <div
                        key={index}
                        className="stock-card"
                        onClick={() => onSelect(stock.symbol)}
                    >
                        <div className="stock-card-header">
                            <div>
                                <div className="stock-symbol">{stock.symbol}</div>
                                <div className="stock-type">{stock.type}</div>
                            </div>
                            {stock.risk_level && (
                                <div className={`risk-badge ${getRiskClass(stock.risk_level)}`}>
                                    {stock.risk_level}
                                </div>
                            )}
                        </div>
                        <div className="stock-name">{stock.name}</div>

                        {stock.match_reason && (
                            <div className="stock-match-reason">
                                <span className="match-icon">🎯</span> {stock.match_reason}
                            </div>
                        )}

                        <div className="stock-reason">{stock.reason}</div>
                        {stock.source && (
                            <div className="stock-source">
                                <span>via {stock.source}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockCarousel;
