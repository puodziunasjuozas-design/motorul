import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-primary/20 bg-black mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-start gap-2 max-w-5xl mx-auto">
          <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center sm:text-left">
            {t("disclaimerShort")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;