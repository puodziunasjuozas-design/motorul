import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Car, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
const AnalysesTab = () => {
  const {
    t
  } = useLanguage();
  const {
    user
  } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);
  const fetchAnalyses = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("analysis_history").select("id, vehicle_make, vehicle_model, vehicle_year, current_price, price_rating, is_profitable, created_at, listing_url").eq("user_id", user.id).order("created_at", {
      ascending: false
    });
    if (error) {
      console.error("Error fetching analyses:", error);
      toast.error(t("errorFetchingAnalyses"));
    } else {
      setAnalyses(data || []);
    }
    setLoading(false);
  };
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from("analysis_history").delete().eq("id", id);
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
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  if (analyses.length === 0) {
    return <div className="text-center py-12">
        <Car className="w-12 h-12 mx-auto mb-4 text-red-800" />
        <h3 className="text-foreground mb-2 text-3xl font-extrabold">{t("noAnalyses")}</h3>
        <p className="text-muted-foreground">{t("noAnalysesDesc")}</p>
      </div>;
  }
  return <div className="space-y-3">
      {analyses.map(analysis => <Card key={analysis.id} className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    {analysis.vehicle_make} {analysis.vehicle_model}
                    {analysis.vehicle_year && ` (${analysis.vehicle_year})`}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                    {analysis.current_price && <span className="text-sm text-primary font-medium">
                        {analysis.current_price.toLocaleString()} €
                      </span>}
                    {analysis.price_rating && <Badge className={getPriceRatingColor(analysis.price_rating)}>
                        {analysis.price_rating}
                      </Badge>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analysis.listing_url && <Button variant="ghost" size="sm" onClick={() => window.open(analysis.listing_url!, "_blank")}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(analysis.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>;
};
export default AnalysesTab;