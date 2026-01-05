import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import ServicesTab from "@/components/profile/ServicesTab";
import AnalysesTab from "@/components/profile/AnalysesTab";
import ChatsTab from "@/components/profile/ChatsTab";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileModal = ({ open, onOpenChange }: ProfileModalProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("services");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-zinc-950 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {t("profile")}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("services")}
            </TabsTrigger>
            <TabsTrigger 
              value="analyses" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("myAnalyses")}
            </TabsTrigger>
            <TabsTrigger 
              value="chats" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t("aiChats")}
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="services" className="m-0">
              <ServicesTab />
            </TabsContent>
            <TabsContent value="analyses" className="m-0">
              <AnalysesTab />
            </TabsContent>
            <TabsContent value="chats" className="m-0">
              <ChatsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
