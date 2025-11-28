import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Building2,
  Newspaper,
} from "lucide-react";

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();

  // Mock data
  const stockData = {
    symbol: symbol?.toUpperCase() || "RELIANCE",
    exchange: "NSE",
    currentPrice: 2845.5,
    change: 42.3,
    changePercent: 1.51,
    signal: "BUY",
    confidence: 87,
    aiTarget: 3200,
    analystTarget: 3150,
  };

  const swotData = {
    strengths: [
      "Strong cash flow generation",
      "Diversified business portfolio",
      "Market leadership in telecom",
      "Robust refining margins",
    ],
    weaknesses: [
      "High debt levels",
      "Regulatory challenges in telecom",
      "Dependence on oil prices",
    ],
    opportunities: [
      "5G rollout expansion",
      "Retail digital transformation",
      "Green energy initiatives",
      "E-commerce growth",
    ],
    threats: [
      "Intense competition in telecom",
      "Volatile crude oil prices",
      "Regulatory policy changes",
    ],
  };

  const peers = [
    { name: "ONGC", price: 245.6, signal: "HOLD", aiScore: 72 },
    { name: "IOC", price: 134.8, signal: "BUY", aiScore: 81 },
    { name: "BPCL", price: 356.2, signal: "SELL", aiScore: 45 },
  ];

  const news = [
    {
      headline: "Q4 Earnings Beat Expectations by 12%",
      source: "Economic Times",
      time: "2h ago",
    },
    {
      headline: "New Refinery Project Approved",
      source: "Business Standard",
      time: "1d ago",
    },
    {
      headline: "Telecom ARPU Shows Strong Growth",
      source: "Mint",
      time: "2d ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <h1 className="font-display text-4xl font-bold text-foreground">
                  {stockData.symbol}
                </h1>
                <Badge
                  variant="outline"
                  className="text-xs font-mono text-copper border-copper/30"
                >
                  {stockData.exchange}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-3xl font-semibold text-foreground">
                  ₹{stockData.currentPrice.toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-lg font-medium flex items-center gap-1 ${
                    stockData.change >= 0 ? "text-signal-buy" : "text-signal-sell"
                  }`}
                >
                  {stockData.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stockData.change >= 0 ? "+" : ""}
                  {stockData.change.toFixed(2)} ({stockData.changePercent >= 0 ? "+" : ""}
                  {stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <Badge
              className={`px-6 py-3 text-xl font-bold ${
                stockData.signal === "BUY"
                  ? "bg-signal-buy text-signal-buy-foreground"
                  : "bg-signal-hold text-signal-hold-foreground"
              }`}
            >
              AI SIGNAL: {stockData.signal}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
            <span className="text-sm font-bold text-copper font-mono">
              {stockData.confidence}%
            </span>
          </div>
          <Progress value={stockData.confidence} className="h-2 bg-muted [&>div]:bg-copper" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="peers">Peers</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Price Targets */}
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-copper" />
                Price Target Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">AI Target Price</p>
                  <p className="text-3xl font-bold font-mono text-signal-buy">
                    ₹{stockData.aiTarget}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upside: {(((stockData.aiTarget - stockData.currentPrice) / stockData.currentPrice) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Analyst Consensus</p>
                  <p className="text-3xl font-bold font-mono text-foreground">
                    ₹{stockData.analystTarget}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on 12 analysts
                  </p>
                </div>
              </div>
            </Card>

            {/* SWOT Analysis */}
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4">
                AI-Generated SWOT Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-signal-buy" />
                    <h4 className="font-semibold text-signal-buy">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {swotData.strengths.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-signal-buy mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-signal-sell" />
                    <h4 className="font-semibold text-signal-sell">Weaknesses</h4>
                  </div>
                  <ul className="space-y-2">
                    {swotData.weaknesses.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-signal-sell mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-copper" />
                    <h4 className="font-semibold text-copper">Opportunities</h4>
                  </div>
                  <ul className="space-y-2">
                    {swotData.opportunities.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-copper mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-signal-hold" />
                    <h4 className="font-semibold text-signal-hold">Threats</h4>
                  </div>
                  <ul className="space-y-2">
                    {swotData.threats.map((item, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-signal-hold mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4">Data Sources & Reasoning</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">Analyst Reports</span>
                    <Badge className="bg-signal-buy text-signal-buy-foreground">12 Reports</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Motilal Oswal, ICICI Direct, Axis Securities, HDFC Securities, and 8 others
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">Financial Data</span>
                    <Badge className="bg-signal-buy text-signal-buy-foreground">Verified</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Q4 FY24 results, Balance sheet, Cash flow statements
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">SEBI Compliance</span>
                    <Badge className="bg-signal-buy text-signal-buy-foreground">✓ Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All recommendations follow SEBI Research Analyst Regulations 2014
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Peers Tab */}
          <TabsContent value="peers">
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-copper" />
                Peer Comparison
              </h3>
              <div className="space-y-4">
                {peers.map((peer, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground mb-1">{peer.name}</h4>
                        <p className="text-2xl font-mono font-bold text-foreground">
                          ₹{peer.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`mb-2 ${
                            peer.signal === "BUY"
                              ? "bg-signal-buy text-signal-buy-foreground"
                              : peer.signal === "SELL"
                              ? "bg-signal-sell text-signal-sell-foreground"
                              : "bg-signal-hold text-signal-hold-foreground"
                          }`}
                        >
                          {peer.signal}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">AI Score:</span>
                          <span className="text-sm font-bold text-copper">{peer.aiScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-copper" />
                Latest News & Updates
              </h3>
              <div className="space-y-4">
                {news.map((item, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-copper bg-muted/20 rounded">
                    <h4 className="font-semibold text-foreground mb-2">{item.headline}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button className="flex-1 bg-copper hover:bg-copper/90 text-copper-foreground font-medium py-6 text-lg">
            Execute Trade
          </Button>
          <Button variant="outline" className="flex-1 border-border hover:bg-muted font-medium py-6 text-lg">
            Paper Trade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
