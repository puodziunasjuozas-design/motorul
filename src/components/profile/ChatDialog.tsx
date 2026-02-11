import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, ImagePlus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AnalysisData } from "@/components/AnalysisResult";

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
  analysisContext?: AnalysisData | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatDialog = ({
  open,
  onOpenChange,
  conversationId,
  conversationTitle,
  onCreditsUsed,
  analysisContext
}: ChatDialogProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatImages, setChatImages] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      if (analysisContext) {
        const contextMessage = `${t("analysisContextMessage") || "Turiu klausimų apie šią analizę:"}

🚗 **${analysisContext.vehicleInfo.make} ${analysisContext.vehicleInfo.model}** (${analysisContext.vehicleInfo.year})
📊 Rida: ${analysisContext.vehicleInfo.mileage}
⛽ Kuras: ${analysisContext.vehicleInfo.fuelType}
🔧 Pavarų dėžė: ${analysisContext.vehicleInfo.transmission}

💰 Dabartinė kaina: €${analysisContext.marketAnalysis.currentPrice.toLocaleString()}
📈 Rinkos vidurkis: €${analysisContext.marketAnalysis.marketAverage.toLocaleString()}
💎 Perpardavimo vertė: €${analysisContext.marketAnalysis.estimatedResaleValue.toLocaleString()}

🔧 Remonto kaina: €${analysisContext.repairEstimate.totalCost.toLocaleString()}
${analysisContext.profitability.isProfitable ? "✅" : "❌"} Potencialus pelnas: €${analysisContext.profitability.potentialProfit.toLocaleString()}`;

        setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Sveiki! Matau, kad norite pasikonsultuoti apie ${analysisContext.vehicleInfo.make} ${analysisContext.vehicleInfo.model}. Turiu visą analizės informaciją - klauskite drąsiai!`
        },
        {
          id: "context",
          role: "user",
          content: contextMessage
        },
        {
          id: "ready",
          role: "assistant",
          content: "Puiku! Supratau analizės duomenis. Kokį klausimą turite apie šį automobilį?"
        }]
        );
      } else {
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: t("chatWelcomeMessage") || "Sveiki! Aš esu jūsų automobilio konsultantas su GPT-5 Mini ir vaizdo atpažinimu. Galite siųsti nuotraukas - analizuosiu jas! 📸"
        }]);
      }
    }
  }, [open, t, analysisContext]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async () => {
    if (!input.trim() && chatImages.length === 0 || isLoading) return;

    const userText = input.trim();
    const imagesToSend = [...chatImages];

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText + (imagesToSend.length > 0 ? ` 📷 (${imagesToSend.length} nuotr.)` : "")
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatImages([]);
    setIsLoading(true);

    try {
      // Build message content with images
      const userContent: any[] = [];

      if (imagesToSend.length > 0) {
        const base64Images = await Promise.all(imagesToSend.map((f) => fileToBase64(f)));
        for (const img of base64Images) {
          userContent.push({ type: "image_url", image_url: { url: img } });
        }
      }

      userContent.push({
        type: "text",
        text: userText || "Prašau išanalizuoti šias nuotraukas."
      });

      // Build history for AI
      const aiMessages = messages.
      filter((m) => m.id !== "welcome" || messages.length <= 1).
      map((m) => ({
        role: m.role,
        content: m.content
      }));

      aiMessages.push({ role: "user", content: userContent as any });

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ messages: aiMessages })
      });

      if (resp.status === 429) {
        toast.error("Per daug užklausų. Pabandykite vėliau.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("Pasiektas limitas.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Nepavyko prisijungti prie AI");

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {streamDone = true;break;}

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last.id === "streaming") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: current } : m);
                }
                return [...prev, { id: "streaming", role: "assistant", content: current }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Finalize the streaming message with a proper ID
      setMessages((prev) => prev.map((m) => m.id === "streaming" ? { ...m, id: Date.now().toString() } : m));
      onCreditsUsed?.();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Klaida siunčiant žinutę");
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Atsiprašau, įvyko klaida. Bandykite dar kartą."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setChatImages((prev) => [...prev, ...files].slice(0, 3));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 rounded-none flex flex-col bg-zinc-950 border-none">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {conversationTitle || t("technicalConsultation")}
            
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) =>
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" &&
              <div className="w-8 h-8 flex-shrink-0 bg-background flex items-center justify-center rounded border border-red-800">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
              }
                <div className={`max-w-[90%] sm:max-w-[85%] rounded-lg px-4 py-2 whitespace-pre-wrap ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-foreground"}`}>
                  {message.content}
                </div>
                {message.role === "user" &&
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
              }
              </div>
            )}
            {isLoading &&
            <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-zinc-800 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            }
          </div>
        </ScrollArea>

        {chatImages.length > 0 &&
        <div className="flex gap-2 px-2">
            {chatImages.map((img, i) =>
          <div key={i} className="relative w-16 h-16 rounded overflow-hidden border border-border">
                <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                <button
              onClick={() => setChatImages((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute top-0 right-0 bg-destructive rounded-bl p-0.5">

                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
          )}
          </div>
        }

        <div className="flex gap-2 pt-4 border-t border-primary/20">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect} />

          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="border-primary/30 hover:bg-primary/10">

            <ImagePlus className="w-4 h-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage") || "Įveskite žinutę arba siųskite nuotrauką..."}
            className="flex-1 bg-zinc-900 border-primary/30 focus:border-primary"
            disabled={isLoading} />

          <Button
            onClick={handleSend}
            disabled={!input.trim() && chatImages.length === 0 || isLoading}
            className="bg-primary hover:bg-primary/90">

            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

export default ChatDialog;