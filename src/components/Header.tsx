import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Car, Bike, LogOut, User, ShoppingBag, BarChart3, MessageSquare } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

type TabType = "services" | "analyses" | "consultations";

interface HeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  showProfileTabs?: boolean;
}

const Header = ({ activeTab, onTabChange, showProfileTabs = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const tabs = [
    { id: "services" as TabType, label: t("myPurchases"), icon: ShoppingBag },
    { id: "analyses" as TabType, label: t("analyses"), icon: BarChart3 },
    { id: "consultations" as TabType, label: t("technicalConsultations"), icon: MessageSquare }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-6 py-4 border-primary border-0">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative flex items-center gap-1 p-2 rounded-xl bg-primary/10">
                <Car className="w-6 h-6 text-primary" />
                <Bike className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="gradient-text text-3xl font-extrabold">​MOTORUL</span>
              </h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline text-muted-foreground">{t("profile")}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      {showProfileTabs && onTabChange && (
        <div className="container mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2
                    rounded-lg text-sm sm:text-base font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-black/50 text-muted-foreground hover:bg-black/70 hover:text-foreground border border-primary/30"}
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
