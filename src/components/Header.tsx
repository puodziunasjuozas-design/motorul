import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Car, Bike, History, LogOut, User } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
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
                <span className="gradient-text">Auto</span>
                <span className="text-foreground">Analizė</span>
              </h1>
              <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="hidden sm:flex">
                  <History className="w-4 h-4 mr-2" />
                  {t("history")}
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
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
    </header>
  );
};

export default Header;