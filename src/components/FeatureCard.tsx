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
  return <div style={{
    animationDelay: `${delay}ms`
  }} className="glass-card p-3 sm:p-6 transition-all duration-300 group animate-slide-up border-red-800">
      <div className="relative mb-2 sm:mb-4">
        <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-none shadow-none bg-inherit" />
        <div className="relative w-8 h-8 sm:w-12 sm:h-12 transition-colors flex-row flex items-center justify-center rounded shadow-none opacity-100 border-solid border-0 text-primary-foreground bg-red-800">
          <Icon className="bg-red-800 w-5 h-5 sm:w-[30px] sm:h-[30px] text-black" />
        </div>
      </div>
      <h3 className="mb-1 sm:mb-2 text-sm sm:text-xl md:text-2xl font-extrabold text-center leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{description}</p>
    </div>;
};
export default FeatureCard;