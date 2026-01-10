import { useLanguage, Language } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "lt", name: "Lietuvių", flag: "🇱🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ga", name: "Gaeilge", flag: "🇮🇪" },
  { code: "bg", name: "Български", flag: "🇧🇬" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "da", name: "Dansk", flag: "🇩🇰" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "et", name: "Eesti", flag: "🇪🇪" },
  { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fi", name: "Suomi", flag: "🇫🇮" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "hr", name: "Hrvatski", flag: "🇭🇷" },
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "lv", name: "Latviešu", flag: "🇱🇻" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ro", name: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "sl", name: "Slovenščina", flag: "🇸🇮" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const currentLang = languages.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {/* On mobile: show only globe icon for minimalist look */}
          {isMobile ? (
            <span className="text-xs font-medium uppercase">{language}</span>
          ) : (
            <span className="text-lg">{currentLang?.flag}</span>
          )}
          <Globe className="w-4 h-4 text-red-800" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] max-h-[400px] overflow-y-auto">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-2 cursor-pointer ${language === lang.code ? "bg-accent" : ""}`}
          >
            {/* On mobile: minimal flags or just code, on desktop: show flags */}
            {isMobile ? (
              <span className="text-xs font-medium uppercase w-6">{lang.code}</span>
            ) : (
              <span className="text-lg">{lang.flag}</span>
            )}
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
