import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Trash2, Calendar, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChatDialog from "./ChatDialog";

interface ChatConversation {
  id: string;
  title: string | null;
  is_active: boolean;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatsTabProps {
  onCreditsUsed?: () => void;
}

const ChatsTab = ({ onCreditsUsed }: ChatsTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("chat_messages")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setChatCredits(data?.chat_messages || 0);
  };
  const fetchConversations = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("chat_conversations").select("*").eq("user_id", user.id).order("updated_at", {
      ascending: false
    });
    if (error) {
      console.error("Error fetching conversations:", error);
      toast.error(t("errorFetchingChats"));
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };
  const handleNewChat = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("chat_conversations").insert({
      user_id: user.id,
      title: t("newConversation"),
      is_active: true,
      messages_count: 0
    }).select().single();
    if (error) {
      toast.error(t("errorCreatingChat"));
    } else {
      setConversations([data, ...conversations]);
      // Open chat dialog with new conversation
      setActiveConversation(data);
      setChatDialogOpen(true);
    }
  };
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from("chat_conversations").delete().eq("id", id);
    if (error) {
      toast.error(t("errorDeletingChat"));
    } else {
      setConversations(conversations.filter(c => c.id !== id));
      toast.success(t("chatDeleted"));
    }
  };
  const handleOpenChat = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    setChatDialogOpen(true);
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-4">
      {chatCredits > 0 && (
        <Button onClick={handleNewChat} className="w-full bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {t("newChat")}
        </Button>
      )}

      {conversations.length === 0 ? <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-800" />
          <h3 className="text-foreground mb-2 text-3xl font-semibold">{t("noChats")}</h3>
          
        </div> : <div className="space-y-3">
          {conversations.map(chat => <Card key={chat.id} className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => handleOpenChat(chat)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {chat.title || t("untitledChat")}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {chat.messages_count} {t("messages")}
                        </span>
                        <Badge className={chat.is_active ? "bg-green-600" : "bg-zinc-600"}>
                          {chat.is_active ? t("active") : t("archived")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              handleDelete(chat.id);
            }} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>)}
          
          {/* Chat Dialog */}
          <ChatDialog
            open={chatDialogOpen}
            onOpenChange={setChatDialogOpen}
            conversationId={activeConversation?.id || ""}
            conversationTitle={activeConversation?.title || t("technicalConsultation")}
            onCreditsUsed={() => {
              fetchCredits();
              onCreditsUsed?.();
            }}
          />
        </div>}
    </div>;
};
export default ChatsTab;