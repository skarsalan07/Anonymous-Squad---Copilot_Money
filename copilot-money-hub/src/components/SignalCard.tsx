import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignalCardProps {
  symbol: string;
  exchange: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  rationale: string;
  lastUpdated: string;
}

const SignalCard = ({
  symbol,
  exchange,
  signal,
  confidence,
  currentPrice,
  change,
  changePercent,
  rationale,
  lastUpdated,
}: SignalCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const signalColors = {
    BUY: "bg-signal-buy text-signal-buy-foreground",
    SELL: "bg-signal-sell text-signal-sell-foreground",
    HOLD: "bg-signal-hold text-signal-hold-foreground",
  };

  const SignalIcon = signal === "BUY" ? TrendingUp : signal === "SELL" ? TrendingDown : Minus;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 
              className="font-display text-2xl font-bold text-foreground cursor-pointer hover:text-copper transition-colors"
              onClick={() => navigate(`/stock/${symbol}`)}
            >
              {symbol}
            </h3>
            <Badge variant="outline" className="text-xs font-mono text-copper border-copper/30">
              {exchange}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-2xl font-semibold text-foreground">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
            <span
              className={`text-sm font-medium flex items-center gap-1 ${
                change >= 0 ? "text-signal-buy" : "text-signal-sell"
              }`}
            >
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)} ({changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <Badge className={`${signalColors[signal]} px-4 py-2 text-base font-bold flex items-center gap-2`}>
          <SignalIcon className="w-4 h-4" />
          {signal}
        </Badge>
      </div>

      {/* Confidence Meter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
          <span className="text-sm font-bold text-copper font-mono">{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-1 bg-muted [&>div]:bg-copper" />
      </div>

      {/* Rationale */}
      <div className="mb-4">
        <p className="text-sm text-foreground leading-relaxed line-clamp-2">{rationale}</p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-copper hover:text-copper/80 font-medium mt-2 flex items-center gap-1"
        >
          View Full Analysis
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expanded Analysis */}
      {expanded && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border">
          <h4 className="font-semibold text-sm mb-2 text-foreground">Detailed Analysis</h4>
          <p className="text-sm text-muted-foreground mb-3">{rationale}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sources:</span>
              <span className="font-medium text-foreground">12 Analyst Reports</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">SEBI Compliant:</span>
              <span className="text-signal-buy font-medium">✓ Verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1 bg-copper hover:bg-copper/90 text-copper-foreground font-medium">
          Execute Trade
        </Button>
        <Button variant="outline" className="flex-1 border-border hover:bg-muted font-medium">
          Paper Trade
        </Button>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground mt-3 font-mono">Last updated {lastUpdated}</p>
    </Card>
  );
};

export default SignalCard;
