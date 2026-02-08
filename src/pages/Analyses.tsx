import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import AnalysesTab from "@/components/profile/AnalysesTab";
import AnalysisTool from "@/components/profile/AnalysisTool";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import analysesCarGif from "@/assets/analyses-history-car.gif";

const Analyses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showAnalysisTool, setShowAnalysisTool] = useState(false);
  const [analysisCredits, setAnalysisCredits] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("analysis_credits")
      .eq("user_id", user.id)
      .single();
    
    setAnalysisCredits(data?.analysis_credits || 0);
  };

  const handleCreditsUsed = () => {
    fetchCredits();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="analyses" />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        {showAnalysisTool ? (
          <AnalysisTool 
            onClose={() => {
              setShowAnalysisTool(false);
              setRefreshKey(prev => prev + 1);
            }} 
            onCreditsUsed={handleCreditsUsed} 
          />
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <img src={analysesCarGif} alt="" className="w-64 h-auto opacity-80" />
            </div>
            <h2 className="text-foreground text-2xl sm:text-3xl font-bold mb-4">{t("analysisHistory")}</h2>
            <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
              {analysisCredits > 0 && (
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full mb-6"
                  onClick={() => setShowAnalysisTool(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t("startNewAnalysis")}
                </Button>
              )}
              <AnalysesTab key={refreshKey} onCreditsUsed={handleCreditsUsed} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analyses;
