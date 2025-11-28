import React from 'react';
import { MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface ChatSession {
    id: number;
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
    isOpen: boolean;
    onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isOpen,
    onClose
}) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <div className={`
                fixed md:relative top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">History</h2>
                        <button
                            onClick={onClose}
                            className="md:hidden p-1 hover:bg-accent rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            onNewChat();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className="flex items-center gap-2 w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mb-4"
                    >
                        <Plus size={20} />
                        <span>New Chat</span>
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {sessions.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                No chat history
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.session_id}
                                    className={`
                                        group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                                        ${currentSessionId === session.session_id
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'}
                                    `}
                                    onClick={() => {
                                        onSelectSession(session.session_id);
                                        if (window.innerWidth < 768) onClose();
                                    }}
                                >
                                    <MessageSquare size={18} className="shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="truncate text-sm font-medium">
                                            {session.title || "New Chat"}
                                        </div>
                                        <div className="text-xs opacity-70">
                                            {format(new Date(session.updated_at), 'MMM d, h:mm a')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => onDeleteSession(session.session_id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                                        title="Delete chat"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
