import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Wallet, Trophy, Target, Sparkles, Trash2, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SymbolSearch } from "@/components/SymbolSearch";

const API_BASE_URL = "http://localhost:8000/api";

interface Trade {
  id: number;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  timestamp: string;
  status: "EXECUTED" | "PENDING";
}

interface AutoTradeRule {
  id: number;
  symbol: string;
  condition: string;
  action: "BUY" | "SELL";
  quantity: number;
  active: boolean;
}

const PaperTrading = () => {
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(""); // Optional limit price
  const [stopLoss, setStopLoss] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const [virtualBalance, setVirtualBalance] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  const [plPercent, setPlPercent] = useState(0);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchPortfolio(user.id);
        fetchHistory(user.id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!symbol) {
        setCurrentPrice(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/trading/price/${symbol}`);
        const data = await res.json();
        setCurrentPrice(data.price);
      } catch (e) {
        console.error("Error fetching price:", e);
        setCurrentPrice(null);
      }
    };

    // Debounce slightly or just fetch
    const timeout = setTimeout(fetchPrice, 500);
    return () => clearTimeout(timeout);
  }, [symbol]);

  const fetchPortfolio = async (uid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/paper/portfolio/${uid}`);
      const data = await res.json();
      setVirtualBalance(data.balance);
      setTotalPL(data.total_pl);
      setPlPercent(data.total_pl_percent);
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

  const handlePlaceTrade = async () => {
    if (!userId || !symbol || !quantity) return;

    try {
      // Logic split:
      // BUY: Always execute trade (Limit or Market)
      // SELL: 
      //   - If SL or TP provided -> Create Rules (Don't sell now)
      //   - If NO SL/TP -> Execute Market Sell (Sell now)

      if (orderType === "SELL" && (stopLoss || targetPrice)) {
        // Create Rules
        let success = true;

        if (stopLoss) {
          const res = await fetch(`${API_BASE_URL}/trading/auto-trade/rules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              symbol: symbol.toUpperCase(),
              condition: `price < ${stopLoss}`,
              action: "SELL",
              quantity: parseInt(quantity)
            })
          });
          if (!res.ok) success = false;
        }

        if (targetPrice) {
          const res = await fetch(`${API_BASE_URL}/trading/auto-trade/rules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              symbol: symbol.toUpperCase(),
              condition: `price > ${targetPrice}`,
              action: "SELL",
              quantity: parseInt(quantity)
            })
          });
          if (!res.ok) success = false;
        }

        if (success) {
          toast.success("Sell orders (Stop Loss/Target) placed");
          fetchHistory(userId);
          setSymbol("");
          setQuantity("");
          setStopLoss("");
          setTargetPrice("");
        } else {
          toast.error("Failed to place some rules");
        }
        return;
      }

      // Normal Trade (Buy or Market Sell)
      const res = await fetch(`${API_BASE_URL}/trading/paper/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          symbol: symbol.toUpperCase(),
          type: orderType,
          quantity: parseInt(quantity),
          price: (orderType === "BUY" && price) ? parseFloat(price) : null,
          // We don't send SL/TP here anymore as we handle them as rules above for SELL, 
          // and they are removed for BUY.
          stop_loss: null,
          target_price: null
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchPortfolio(userId);
        fetchHistory(userId);
        setSymbol("");
        setQuantity("");
        setPrice("");
        setStopLoss("");
        setTargetPrice("");
      } else {
        toast.error(data.detail || "Trade failed");
      }
    } catch (e) {
      toast.error("Error executing trade");
    }
  };

  const leaderboard = [
    { rank: 1, name: "InvestorPro", returns: 24.5, trades: 45 },
    { rank: 2, name: "MarketGuru", returns: 21.2, trades: 38 },
    { rank: 3, name: "You", returns: plPercent, trades: tradeHistory.length },
    { rank: 4, name: "TradeMaster", returns: 11.8, trades: 52 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">
              Paper Trading Simulator
            </h1>
            <p className="text-muted-foreground">
              Practice strategies risk-free with virtual money
            </p>
          </div>
          <div className="text-right">
            <Badge className="mb-2 bg-copper/10 text-copper border border-copper/20">
              REAL MARKET DATA
            </Badge>
            <p className="text-sm text-muted-foreground">Trades executed on live prices</p>
          </div>
        </div>

        {/* Virtual Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-copper" />
              <p className="text-sm text-muted-foreground">Virtual Balance</p>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">
              ₹{virtualBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-signal-buy" />
              <p className="text-sm text-muted-foreground">Total P&L</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold font-mono ${totalPL >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                {totalPL >= 0 ? "+" : ""}₹{totalPL.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <span className={`text-lg font-medium ${totalPL >= 0 ? "text-signal-buy" : "text-signal-sell"}`}>
                ({plPercent >= 0 ? "+" : ""}{plPercent.toFixed(2)}%)
              </span>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-copper" />
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold font-mono text-foreground">--%</p>
              <Badge className="bg-muted text-muted-foreground">Calculating</Badge>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-copper" />
              <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
            </div>
            <p className="text-3xl font-bold font-mono text-foreground">#3</p>
            <p className="text-xs text-muted-foreground mt-1">out of 128 traders</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trade Entry */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="trade" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trade">Place Trade</TabsTrigger>
                <TabsTrigger value="history">Trade History</TabsTrigger>
              </TabsList>

              <TabsContent value="trade">
                <Card className="p-6 border-border">
                  <div className="mb-6">
                    <div className="flex gap-3 mb-4">
                      <Button
                        className={`flex-1 py-6 ${orderType === "BUY"
                          ? "bg-signal-buy hover:bg-signal-buy/90 text-signal-buy-foreground"
                          : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => setOrderType("BUY")}
                      >
                        BUY
                      </Button>
                      <Button
                        className={`flex-1 py-6 ${orderType === "SELL"
                          ? "bg-signal-sell hover:bg-signal-sell/90 text-signal-sell-foreground"
                          : "bg-muted hover:bg-muted/80"
                          }`}
                        onClick={() => setOrderType("SELL")}
                      >
                        SELL
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="symbol">Stock Symbol</Label>
                          <div className="mt-1">
                            <SymbolSearch value={symbol} onChange={setSymbol} />
                          </div>
                        </div>
                        <div>
                          <Label>Current Price</Label>
                          <div className="mt-1 h-10 px-3 py-2 rounded-md border border-input bg-background font-mono flex items-center">
                            {currentPrice !== null ? (
                              <span className="font-bold">₹{currentPrice.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Select stock</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          placeholder="Enter quantity"
                          className="mt-1 font-mono"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>

                      {orderType === "BUY" && (
                        <div>
                          <Label htmlFor="price">Limit Price (Optional)</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="Leave empty for Market Price"
                            className="mt-1 font-mono"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Max price you're willing to pay.
                          </p>
                        </div>
                      )}

                      {orderType === "SELL" && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
                            <Input
                              id="stopLoss"
                              type="number"
                              placeholder="Trigger Price"
                              className="mt-1 font-mono"
                              value={stopLoss}
                              onChange={(e) => setStopLoss(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="targetPrice">Target Price (Optional)</Label>
                            <Input
                              id="targetPrice"
                              type="number"
                              placeholder="Trigger Price"
                              className="mt-1 font-mono"
                              value={targetPrice}
                              onChange={(e) => setTargetPrice(e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">
                              Set triggers to auto-sell your position. Leave empty to Sell Now at Market Price.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-copper/5 border border-copper/20 rounded-lg mb-4">
                    <p className="text-sm text-copper flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">Simulated Order</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is a paper trade. Execution will use real-time market data.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-copper hover:bg-copper/90 text-copper-foreground py-6 text-lg font-semibold"
                    onClick={handlePlaceTrade}
                  >
                    Place {orderType} Order
                  </Button>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="p-6 border-border">
                  <h3 className="font-display text-xl font-bold mb-4">Recent Trades</h3>
                  <div className="space-y-3">
                    {tradeHistory.map((trade, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`${trade.type === "BUY"
                                ? "bg-signal-buy text-signal-buy-foreground"
                                : "bg-signal-sell text-signal-sell-foreground"
                                }`}
                            >
                              {trade.type}
                            </Badge>
                            <span className="font-semibold font-display text-foreground">
                              {trade.symbol}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground font-mono">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-mono">{trade.quantity} @ ₹{trade.price.toFixed(2)}</span>
                          </div>
                          <Badge variant={trade.status === "PENDING" ? "outline" : "secondary"} className="text-xs">
                            {trade.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {tradeHistory.length === 0 && <div className="text-center text-muted-foreground">No trade history</div>}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="p-6 border-border">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-copper" />
                Community Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`p-4 rounded-lg border transition-all ${player.name === "You"
                      ? "bg-copper/10 border-copper shadow-md"
                      : "border-border hover:bg-muted/30"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank === 1
                            ? "bg-signal-buy text-signal-buy-foreground"
                            : player.rank === 2
                              ? "bg-signal-hold text-signal-hold-foreground"
                              : player.rank === 3
                                ? "bg-copper text-copper-foreground"
                                : "bg-muted text-foreground"
                            }`}
                        >
                          {player.rank}
                        </span>
                        <span className="font-semibold text-foreground">{player.name}</span>
                      </div>
                      <Badge className="bg-signal-buy text-signal-buy-foreground">
                        {player.returns > 0 ? "+" : ""}{typeof player.returns === 'number' ? player.returns.toFixed(1) : player.returns}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-11">
                      {player.trades} trades executed
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperTrading;
