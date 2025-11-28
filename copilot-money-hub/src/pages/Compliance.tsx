import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, FileText, Lock, AlertCircle } from "lucide-react";

const Compliance = () => {
  const disclosures = [
    "AI recommendations are based on historical data and may not predict future performance",
    "Past performance is not indicative of future results",
    "All investments carry risk of capital loss",
    "Users should consult financial advisors for personalized advice",
  ];

  const dataSources = [
    { name: "Motilal Oswal", type: "SEBI Registered", expiry: "2025-12-31", verified: true },
    { name: "ICICI Direct", type: "SEBI Registered", expiry: "2025-10-15", verified: true },
    { name: "Axis Securities", type: "SEBI Registered", expiry: "2025-11-20", verified: true },
  ];

  const auditTrail = [
    {
      date: "2024-01-15",
      signal: "BUY",
      stock: "RELIANCE",
      regulation: "SEBI RA Reg 2014, Section 12",
      status: "Compliant",
    },
    {
      date: "2024-01-14",
      signal: "HOLD",
      stock: "TCS",
      regulation: "SEBI RA Reg 2014, Section 12",
      status: "Compliant",
    },
    {
      date: "2024-01-13",
      signal: "BUY",
      stock: "HDFC BANK",
      regulation: "SEBI RA Reg 2014, Section 12",
      status: "Compliant",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-copper" />
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground">
              SEBI Compliance Dashboard
            </h1>
            <p className="text-muted-foreground">Regulatory adherence and transparency</p>
          </div>
        </div>

        {/* Compliance Status */}
        <Card className="p-8 mb-8 border-signal-buy bg-signal-buy/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-signal-buy flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-signal-buy-foreground" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-signal-buy mb-1">
                  Fully Compliant
                </h2>
                <p className="text-muted-foreground">
                  All AI recommendations follow SEBI Research Analyst Regulations 2014
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-signal-buy text-signal-buy-foreground mb-2">
                ISO 27001 Certified
              </Badge>
              <p className="text-xs text-muted-foreground">Last audit: Jan 10, 2024</p>
            </div>
          </div>
        </Card>

        {/* Four Quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Disclosures */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-copper" />
              <h3 className="font-display text-xl font-bold text-foreground">AI Disclosures</h3>
            </div>
            <ul className="space-y-3">
              {disclosures.map((disclosure, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertCircle className="w-4 h-4 text-copper mt-0.5 flex-shrink-0" />
                  <span>{disclosure}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Data Sources */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-signal-buy" />
              <h3 className="font-display text-xl font-bold text-foreground">
                Verified Data Sources
              </h3>
            </div>
            <div className="space-y-3">
              {dataSources.map((source, idx) => (
                <div key={idx} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">{source.name}</span>
                    {source.verified && (
                      <Badge className="bg-signal-buy text-signal-buy-foreground text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{source.type}</span>
                    <span>Valid until {source.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Controls */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-copper" />
              <h3 className="font-display text-xl font-bold text-foreground">User Controls</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground mb-1">Data Collection Consent</p>
                  <p className="text-xs text-muted-foreground">
                    Allow AI to analyze portfolio data
                  </p>
                </div>
                <div className="w-12 h-6 bg-signal-buy rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground mb-1">Trade Recommendations</p>
                  <p className="text-xs text-muted-foreground">
                    Receive AI-powered buy/sell signals
                  </p>
                </div>
                <div className="w-12 h-6 bg-signal-buy rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground mb-1">Risk Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Get notified about portfolio risks
                  </p>
                </div>
                <div className="w-12 h-6 bg-signal-buy rounded-full flex items-center justify-end px-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Audit Trail */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-copper" />
              <h3 className="font-display text-xl font-bold text-foreground">Audit Trail</h3>
            </div>
            <div className="space-y-3">
              {auditTrail.map((entry, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-foreground">{entry.stock}</span>
                    <Badge
                      className={`text-xs ${
                        entry.signal === "BUY"
                          ? "bg-signal-buy text-signal-buy-foreground"
                          : "bg-signal-hold text-signal-hold-foreground"
                      }`}
                    >
                      {entry.signal}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{entry.regulation}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{entry.date}</span>
                    <span className="text-signal-buy font-medium">{entry.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Security Badge */}
        <Card className="p-6 border-border bg-gradient-to-br from-card to-card/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  Enterprise-Grade Security
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your data is protected with industry-leading security measures
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className="bg-copper text-copper-foreground">256-bit Encryption</Badge>
              <br />
              <Badge className="bg-signal-buy text-signal-buy-foreground">ISO 27001</Badge>
              <br />
              <Badge className="bg-primary text-primary-foreground">SEBI Registered</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;
