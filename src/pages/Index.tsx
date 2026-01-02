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
        title: "Trūksta informacijos",
        description: "Įkelkite nuotraukas arba pridėkite aprašymą",
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Convert images to base64
      const imageBase64List = await Promise.all(images.slice(0, 5).map(file => fileToBase64(file)));

      // Call AI analysis
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

      // Fetch YouTube videos
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

      // Save to history if logged in
      if (user) {
        await saveToHistory(result);
      }
      toast({
        title: "Analizė baigta!",
        description: user ? "Rezultatai išsaugoti į istoriją" : "Prisijunkite, kad išsaugotumėte rezultatus"
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko atlikti analizės",
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
    title: "Nuotraukų analizė",
    description: "AI atpažįsta automobilį, defektus ir bendrą būklę iš nuotraukų"
  }, {
    icon: TrendingUp,
    title: "Rinkos analizė",
    description: "Realaus laiko kainų palyginimas su panašiais skelbimais"
  }, {
    icon: Calculator,
    title: "Pelno skaičiuoklė",
    description: "Sužinokite ar apsimoka pirkti ir perpardavinėti"
  }, {
    icon: Wrench,
    title: "Remonto sąmata",
    description: "Tikslus remonto kaštų įvertinimas pagal defektus"
  }, {
    icon: Play,
    title: "Video instrukcijos",
    description: "Suraskite kaip pataisyti konkrečias detales"
  }, {
    icon: Sparkles,
    title: "AI rekomendacijos",
    description: "Išmanios patarimai prieš perkant automobilį"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">AUTO / MOTO
analizė ir patarimai<span className="gradient-text text-red-800">auto pirkimo</span> patarėjas
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{
            animationDelay: "100ms"
          }}>Įkelkite skelbimo nuotraukas ir aprašymą – išanalizuosime rinkos kainą, apskaičiuosime remonto kaštus ir parodysime ar apsimoka pirkti. Nusipirkus surasime detalių remontui, taisymo vaizdo medžiagos</p>

            {!user && <p className="text-sm text-muted-foreground mb-4">
                <Save className="w-4 h-4 inline mr-1" />
                Prisijunkite, kad išsaugotumėte analizių istoriją
              </p>}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {features.map((feature, index) => <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={index * 100} />)}
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pradėkite analizę</h2>
              <p className="text-muted-foreground">
                Įkelkite nuotraukas ir/arba aprašymą iš skelbimo
              </p>
            </div>

            <div className="glass-card p-8 space-y-8">
              <UploadZone images={images} onImagesChange={setImages} isAnalyzing={isAnalyzing} />
              
              <div className="border-t border-border pt-8">
                <DescriptionInput description={description} onDescriptionChange={setDescription} listingUrl={listingUrl} onListingUrlChange={setListingUrl} />
              </div>

              <Button variant="hero" size="xl" className="w-full" onClick={handleAnalyze} disabled={isAnalyzing || images.length === 0 && !description}>
                {isAnalyzing ? <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Analizuojama su AI...
                  </> : <>
                    Analizuoti su AI
                    <ArrowRight className="w-5 h-5" />
                  </>}
              </Button>
            </div>

            {/* Results */}
            {analysisResult && <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Analizės rezultatai</h2>
                <AnalysisResult data={analysisResult} />
              </div>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 AutoAnalizė</p>
        </div>
      </footer>
    </div>;
};
export default Index;