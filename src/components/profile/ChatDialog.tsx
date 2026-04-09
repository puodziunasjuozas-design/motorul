import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, ImagePlus, X, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnalysisData } from "@/components/AnalysisResult";
import ReactMarkdown from "react-markdown";

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
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch credits
  useEffect(() => {
    if (open && user) {
      const fetchCredits = async () => {
        const { data } = await supabase
          .from("user_credits")
          .select("chat_messages")
          .eq("user_id", user.id)
          .maybeSingle();
        setChatCredits(data?.chat_messages || 0);
      };
      fetchCredits();
    }
  }, [open, user]);

  // Load existing messages from database
  useEffect(() => {
    if (!open || !conversationId || !user) return;
    setLoadedFromDb(false);

    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setMessages(data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content
        })));
      } else if (analysisContext) {
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

        const welcomeMsg: Message = {
          id: "welcome",
          role: "assistant",
          content: `Sveiki! Matau, kad norite pasikonsultuoti apie ${analysisContext.vehicleInfo.make} ${analysisContext.vehicleInfo.model}. Turiu visą analizės informaciją - klauskite drąsiai!`
        };
        const contextMsg: Message = { id: "context", role: "user", content: contextMessage };
        const readyMsg: Message = {
          id: "ready",
          role: "assistant",
          content: "Puiku! Supratau analizės duomenis. Kokį klausimą turite apie šį automobilį?"
        };
        setMessages([welcomeMsg, contextMsg, readyMsg]);
        await saveMessageToDb(conversationId, "assistant", welcomeMsg.content);
        await saveMessageToDb(conversationId, "user", contextMsg.content);
        await saveMessageToDb(conversationId, "assistant", readyMsg.content);
      } else {
        const welcome: Message = {
          id: "welcome",
          role: "assistant",
          content: "Sveiki! 🚗 Aš esu jūsų transporto priemonių konsultantas. Galiu padėti su automobilių ir motociklų diagnostika, remonto klausimais, skelbimų vertinimu ir pirkimo patarimais. Galite siųsti ir nuotraukas – jas išanalizuosiu! 📸"
        };
        setMessages([welcome]);
        await saveMessageToDb(conversationId, "assistant", welcome.content);
      }
      setLoadedFromDb(true);
    };

    loadMessages();
  }, [open, conversationId, user]);

  const saveMessageToDb = async (convId: string, role: string, content: string) => {
    try {
      await supabase.from("chat_messages").insert({
        conversation_id: convId,
        role,
        content
      });
      await supabase.from("chat_conversations").update({
        updated_at: new Date().toISOString()
      }).eq("id", convId);
    } catch (e) {
      console.error("Failed to save message:", e);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && chatImages.length === 0) || isLoading) return;

    const userText = input.trim();
    const imagesToSend = [...chatImages];

    const displayContent = userText + (imagesToSend.length > 0 ? ` 📷 (${imagesToSend.length} nuotr.)` : "");
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayContent
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatImages([]);
    setIsLoading(true);

    await saveMessageToDb(conversationId, "user", displayContent);

    try {
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

      // Build history for AI (last 20 messages for speed)
      const recentMessages = messages.slice(-20);
      const aiMessages = recentMessages.map((m) => ({
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

      if (resp.status === 429) { toast.error("Per daug užklausų."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("Pasiektas limitas."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Nepavyko prisijungti prie AI");

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
          if (jsonStr === "[DONE]") { streamDone = true; break; }

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

      setMessages((prev) => prev.map((m) => m.id === "streaming" ? { ...m, id: Date.now().toString() } : m));
      if (assistantSoFar) {
        await saveMessageToDb(conversationId, "assistant", assistantSoFar);
      }
      onCreditsUsed?.();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Klaida siunčiant žinutę");
      const errContent = "Atsiprašau, įvyko klaida. Bandykite dar kartą.";
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: errContent }]);
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
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 rounded-none flex flex-col bg-zinc-950 border-none p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
              <Bot className="w-5 h-5 text-primary" />
              <span className="truncate">{conversationTitle || t("technicalConsultation")}</span>
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Liko: <span className="text-primary font-bold">{chatCredits}</span> konsultacijų</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 sm:pr-4" ref={scrollRef}>
          <div className="space-y-3 sm:space-y-4 pb-4">
            {messages.map((message) =>
              <div key={message.id} className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" &&
                  <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 bg-background flex items-center justify-center rounded border border-red-800">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                }
                <div className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 ${message.role === "user" ? "rounded-lg bg-primary text-primary-foreground whitespace-pre-wrap text-sm" : "text-foreground bg-background border-primary border rounded-sm border-solid"}`}>
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-code:text-primary prose-strong:text-foreground">
                      <ReactMarkdown components={{ p: ({ children }) => <p className="text-sm leading-relaxed">{children}</p> }}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                {message.role === "user" &&
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" />
                  </div>
                }
              </div>
            )}
            {isLoading && messages[messages.length - 1]?.id !== "streaming" &&
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
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
              <div key={i} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden border border-border">
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

        <div className="flex gap-2 pt-3 sm:pt-4 border-t border-primary/20 flex-shrink-0">
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
            className="border-primary/30 hover:bg-primary/10 flex-shrink-0">
            <ImagePlus className="w-4 h-4 text-red-800" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage") || "Įveskite žinutę apie transportą..."}
            className="flex-1 min-w-0 border-primary/30 focus:border-primary bg-black"
            disabled={isLoading} />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && chatImages.length === 0) || isLoading}
            className="bg-primary hover:bg-primary/90 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
