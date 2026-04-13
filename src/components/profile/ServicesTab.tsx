import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Zap, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface UserCredits {
  analysis_credits: number;
  consultation_credits: number;
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
    } = await supabase.from("user_credits").select("analysis_credits, consultation_credits").eq("user_id", user.id).maybeSingle();
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
        consultation_credits: 0
      });
      if (!insertError) {
        setCredits({
          analysis_credits: 0,
          consultation_credits: 0
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
    icon: MessageSquare,
    name: t("techConsultation"),
    description: t("techConsultationDesc"),
    price: 6,
    credits: 0,
    messages: 30
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
  return <div className="space-y-4 sm:space-y-6">
      {/* Current Balance */}
      <Card className="bg-black border-primary/30">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg text-foreground">{t("yourBalance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 bg-black">
            <div className="flex items-center gap-2">
              <Search className="text-primary h-5 w-5 sm:h-[28px] sm:w-[28px] flex-shrink-0" />
              <span className="text-foreground font-semibold text-xl sm:text-2xl md:text-4xl">
                <strong>{loading ? "..." : credits?.analysis_credits ?? 0}</strong> {t("analyses")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="text-primary h-5 w-5 sm:h-[28px] sm:w-[28px] flex-shrink-0" />
              <span className="text-foreground text-xl sm:text-2xl md:text-4xl font-semibold">
                <strong>{loading ? "..." : credits?.consultation_credits ?? 0}</strong> {t("consultationsRemaining")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <div>
        <h3 className="text-foreground mb-3 font-extrabold text-center text-3xl sm:text-5xl md:text-7xl">{t("services")}</h3>
        <div className="grid gap-3">
          {services.map(service => <Card key={service.id} className="bg-black border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-black bg-background border-transparent">
                  <div className="flex items-center gap-2 sm:gap-3 bg-transparent">
                    <div className="p-2 rounded-lg border-primary border-solid border bg-primary flex-shrink-0">
                      <service.icon className="text-black h-5 w-5 sm:h-[27px] sm:w-[27px] border-solid" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-foreground text-lg sm:text-2xl md:text-3xl font-semibold truncate">{service.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <span className="font-bold text-primary text-xl sm:text-2xl md:text-3xl whitespace-nowrap">{service.price} EUR</span>
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
        <h3 className="text-base text-foreground mb-3 bg-background font-extrabold sm:text-3xl">{t("packages")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {packages.map(pkg => <Card key={pkg.id} className={`bg-black border-primary/20 hover:border-primary/40 transition-colors ${pkg.popular ? "ring-2 ring-primary" : ""}`}>
              <CardHeader className="pb-2 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg text-foreground">{pkg.name}</CardTitle>
                  {pkg.popular && <Badge className="bg-primary text-primary-foreground text-xs">
                      {t("popular")}
                    </Badge>}
                </div>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                  {pkg.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-background">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-lg sm:text-xl md:text-2xl font-semibold">{pkg.credits} {t("analyses")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-lg sm:text-xl md:text-2xl font-semibold">{pkg.messages} {t("consultationsRemaining")}</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:text-right gap-2">
                    <span className="font-bold text-primary text-2xl sm:text-3xl md:text-4xl whitespace-nowrap">{pkg.price} EUR</span>
                    <Button size="sm" onClick={() => handlePurchase(pkg.name)} className="bg-primary hover:bg-primary/90">
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