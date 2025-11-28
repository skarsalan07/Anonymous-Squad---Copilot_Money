import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const AIChatBot = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/chat")}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-copper hover:bg-copper/90 text-copper-foreground shadow-2xl z-50 flex items-center justify-center"
    >
      <Sparkles className="w-6 h-6" />
    </Button>
  );
};

export default AIChatBot;
