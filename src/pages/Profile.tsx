import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";
import { ShoppingBag, BarChart3, MessageSquare } from "lucide-react";
type TabType = "purchases" | "analyses" | "consultations";
const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("purchases");
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  const tabs = [{
    id: "purchases" as TabType,
    label: t("myPurchases"),
    icon: ShoppingBag
  }, {
    id: "analyses" as TabType,
    label: t("analyses"),
    icon: BarChart3
  }, {
    id: "consultations" as TabType,
    label: t("technicalConsultations"),
    icon: MessageSquare
  }];
  return <div className="min-h-screen bg-zinc-950">
      <Header />
      
      <div className="container mx-auto px-6 pt-28 pb-20">
        <h1 className="text-white mb-8 text-center text-8xl font-extrabold">{t("profile")}</h1>
        
        {/* Large navigation buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabs.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`
                  flex items-center justify-center gap-3 p-6 
                  bg-black border border-primary rounded-lg
                  text-white text-lg font-medium
                  transition-all duration-200
                  ${activeTab === tab.id ? "bg-primary/20 border-primary" : "hover:bg-zinc-900"}
                `}>
                <Icon className="text-red-800 h-[34px] w-[34px]" />
                {tab.label}
              </button>;
        })}
        </div>

        {/* Pricing section */}
        

        {/* Tab content */}
        <div className="border border-primary/30 rounded-lg p-6 bg-background">
          {activeTab === "purchases" && <ServicesTab />}
          {activeTab === "analyses" && <AnalysesTab />}
          {activeTab === "consultations" && <ChatsTab />}
        </div>
      </div>
    </div>;
};
export default Profile;