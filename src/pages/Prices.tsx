import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";

const Prices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="services" />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        <h2 className="text-foreground text-2xl sm:text-3xl font-bold mb-4">{t("buyServices")}</h2>
        <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
          <ServicesTab />
        </div>
      </div>
    </div>
  );
};

export default Prices;
