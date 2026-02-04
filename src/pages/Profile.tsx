import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";
import AccountSettingsDialog from "@/components/profile/AccountSettingsDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TabType = "services" | "analyses" | "consultations";

const Profile = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "analyses";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [analysisCredits, setAnalysisCredits] = useState<number>(0);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("analysis_credits, chat_messages")
      .eq("user_id", user.id)
      .single();
    
    setAnalysisCredits(data?.analysis_credits || 0);
    setChatCredits(data?.chat_messages || 0);
  };

  const fetchStats = async () => {
    if (!user) return;

    // Fetch display name
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

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
  };

  // Check if we're on the profile/account view (not purchases)
  const isProfileView = activeTab === "analyses" || activeTab === "consultations";

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
      
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 sm:pb-20">
        {/* Services/Purchases Tab - Shows only prices */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("buyServices")}</h2>
            <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
              <ServicesTab />
            </div>
          </div>
        )}

        {/* Profile View - Account info + Both Histories */}
        {isProfileView && (
          <>
            {/* User Account Section */}
            <div className="mb-8">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("userAccount")}</h2>
              <Card className="bg-black border-primary/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{t("displayName")}</p>
                      <p className="text-white text-lg font-semibold">
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
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("remainingCredits")}</h2>
              <Card className="bg-black border-primary/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="flex items-center gap-3">
                      <Search className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                      <div>
                        <p className="text-white text-2xl sm:text-3xl font-bold">{analysisCredits}</p>
                        <p className="text-muted-foreground text-sm">{t("analyses")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                      <div>
                        <p className="text-white text-2xl sm:text-3xl font-bold">{chatCredits}</p>
                        <p className="text-muted-foreground text-sm">{t("consultationsRemaining")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analyses History Section */}
            <div className="mb-8">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("analysisHistory")}</h2>
              <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
                <AnalysesTab onCreditsUsed={fetchCredits} />
              </div>
            </div>

            {/* Consultations History Section */}
            <div className="mb-8">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("technicalConsultations")}</h2>
              <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
                <ChatsTab onCreditsUsed={fetchCredits} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
