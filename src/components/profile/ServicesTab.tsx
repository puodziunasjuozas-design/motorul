import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Zap, MessageSquare, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface UserCredits {
  analysis_credits: number;
  chat_messages: number;
}
const ServicesTab = () => {
  const {
    t
  } = useLanguage();
  const {
    user
  } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);
  const fetchCredits = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("user_credits").select("analysis_credits, chat_messages").eq("user_id", user.id).maybeSingle();
    if (error) {
      console.error("Error fetching credits:", error);
    } else if (data) {
      setCredits(data);
    } else {
      // Create initial credits record
      const {
        error: insertError
      } = await supabase.from("user_credits").insert({
        user_id: user.id,
        analysis_credits: 0,
        chat_messages: 0
      });
      if (!insertError) {
        setCredits({
          analysis_credits: 0,
          chat_messages: 0
        });
      }
    }
    setLoading(false);
  };
  const handlePurchase = (productName: string) => {
    toast.info(t("paymentComingSoon"));
  };
  const services = [{
    id: "analysis",
    icon: Search,
    name: t("singleAnalysis"),
    description: t("singleAnalysisDesc"),
    price: 2,
    credits: 1,
    messages: 0
  }, {
    id: "consultation",
    icon: MessageCircle,
    name: t("techConsultation"),
    description: t("techConsultationDesc"),
    price: 6,
    credits: 0,
    messages: 40
  }, {
    id: "extra_messages",
    icon: Zap,
    name: t("extraMessages"),
    description: t("extraMessagesDesc"),
    price: 2,
    credits: 0,
    messages: 20
  }];
  const packages = [{
    id: "starter",
    icon: Package,
    name: "STARTER",
    description: t("starterPackDesc"),
    price: 12,
    credits: 4,
    messages: 40,
    popular: false
  }, {
    id: "pro",
    icon: Package,
    name: "PRO",
    description: t("proPackDesc"),
    price: 18,
    credits: 10,
    messages: 80,
    popular: true
  }];
  return <div className="space-y-6">
      {/* Current Balance */}
      <Card className="bg-zinc-900 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">{t("yourBalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 bg-black">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="text-foreground">
                <strong>{loading ? "..." : credits?.analysis_credits ?? 0}</strong> {t("analyses")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-foreground">
                <strong>{loading ? "..." : credits?.chat_messages ?? 0}</strong> {t("messages")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">{t("services")}</h3>
        <div className="grid gap-3">
          {services.map(service => <Card key={service.id} className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-black bg-background border-transparent">
                  <div className="flex items-center gap-3 bg-transparent">
                    <div className="p-2 rounded-lg border-primary border-solid border bg-primary">
                      <service.icon className="text-black h-[27px] w-[27px] border-solid" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-primary">{service.price} EUR</span>
                    <Button size="sm" onClick={() => handlePurchase(service.name)} className="bg-primary hover:bg-primary/90">
                      {t("buy")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Packages */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 bg-background">{t("packages")}</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {packages.map(pkg => <Card key={pkg.id} className={`bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors ${pkg.popular ? "ring-2 ring-primary" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{pkg.name}</CardTitle>
                  {pkg.popular && <Badge className="bg-primary text-primary-foreground">
                      {t("popular")}
                    </Badge>}
                </div>
                <CardDescription className="text-muted-foreground">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-background">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      <span>{pkg.credits} {t("analyses")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>{pkg.messages} {t("messages")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{pkg.price} EUR</span>
                    <Button size="sm" onClick={() => handlePurchase(pkg.name)} className="mt-2 w-full bg-primary hover:bg-primary/90">
                      {t("buy")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default ServicesTab;