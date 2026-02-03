import { MessageCircle, User, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const ChatPreview = () => {
  const { language } = useLanguage();

  const messages = language === "lt" ? [
    { role: "user", text: "Mano BMW 320d skleidžia girgždantį garsą stabdant. Kas tai?" },
    { role: "assistant", text: "Girgždėjimas stabdant rodo susidėvėjusius stabdžių diskus arba kaladėles. Rekomenduoju patikrinti kaladėlių storį ir diskų būklę." },
    { role: "user", text: "Ar galiu pats pakeisti kaladėles?" },
    { role: "assistant", text: "Taip! Reikės: domkrato, veržliarakčių, C-spaustuvo. Kaladėlės ~€40-80, laikas ~1-2 val. Radau video instrukciją..." }
  ] : [
    { role: "user", text: "My BMW 320d makes a squeaking sound when braking. What is it?" },
    { role: "assistant", text: "Squeaking when braking indicates worn brake discs or pads. I recommend checking pad thickness and disc condition." },
    { role: "user", text: "Can I replace the pads myself?" },
    { role: "assistant", text: "Yes! You'll need: jack, wrenches, C-clamp. Pads ~€40-80, time ~1-2 hours. I found a video tutorial..." }
  ];

  return (
    <div className="max-w-lg mx-auto animate-slide-up scale-[0.85] origin-top">
      <Card className="glass-card p-3 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/50">
          <MessageCircle className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold">BMW 320d - Stabdžiai</span>
        </div>

        {/* Messages */}
        <div className="space-y-2 max-h-[180px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-2.5 h-2.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-2 rounded-lg text-[10px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-foreground"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ChatPreview;
