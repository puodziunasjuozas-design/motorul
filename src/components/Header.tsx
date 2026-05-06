import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User, ShoppingBag, BarChart3, MessageSquare, Shield } from "lucide-react";
import logoImg from "@/assets/logo.png";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

type TabType = "services" | "analyses" | "consultations";

interface HeaderProps {
  activeTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { id: "services" as TabType, label: t("priceList"), icon: ShoppingBag, path: "/prices" },
    { id: "analyses" as TabType, label: t("analyses"), icon: BarChart3, path: "/analyses" },
    { id: "consultations" as TabType, label: t("technicalConsultation"), icon: MessageSquare, path: "/consultations" }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    navigate(item.path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
       <div className="container mx-auto px-4 sm:px-6 py-1 border-primary border-0">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={logoImg} alt="MOTORUL logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-contain object-center" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight">
                <span className="gradient-text text-3xl font-extrabold">​MOTORUL</span>
              </h1>
            </div>
          </Link>

          {/* Profile Navigation Tabs - visible when logged in */}
          {user && (
            <div className="flex gap-6 sm:gap-10 flex-1 justify-center">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = 
                  (item.id === "services" && location.pathname === "/prices") ||
                  (item.id === "analyses" && location.pathname === "/analyses") ||
                  (item.id === "consultations" && location.pathname === "/consultations");
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`
                      flex flex-col items-center gap-0.5 p-2 transition-all duration-200
                      ${isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"}
                    `}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <LanguageSelector />
            
            {user && isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline text-muted-foreground">Admin</span>
              </Button>
            )}
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline text-muted-foreground">{t("profile")}</span>
              </Button>
            ) : (
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
