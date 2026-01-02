import { Textarea } from "@/components/ui/textarea";
import { Link2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface DescriptionInputProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  listingUrl: string;
  onListingUrlChange: (value: string) => void;
}

const DescriptionInput = ({
  description,
  onDescriptionChange,
  listingUrl,
  onListingUrlChange
}: DescriptionInputProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="w-4 h-4 text-red-800" />
          {t("listingUrl")}
        </label>
        <Input
          value={listingUrl}
          onChange={e => onListingUrlChange(e.target.value)}
          placeholder={t("listingUrlPlaceholder")}
          className="bg-card border-border focus:border-primary"
        />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-primary" />
          {t("description")}
        </label>
        <Textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          rows={6}
          className="bg-card border-border focus:border-primary resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {t("moreInfoBetterAnalysis")}
        </p>
      </div>
    </div>
  );
};

export default DescriptionInput;
