import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TradingSidebar } from "@/components/TradingSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, TrendingUp, BarChart2, Search, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://localhost:8000/api";

interface Message {
    id: string;
    role: "user" | "assistant";
    content?: string;
    timestamp: string;
    news?: any;
    chart?: any;
    type?: string; // "text", "market_analysis", "stock_research", "trade_analysis", "interview_question", "stock_recommendation"
    data?: any;
}

interface TradesChatProps {
    initialSessionId?: string;
}

const TradesChat: React.FC<TradesChatProps> = ({ initialSessionId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string>(initialSessionId || "");
    const [awaitingSymbolFor, setAwaitingSymbolFor] = useState<"research" | "trade" | null>(null);
    const [isHeroState, setIsHeroState] = useState(true);

    // Interview State
    const [interviewStep, setInterviewStep] = useState(0);
    const [userProfile, setUserProfile] = useState<any>({});

    const interviewQuestions = [
        {
            id: "risk",
            question: "What is your risk tolerance?",
            options: [
                { value: "Low", label: "Low (Preserve Capital)" },
                { value: "Medium", label: "Medium (Balanced)" },
                { value: "High", label: "High (Aggressive Growth)" }
            ]
        },
        {
            id: "goal",
            question: "What is your primary investment goal?",
            options: [
                { value: "Growth", label: "Long-term Growth" },
                { value: "Income", label: "Regular Income (Dividends)" },
                { value: "Stability", label: "Stability & Safety" }
            ]
        },
        {
            id: "amount",
            question: "How much are you planning to invest?",
            options: [
                { value: "Under $1k", label: "Under $1,000" },
                { value: "$1k-$10k", label: "$1,000 - $10,000" },
                { value: "$10k-$50k", label: "$10,000 - $50,000" },
                { value: "Over $50k", label: "Over $50,000" }
            ]
        },
        {
            id: "experience",
            question: "What is your trading experience?",
            options: [
                { value: "Beginner", label: "Beginner (New to trading)" },
                { value: "Intermediate", label: "Intermediate (Some experience)" },
                { value: "Advanced", label: "Advanced (Active trader)" }
            ]
        },
        {
            id: "sector",
            question: "Which sector interests you the most?",
            options: [
                { value: "Tech", label: "Technology" },
                { value: "Finance", label: "Finance" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Energy", label: "Energy" },
                { value: "Consumer", label: "Consumer Goods" }
            ]
        }
    ];

    useEffect(() => {
        if (!sessionId) {
            createSession();
        }
    }, []); // Run once on mount, createSession handles the rest

    const createSession = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "New Chat Session" }),
            });
            const data = await response.json();
            setSessionId(data.session_id);
        } catch (error) {
            console.error("Error creating session:", error);
        }
    };

    const handleSendMessage = async (content: string) => {
        console.log("handleSendMessage called with:", content, "interviewStep:", interviewStep);

        // Allow interview flow to proceed without session ID initially
        if (!sessionId && interviewStep === 0) {
            console.warn("No session ID, attempting to create one...");
            createSession();
            // Don't return yet if we are in interview mode, but for normal chat we need session
        }

        if (isHeroState) {
            setIsHeroState(false);
        }

        // Handle awaiting symbol state
        if (awaitingSymbolFor) {
            handleSymbolInput(content, awaitingSymbolFor);
            setAwaitingSymbolFor(null);
            return;
        }

        // Handle Interview Flow
        if (interviewStep > 0) {
            console.log("Processing interview answer. Step:", interviewStep);
            // User answered a question
            const currentQuestion = interviewQuestions[interviewStep - 1];

            // Update profile
            const updatedProfile = { ...userProfile, [currentQuestion.id]: content };
            setUserProfile(updatedProfile);

            // Add user message
            const userMsg: Message = {
                id: Date.now().toString(),
                role: "user",
                content: content,
                timestamp: "Just now",
            };
            setMessages((prev) => [...prev, userMsg]);

            // Check if next question exists
            if (interviewStep < interviewQuestions.length) {
                // Ask next question
                const nextQ = interviewQuestions[interviewStep];
                setInterviewStep(interviewStep + 1);

                setTimeout(() => {
                    setMessages((prev) => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        type: "interview_question",
                        data: {
                            question: nextQ.question,
                            options: nextQ.options,
                            progress: interviewStep + 1
                        },
                        timestamp: "Just now"
                    }]);
                }, 500);
            } else {
                // Finished interview, fetch recommendations
                setInterviewStep(0); // Reset
                fetchRecommendations(updatedProfile);
            }
            return;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: "Just now",
        };

        setMessages((prev) => [...prev, newMessage]);

        try {
            const response = await fetch(
                `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content }),
                }
            );

            const data = await response.json();

            // Parse response content if it's JSON
            let parsedContent = data.content;
            let msgType = "text";
            let msgData = null;

            try {
                const jsonContent = JSON.parse(data.content);
                if (jsonContent.success && jsonContent.type) {
                    msgType = jsonContent.type;
                    msgData = jsonContent.data;
                    parsedContent = null; // Don't show raw JSON text
                }
            } catch (e) {
                // Not JSON, treat as plain text
            }

            const aiResponse: Message = {
                id: data.id.toString(),
                role: "assistant",
                content: parsedContent,
                timestamp: "Just now",
                type: msgType,
                data: msgData,
                news: data.metadata?.news,
                chart: data.metadata?.chart,
            };

            setMessages((prev) => [...prev, aiResponse]);

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const fetchRecommendations = async (profile: any) => {
        setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Analyzing market data based on your preferences...",
            timestamp: "Just now"
        }]);

        try {
            const response = await fetch(`${API_BASE_URL}/trades/recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile: {
                        riskTolerance: profile.risk || "Medium",
                        investmentGoal: profile.goal || "Growth",
                        preferredSectors: [profile.sector || "Tech"],
                        regionalFocus: "US"
                    }
                })
            });
            const resData = await response.json();

            if (resData.success) {
                setMessages((prev) => [...prev, {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    timestamp: "Just now",
                    type: "stock_recommendation",
                    data: resData.data
                }]);
            } else {
                setMessages((prev) => [...prev, {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: "Sorry, I couldn't generate recommendations at this time.",
                    timestamp: "Just now"
                }]);
            }
        } catch (e) {
            console.error(e);
            setMessages((prev) => [...prev, {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: "Error fetching recommendations.",
                timestamp: "Just now"
            }]);
        }
    };

    const handleSymbolInput = async (symbol: string, type: "research" | "trade") => {
        // Add user message
        const newMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: symbol,
            timestamp: "Just now",
        };
        setMessages((prev) => [...prev, newMessage]);

        // Add loading message
        const loadingId = (Date.now() + 1).toString();
        setMessages((prev) => [...prev, {
            id: loadingId,
            role: "assistant",
            content: "Fetching data...",
            timestamp: "Just now"
        }]);

        try {
            const endpoint = type === "research" ? "stock-research" : "trade-analysis";
            // Use the correct API path with /api/trades prefix
            const response = await fetch(`${API_BASE_URL}/trades/${endpoint}/${symbol}`);
            const resData = await response.json();

            // Remove loading message
            setMessages((prev) => prev.filter(m => m.id !== loadingId));

            if (resData.success) {
                const aiResponse: Message = {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    timestamp: "Just now",
                    type: type === "research" ? "stock_research" : "trade_analysis",
                    data: resData.data
                };
                setMessages((prev) => [...prev, aiResponse]);
            } else {
                setMessages((prev) => [...prev, {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: `Sorry, I couldn't fetch data for ${symbol}. Please try a valid ticker like AAPL or BTC-USD.`,
                    timestamp: "Just now"
                }]);
            }

        } catch (error) {
            console.error(error);
            setMessages((prev) => prev.filter(m => m.id !== loadingId));
            setMessages((prev) => [...prev, {
                id: (Date.now() + 3).toString(),
                role: "assistant",
                content: "An error occurred while fetching data. Please check the backend connection.",
                timestamp: "Just now"
            }]);
        }
    };

    const handleFeatureSelect = async (feature: string) => {
        if (isHeroState) {
            setIsHeroState(false);
        }

        if (feature === "recommendations") {
            // Start Interview Flow
            setInterviewStep(1);
            setUserProfile({});

            // Ask first question
            const firstQ = interviewQuestions[0];
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                type: "interview_question",
                data: {
                    question: firstQ.question,
                    options: firstQ.options,
                    progress: 1
                },
                timestamp: "Just now"
            }]);

        } else if (feature === "market_analysis") {
            // Add user message (visual only)
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "user",
                content: "Show me the Market Analysis",
                timestamp: "Just now"
            }]);

            // Fetch data
            try {
                const response = await fetch(`${API_BASE_URL}/trades/market-analysis`);
                const resData = await response.json();

                if (resData.success) {
                    setMessages((prev) => [...prev, {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        timestamp: "Just now",
                        type: "market_analysis",
                        data: resData.data
                    }]);
                }
            } catch (e) {
                console.error(e);
            }
        } else if (feature === "stock_research") {
            setAwaitingSymbolFor("research");
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Please enter the stock symbol you want to research (e.g., AAPL, TSLA).",
                timestamp: "Just now"
            }]);
        } else if (feature === "trade_analysis") {
            setAwaitingSymbolFor("trade");
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Please enter the stock symbol for trade analysis (e.g., BTC-USD, NVDA).",
                timestamp: "Just now"
            }]);
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <TradingSidebar />

                <div className="flex-1 flex flex-col relative">
                    {/* Header */}
                    <header className="h-16 border-b border-border/50 glass-effect flex items-center px-6 gap-4 justify-between z-10">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="hover:bg-sidebar-accent/50 transition-colors" />
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary animate-glow" />
                                <h1 className="text-lg font-semibold">AI Trading Assistant</h1>
                            </div>
                        </div>
                    </header>

                    {/* Messages Area */}
                    {!isHeroState && (
                        <ScrollArea className="flex-1 w-full pb-32"> {/* Add padding bottom to avoid overlap with input */}
                            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                                {messages.map((msg) => (
                                    <ChatMessage
                                        key={msg.id}
                                        role={msg.role}
                                        content={msg.content}
                                        timestamp={msg.timestamp}
                                        news={msg.news}
                                        chart={msg.chart}
                                        type={msg.type}
                                        data={msg.data}
                                        onOptionSelect={handleSendMessage}
                                    />
                                ))}
                                {awaitingSymbolFor && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-card border border-border/50 rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                                            Waiting for your input...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}

                    {/* Chat Area */}
                    <div
                        className={cn(
                            "absolute w-full px-4 transition-all duration-500 ease-in-out flex flex-col items-center pointer-events-none",
                            isHeroState
                                ? "top-1/2 -translate-y-1/2"
                                : "bottom-0 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-10"
                        )}
                    >
                        <div className="w-full max-w-3xl space-y-6 pointer-events-auto">
                            {/* Feature Chips */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all"
                                    onClick={() => handleFeatureSelect("recommendations")}
                                >
                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                    Stock Recommendations
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all"
                                    onClick={() => handleFeatureSelect("market_analysis")}
                                >
                                    <BarChart2 className="h-4 w-4 text-blue-500" />
                                    Market Analysis
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all"
                                    onClick={() => handleFeatureSelect("stock_research")}
                                >
                                    <Search className="h-4 w-4 text-green-500" />
                                    Stock Research
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all"
                                    onClick={() => handleFeatureSelect("trade_analysis")}
                                >
                                    <LineChart className="h-4 w-4 text-purple-500" />
                                    Trade Analysis
                                </Button>
                            </div>

                            {/* Input */}
                            <div className="shadow-2xl rounded-xl overflow-hidden border border-primary/20">
                                <ChatInput onSend={handleSendMessage} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default TradesChat;
