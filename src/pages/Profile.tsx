import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import AccountSettingsDialog from "@/components/profile/AccountSettingsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, LogOut, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const [analysisCredits, setAnalysisCredits] = useState<number>(0);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("analysis_credits, consultation_credits")
      .eq("user_id", user.id)
      .single();
    
    setAnalysisCredits(data?.analysis_credits || 0);
    setChatCredits(data?.consultation_credits || 0);
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();
    
    setDisplayName(profile?.display_name || null);
  };

  useEffect(() => {
    fetchCredits();
    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        {/* User Account Section */}
        <div className="mb-8">
          <h2 className="text-foreground text-2xl sm:text-3xl font-bold mb-4">{t("userAccount")}</h2>
          <Card className="bg-card border-primary/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{t("displayName")}</p>
                  <p className="text-foreground text-lg font-semibold">
                    {displayName || user?.email || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AccountSettingsDialog onSave={fetchStats} />
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Remaining Credits Section */}
        <div className="mb-8">
          <h2 className="text-foreground text-2xl sm:text-3xl font-bold mb-4">{t("remainingCredits")}</h2>
          <Card className="bg-card border-primary/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <Search className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                  <div>
                    <p className="text-foreground text-2xl sm:text-3xl font-bold">{analysisCredits}</p>
                    <p className="text-muted-foreground text-sm">{t("analyses")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                  <div>
                    <p className="text-foreground text-2xl sm:text-3xl font-bold">{chatCredits}</p>
                    <p className="text-muted-foreground text-sm">{t("consultationsRemaining")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Buy Services Button */}
        <Button 
          variant="hero" 
          size="lg" 
          className="w-full"
          onClick={() => navigate("/prices")}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {t("buyServices")}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
