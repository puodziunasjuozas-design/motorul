import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, BarChart3, Users2, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ForBusiness = () => {
  const { t } = useLanguage();

  const benefits = [
    { icon: BarChart3, titleKey: "businessBenefit1", descKey: "businessBenefit1Desc" },
    { icon: Users2, titleKey: "businessBenefit2", descKey: "businessBenefit2Desc" },
    { icon: Zap, titleKey: "businessBenefit3", descKey: "businessBenefit3Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">{t("forBusiness")}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                {t("businessTitle")}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
                {t("businessSubtitle")}
              </p>
            </div>

            {/* Benefits */}
            <div className="grid gap-4 sm:gap-6 mb-12 sm:mb-16">
              {benefits.map((benefit) => (
                <div 
                  key={benefit.titleKey}
                  className="bg-card rounded-xl p-6 sm:p-8 border border-border flex flex-col sm:flex-row items-start gap-4"
                >
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">{t(benefit.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{t(benefit.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="bg-card rounded-xl p-6 sm:p-8 border border-border mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6">{t("businessFeatures")}</h2>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {["feature1", "feature2", "feature3", "feature4", "feature5", "feature6"].map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm sm:text-base">{t(`business${key.charAt(0).toUpperCase() + key.slice(1)}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 sm:p-12 border border-primary/20">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">{t("businessCTA")}</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-6">{t("businessCTADesc")}</p>
              <Button size="lg" className="text-sm sm:text-base">
                {t("contactUs")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 {t("title")}</p>
        </div>
      </footer>
    </div>
  );
};

export default ForBusiness;
