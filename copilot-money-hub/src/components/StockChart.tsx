import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockChartProps {
    ticker: string;
    data: Array<{ time: string; value: number }>;
    currentPrice: number;
    change: number;
    changePercent: number;
}

export function StockChart({ ticker, data, currentPrice, change, changePercent }: StockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const isPositive = change >= 0;

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "hsl(var(--muted-foreground))",
            },
            grid: {
                vertLines: { color: "hsl(var(--border) / 0.1)" },
                horzLines: { color: "hsl(var(--border) / 0.1)" },
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                borderColor: "hsl(var(--border))",
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: "hsl(var(--border))",
            },
        });

        const areaSeries = chart.addSeries({
            type: 'Area',
            lineWidth: 2,
        } as any);

        areaSeries.applyOptions({
            lineColor: isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
            topColor: isPositive ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)",
            bottomColor: isPositive ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)",
        });

        areaSeries.setData(data);
        chart.timeScale().fitContent();

        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data, isPositive]);

    return (
        <Card className="glass-effect border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">{ticker}</CardTitle>
                        <div className="flex items-baseline gap-3 mt-2">
                            <span className="text-3xl font-bold">${currentPrice.toFixed(2)}</span>
                            <div className={`flex items-center gap-1 ${isPositive ? "text-success" : "text-destructive"}`}>
                                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span className="text-sm font-semibold">
                                    {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div ref={chartContainerRef} className="w-full" />
            </CardContent>
        </Card>
    );
}
