import { useState, useEffect } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestimonialFormProps {
  userId: string;
  onSuccess?: () => void;
}

const countryOptions: Record<string, string> = {
  lt: "Lietuva",
  en: "United Kingdom",
  de: "Deutschland",
  pl: "Polska",
  fr: "France",
  es: "España",
  it: "Italia",
  pt: "Portugal",
  nl: "Nederland",
  ru: "Россия",
  cs: "Česko",
  bg: "България",
  hu: "Magyarország",
  ro: "România",
  sv: "Sverige",
  fi: "Suomi",
  da: "Danmark",
  el: "Ελλάδα",
  lv: "Latvija",
  et: "Eesti",
  hr: "Hrvatska",
  sk: "Slovensko",
  sl: "Slovenija",
  ga: "Ireland",
};

const TestimonialForm = ({ userId, onSuccess }: TestimonialFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligible, setEligible] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const [purchases, analyses, chats] = await Promise.all([
        supabase.from("purchases").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
        supabase.from("analysis_history").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).eq("user_id", userId),
      ]);
      const hasPurchase = (purchases.count || 0) > 0;
      const hasActivity = (analyses.count || 0) > 0 || (chats.count || 0) > 0;
      setEligible(hasPurchase && hasActivity);
    };
    check();
  }, [userId]);

  const country = countryOptions[language] || countryOptions.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() || !authorName.trim()) {
      toast({
        title: t("error"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (text.length > 500) {
      toast({
        title: t("error"),
        description: t("testimonialTooLong"),
        variant: "destructive",
      });
      return;
    }

    if (authorName.length > 50) {
      toast({
        title: t("error"),
        description: t("nameTooLong"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_testimonials").insert({
        user_id: userId,
        text: text.trim(),
        rating,
        author_name: authorName.trim(),
        country,
      });

      if (error) {
        if (error.code === "42501") {
          toast({
            title: t("error"),
            description: t("noPurchasesForTestimonial"),
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: t("testimonialSubmitted"),
        description: t("testimonialPendingApproval"),
      });

      setText("");
      setAuthorName("");
      setRating(5);
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast({
        title: t("error"),
        description: t("testimonialSubmitError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4">{t("leaveTestimonial")}</h3>
      {eligible === false && (
        <p className="text-sm text-muted-foreground mb-4">
          {t("noPurchasesForTestimonial")}
        </p>
      )}
      {eligible !== false && (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {t("yourRating")}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {t("yourName")}
          </label>
          <Input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder={t("yourNamePlaceholder")}
            maxLength={50}
          />
        </div>

        {/* Text */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {t("yourTestimonial")}
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("testimonialPlaceholder")}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {text.length}/500
          </p>
        </div>

        {/* Country info */}
        <p className="text-sm text-muted-foreground">
          {t("yourCountry")}: <span className="font-medium">{country}</span>
        </p>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            t("submitting")
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t("submitTestimonial")}
            </>
          )}
        </Button>
      </form>
      )}
    </Card>
  );
};

export default TestimonialForm;
