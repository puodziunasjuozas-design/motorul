import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ChatsTab from "@/components/profile/ChatsTab";
import consultationsCarGif from "@/assets/consultations-history-car.gif";
import { AnalysisData } from "@/components/AnalysisResult";

const Consultations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [autoOpenNewChat, setAutoOpenNewChat] = useState(false);
  const [analysisContext, setAnalysisContext] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Check if we arrived with analysis context from transfer
  useEffect(() => {
    const state = location.state as { analysisContext?: AnalysisData } | null;
    if (state?.analysisContext) {
      setAnalysisContext(state.analysisContext);
      setAutoOpenNewChat(true);
      // Clear the state so refreshing doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchCredits = async () => {
    // Credits refresh handled by component
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="consultations" />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        <div className="flex justify-center mb-4">
          <img src={consultationsCarGif} alt="" className="w-80 sm:w-96 h-auto opacity-80" />
        </div>
        <h2 className="text-foreground text-2xl mb-4 text-center font-extrabold sm:text-4xl">{t("technicalConsultations")}</h2>
        <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
          <ChatsTab
            onCreditsUsed={fetchCredits}
            analysisContext={analysisContext}
            autoOpenNewChat={autoOpenNewChat}
            onAutoOpenHandled={() => {
              setAutoOpenNewChat(false);
              setAnalysisContext(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Consultations;
