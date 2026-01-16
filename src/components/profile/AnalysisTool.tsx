import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import DescriptionInput from "@/components/DescriptionInput";
import AnalysisResult, { AnalysisData } from "@/components/AnalysisResult";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisToolProps {
  onClose: () => void;
  onCreditsUsed?: () => void;
}

const AnalysisTool = ({ onClose, onCreditsUsed }: AnalysisToolProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  const decreaseCredits = async () => {
    if (!user) return;
    
    // Get current credits
    const { data: currentCredits } = await supabase
      .from("user_credits")
      .select("analysis_credits")
      .eq("user_id", user.id)
      .single();
    
    if (currentCredits && currentCredits.analysis_credits > 0) {
      await supabase
        .from("user_credits")
        .update({ analysis_credits: currentCredits.analysis_credits - 1 })
        .eq("user_id", user.id);
      
      onCreditsUsed?.();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (images.length === 0 && !description) {
      toast({
        title: t("missingInfo"),
        description: t("uploadOrDescribe"),
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const imageBase64List = await Promise.all(images.slice(0, 5).map(file => fileToBase64(file)));
      const {
        data: analysisData,
        error: analysisError
      } = await supabase.functions.invoke('analyze-vehicle', {
        body: {
          description,
          listingUrl,
          imageBase64List
        }
      });
      if (analysisError) {
        throw new Error(analysisError.message);
      }
      if (analysisData.error) {
        throw new Error(analysisData.error);
      }
      const {
        data: videosData
      } = await supabase.functions.invoke('search-youtube', {
        body: {
          searchQueries: analysisData.youtubeSearchQueries || [],
          vehicleMake: analysisData.vehicleInfo?.make,
          vehicleModel: analysisData.vehicleInfo?.model
        }
      });
      const result: AnalysisData = {
        vehicleInfo: analysisData.vehicleInfo,
        marketAnalysis: analysisData.marketAnalysis,
        repairEstimate: analysisData.repairEstimate,
        profitability: analysisData.profitability,
        warnings: analysisData.warnings || [],
        positives: analysisData.positives || [],
        videos: videosData?.videos || []
      };
      setAnalysisResult(result);
      if (user) {
        await saveToHistory(result);
        await decreaseCredits();
      }
      toast({
        title: t("analysisDone"),
        description: t("resultsSaved")
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t("analysisFailed"),
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = async (result: AnalysisData) => {
    const { error } = await supabase.from("analysis_history").insert({
      user_id: user!.id,
      vehicle_make: result.vehicleInfo.make,
      vehicle_model: result.vehicleInfo.model,
      vehicle_year: result.vehicleInfo.year,
      vehicle_mileage: result.vehicleInfo.mileage,
      vehicle_fuel_type: result.vehicleInfo.fuelType,
      vehicle_transmission: result.vehicleInfo.transmission,
      listing_url: listingUrl || null,
      description: description || null,
      current_price: result.marketAnalysis.currentPrice,
      market_average: result.marketAnalysis.marketAverage,
      price_rating: result.marketAnalysis.priceRating,
      estimated_resale_value: result.marketAnalysis.estimatedResaleValue,
      repair_total_cost: result.repairEstimate.totalCost,
      repair_items: result.repairEstimate.items,
      is_profitable: result.profitability.isProfitable,
      potential_profit: result.profitability.potentialProfit,
      recommendation: result.profitability.recommendation,
      warnings: result.warnings,
      positives: result.positives,
      videos: result.videos
    });
    if (error) {
      console.error("Error saving to history:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t("startAnalysis")}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <p className="text-muted-foreground">{t("startAnalysisDesc")}</p>

      <div className="glass-card p-6 space-y-6">
        <UploadZone images={images} onImagesChange={setImages} isAnalyzing={isAnalyzing} />
        
        <div className="border-t border-border pt-6">
          <DescriptionInput 
            description={description} 
            onDescriptionChange={setDescription} 
            listingUrl={listingUrl} 
            onListingUrlChange={setListingUrl} 
          />
        </div>

        <Button 
          variant="hero" 
          size="xl" 
          className="w-full" 
          onClick={handleAnalyze} 
          disabled={isAnalyzing || (images.length === 0 && !description)}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              {t("analyzeWithAI")}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>

      {analysisResult && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{t("analysisResults")}</h2>
          <AnalysisResult data={analysisResult} />
        </div>
      )}
    </div>
  );
};

export default AnalysisTool;
