import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Trash2, TrendingUp, TrendingDown, Calendar, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisRecord {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  current_price: number | null;
  is_profitable: boolean | null;
  potential_profit: number | null;
  created_at: string;
}

const History = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchAnalyses();
  }, [user, navigate]);

  const fetchAnalyses = async () => {
    const { data, error } = await supabase
      .from("analysis_history")
      .select("id, vehicle_make, vehicle_model, vehicle_year, current_price, is_profitable, potential_profit, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      toast({
        title: t("error"),
        description: t("failedToLoad"),
        variant: "destructive",
      });
    } else {
      setAnalyses(data || []);
    }
    setLoading(false);
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase
      .from("analysis_history")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: t("error"),
        description: t("failedToDelete"),
        variant: "destructive",
      });
    } else {
      setAnalyses(analyses.filter(a => a.id !== id));
      toast({
        title: t("deleted"),
        description: t("analysisRemoved"),
      });
    }
  };

  const formatDate = (dateString: string) => {
    const localeMap: Record<string, string> = {
      lt: "lt-LT",
      en: "en-US",
      ru: "ru-RU",
      es: "es-ES",
      fr: "fr-FR",
      pl: "pl-PL",
      de: "de-DE",
    };
    
    return new Date(dateString).toLocaleDateString(localeMap[language] || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("goBack")}
          </Button>

          <h1 className="text-3xl font-bold mb-8">{t("analysisHistory")}</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : analyses.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t("noSavedAnalyses")}</h2>
              <p className="text-muted-foreground mb-6">
                {t("doFirstAnalysis")}
              </p>
              <Button variant="hero" onClick={() => navigate("/")}>
                {t("startAnalysis")}
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="glass-card p-6 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          analysis.is_profitable ? "bg-primary/20" : "bg-destructive/20"
                        }`}>
                          {analysis.is_profitable ? (
                            <TrendingUp className="w-5 h-5 text-primary" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {analysis.vehicle_make} {analysis.vehicle_model}
                            {analysis.vehicle_year && ` (${analysis.vehicle_year})`}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(analysis.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        {analysis.current_price && (
                          <div>
                            <p className="text-xs text-muted-foreground">{t("price")}</p>
                            <p className="font-mono font-medium">€{analysis.current_price.toLocaleString()}</p>
                          </div>
                        )}
                        {analysis.potential_profit !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">{t("potentialProfit")}</p>
                            <p className={`font-mono font-medium ${
                              analysis.is_profitable ? "stat-positive" : "stat-negative"
                            }`}>
                              {analysis.is_profitable ? "+" : ""}€{analysis.potential_profit?.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAnalysis(analysis.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
