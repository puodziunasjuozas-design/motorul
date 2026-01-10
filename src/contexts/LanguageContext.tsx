import { createContext, useContext, useState, ReactNode } from "react";
import { lt } from "@/locales/lt";
import { en } from "@/locales/en";
import { ga } from "@/locales/ga";
import { bg } from "@/locales/bg";
import { cs } from "@/locales/cs";
import { da } from "@/locales/da";
import { et } from "@/locales/et";
import { el } from "@/locales/el";
import { ru } from "@/locales/ru";
import { es, it, hr, lv, pl, nl, pt, fr, ro, sk, sl, fi, sv, hu, de } from "@/locales/eu-languages";

export type Language = 
  | "lt" | "en" | "ga" | "bg" | "cs" | "da" | "et" | "el" 
  | "es" | "it" | "hr" | "lv" | "pl" | "nl" | "pt" | "fr" 
  | "ro" | "sk" | "sl" | "fi" | "sv" | "hu" | "de" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  lt, en, ga, bg, cs, da, et, el, es, it, hr, lv, pl, nl, pt, fr, ro, sk, sl, fi, sv, hu, de, ru
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved && translations[saved] ? saved : "lt";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
