import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Loader2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchFinancialNews, FeedItem } from "@/lib/newsService";
import { Button } from "@/components/ui/button";

const IntelligenceFeed = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await fetchFinancialNews();
        setFeedItems(news);
        if (news.length === 0) setError(true);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const sentimentColors: Record<string, string> = {
    Optimistic: "text-signal-buy",
    Neutral: "text-signal-hold",
    Cautious: "text-signal-sell",
  };

  const displayedItems = showAll ? feedItems : feedItems.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-copper" />
          <h2 className="font-display text-2xl font-bold text-foreground">Intelligence Feed</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "My Holdings", "High Conviction", "Alerts"].map((filter) => (
            <Badge
              key={filter}
              variant={filter === "All" ? "default" : "outline"}
              className={`cursor-pointer ${filter === "All"
                  ? "bg-copper text-copper-foreground hover:bg-copper/90"
                  : "hover:bg-muted"
                }`}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-copper" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-muted-foreground">
            Failed to load news feed. Please try again later.
          </div>
        ) : (
          <>
            <div className={`space-y-4 ${showAll ? "max-h-[600px] overflow-y-auto pr-2" : ""}`}>
              {displayedItems.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="p-5 border-border hover:shadow-md transition-all duration-300 group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-copper" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-xs font-medium border-copper/30 text-copper">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base text-foreground mb-2 leading-tight group-hover:text-copper transition-colors" title={item.headline}>
                          {item.headline} <ExternalLink className="inline w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{item.summary}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Source: <span className="font-medium text-foreground">{item.source}</span>
                          </span>
                          <span className={`text-xs font-medium flex items-center gap-1 ${sentimentColors[item.sentiment]}`}>
                            📊 {item.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            {feedItems.length > 4 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowAll(!showAll)}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  {showAll ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show More <ChevronDown className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IntelligenceFeed;
