import { useState, useEffect } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTestimonialsForLanguage, Testimonial } from "@/data/testimonials";
import TestimonialForm from "@/components/TestimonialForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface UserTestimonial {
  id: string;
  text: string;
  author_name: string;
  country: string;
  rating: number;
  created_at: string;
}

const Testimonials = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [hasPurchases, setHasPurchases] = useState(false);
  const [userTestimonials, setUserTestimonials] = useState<UserTestimonial[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const staticTestimonials = getTestimonialsForLanguage(language);

  // Check if user has purchases
  useEffect(() => {
    const checkPurchases = async () => {
      if (!user) {
        setHasPurchases(false);
        return;
      }

      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasPurchases(true);
      }
    };

    checkPurchases();
  }, [user]);

  // Fetch approved user testimonials
  useEffect(() => {
    const fetchUserTestimonials = async () => {
      const { data, error } = await supabase
        .from("user_testimonials")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUserTestimonials(data);
      }
    };

    fetchUserTestimonials();
  }, [refreshKey]);

  // Combine static and user testimonials
  const allTestimonials: Testimonial[] = [
    ...userTestimonials.map((ut) => ({
      id: ut.id,
      text: ut.text,
      author: ut.author_name,
      country: ut.country,
      countryCode: language,
      rating: ut.rating,
    })),
    ...staticTestimonials,
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Back button */}
          <Link to="/">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              {t("goBack")}
            </Button>
          </Link>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4">
              {t("testimonials")}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("testimonialsSubtitle")}
            </p>
          </div>

          {/* Testimonial Form for users with purchases */}
          {user && hasPurchases && (
            <div className="max-w-xl mx-auto mb-12">
              <TestimonialForm 
                userId={user.id} 
                onSuccess={() => setRefreshKey((k) => k + 1)} 
              />
            </div>
          )}

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {allTestimonials.map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className="p-6 bg-card border-primary/20 hover:border-primary/50 transition-all duration-300 animate-slide-up relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <span className="text-primary font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.country}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 {t("title")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Testimonials;
