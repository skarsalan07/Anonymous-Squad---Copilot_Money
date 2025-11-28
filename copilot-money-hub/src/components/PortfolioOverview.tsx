import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

const PortfolioOverview = () => {
  const stats = [
    {
      label: "Total Value",
      value: "₹12,45,678",
      change: "+8.5%",
      positive: true,
      icon: Activity,
    },
    {
      label: "Today's P&L",
      value: "₹3,456",
      change: "+2.1%",
      positive: true,
      icon: TrendingUp,
    },
    {
      label: "AI Health Score",
      value: "87/100",
      change: "Strong",
      positive: true,
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="p-6 border-border hover:shadow-md transition-all duration-300 bg-gradient-to-br from-card to-card/50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium mb-2">{stat.label}</p>
              <p className="text-3xl font-bold font-mono text-foreground mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.positive ? (
                  <TrendingUp className="w-3 h-3 text-signal-buy" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-signal-sell" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.positive ? "text-signal-buy" : "text-signal-sell"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-copper/10 flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-copper" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioOverview;
