import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 glass-effect">
            <div className="flex gap-3 max-w-4xl mx-auto">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about stocks, market trends, portfolio analysis..."
                    className="min-h-[60px] max-h-[200px] resize-none bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
                    disabled={disabled}
                />
                <Button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="h-[60px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </form>
    );
}
