import { useState } from "react";
import { 
  Camera, 
  TrendingUp, 
  Wrench, 
  Play, 
  Calculator,
  Sparkles,
  ArrowRight 
} from "lucide-react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import DescriptionInput from "@/components/DescriptionInput";
import AnalysisResult, { AnalysisData } from "@/components/AnalysisResult";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (images.length === 0 && !description) {
      toast({
        title: "Trūksta informacijos",
        description: "Įkelkite nuotraukas arba pridėkite aprašymą",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock result for demonstration
    const mockResult: AnalysisData = {
      vehicleInfo: {
        make: "BMW",
        model: "320d",
        year: 2018,
        mileage: "150,000 km",
        fuelType: "Dyzelinas",
        transmission: "Automatinė",
      },
      marketAnalysis: {
        currentPrice: 18500,
        marketAverage: 19200,
        priceRating: "good",
        estimatedResaleValue: 16000,
        resaleTimeframe: "per 1 metus",
      },
      repairEstimate: {
        totalCost: 2800,
        items: [
          { name: "Paskirstymo diržas + vandens pompa", cost: 800, urgency: "high" },
          { name: "Stabdžių kaladėlės (galinės)", cost: 150, urgency: "medium" },
          { name: "Alyvos keitimas", cost: 120, urgency: "high" },
          { name: "EGR vožtuvo valymas", cost: 250, urgency: "medium" },
          { name: "Turbinos patikra", cost: 100, urgency: "low" },
          { name: "Kiti smulkūs darbai", cost: 1380, urgency: "low" },
        ],
      },
      profitability: {
        isProfitable: true,
        potentialProfit: 2700,
        recommendation: "Automobilis parduodamas žemiau rinkos kainos. Po remonto galėsite parduoti už ~€19,000-20,000. Rekomenduojame derėtis iki €17,000.",
      },
      videos: [
        {
          title: "BMW N47 paskirstymo diržo keitimas",
          url: "https://youtube.com",
          thumbnail: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=225&fit=crop",
        },
        {
          title: "Stabdžių kaladėlių keitimas BMW F30",
          url: "https://youtube.com",
          thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=225&fit=crop",
        },
        {
          title: "EGR vožtuvo valymas dyzeliniams varikliams",
          url: "https://youtube.com",
          thumbnail: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=225&fit=crop",
        },
      ],
      warnings: [
        "N47 variklis turi žinomą paskirstymo diržo problemą - būtina keisti",
        "150,000 km rida reikalauja didelės techninės apžiūros",
        "Patikrinkite swirl flaps būklę",
      ],
      positives: [
        "Kaina žemiau rinkos vidurkio",
        "Automatinė pavarų dėžė ZF - patikima",
        "Populiarus modelis - lengva parduoti",
        "Dyzelinis variklis - ekonomiškas",
      ],
    };

    setAnalysisResult(mockResult);
    setIsAnalyzing(false);

    toast({
      title: "Analizė baigta!",
      description: "Peržiūrėkite rezultatus žemiau",
    });
  };

  const features = [
    {
      icon: Camera,
      title: "Nuotraukų analizė",
      description: "AI atpažįsta automobilį, defektus ir bendrą būklę iš nuotraukų",
    },
    {
      icon: TrendingUp,
      title: "Rinkos analizė",
      description: "Realaus laiko kainų palyginimas su panašiais skelbimais",
    },
    {
      icon: Calculator,
      title: "Pelno skaičiuoklė",
      description: "Sužinokite ar apsimoka pirkti ir perpardavinėti",
    },
    {
      icon: Wrench,
      title: "Remonto sąmata",
      description: "Tikslus remonto kaštų įvertinimas pagal defektus",
    },
    {
      icon: Play,
      title: "Video instrukcijos",
      description: "Suraskite kaip pataisyti konkrečias detales",
    },
    {
      icon: Sparkles,
      title: "AI rekomendacijos",
      description: "Išmanios patarimai prieš perkant automobilį",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI paremta transporto priemonių analizė</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              Išmanusis <span className="gradient-text">auto pirkimo</span> patarėjas
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Įkelkite skelbimo nuotraukas ir aprašymą – AI išanalizuos rinkos kainą, 
              apskaičiuos remonto kaštus ir parodys ar apsimoka pirkti.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
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
              <UploadZone 
                images={images} 
                onImagesChange={setImages}
                isAnalyzing={isAnalyzing}
              />
              
              <div className="border-t border-border pt-8">
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
                    Analizuojama...
                  </>
                ) : (
                  <>
                    Analizuoti su AI
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {analysisResult && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Analizės rezultatai</h2>
                <AnalysisResult data={analysisResult} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 AutoAnalizė. AI paremta transporto priemonių analizė.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
