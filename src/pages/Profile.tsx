import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";
import { ShoppingBag, BarChart3, MessageCircle } from "lucide-react";

type TabType = "purchases" | "analyses" | "consultations";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("purchases");
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
    { id: "consultations" as TabType, label: t("technicalConsultations"), icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      
      <div className="container mx-auto px-6 pt-28 pb-20">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">{t("profile")}</h1>
        
        {/* Large navigation buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-3 p-6 
                  bg-black border border-primary rounded-lg
                  text-white text-lg font-medium
                  transition-all duration-200
                  ${activeTab === tab.id ? "bg-primary/20 border-primary" : "hover:bg-zinc-900"}
                `}
              >
                <Icon className="w-6 h-6" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Pricing section */}
        <div className="bg-zinc-900 border border-primary/30 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">{t("priceList")}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">{t("services")}</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-white">
                  <span>1 {t("marketAnalysis")}</span>
                  <span className="font-mono text-primary">2 EUR</span>
                </li>
                <li className="flex justify-between text-white">
                  <span>1 {t("technicalConsultation")} (40 {t("messages")})</span>
                  <span className="font-mono text-primary">6 EUR</span>
                </li>
                <li className="flex justify-between text-white">
                  <span>{t("additional")} +20 {t("messages")}</span>
                  <span className="font-mono text-primary">2 EUR</span>
                </li>
              </ul>
            </div>

            {/* Packages */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">{t("packages")}</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-white">
                  <span>STARTER - 4 {t("analysesLower")} + 1 {t("consultationShort")} (40 {t("messagesShort")})</span>
                  <span className="font-mono text-primary">12 EUR</span>
                </li>
                <li className="flex justify-between text-white">
                  <span>PRO - 10 {t("analysesLower")} + 2 {t("consultationsShort")} (80 {t("messagesShort")})</span>
                  <span className="font-mono text-primary">18 EUR</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-zinc-900 border border-primary/30 rounded-lg p-6">
          {activeTab === "purchases" && <ServicesTab />}
          {activeTab === "analyses" && <AnalysesTab />}
          {activeTab === "consultations" && <ChatsTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
