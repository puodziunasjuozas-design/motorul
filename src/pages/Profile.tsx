import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";
import AccountSettingsDialog from "@/components/profile/AccountSettingsDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TabType = "services" | "analyses" | "consultations";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [showAnalysisTool, setShowAnalysisTool] = useState(false);
  const [analysisCredits, setAnalysisCredits] = useState<number>(0);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const [activeChatsCount, setActiveChatsCount] = useState<number>(0);
  const [analysesCount, setAnalysesCount] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
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
    
    // Fetch active chats count
    const { count: chatsCount } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_active", true);
    
    setActiveChatsCount(chatsCount || 0);

    // Fetch analyses count
    const { count: analysisCount } = await supabase
      .from("analysis_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    
    setAnalysesCount(analysisCount || 0);

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
    setShowAnalysisTool(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        showProfileTabs={true}
      />
      
      <div className="container mx-auto px-4 sm:px-6 pt-32 sm:pt-36 pb-12 sm:pb-20">
        {/* Main Profile Content - only show when on services tab */}
        {activeTab === "services" && (
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
                    <AccountSettingsDialog onSave={fetchStats} />
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

            {/* Active Chats Section */}
            <div className="mb-8">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("activeChats")}</h2>
              <Card className="bg-black border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleTabChange("consultations")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                      <div>
                        <p className="text-white text-2xl sm:text-3xl font-bold">{activeChatsCount}</p>
                        <p className="text-muted-foreground text-sm">{t("active")}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-primary h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis History Section */}
            <div className="mb-8">
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("analysisHistory")}</h2>
              <Card className="bg-black border-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleTabChange("analyses")}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Search className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
                      <div>
                        <p className="text-white text-2xl sm:text-3xl font-bold">{analysesCount}</p>
                        <p className="text-muted-foreground text-sm">{t("analyses")}</p>
                      </div>
                    </div>
                    <ArrowRight className="text-primary h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Start Analysis Button - only show in analyses tab when tool is not open AND user has credits */}
        {activeTab === "analyses" && !showAnalysisTool && analysisCredits > 0 && (
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
        {activeTab !== "services" && (
          <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
            {activeTab === "analyses" && (
              <AnalysesTab 
                showAnalysisTool={showAnalysisTool} 
                onAnalysisToolClose={() => setShowAnalysisTool(false)}
                onCreditsUsed={fetchCredits}
              />
            )}
            {activeTab === "consultations" && <ChatsTab onCreditsUsed={fetchCredits} />}
          </div>
        )}

        {/* Services Section - Buy Services */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-bold mb-4">{t("buyServices")}</h2>
            <div className="border border-primary/30 rounded-lg p-4 sm:p-6 bg-background">
              <ServicesTab />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
