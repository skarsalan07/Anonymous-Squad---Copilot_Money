import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsCarousel } from "./NewsCarousel";
import { StockChart } from "./StockChart";
import { RecommendationView } from "./RecommendationView";
import { MarketAnalysisView } from "./MarketAnalysisView";
import { StockResearchView } from "./StockResearchView";
import { TradeAnalysisView } from "./TradeAnalysisView";
import { Button } from "@/components/ui/button";

interface NewsItem {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    sentiment: "positive" | "negative" | "neutral";
    impact: "high" | "medium" | "low";
    summary: string;
    url?: string;
}

interface ChartData {
    ticker: string;
    data: Array<{ time: string; value: number }>;
    currentPrice: number;
    change: number;
    changePercent: number;
    period?: string;
}

interface ChatMessageProps {
    role: "user" | "assistant";
    content?: string;
    timestamp?: string;
    news?: {
        ticker: string;
        items: NewsItem[];
    };
    chart?: ChartData;
    type?: string;
    data?: any;
    data?: any;
    onOptionSelect?: (value: string) => void;
    onAutomate?: (stocks: any[]) => void;
}

export function ChatMessage({ role, content, timestamp, news, chart, type, data, onOptionSelect, onAutomate }: ChatMessageProps) {
    const isUser = role === "user";

    const renderContent = () => {
        if (type === "stock_recommendation" && data) {
            return <RecommendationView data={data} onAutomate={onAutomate} />;
        }
        if (type === "market_analysis" && data) {
            return <MarketAnalysisView data={data} />;
        }
        if (type === "stock_research" && data) {
            return <StockResearchView data={data} />;
        }
        if (type === "trade_analysis" && data) {
            return <TradeAnalysisView data={data} />;
        }
        if (type === "interview_question" && data) {
            return (
                <div className="space-y-4 w-full max-w-md">
                    <p className="text-lg font-medium">{data.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                        {data.options.map((opt: any) => (
                            <Button
                                key={opt.value}
                                variant="outline"
                                className="justify-start h-auto py-3 px-4 text-left whitespace-normal hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                                onClick={() => onOptionSelect?.(opt.value)}
                            >
                                <div className="font-semibold mr-2">{opt.label.split("(")[0]}</div>
                                {opt.label.includes("(") && (
                                    <div className="text-xs text-muted-foreground">({opt.label.split("(")[1]}</div>
                                )}
                            </Button>
                        ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Question {data.progress}</div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-4">
                {content && (
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-3 glass-effect shadow-lg",
                            isUser
                                ? "bg-primary/10 border-primary/20"
                                : "bg-card border-border/50"
                        )}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                    </div>
                )}

                {chart && !isUser && (
                    <div className="w-full max-w-3xl">
                        <StockChart
                            ticker={chart.ticker}
                            data={chart.data}
                            currentPrice={chart.currentPrice}
                            change={chart.change}
                            changePercent={chart.changePercent}
                        />
                    </div>
                )}

                {news && !isUser && (
                    <div className="w-full max-w-5xl">
                        <NewsCarousel news={news.items} ticker={news.ticker} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={cn(
                "flex gap-4 p-6 animate-fade-in w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mt-1">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
            )}

            <div className={cn("flex flex-col gap-2 w-full", isUser ? "max-w-[80%] items-end" : "max-w-full")}>
                {renderContent()}

                {timestamp && (
                    <span className="text-xs text-muted-foreground px-2">{timestamp}</span>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mt-1">
                    <User className="h-5 w-5 text-foreground" />
                </div>
            )}
        </div>
    );
}
