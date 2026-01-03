import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Wrench, DollarSign, Clock, Play, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
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
}
const AnalysisResult = ({
  data
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
  return <div className="space-y-6 animate-slide-up">
      {/* Vehicle Info */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          
          {t("vehicle")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("makeModel")}</p>
            <p className="text-2xl font-semibold">{data.vehicleInfo.make} {data.vehicleInfo.model}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("year")}</p>
            <p className="text-2xl font-semibold">{data.vehicleInfo.year}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("mileage")}</p>
            <p className="text-2xl font-semibold">{data.vehicleInfo.mileage}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("fuel")}</p>
            <p className="text-2xl font-semibold">{data.vehicleInfo.fuelType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("transmission")}</p>
            <p className="text-2xl font-semibold">{data.vehicleInfo.transmission}</p>
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
            <p className="text-sm text-muted-foreground mb-1">{t("currentPrice")}</p>
            <p className={`text-2xl font-bold ${getPriceColor(data.marketAnalysis.priceRating)}`}>
              €{data.marketAnalysis.currentPrice.toLocaleString()}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${data.marketAnalysis.priceRating === "good" ? "bg-primary/20 text-primary" : data.marketAnalysis.priceRating === "overpriced" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
              {getPriceLabel(data.marketAnalysis.priceRating)}
            </span>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">{t("marketAverage")}</p>
            <p className="text-2xl font-bold text-foreground">
              €{data.marketAnalysis.marketAverage.toLocaleString()}
            </p>
            <span className="text-xs text-muted-foreground">
              {t("similarVehicles")}
            </span>
          </div>
          <div className="text-center p-4 rounded-xl bg-secondary/30">
            <p className="text-sm text-muted-foreground mb-1">{t("resaleValue")}</p>
            <p className="text-2xl font-bold text-foreground">
              €{data.marketAnalysis.estimatedResaleValue.toLocaleString()}
            </p>
            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {data.marketAnalysis.resaleTimeframe}
            </span>
          </div>
        </div>
      </Card>

      {/* Repair Estimate */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
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
              €{data.repairEstimate.totalCost.toLocaleString()}
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
              {data.profitability.isProfitable ? "+" : ""}€{data.profitability.potentialProfit.toLocaleString()}
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
        
        {data.positives.length > 0 && <Card className="glass-card p-6 border-primary/30">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              {t("positives")}
            </h3>
            <ul className="space-y-2">
              {data.positives.map((positive, index) => <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {positive}
                </li>)}
            </ul>
          </Card>}
      </div>

      {/* Video Tutorials */}
      {data.videos.length > 0 && <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            {t("youtubeVideos")}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.videos.map((video, index) => <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-video rounded-lg overflow-hidden bg-secondary">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background to-transparent">
                  <p className="text-sm font-medium line-clamp-2 flex items-center gap-1">
                    {video.title}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </p>
                </div>
              </a>)}
          </div>
        </Card>}
    </div>;
};
export default AnalysisResult;