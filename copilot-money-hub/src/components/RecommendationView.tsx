import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Info, ExternalLink, Building2, Newspaper, BarChart3, TrendingDown } from "lucide-react";

interface Recommendation {
    symbol: string;
    name: string;
    reason: string;
    match_reason: string;
    risk_level: string;
    type: string;
    source: string;
    buy_price?: string;
    sell_price?: string;
}

interface RecommendationViewProps {
    data: {
        summary: string;
        recommendations: Recommendation[];
    };
}



export function RecommendationView({ data }: RecommendationViewProps) {
    const [selectedStock, setSelectedStock] = useState<Recommendation | null>(data.recommendations[0] || null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loadingChart, setLoadingChart] = useState(false);
    const [stockDetails, setStockDetails] = useState<any>(null);
    const [chartType, setChartType] = useState<"line" | "candle">("line");

    useEffect(() => {
        if (selectedStock) {
            fetchStockData(selectedStock.symbol);
        }
    }, [selectedStock]);

    const fetchStockData = async (symbol: string) => {
        setLoadingChart(true);
        try {
            // Fetch chart
            const chartRes = await fetch(`http://localhost:8000/api/stocks/chart/${symbol}`);
            const chartJson = await chartRes.json();

            // Handle response format from stocks.py (direct object, not wrapped in success/data)
            if (chartJson.data && Array.isArray(chartJson.data)) {
                // Map backend keys (time, value) to frontend keys (date, price)
                const mappedData = chartJson.data.map((item: any) => ({
                    date: item.time,
                    price: item.value,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close
                }));
                setChartData(mappedData);
            }

            // Fetch details (reuse market-data endpoint or similar)
            const detailsRes = await fetch(`http://localhost:8000/api/trades/stock-research/${symbol}`);
            const detailsJson = await detailsRes.json();
            if (detailsJson.success) {
                setStockDetails(detailsJson.data);
            }
        } catch (error) {
            console.error("Error fetching stock data:", error);
        } finally {
            setLoadingChart(false);
        }
    };

    return (
        <div className="space-y-6 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Summary Section (Top) */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Detailed Recommendation Strategy</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                    {data.summary}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 2. Stock List (Left - 4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4 h-[600px]">
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col h-full overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-white/10 bg-white/5">
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Top Picks
                            </h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-3">
                                {data.recommendations.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        onClick={() => setSelectedStock(stock)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border group ${selectedStock?.symbol === stock.symbol
                                            ? "bg-primary/20 border-primary/50 shadow-lg translate-x-1"
                                            : "bg-white/5 border-transparent hover:bg-white/10 hover:translate-x-1"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`font-bold text-lg group-hover:text-primary transition-colors ${selectedStock?.symbol === stock.symbol ? "text-primary" : "text-foreground"}`}>
                                                    {stock.symbol}
                                                </span>
                                                <div className="text-xs text-muted-foreground">{stock.name}</div>
                                            </div>
                                            <Badge variant={stock.risk_level === "High" ? "destructive" : "secondary"} className="text-[10px] uppercase tracking-wider">
                                                {stock.risk_level}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium leading-snug line-clamp-2">
                                            {stock.match_reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* 3. Chart & Actions (Right - 8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[600px]">
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md flex flex-col h-full shadow-xl overflow-hidden">
                        {selectedStock && (
                            <>
                                {/* Chart Header */}
                                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-2xl text-foreground flex items-center gap-3">
                                            {selectedStock.name}
                                            <span className="text-muted-foreground text-lg font-normal">({selectedStock.symbol})</span>
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Badge variant="outline" className="border-white/10 bg-white/5">{selectedStock.type}</Badge>
                                            <span>•</span>
                                            <span>{selectedStock.source}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-foreground tracking-tight">
                                            ${stockDetails?.profile?.price || (chartData.length > 0 ? chartData[chartData.length - 1].price : "---")}
                                        </div>
                                        {stockDetails?.profile?.changesPercentage && (
                                            <div className={`text-sm font-medium flex items-center justify-end gap-1 ${stockDetails.profile.changesPercentage >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                {stockDetails.profile.changesPercentage > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {stockDetails.profile.changesPercentage.toFixed(2)}%
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="flex-1 p-4 min-h-0 relative">
                                    <div className="absolute top-4 right-4 z-10 flex gap-1 bg-black/20 p-1 rounded-lg backdrop-blur-sm">
                                        <Button
                                            variant={chartType === "line" ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setChartType("line")}
                                        >
                                            Line
                                        </Button>
                                        <Button
                                            variant={chartType === "candle" ? "secondary" : "ghost"}
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setChartType("candle")}
                                        >
                                            Candle
                                        </Button>
                                    </div>

                                    {loadingChart ? (
                                        <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">
                                            Loading market data...
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartType === "line" ? (
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 10, fill: '#ffffff60' }}
                                                        tickFormatter={(val) => val ? val.slice(5) : ""}
                                                        minTickGap={40}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        domain={['auto', 'auto']}
                                                        tick={{ fontSize: 10, fill: '#ffffff60' }}
                                                        width={40}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        dx={-10}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', fontSize: '12px', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                                                        itemStyle={{ color: '#22c55e' }}
                                                        labelStyle={{ color: '#ffffff80' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="price"
                                                        stroke="#22c55e"
                                                        strokeWidth={2}
                                                        fillOpacity={1}
                                                        fill="url(#colorPrice)"
                                                    />
                                                </AreaChart>
                                            ) : (
                                                <ComposedChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                                    <XAxis
                                                        dataKey="date"
                                                        tick={{ fontSize: 10, fill: '#ffffff60' }}
                                                        tickFormatter={(val) => val ? val.slice(5) : ""}
                                                        minTickGap={40}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        dy={10}
                                                    />
                                                    <YAxis
                                                        domain={['auto', 'auto']}
                                                        tick={{ fontSize: 10, fill: '#ffffff60' }}
                                                        width={40}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        dx={-10}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#000000cc', borderColor: '#ffffff20', fontSize: '12px', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                                                        labelStyle={{ color: '#ffffff80' }}
                                                        formatter={(value: any, name: any, props: any) => {
                                                            if (name === "high" || name === "low") return [value, name];
                                                            return [value, name];
                                                        }}
                                                    />
                                                    {/* Custom Candle Shape */}
                                                    <Bar
                                                        dataKey="close"
                                                        fill="#22c55e"
                                                        shape={(props: any) => {
                                                            const { x, y, width, height, payload } = props;
                                                            // Safety check
                                                            if (!payload || typeof payload.open !== 'number' || typeof payload.close !== 'number') return null;
                                                            if (!props.yAxis || !props.yAxis.scale) return null;

                                                            const isUp = payload.close > payload.open;
                                                            const color = isUp ? "#22c55e" : "#ef4444";
                                                            const yOpen = props.yAxis.scale(payload.open);
                                                            const yClose = props.yAxis.scale(payload.close);
                                                            const yHigh = props.yAxis.scale(payload.high);
                                                            const yLow = props.yAxis.scale(payload.low);
                                                            const bodyHeight = Math.abs(yOpen - yClose);
                                                            const bodyY = Math.min(yOpen, yClose);

                                                            return (
                                                                <g>
                                                                    <line x1={x + width / 2} y1={yHigh} x2={x + width / 2} y2={yLow} stroke={color} strokeWidth={1} />
                                                                    <rect x={x} y={bodyY} width={width} height={Math.max(bodyHeight, 1)} fill={color} />
                                                                </g>
                                                            );
                                                        }}
                                                    />
                                                </ComposedChart>
                                            )}
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Buy/Sell Zones (Bottom of Chart Card) */}
                                <div className="p-4 border-t border-white/10 bg-white/5 grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center backdrop-blur-sm">
                                        <div className="text-xs text-green-400 uppercase font-bold tracking-wider mb-1">Buying Zone</div>
                                        <div className="text-2xl text-foreground font-bold">
                                            {selectedStock.buy_price || (stockDetails?.profile?.price ? `$${(stockDetails.profile.price * 0.95).toFixed(2)}` : "---")}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center backdrop-blur-sm">
                                        <div className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">Selling Target</div>
                                        <div className="text-2xl text-foreground font-bold">
                                            {selectedStock.sell_price || (stockDetails?.profile?.price ? `$${(stockDetails.profile.price * 1.15).toFixed(2)}` : "---")}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Company Details (Full Width) */}
            {
                selectedStock && (
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Company Profile</h3>
                        </div>
                        <div className="text-muted-foreground leading-relaxed whitespace-normal break-words text-sm">
                            {stockDetails?.profile?.description || selectedStock.reason}
                        </div>

                        {stockDetails?.profile && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-xs text-muted-foreground block mb-1">Sector</span>
                                    <span className="font-medium text-foreground">{stockDetails.profile.sector}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-xs text-muted-foreground block mb-1">PE Ratio</span>
                                    <span className="font-medium text-foreground">{stockDetails.profile.pe_ratio?.toFixed(2) || "N/A"}</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-xs text-muted-foreground block mb-1">Market Cap</span>
                                    <span className="font-medium text-foreground">{(stockDetails.profile.market_cap / 1e9).toFixed(2)}B</span>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <span className="text-xs text-muted-foreground block mb-1">Dividend Yield</span>
                                    <span className="font-medium text-foreground">{(stockDetails.profile.dividend_yield * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
            {/* 5. News (Full Width) */}
            {
                selectedStock && (
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Newspaper className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Recent News</h3>
                        </div>
                        {stockDetails?.news ? (
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex w-max space-x-4 pb-4">
                                    {stockDetails.news.map((n: any, i: number) => (
                                        <a
                                            key={i}
                                            href={n.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-[300px] p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all group whitespace-normal flex flex-col justify-between h-[160px]"
                                        >
                                            <div className="text-sm font-medium text-foreground line-clamp-3 group-hover:text-primary transition-colors">
                                                {n.title}
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                                <span className="text-xs text-muted-foreground">{n.publisher}</span>
                                                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" className="bg-white/5" />
                            </ScrollArea>
                        ) : (
                            <div className="text-sm text-muted-foreground p-8 text-center border border-dashed border-white/10 rounded-xl">
                                Loading news feed...
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}
