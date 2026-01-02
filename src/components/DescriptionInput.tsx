import { Textarea } from "@/components/ui/textarea";
import { Link2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  return <div className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="w-4 h-4 text-red-800" />
          Skelbimo nuoroda (nebūtina)
        </label>
        <Input value={listingUrl} onChange={e => onListingUrlChange(e.target.value)} placeholder="https://autoplius.lt/..." className="bg-card border-border focus:border-primary" />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <FileText className="w-4 h-4 text-primary" />
          Aprašymas iš skelbimo
        </label>
        <Textarea value={description} onChange={e => onDescriptionChange(e.target.value)} placeholder="Įklijuokite skelbimo aprašymą čia...

Pvz.: BMW 320d, 2018 m., 150 000 km, dyzelinas, automatinė pavarų dėžė, pilna serviso istorija..." rows={6} className="bg-card border-border focus:border-primary resize-none" />
        <p className="text-xs text-muted-foreground">
          Kuo daugiau informacijos pateiksite, tuo tikslesnė bus analizė
        </p>
      </div>
    </div>;
};
export default DescriptionInput;