import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  conversationTitle: string;
  onCreditsUsed?: () => void;
}
const ChatDialog = ({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
  onCreditsUsed
}: ChatDialogProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasCredits, setHasCredits] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("chat_messages")
      .eq("user_id", user.id)
      .single();
    
    setHasCredits((data?.chat_messages || 0) > 0);
  };

  const decreaseCredits = async () => {
    if (!user) return false;
    
    const { data: currentCredits } = await supabase
      .from("user_credits")
      .select("chat_messages")
      .eq("user_id", user.id)
      .single();
    
    if (currentCredits && currentCredits.chat_messages > 0) {
      await supabase
        .from("user_credits")
        .update({ chat_messages: currentCredits.chat_messages - 1 })
        .eq("user_id", user.id);
      
      onCreditsUsed?.();
      setHasCredits(currentCredits.chat_messages > 1);
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (open) {
      checkCredits();
      // Add welcome message when dialog opens
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: t("chatWelcomeMessage") || "Sveiki! Aš esu jūsų automobilio konsultantas. Kaip galiu jums padėti?"
      }]);
    }
  }, [open, t]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!hasCredits) {
      toast.error(t("noCredits") || "Neturite žinučių kreditų");
      return;
    }

    const creditUsed = await decreaseCredits();
    if (!creditUsed) {
      toast.error(t("noCredits") || "Neturite žinučių kreditų");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (placeholder for actual AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("chatAIPlaceholder") || "Ačiū už jūsų klausimą! AI konsultanto funkcija bus netrukus aktyvuota."
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 rounded-none flex flex-col bg-zinc-950 border-none">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {conversationTitle || t("technicalConsultation")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && <div className="w-8 h-8 flex-shrink-0 bg-background flex items-center justify-center rounded border border-red-800">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>}
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-foreground"}`}>
                  {message.content}
                </div>
                {message.role === "user" && <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>}
              </div>)}
            {isLoading && <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-zinc-800 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                  animationDelay: "0ms"
                }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                  animationDelay: "150ms"
                }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{
                  animationDelay: "300ms"
                }} />
                  </div>
                </div>
              </div>}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t border-primary/20">
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={!hasCredits ? (t("noCreditsPlaceholder") || "Neturite žinučių kreditų...") : (t("typeMessage") || "Įveskite žinutę...")} className="flex-1 bg-zinc-900 border-primary/30 focus:border-primary" disabled={isLoading || !hasCredits} />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading || !hasCredits} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default ChatDialog;