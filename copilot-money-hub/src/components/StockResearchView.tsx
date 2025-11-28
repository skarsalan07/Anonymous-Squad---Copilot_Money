import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Building2, Newspaper, TrendingUp, DollarSign } from "lucide-react";

interface StockResearchViewProps {
    data: {
        profile: any;
        financials: any[];
        ratings: any;
        news: any[];
    };
}

export function StockResearchView({ data }: StockResearchViewProps) {
    const { profile, financials, ratings, news } = data;

    return (
        <div className="space-y-6 w-full max-w-4xl">
            {/* Header */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{profile.sector}</Badge>
                                <span className="text-muted-foreground">•</span>
                                <span>{profile.industry}</span>
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Analyst Consensus</div>
                            <Badge className={`mt-1 text-base capitalize ${ratings.consensus === "buy" || ratings.consensus === "strong_buy" ? "bg-green-500 hover:bg-green-600" :
                                ratings.consensus === "sell" ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-yellow-600"
                                }`}>
                                {ratings.consensus?.replace("_", " ")}
                            </Badge>
                            {ratings.target_price > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">Target: ${ratings.target_price}</div>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-4 w-4" /> Company Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {profile.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div>
                                    <div className="text-xs text-muted-foreground">Market Cap</div>
                                    <div className="font-medium">{(profile.market_cap / 1e9).toFixed(2)}B</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">P/E Ratio</div>
                                    <div className="font-medium">{profile.pe_ratio?.toFixed(2) || "N/A"}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Div Yield</div>
                                    <div className="font-medium">{(profile.dividend_yield * 100).toFixed(2)}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Beta</div>
                                    <div className="font-medium">1.2 (Est)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Annual Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financials}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="date" tickFormatter={(val) => val.slice(0, 4)} tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`} tick={{ fontSize: 12 }} width={40} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                        formatter={(val: number) => [`$${(val / 1e9).toFixed(2)}B`, ""]}
                                    />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="earnings" name="Net Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="news">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Newspaper className="h-4 w-4" /> Recent News
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-4">
                                    {news.map((item, i) => (
                                        <a key={i} href={item.link} target="_blank" rel="noreferrer" className="flex gap-4 group">
                                            {item.thumbnail && (
                                                <img src={item.thumbnail} alt="" className="w-24 h-16 object-cover rounded-md bg-muted" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                                                    {item.title}
                                                </h4>
                                                <div className="text-xs text-muted-foreground mt-1">{item.publisher}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
