import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, ExternalLink, Car, Calendar, Pencil, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnalysisResult, { AnalysisData } from "@/components/AnalysisResult";
import ChatDialog from "./ChatDialog";

interface Analysis {
  id: string;
  custom_title: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number | null;
  vehicle_mileage: string | null;
  vehicle_fuel_type: string | null;
  vehicle_transmission: string | null;
  current_price: number | null;
  market_average: number | null;
  estimated_resale_value: number | null;
  price_rating: string | null;
  is_profitable: boolean | null;
  potential_profit: number | null;
  recommendation: string | null;
  repair_total_cost: number | null;
  repair_items: unknown;
  warnings: unknown;
  positives: unknown;
  videos: unknown;
  created_at: string;
  listing_url: string | null;
}

interface AnalysesTabProps {
  onCreditsUsed?: () => void;
}

const AnalysesTab = ({ onCreditsUsed }: AnalysesTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [analysisContext, setAnalysisContext] = useState<AnalysisData | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("analysis_history")
      .select("*")
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

  const handleStartRename = (e: React.MouseEvent, analysis: Analysis) => {
    e.stopPropagation();
    setEditingId(analysis.id);
    setEditTitle(analysis.custom_title || `${analysis.vehicle_make} ${analysis.vehicle_model}`);
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const trimmed = editTitle.trim().slice(0, 40);
    const { error } = await supabase
      .from("analysis_history")
      .update({ custom_title: trimmed || null })
      .eq("id", id);
    
    if (error) {
      toast.error(t("error"));
    } else {
      setAnalyses(analyses.map(a => a.id === id ? { ...a, custom_title: trimmed || null } : a));
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
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

  const handleTransferToConsultation = async (data: AnalysisData) => {
    if (!user) return;
    
    // Check credits first
    const { data: currentCredits } = await supabase
      .from("user_credits")
      .select("chat_messages")
      .eq("user_id", user.id)
      .single();
    
    if (!currentCredits || currentCredits.chat_messages <= 0) {
      toast.error(t("noConsultationCredits") || "Neturite konsultacijų kreditų");
      return;
    }
    
    // Deduct one consultation credit
    await supabase
      .from("user_credits")
      .update({ chat_messages: currentCredits.chat_messages - 1 })
      .eq("user_id", user.id);
    
    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: `${data.vehicleInfo.make} ${data.vehicleInfo.model} (${data.vehicleInfo.year})`,
        is_active: true,
        messages_count: 0
      })
      .select()
      .single();
    
    if (error) {
      toast.error(t("errorCreatingChat"));
      return;
    }
    
    onCreditsUsed?.();
    setAnalysisContext(data);
    setChatDialogOpen(true);
  };

  const convertToAnalysisData = (analysis: Analysis) => {
    const repairItems = Array.isArray(analysis.repair_items) ? analysis.repair_items : [];
    const videos = Array.isArray(analysis.videos) ? analysis.videos : [];
    const warnings = Array.isArray(analysis.warnings) ? analysis.warnings : [];
    const positives = Array.isArray(analysis.positives) ? analysis.positives : [];
    
    return {
      vehicleInfo: {
        make: analysis.vehicle_make,
        model: analysis.vehicle_model,
        year: analysis.vehicle_year || 0,
        mileage: analysis.vehicle_mileage || "N/A",
        fuelType: analysis.vehicle_fuel_type || "N/A",
        transmission: analysis.vehicle_transmission || "N/A",
      },
      marketAnalysis: {
        currentPrice: analysis.current_price || 0,
        marketAverage: analysis.market_average || 0,
        priceRating: (analysis.price_rating?.toLowerCase() === "good" || analysis.price_rating?.toLowerCase() === "gera" ? "good" : 
                      analysis.price_rating?.toLowerCase() === "overpriced" || analysis.price_rating?.toLowerCase() === "aukšta" ? "overpriced" : "average") as "good" | "average" | "overpriced",
        estimatedResaleValue: analysis.estimated_resale_value || 0,
        resaleTimeframe: "6-12 mėn.",
      },
      repairEstimate: {
        totalCost: analysis.repair_total_cost || 0,
        items: repairItems as Array<{ name: string; cost: number; urgency: "high" | "medium" | "low" }>,
      },
      profitability: {
        isProfitable: analysis.is_profitable || false,
        potentialProfit: analysis.potential_profit || 0,
        recommendation: analysis.recommendation || "",
      },
      videos: videos as Array<{ title: string; url: string; thumbnail: string }>,
      warnings: warnings as string[],
      positives: positives as string[],
    };
  };

  if (selectedAnalysis) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedAnalysis(null)}
          className="mb-4"
        >
          ← {t("back")}
        </Button>
        <AnalysisResult 
          data={convertToAnalysisData(selectedAnalysis)} 
          onTransferToConsultation={handleTransferToConsultation}
        />
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          conversationId=""
          conversationTitle={analysisContext ? `${analysisContext.vehicleInfo.make} ${analysisContext.vehicleInfo.model}` : t("technicalConsultation")}
          analysisContext={analysisContext}
          onCreditsUsed={onCreditsUsed}
        />
      </div>
    );
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
        <Card 
          key={analysis.id} 
          className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => setSelectedAnalysis(analysis)}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  {editingId === analysis.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value.slice(0, 40))}
                        className="h-7 text-sm max-w-[200px]"
                        maxLength={40}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(e as any, analysis.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleSaveRename(e, analysis.id)}>
                        <Check className="w-3 h-3 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCancelRename}>
                        <X className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                      {analysis.custom_title || `${analysis.vehicle_make} ${analysis.vehicle_model}${analysis.vehicle_year ? ` (${analysis.vehicle_year})` : ""}`}
                    </h4>
                  )}
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
              <div className="flex items-center gap-1 self-end sm:self-auto flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => handleStartRename(e, analysis)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {analysis.listing_url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(analysis.listing_url!, "_blank");
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(analysis.id);
                  }} 
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
