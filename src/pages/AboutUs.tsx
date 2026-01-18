import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Target, Award, Shield } from "lucide-react";
const AboutUs = () => {
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12">
              {t("aboutUsTitle")}
            </h1>
            
            <div className="space-y-8 sm:space-y-12">
              {/* Mission */}
              <div className="bg-card rounded-xl p-6 sm:p-8 border-2 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">{t("ourMission")}</h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t("ourMissionDesc")}
                </p>
              </div>

              {/* Team */}
              <div className="bg-card rounded-xl p-6 sm:p-8 border-2 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">{t("ourTeam")}</h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t("ourTeamDesc")}
                </p>
              </div>

              {/* Values */}
              <div className="bg-card rounded-xl p-6 sm:p-8 border-2 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">{t("ourValues")}</h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t("ourValuesDesc")}
                </p>
              </div>

              {/* Trust */}
              <div className="bg-card rounded-xl p-6 sm:p-8 border-2 border-primary">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-semibold">{t("whyTrustUs")}</h2>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {t("whyTrustUsDesc")}
                </p>
              </div>
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
    </div>;
};
export default AboutUs;