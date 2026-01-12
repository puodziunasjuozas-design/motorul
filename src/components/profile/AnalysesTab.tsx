import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Car, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnalysisTool from "./AnalysisTool";

interface Analysis {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  current_price: number | null;
  price_rating: string | null;
  is_profitable: boolean | null;
  created_at: string;
  listing_url: string | null;
}

interface AnalysesTabProps {
  showAnalysisTool?: boolean;
  onAnalysisToolClose?: () => void;
}

const AnalysesTab = ({ showAnalysisTool = false, onAnalysisToolClose }: AnalysesTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("analysis_history")
      .select("id, vehicle_make, vehicle_model, vehicle_year, current_price, price_rating, is_profitable, created_at, listing_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching analyses:", error);
      toast.error(t("errorFetchingAnalyses"));
    } else {
      setAnalyses(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (error) {
      toast.error(t("errorDeletingAnalysis"));
    } else {
      setAnalyses(analyses.filter(a => a.id !== id));
      toast.success(t("analysisDeleted"));
    }
  };

  const getPriceRatingColor = (rating: string | null) => {
    switch (rating?.toLowerCase()) {
      case "good":
      case "gera":
        return "bg-green-600";
      case "fair":
      case "vidutinė":
        return "bg-yellow-600";
      case "high":
      case "aukšta":
        return "bg-red-600";
      default:
        return "bg-zinc-600";
    }
  };

  const handleToolClose = () => {
    fetchAnalyses();
    onAnalysisToolClose?.();
  };

  if (showAnalysisTool) {
    return <AnalysisTool onClose={handleToolClose} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 mx-auto mb-4 text-red-800" />
        <h3 className="text-foreground mb-2 text-3xl font-extrabold">{t("noAnalyses")}</h3>
        <p className="text-muted-foreground">{t("noAnalysesDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map(analysis => (
        <Card key={analysis.id} className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                    {analysis.vehicle_make} {analysis.vehicle_model}
                    {analysis.vehicle_year && ` (${analysis.vehicle_year})`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                    {analysis.current_price && (
                      <span className="text-xs sm:text-sm text-primary font-medium">
                        {analysis.current_price.toLocaleString()} €
                      </span>
                    )}
                    {analysis.price_rating && (
                      <Badge className={`${getPriceRatingColor(analysis.price_rating)} text-xs`}>
                        {analysis.price_rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                {analysis.listing_url && (
                  <Button variant="ghost" size="sm" onClick={() => window.open(analysis.listing_url!, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(analysis.id)} 
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysesTab;
