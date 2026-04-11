import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar, MessageSquare, Pencil, Check, X, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

const ChatsTab = ({
  onCreditsUsed
}: ChatsTabProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatCredits, setChatCredits] = useState<number>(0);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;
    const { data } = await supabase.from("user_credits").select("consultation_credits").eq("user_id", user.id).maybeSingle();
    setChatCredits(data?.consultation_credits || 0);
  };

  const fetchConversations = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("chat_conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
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
    const { data: currentCredits } = await supabase.from("user_credits").select("chat_messages").eq("user_id", user.id).single();
    if (!currentCredits || currentCredits.chat_messages <= 0) {
      toast.error("Neturite žinučių. Papildykite balansą!");
      return;
    }
    const { data, error } = await supabase.from("chat_conversations").insert({
      user_id: user.id,
      title: t("newConversation"),
      is_active: true,
      messages_count: 0
    }).select().single();
    if (error) {
      toast.error(t("errorCreatingChat"));
    } else {
      setConversations([data, ...conversations]);
      onCreditsUsed?.();
      setActiveConversation(data);
      setChatDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("chat_conversations").delete().eq("id", id);
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

  const handleStartRename = (e: React.MouseEvent, chat: ChatConversation) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title || "");
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const trimmed = editTitle.trim().slice(0, 40);
    const { error } = await supabase.from("chat_conversations").update({
      title: trimmed || null
    }).eq("id", id);
    if (error) {
      toast.error(t("error"));
    } else {
      setConversations(conversations.map(c => c.id === id ? { ...c, title: trimmed || null } : c));
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
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
      {/* Credits info bar */}
      <div className="flex-col gap-3 p-3 sm:p-4 rounded-lg border border-primary/20 bg-background items-center justify-between flex sm:flex-row">
        <div className="flex items-center gap-2 text-sm sm:text-base">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">Liko konsultacijų:</span>
          <span className={`font-bold text-lg ${chatCredits <= 5 ? 'text-destructive' : 'text-primary'}`}>{chatCredits}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/prices")}
          className="border-primary/30 hover:bg-primary/10 text-primary"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t("buyMore") || "Papildyti"}
        </Button>
      </div>

      {chatCredits > 0 && (
        <Button onClick={handleNewChat} className="w-full bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {t("newChat")}
        </Button>
      )}

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-red-800" />
          <h3 className="text-foreground mb-2 text-xl sm:text-3xl font-semibold">{t("noChats")}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(chat => (
            <Card key={chat.id} className="bg-zinc-900 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => handleOpenChat(chat)}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0 bg-background border-primary border">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingId === chat.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Input value={editTitle} onChange={e => setEditTitle(e.target.value.slice(0, 40))} className="h-7 text-sm max-w-[200px]" maxLength={40} autoFocus onKeyDown={e => {
                            if (e.key === "Enter") handleSaveRename(e as any, chat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }} />
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={e => handleSaveRename(e, chat.id)}>
                            <Check className="w-3 h-3 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCancelRename}>
                            <X className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <h4 className="text-foreground truncate text-base sm:text-lg font-semibold">
                          {chat.title || t("untitledChat")}
                        </h4>
                      )}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 text-red-800" />
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {chat.messages_count} {t("messages")}
                        </span>
                        <Badge className={`text-xs ${chat.is_active ? "bg-green-600" : "bg-zinc-600"}`}>
                          {chat.is_active ? t("active") : t("archived")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={e => handleStartRename(e, chat)} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => {
                      e.stopPropagation();
                      handleDelete(chat.id);
                    }} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <ChatDialog open={chatDialogOpen} onOpenChange={setChatDialogOpen} conversationId={activeConversation?.id || ""} conversationTitle={activeConversation?.title || t("technicalConsultation")} onCreditsUsed={() => {
            fetchCredits();
            onCreditsUsed?.();
          }} />
        </div>
      )}
    </div>
  );
};

export default ChatsTab;
