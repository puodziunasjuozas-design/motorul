import { useState } from "react";
import { Camera, TrendingUp, Wrench, Play, Calculator, ArrowRight, Save, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import DescriptionInput from "@/components/DescriptionInput";
import AnalysisResult, { AnalysisData } from "@/components/AnalysisResult";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
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
      }
      toast({
        title: t("analysisDone"),
        description: user ? t("resultsSaved") : t("loginToSave")
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
    const {
      error
    } = await supabase.from("analysis_history").insert({
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
  const features = [{
    icon: Camera,
    titleKey: "photoAnalysis",
    descriptionKey: "photoAnalysisDesc"
  }, {
    icon: TrendingUp,
    titleKey: "marketAnalysisTitle",
    descriptionKey: "marketAnalysisDesc"
  }, {
    icon: Calculator,
    titleKey: "profitCalculator",
    descriptionKey: "profitCalculatorDesc"
  }, {
    icon: Wrench,
    titleKey: "repairEstimateTitle",
    descriptionKey: "repairEstimateDesc"
  }, {
    icon: Play,
    titleKey: "videoInstructions",
    descriptionKey: "videoInstructionsDesc"
  }, {
    icon: Sparkles,
    titleKey: "aiRecommendations",
    descriptionKey: "aiRecommendationsDesc"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              <span className="text-red-600 font-extrabold">{t("heroHighlight")}</span> {t("heroTitle")}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{
            animationDelay: "100ms"
          }}>
              {t("heroSubtitle")}
            </p>

            {!user && <p className="text-sm text-muted-foreground mb-4">
                <Save className="w-4 h-4 inline mr-1 text-red-800" />
                {t("loginToSaveHistory")}
              </p>}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {features.map((feature, index) => <FeatureCard key={feature.titleKey} icon={feature.icon} title={t(feature.titleKey)} description={t(feature.descriptionKey)} delay={index * 100} />)}
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t("startAnalysis")}</h2>
              <p className="text-muted-foreground text-center">{t("startAnalysisDesc")}</p>
            </div>

            <div className="glass-card p-8 space-y-8">
              <UploadZone images={images} onImagesChange={setImages} isAnalyzing={isAnalyzing} />
              
              <div className="border-t border-border pt-8">
                <DescriptionInput description={description} onDescriptionChange={setDescription} listingUrl={listingUrl} onListingUrlChange={setListingUrl} />
              </div>

              <Button variant="hero" size="xl" className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || images.length === 0 && !description}>
                {isAnalyzing ? <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t("analyzing")}
                  </> : <>
                    {t("analyzeWithAI")}
                    <ArrowRight className="w-5 h-5" />
                  </>}
              </Button>
            </div>

            {analysisResult && <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">{t("analysisResults")}</h2>
                <AnalysisResult data={analysisResult} />
              </div>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 {t("title")}</p>
        </div>
      </footer>
    </div>;
};
export default Index;