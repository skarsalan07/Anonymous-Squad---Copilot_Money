import { MessageSquarePlus, TrendingUp, Settings, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockChatSessions = [
    { id: "1", title: "AAPL Stock Analysis", timestamp: "2 hours ago" },
    { id: "2", title: "Market Trends - Tech Sector", timestamp: "Yesterday" },
    { id: "3", title: "TSLA vs RIVN Comparison", timestamp: "2 days ago" },
    { id: "4", title: "Portfolio Diversification", timestamp: "3 days ago" },
    { id: "5", title: "Crypto Market Overview", timestamp: "1 week ago" },
];

export function TradingSidebar() {
    return (
        <Sidebar className="border-r border-border/50 glass-effect">
            <SidebarHeader className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        TradeAI
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <div className="p-3">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-primary/20 transition-all">
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground px-3">Recent Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <SidebarMenu>
                                {mockChatSessions.map((session) => (
                                    <SidebarMenuItem key={session.id}>
                                        <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50 transition-colors">
                                            <NavLink to={`/chat/${session.id}`} className="flex flex-col items-start gap-1 py-3">
                                                <span className="text-sm font-medium truncate w-full">{session.title}</span>
                                                <span className="text-xs text-muted-foreground">{session.timestamp}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </ScrollArea>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-border/50 p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50">
                            <button className="w-full flex items-center gap-3">
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-sidebar-accent/50">
                            <button className="w-full flex items-center gap-3">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
