import { Camera, TrendingUp, Wrench, Play, Calculator, ThumbsUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import ScrollingCar from "@/components/ScrollingCar";
import { useLanguage } from "@/contexts/LanguageContext";
const Index = () => {
  const {
    t
  } = useLanguage();
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
    icon: ThumbsUp,
    titleKey: "aiRecommendations",
    descriptionKey: "aiRecommendationsDesc"
  }];
  const testimonials = [{
    textKey: "testimonial1",
    authorKey: "testimonial1Author",
    roleKey: "testimonial1Role"
  }, {
    textKey: "testimonial2",
    authorKey: "testimonial2Author",
    roleKey: "testimonial2Role"
  }, {
    textKey: "testimonial3",
    authorKey: "testimonial3Author",
    roleKey: "testimonial3Role"
  }];
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[800px] h-[300px] sm:h-[600px] bg-primary/5 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-16">
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-slide-up">
              <span className="text-red-600 font-extrabold">{t("heroHighlight")}</span> {t("heroTitle")}
            </h1>
            
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8 animate-slide-up px-2" style={{
            animationDelay: "100ms"
          }}>
              {t("heroSubtitle")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-16">
            {features.map((feature, index) => <FeatureCard key={feature.titleKey} icon={feature.icon} title={t(feature.titleKey)} description={t(feature.descriptionKey)} delay={index * 100} />)}
          </div>
        </div>
      </section>

      {/* Scrolling Car Animation */}
      <ScrollingCar />

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">
              {t("testimonials")}
            </h2>
            <Link 
              to="/testimonials" 
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="text-sm font-medium hidden sm:inline">{t("viewAll")}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => <div key={index} className="bg-card border rounded-xl p-6 relative animate-slide-up border-primary" style={{
            animationDelay: `${index * 100}ms`
          }}>
                
                <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                  "{t(testimonial.textKey)}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {t(testimonial.authorKey).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t(testimonial.authorKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(testimonial.roleKey)}</p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
            <Link to="/about" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">
              {t("aboutUs")}
            </Link>
            <Link to="/business" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors">
              {t("forBusiness")}
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground">© 2026 {t("title")}</p>
        </div>
      </footer>
    </div>;
};
export default Index;