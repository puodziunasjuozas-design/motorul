import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Wrench, DollarSign, Target, Clock, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
export interface AnalysisData {
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    mileage: string;
    fuelType: string;
    transmission: string;
  };
  marketAnalysis: {
    currentPrice: number;
    marketAverage: number;
    priceRating: "good" | "average" | "overpriced";
    estimatedResaleValue: number;
    resaleTimeframe: string;
  };
  repairEstimate: {
    totalCost: number;
    items: Array<{
      name: string;
      cost: number;
      urgency: "high" | "medium" | "low";
    }>;
  };
  profitability: {
    isProfitable: boolean;
    potentialProfit: number;
    recommendation: string;
  };
  videos: Array<{
    title: string;
    url: string;
    thumbnail: string;
  }>;
  warnings: string[];
  positives: string[];
}
interface AnalysisResultProps {
  data: AnalysisData;
  onTransferToConsultation?: (data: AnalysisData) => void;
}
const AnalysisResult = ({
  data,
  onTransferToConsultation
}: AnalysisResultProps) => {
  const {
    t
  } = useLanguage();
  const getPriceColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "stat-positive";
      case "overpriced":
        return "stat-negative";
      default:
        return "stat-warning";
    }
  };
  const getPriceLabel = (rating: string) => {
    switch (rating) {
      case "good":
        return t("goodPrice");
      case "overpriced":
        return t("overpriced");
      default:
        return t("averagePrice");
    }
  };
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };
  return <div className="space-y-6 animate-slide-up max-w-5xl mx-auto w-full">
      {/* Transfer to Consultation Button */}
      {onTransferToConsultation && (
        <Button 
          onClick={() => onTransferToConsultation(data)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("transferToConsultation")}
        </Button>
      )}

      {/* Vehicle Info */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {t("vehicle")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground text-lg">{t("makeModel")}</p>
            <p className="text-3xl font-semibold">{data.vehicleInfo.make} {data.vehicleInfo.model}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-lg">{t("year")}</p>
            <p className="text-3xl font-semibold">{data.vehicleInfo.year}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-lg">{t("mileage")}</p>
            <p className="text-3xl font-semibold">{data.vehicleInfo.mileage}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-lg">{t("fuel")}</p>
            <p className="text-3xl font-semibold">{data.vehicleInfo.fuelType}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-lg">{t("transmission")}</p>
            <p className="text-3xl font-semibold">{data.vehicleInfo.transmission}</p>
          </div>
        </div>
      </Card>

      {/* Market Analysis */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          {t("marketAnalysis")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <p className="text-muted-foreground mb-1 text-lg">{t("currentPrice")}</p>
            <p className={`text-2xl font-bold ${getPriceColor(data.marketAnalysis.priceRating)}`}>
              €{(data.marketAnalysis.currentPrice ?? 0).toLocaleString()}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${data.marketAnalysis.priceRating === "good" ? "bg-primary/20 text-primary" : data.marketAnalysis.priceRating === "overpriced" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
              {getPriceLabel(data.marketAnalysis.priceRating)}
            </span>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <p className="text-muted-foreground mb-1 text-lg">{t("marketAverage")}</p>
            <p className="text-2xl font-bold text-foreground">
              €{(data.marketAnalysis.marketAverage ?? 0).toLocaleString()}
            </p>
            <span className="text-muted-foreground text-sm">
              {t("similarVehicles")}
            </span>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <p className="text-muted-foreground mb-1 text-lg">{t("resaleValue")}</p>
            <p className="text-2xl font-bold text-foreground">
              €{(data.marketAnalysis.estimatedResaleValue ?? 0).toLocaleString()}
            </p>
            <span className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <Clock className="w-3 h-3 text-red-800" />
              {data.marketAnalysis.resaleTimeframe}
            </span>
          </div>
        </div>
      </Card>

      {/* Repair Estimate */}
      <Card className="glass-card p-6">
        <h3 className="mb-4 items-center border-red-800 flex flex-row gap-[8px] text-red-800 bg-transparent font-bold text-2xl">
          <Wrench className="w-5 h-5 text-red-800" />
          {t("repairEstimate")}
        </h3>
        <div className="space-y-3">
          {data.repairEstimate.items.map((item, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.urgency === "high" ? "bg-destructive" : item.urgency === "medium" ? "bg-warning" : "bg-muted-foreground"}`} />
                <span className={getUrgencyColor(item.urgency)}>{item.name}</span>
              </div>
              <span className="font-mono font-medium">€{item.cost}</span>
            </div>)}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30 mt-4">
            <span className="font-semibold">{t("totalRepairCost")}:</span>
            <span className="text-xl font-bold text-primary">
              €{(data.repairEstimate.totalCost ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Profitability */}
      <Card className={`glass-card p-6 border-2 ${data.profitability.isProfitable ? "border-primary/50" : "border-destructive/50"}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${data.profitability.isProfitable ? "bg-primary/20" : "bg-destructive/20"}`}>
            {data.profitability.isProfitable ? <TrendingUp className="w-8 h-8 text-primary" /> : <TrendingDown className="w-8 h-8 text-destructive" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              {data.profitability.isProfitable ? t("worthBuying") : t("notRecommended")}
            </h3>
            <p className={`text-2xl font-bold mb-2 ${data.profitability.isProfitable ? "stat-positive" : "stat-negative"}`}>
              {data.profitability.isProfitable ? "+" : ""}€{(data.profitability.potentialProfit ?? 0).toLocaleString()}
            </p>
            <p className="text-muted-foreground">{data.profitability.recommendation}</p>
          </div>
        </div>
      </Card>

      {/* Warnings & Positives */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.warnings.length > 0 && <Card className="glass-card p-6 border-destructive/30">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t("warnings")}
            </h3>
            <ul className="space-y-2">
              {data.warnings.map((warning, index) => <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive mt-1">•</span>
                  {warning}
                </li>)}
            </ul>
          </Card>}
        
        {data.positives.length > 0 && <Card className="glass-card p-6 border-2 border-emerald-700 bg-emerald-950/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              {t("positives")}
            </h3>
            <ul className="space-y-2">
              {data.positives.map((positive, index) => <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-emerald-500 mt-1">✓</span>
                  {positive}
                </li>)}
            </ul>
          </Card>}
      </div>

    </div>;
};
export default AnalysisResult;