import { LucideIcon } from "lucide-react";
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0
}: FeatureCardProps) => {
  return <div className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group animate-slide-up" style={{
    animationDelay: `${delay}ms`
  }}>
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h3 className="mb-2 text-2xl font-extrabold text-center">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>;
};
export default FeatureCard;