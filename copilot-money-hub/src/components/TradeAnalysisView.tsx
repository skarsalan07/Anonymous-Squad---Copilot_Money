import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface TradeAnalysisViewProps {
    data: {
        symbol: string;
        current_price: number;
        indicators: {
            rsi: number;
            macd: number;
            sma_50: number;
            sma_200: number;
        };
        levels: {
            support: number;
            resistance: number;
            pivot?: number;
        };
        signals: string[];
        verdict: string;
        chart_data: any[];
    };
}

export function TradeAnalysisView({ data }: TradeAnalysisViewProps) {
    const getVerdictColor = (verdict: string) => {
        if (verdict.includes("Buy")) return "bg-green-500 hover:bg-green-600";
        if (verdict.includes("Sell")) return "bg-red-500 hover:bg-red-600";
        return "bg-yellow-500 hover:bg-yellow-600";
    };

    return (
        <div className="space-y-6 w-full max-w-4xl">
            {/* Verdict Header */}
            <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6 flex justify-between items-center">
                    <div>
                        <div className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Trade Setup</div>
                        <div className="text-3xl font-bold mt-1 flex items-center gap-3">
                            {data.symbol}
                            <Badge className={`text-lg px-4 py-1 ${getVerdictColor(data.verdict)}`}>
                                {data.verdict}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            Current Price: <span className="text-foreground font-mono">${data.current_price}</span>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-xs text-muted-foreground">Support</div>
                        <div className="font-mono text-green-500">${data.levels.support}</div>
                        <div className="text-xs text-muted-foreground mt-2">Resistance</div>
                        <div className="font-mono text-red-500">${data.levels.resistance}</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Technical Chart */}
                <Card className="md:col-span-2 h-[400px]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Price Action
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[340px] p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.chart_data}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={30} />
                                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={40} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                />
                                <Area type="monotone" dataKey="close" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
                                <ReferenceLine y={data.levels.support} stroke="green" strokeDasharray="3 3" label={{ value: 'Sup', position: 'insideLeft', fill: 'green', fontSize: 10 }} />
                                <ReferenceLine y={data.levels.resistance} stroke="red" strokeDasharray="3 3" label={{ value: 'Res', position: 'insideLeft', fill: 'red', fontSize: 10 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Indicators & Signals */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" /> Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">RSI (14)</span>
                                <Badge variant={data.indicators.rsi > 70 ? "destructive" : data.indicators.rsi < 30 ? "default" : "secondary"}>
                                    {data.indicators.rsi}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">MACD</span>
                                <span className={`font-mono text-sm ${data.indicators.macd > 0 ? "text-green-500" : "text-red-500"}`}>
                                    {data.indicators.macd}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">SMA 50</span>
                                <span className="font-mono text-sm">${data.indicators.sma_50}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">SMA 200</span>
                                <span className="font-mono text-sm">${data.indicators.sma_200}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Signals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.signals.map((signal, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs">
                                    {signal.includes("Bullish") ? (
                                        <TrendingUp className="h-3 w-3 text-green-500 mt-0.5" />
                                    ) : signal.includes("Bearish") ? (
                                        <TrendingDown className="h-3 w-3 text-red-500 mt-0.5" />
                                    ) : (
                                        <Activity className="h-3 w-3 text-muted-foreground mt-0.5" />
                                    )}
                                    <span>{signal}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
