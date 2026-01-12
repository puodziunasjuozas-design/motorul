import { Camera, TrendingUp, Wrench, Play, Calculator, ThumbsUp } from "lucide-react";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import ScrollingCar from "@/components/ScrollingCar";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Camera, titleKey: "photoAnalysis", descriptionKey: "photoAnalysisDesc" },
    { icon: TrendingUp, titleKey: "marketAnalysisTitle", descriptionKey: "marketAnalysisDesc" },
    { icon: Calculator, titleKey: "profitCalculator", descriptionKey: "profitCalculatorDesc" },
    { icon: Wrench, titleKey: "repairEstimateTitle", descriptionKey: "repairEstimateDesc" },
    { icon: Play, titleKey: "videoInstructions", descriptionKey: "videoInstructionsDesc" },
    { icon: ThumbsUp, titleKey: "aiRecommendations", descriptionKey: "aiRecommendationsDesc" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              <span className="text-red-600 font-extrabold">{t("heroHighlight")}</span> {t("heroTitle")}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.titleKey} 
                icon={feature.icon} 
                title={t(feature.titleKey)} 
                description={t(feature.descriptionKey)} 
                delay={index * 100} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Car Animation */}
      <ScrollingCar />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 {t("title")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
