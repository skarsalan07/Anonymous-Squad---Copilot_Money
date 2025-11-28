import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, PieChart, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "http://localhost:8000/api";

interface Holding {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  current_value: number;
  pl: number;
  pl_percent: number;
}

const Portfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  const [totalPLPercent, setTotalPLPercent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  const [rebalancingSuggestions, setRebalancingSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchPortfolio(user.id);
        fetchHistory(user.id);
        fetchSuggestions(user.id);
      }
    };
    init();
  }, []);

  const fetchPortfolio = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/paper/portfolio/${uid}`);
      const data = await res.json();

      setHoldings(data.holdings);
      setTotalPL(data.total_pl);
      setTotalPLPercent(data.total_pl_percent);
      setTotalCurrent(data.total_value);

      // Calculate total invested
      const invested = data.holdings.reduce((sum: number, h: any) => sum + (h.quantity * h.avg_price), 0);
      setTotalInvested(invested);

    } catch (e) {
      console.error("Error fetching portfolio:", e);
    }
  };

  const fetchHistory = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/paper/history/${uid}`);
      const data = await res.json();
      setTradeHistory(data);
    } catch (e) {
      console.error("Error fetching history:", e);
    }
  };

  const fetchSuggestions = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/rebalance/${uid}`);
      const data = await res.json();
      setRebalancingSuggestions(data);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
    }
  };

  const sectorAllocation = [
    { sector: "Financial Services", percentage: 43, color: "text-copper" },
    { sector: "Energy", percentage: 35, color: "text-signal-buy" },
    { sector: "Information Technology", percentage: 22, color: "text-signal-hold" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">My Portfolio</h1>
          <Button variant="outline" className="gap-2" onClick={() => userId && fetchPortfolio(userId)}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Investment</p>
            <p className="text-3xl font-bold font-mono text-foreground">
              ₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-2">Current Value</p>
            <p className="text-3xl font-bold font-mono text-foreground">
              ₹{totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-2">Total P&L</p>
            <div className="flex items-baseline gap-3">
              <p
                className={`text-3xl font-bold font-mono ${totalPL >= 0 ? "text-signal-buy" : "text-signal-sell"
                  }`}
              >
                {totalPL >= 0 ? "+" : ""}₹{totalPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <span
                className={`text-lg font-medium ${totalPL >= 0 ? "text-signal-buy" : "text-signal-sell"
                  }`}
              >
                ({totalPLPercent >= 0 ? "+" : ""}
                {totalPLPercent.toFixed(2)}%)
              </span>
            </div>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card className="mb-8 border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-2xl font-bold text-foreground">Holdings</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Stock</TableHead>
                <TableHead className="font-semibold">Qty</TableHead>
                <TableHead className="font-semibold">Avg Price</TableHead>
                <TableHead className="font-semibold">Current Price</TableHead>
                <TableHead className="font-semibold">P&L</TableHead>
                <TableHead className="font-semibold">Allocation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => {
                const allocation = totalCurrent > 0 ? (holding.current_value / totalCurrent) * 100 : 0;
                return (
                  <TableRow key={holding.symbol} className="hover:bg-muted/30">
                    <TableCell className="font-semibold font-display text-foreground">
                      {holding.symbol}
                    </TableCell>
                    <TableCell className="font-mono">{holding.quantity}</TableCell>
                    <TableCell className="font-mono">₹{holding.avg_price.toFixed(2)}</TableCell>
                    <TableCell className="font-mono">₹{holding.current_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-semibold ${holding.pl >= 0 ? "text-signal-buy" : "text-signal-sell"
                            }`}
                        >
                          {holding.pl >= 0 ? "+" : ""}₹{holding.pl.toFixed(2)}
                        </span>
                        <span
                          className={`text-sm ${holding.pl >= 0 ? "text-signal-buy" : "text-signal-sell"
                            }`}
                        >
                          ({holding.pl_percent >= 0 ? "+" : ""}
                          {holding.pl_percent.toFixed(2)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {allocation.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })}
              {holdings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No holdings found. Start trading in Paper Trading!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Trade History */}
        <Card className="mb-8 border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-2xl font-bold text-foreground">Trade History</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Symbol</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradeHistory.map((trade, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold font-display text-foreground">
                    {trade.symbol}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${trade.type === "BUY"
                        ? "bg-signal-buy text-signal-buy-foreground"
                        : "bg-signal-sell text-signal-sell-foreground"
                        }`}
                    >
                      {trade.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{trade.quantity}</TableCell>
                  <TableCell className="font-mono">₹{trade.price.toFixed(2)}</TableCell>
                  <TableCell className="font-mono font-semibold">
                    ₹{(trade.price * trade.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trade.status === "PENDING" ? "outline" : "secondary"}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {tradeHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No trade history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sector Allocation */}
          <Card className="p-6 border-border">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6 text-copper" />
              Sector Allocation
            </h2>
            <div className="space-y-4">
              {sectorAllocation.map((sector, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{sector.sector}</span>
                    <span className={`text-sm font-bold ${sector.color}`}>
                      {sector.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-copper h-2 rounded-full transition-all"
                      style={{ width: `${sector.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-copper/10 border border-copper/20 rounded-lg">
              <p className="text-sm text-foreground">
                <span className="font-semibold">AI Insight:</span> You're 40% concentrated in
                Financial Services. Consider diversifying into Healthcare and FMCG sectors.
              </p>
            </div>
          </Card>

          {/* Rebalancing Suggestions */}
          <Card className="p-6 border-border">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-copper" />
              AI Rebalancing Suggestions
            </h2>
            <div className="space-y-4">
              {rebalancingSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{suggestion.action}</h3>
                    <Badge className="bg-signal-buy text-signal-buy-foreground">
                      {suggestion.impact}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <span className="font-mono">{suggestion.from}</span>
                    <span>→</span>
                    <span className="font-mono">{suggestion.to}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                  <Button className="w-full mt-3 bg-copper hover:bg-copper/90 text-copper-foreground">
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
