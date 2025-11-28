import { useParams } from "react-router-dom";
import TradesChat from "@/components/chat/TradesChat";

const Chat = () => {
    const { sessionId } = useParams();

    return (
        <div className="min-h-screen bg-background">
            <TradesChat initialSessionId={sessionId} />
        </div>
    );
};

export default Chat;
