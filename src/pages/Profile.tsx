import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";
import { Button } from "@/components/ui/button";
import { ShoppingBag, BarChart3, MessageSquare, ArrowRight } from "lucide-react";
import purchasesCarGif from "@/assets/purchases-car.gif";
import analysesCarGif from "@/assets/analyses-car.gif";
import consultationsCarGif from "@/assets/consultations-car.gif";

type TabType = "purchases" | "analyses" | "consultations";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("purchases");
  const [showAnalysisTool, setShowAnalysisTool] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const tabs = [
    { id: "purchases" as TabType, label: t("myPurchases"), icon: ShoppingBag },
    { id: "analyses" as TabType, label: t("analyses"), icon: BarChart3 },
    { id: "consultations" as TabType, label: t("technicalConsultations"), icon: MessageSquare }
  ];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setShowAnalysisTool(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        <h1 className="text-white mb-6 sm:mb-8 text-center text-4xl sm:text-6xl md:text-8xl font-extrabold">{t("profile")}</h1>
        
        {/* Large navigation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 
                  bg-black border border-primary rounded-lg
                  text-white text-sm sm:text-lg font-medium
                  transition-all duration-200
                  ${activeTab === tab.id ? "bg-primary/20 border-primary" : "hover:bg-zinc-900"}
                `}
              >
                <Icon className="text-red-800 h-5 w-5 sm:h-[34px] sm:w-[34px] flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Car GIF - changes based on active tab */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img 
            src={activeTab === "purchases" ? purchasesCarGif : activeTab === "analyses" ? analysesCarGif : consultationsCarGif} 
            alt="Car animation" 
            className="w-48 sm:w-72 md:w-96 h-auto object-contain"
          />
        </div>

        {/* Start Analysis Button - only show in analyses tab when tool is not open */}
        {activeTab === "analyses" && !showAnalysisTool && (
          <div className="flex justify-center mb-8">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={() => setShowAnalysisTool(true)}
              className="gap-3"
            >
              {t("startNewAnalysis")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Tab content */}
        <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
          {activeTab === "purchases" && <ServicesTab />}
          {activeTab === "analyses" && (
            <AnalysesTab 
              showAnalysisTool={showAnalysisTool} 
              onAnalysisToolClose={() => setShowAnalysisTool(false)} 
            />
          )}
          {activeTab === "consultations" && <ChatsTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
