import { Info, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-primary/20 bg-black mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6 max-w-5xl space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">SVARBU:</strong> Ši platforma teikia TIK informacines konsultacijas ir orientacines transporto priemonių analizes. Pateikiama informacija nėra ir negali būti laikoma profesionaliu techniniu, teisiniu ar finansiniu patarimu. Galutinį sprendimą pirkti, parduoti ar remontuoti transporto priemonę visada priimkite patys, įvertinę ją gyvai ir/arba pasitarę su sertifikuotu mechaniku.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Platformos savininkai, kūrėjai ir operatoriai NEPRISIIMA jokios atsakomybės už: (1) netikslią, neišsamią ar pasenusią informaciją; (2) bet kokius tiesioginius ar netiesioginius nuostolius, patirtus remiantis platformoje pateiktais duomenimis ar rekomendacijomis; (3) sandorius, sudarytus tarp pirkėjų ir pardavėjų; (4) transporto priemonių techninę būklę, juridinį statusą ar tikrąją rinkos vertę; (5) trečiųjų šalių (skelbimų portalų, video kanalų) turinį.
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center pt-2 border-t border-border/30">
          Naudodamiesi šia platforma sutinkate, kad visa atsakomybė už priimtus sprendimus tenka jums. Įrankis skirtas tik kaip pagalbinė priemonė informacijai gauti. © {new Date().getFullYear()} MOTORUL.
        </p>
      </div>
    </footer>
  );
};

export default Footer;