import { TrendingUp, DollarSign, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const AnalysisPreview = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-slide-up">
      {/* Vehicle Info Mini */}
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">{t("makeModel")}</p>
            <p className="text-lg font-bold text-foreground">BMW 320d</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">{t("year")}</p>
            <p className="text-lg font-bold text-foreground">2019</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs">{t("mileage")}</p>
            <p className="text-lg font-bold text-foreground">145 000 km</p>
          </div>
        </div>
      </Card>

      {/* Price Analysis Mini */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{t("marketAnalysis")}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">{t("currentPrice")}</p>
            <p className="text-sm font-bold text-primary">€18,500</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
              {t("goodPrice")}
            </span>
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

      {/* Repair Estimate Mini */}
      <Card className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <Wrench className="w-4 h-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">{t("repairEstimate")}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Stabdžių diskai</span>
            </div>
            <span className="font-mono">€280</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span className="text-muted-foreground">Paskirstymo diržas</span>
            </div>
            <span className="font-mono">€450</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/30 mt-2">
            <span className="text-xs font-semibold">{t("totalRepairCost")}:</span>
            <span className="text-sm font-bold text-primary">€730</span>
          </div>
        </div>
      </Card>

      {/* Profitability Mini */}
      <Card className="glass-card p-4 border-2 border-primary/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t("worthBuying")}</p>
            <p className="text-lg font-bold text-primary">+€1,270</p>
          </div>
        </div>
      </Card>

      {/* Warnings & Positives Mini */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card p-3 border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3 h-3 text-destructive" />
            <span className="text-xs font-semibold text-destructive">{t("warnings")}</span>
          </div>
          <ul className="space-y-1">
            <li className="text-[10px] text-muted-foreground flex items-start gap-1">
              <span className="text-destructive">•</span>
              Didelė rida
            </li>
          </ul>
        </Card>
        <Card className="glass-card p-3 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">{t("positives")}</span>
          </div>
          <ul className="space-y-1">
            <li className="text-[10px] text-muted-foreground flex items-start gap-1">
              <span className="text-primary">•</span>
              Pilna servisų istorija
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPreview;
