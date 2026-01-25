import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Car, Bike, LogOut, User } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
const Header = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  return <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
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
                <span className="gradient-text text-3xl font-extrabold">​MOTORIX</span>
                
              </h1>
              
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            
            {user ? <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline text-muted-foreground">{t("profile")}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </> : <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                {t("login")}
              </Button>}
          </div>
        </div>
      </div>
    </header>;
};
export default Header;