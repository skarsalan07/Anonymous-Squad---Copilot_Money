import { NewsCard } from "./NewsCard";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface NewsItem {
    id: string;
    title: string;
    source: string;
    timestamp: string;
    sentiment: "positive" | "negative" | "neutral";
    impact: "high" | "medium" | "low";
    summary: string;
    url?: string;
}

interface NewsCarouselProps {
    news: NewsItem[];
    ticker?: string;
}

export function NewsCarousel({ news, ticker }: NewsCarouselProps) {
    return (
        <div className="w-full space-y-3 animate-slide-in">
            {ticker && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Latest News for</span>
                    <span className="text-sm font-bold text-primary">{ticker}</span>
                </div>
            )}
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {news.map((item) => (
                        <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                            <NewsCard {...item} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="glass-effect -left-4" />
                <CarouselNext className="glass-effect -right-4" />
            </Carousel>
        </div>
    );
}
