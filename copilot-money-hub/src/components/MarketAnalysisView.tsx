import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Activity, Globe, Zap } from "lucide-react";

interface MarketAnalysisViewProps {
    data: {
        indices: Array<{ name: string; price: number; change: number }>;
        sectors: Array<{ name: string; change: number }>;
        sentiment: { score: number; text: string };
        top_movers: Array<{ symbol: string; change: number }>;
    };
}

export function MarketAnalysisView({ data }: MarketAnalysisViewProps) {
    const getSentimentColor = (score: number) => {
        if (score < 30) return "text-red-500";
        if (score < 70) return "text-yellow-500";
        return "text-green-500";
    };

    const getSentimentLabel = (score: number) => {
        if (score < 25) return "Extreme Fear";
        if (score < 45) return "Fear";
        if (score < 55) return "Neutral";
        if (score < 75) return "Greed";
        return "Extreme Greed";
    };

    return (
        <div className="space-y-6 w-full max-w-4xl">
            {/* Indices Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.indices.map((index) => (
                    <Card key={index.name} className="bg-card/50">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="text-xs text-muted-foreground font-medium uppercase">{index.name}</div>
                            <div className="mt-2">
                                <div className="text-lg font-bold">${index.price.toLocaleString()}</div>
                                <div className={`text-xs flex items-center gap-1 ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {index.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(index.change)}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sentiment Gauge */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-4 w-4 text-primary" /> Market Sentiment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-40 h-20 overflow-hidden mb-4">
                            <div className={`text-3xl font-bold text-center mb-2 ${getSentimentColor(data.sentiment.score)}`}>
                                {data.sentiment.score}
                            </div>
                            <div className="text-sm font-medium text-center text-muted-foreground">
                                {getSentimentLabel(data.sentiment.score)}
                            </div>
                        </div>
                        <Progress value={data.sentiment.score} className="h-2 w-full" />
                        <p className="text-xs text-center mt-4 text-muted-foreground px-2">
                            "{data.sentiment.text}"
                        </p>
                    </CardContent>
                </Card>

                {/* Sector Heatmap (List) */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Globe className="h-4 w-4 text-primary" /> Sector Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.sectors.map((sector) => (
                            <div key={sector.name} className="flex justify-between items-center text-sm">
                                <span>{sector.name}</span>
                                <Badge variant="outline" className={`${sector.change >= 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                    {sector.change > 0 ? "+" : ""}{sector.change}%
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Top Movers */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Zap className="h-4 w-4 text-primary" /> Top Movers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.top_movers.map((mover) => (
                            <div key={mover.symbol} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                                <div className="font-bold">{mover.symbol}</div>
                                <div className={`font-mono text-sm ${mover.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {mover.change > 0 ? "+" : ""}{mover.change}%
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
