import { TrendingUp, DollarSign, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const AnalysisPreview = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-lg mx-auto space-y-2 animate-slide-up scale-[0.85] origin-top">
      {/* Vehicle Info Mini */}
      <Card className="glass-card p-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-muted-foreground text-[10px]">{t("makeModel")}</p>
            <p className="text-sm font-bold text-foreground">BMW 320d</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px]">{t("year")}</p>
            <p className="text-sm font-bold text-foreground">2019</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px]">{t("mileage")}</p>
            <p className="text-sm font-bold text-foreground">145 000 km</p>
          </div>
        </div>
      </Card>

      {/* Price Analysis Mini */}
      <Card className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-3 h-3 text-primary" />
          <span className="text-xs font-semibold">{t("marketAnalysis")}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-secondary/30">
            <p className="text-[10px] text-muted-foreground">{t("currentPrice")}</p>
            <p className="text-xs font-bold text-primary">€18,500</p>
          </div>
          <div className="p-1.5 rounded-lg bg-secondary/30">
            <p className="text-[10px] text-muted-foreground">{t("marketAverage")}</p>
            <p className="text-xs font-bold">€19,800</p>
          </div>
          <div className="p-1.5 rounded-lg bg-secondary/30">
            <p className="text-[10px] text-muted-foreground">{t("resaleValue")}</p>
            <p className="text-xs font-bold">€20,500</p>
          </div>
        </div>
      </Card>

      {/* Repair + Profitability Row */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-3 h-3 text-destructive" />
            <span className="text-xs font-semibold text-destructive">{t("repairEstimate")}</span>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-sm font-bold text-primary">€730</span>
          </div>
        </Card>

        <Card className="glass-card p-3 border border-primary/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold">{t("worthBuying")}</p>
              <p className="text-sm font-bold text-primary">+€1,270</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Warnings & Positives Mini */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="glass-card p-2 border-destructive/30">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-2.5 h-2.5 text-destructive" />
            <span className="text-[10px] font-semibold text-destructive">{t("warnings")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">• Didelė rida</p>
        </Card>
        <Card className="glass-card p-2 border-primary/30">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary">{t("positives")}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">• Pilna servisų istorija</p>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPreview;
