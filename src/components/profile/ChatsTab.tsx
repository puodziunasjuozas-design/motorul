import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Plus, Trash2, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatConversation {
  id: string;
  title: string | null;
  is_active: boolean;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

const ChatsTab = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

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
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        user_id: user.id,
        title: t("newConversation"),
        is_active: true,
        messages_count: 0,
      })
      .select()
      .single();

    if (error) {
      toast.error(t("errorCreatingChat"));
    } else {
      setConversations([data, ...conversations]);
      toast.success(t("chatCreated"));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("errorDeletingChat"));
    } else {
      setConversations(conversations.filter(c => c.id !== id));
      toast.success(t("chatDeleted"));
    }
  };

  const handleOpenChat = (id: string) => {
    toast.info(t("chatFeatureComingSoon"));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleNewChat}
        className="w-full bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t("newChat")}
      </Button>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t("noChats")}</h3>
          <p className="text-muted-foreground">{t("noChatsDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((chat) => (
            <Card 
              key={chat.id} 
              className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => handleOpenChat(chat.id)}
            >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(chat.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
