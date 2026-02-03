import { MessageCircle, User, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const ChatPreview = () => {
  const { language } = useLanguage();

  const messages = language === "lt" ? [
    { role: "user", text: "Mano BMW 320d (2019) skleidžia girgždantį garsą stabdant. Kas tai galėtų būti?" },
    { role: "assistant", text: "Girgždėjimas stabdant dažniausiai rodo susidėvėjusius stabdžių diskus arba kaladėles. Kadangi turite 2019 m. BMW 320d su 145 000 km rida, rekomenduoju patikrinti:\n\n• Stabdžių kaladėlių storį\n• Diskų būklę ir storį\n• Stabdžių suportų veikimą" },
    { role: "user", text: "Ar galiu pats pakeisti stabdžių kaladėles?" },
    { role: "assistant", text: "Taip! Stabdžių kaladėlių keitimas yra vienas paprastesnių remontų. Jums reikės:\n\n🔧 Įrankiai: domkratas, veržliarakčiai, C-spaustuvas\n💰 Kaladėlės: ~€40-80 porai\n⏱️ Laikas: ~1-2 val.\n\nRadau video instrukciją jūsų modeliui..." }
  ] : [
    { role: "user", text: "My BMW 320d (2019) makes a squeaking sound when braking. What could it be?" },
    { role: "assistant", text: "Squeaking when braking usually indicates worn brake discs or pads. Since you have a 2019 BMW 320d with 145,000 km, I recommend checking:\n\n• Brake pad thickness\n• Disc condition and thickness\n• Brake caliper operation" },
    { role: "user", text: "Can I replace the brake pads myself?" },
    { role: "assistant", text: "Yes! Replacing brake pads is one of the simpler repairs. You'll need:\n\n🔧 Tools: jack, wrenches, C-clamp\n💰 Pads: ~€40-80 per pair\n⏱️ Time: ~1-2 hours\n\nI found a video tutorial for your model..." }
  ];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <Card className="glass-card p-4 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border/50">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">BMW 320d - Stabdžiai</span>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-foreground"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Preview */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 text-muted-foreground text-xs">
            <MessageCircle className="w-3 h-3" />
            <span>{language === "lt" ? "Rašykite žinutę..." : "Type a message..."}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPreview;
