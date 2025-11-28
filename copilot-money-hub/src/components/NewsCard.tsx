import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsCardProps {
    title: string;
    source: string;
    timestamp: string;
    sentiment: "positive" | "negative" | "neutral";
    impact: "high" | "medium" | "low";
    summary: string;
    url?: string;
}

export function NewsCard({ title, source, timestamp, sentiment, impact, summary, url }: NewsCardProps) {
    const sentimentConfig = {
        positive: {
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            label: "Bullish"
        },
        negative: {
            icon: TrendingDown,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            label: "Bearish"
        },
        neutral: {
            icon: Minus,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            label: "Neutral"
        }
    };

    const impactConfig = {
        high: { label: "High Impact", color: "bg-primary/20 text-primary border-primary/30" },
        medium: { label: "Medium Impact", color: "bg-accent/20 text-accent border-accent/30" },
        low: { label: "Low Impact", color: "bg-muted/20 text-muted-foreground border-muted/30" }
    };

    const SentimentIcon = sentimentConfig[sentiment].icon;

    return (
        <Card className="glass-effect border-border/30 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg ${sentimentConfig[sentiment].bg} border ${sentimentConfig[sentiment].border}`}>
                        <SentimentIcon className={`h-4 w-4 ${sentimentConfig[sentiment].color}`} />
                        <span className={`text-xs font-medium ${sentimentConfig[sentiment].color}`}>
                            {sentimentConfig[sentiment].label}
                        </span>
                    </div>
                    <Badge variant="outline" className={`${impactConfig[impact].color} border`}>
                        {impactConfig[impact].label}
                    </Badge>
                </div>
                <h3 className="text-sm font-semibold leading-tight line-clamp-2">{title}</h3>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-3 pt-0">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{summary}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-foreground/80">{source}</span>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                    </div>
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
