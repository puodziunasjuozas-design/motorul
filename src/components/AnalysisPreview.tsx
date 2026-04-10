import { TrendingUp, DollarSign, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const AnalysisPreview = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-3 animate-slide-up">
      {/* Vehicle Info Mini */}
      <Card className="glass-card p-4 sm:p-5">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">{t("makeModel")}</p>
            <p className="text-base font-bold text-foreground">BMW 320d</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">{t("year")}</p>
            <p className="text-base font-bold text-foreground">2019</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">{t("mileage")}</p>
            <p className="text-base font-bold text-foreground">145 000 km</p>
          </div>
        </div>
      </Card>

      {/* Price Analysis Mini */}
      <Card className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{t("marketAnalysis")}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">{t("currentPrice")}</p>
            <p className="text-sm font-bold text-primary">€18,500</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">{t("marketAverage")}</p>
            <p className="text-sm font-bold">€19,800</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">{t("resaleValue")}</p>
            <p className="text-sm font-bold">€20,500</p>
          </div>
        </div>
      </Card>

      {/* Repair + Profitability Row */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">{t("repairEstimate")}</span>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-base font-bold text-primary">€730</span>
          </div>
        </Card>

        <Card className="glass-card p-4 border border-primary/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("worthBuying")}</p>
              <p className="text-base font-bold text-primary">+€1,270</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Warnings & Positives Mini */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="glass-card p-3 border-destructive/30">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">{t("warnings")}</span>
          </div>
          <p className="text-xs text-muted-foreground">• Didelė rida</p>
        </Card>
        <Card className="glass-card p-3 border-green-800">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-800" />
            <span className="text-xs font-semibold text-green-800">{t("positives")}</span>
          </div>
          <p className="text-xs text-muted-foreground">• Pilna servisų istorija</p>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPreview;
