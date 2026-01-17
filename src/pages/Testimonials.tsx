import { ArrowLeft, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const Testimonials = () => {
  const {
    t
  } = useLanguage();
  const testimonials = [{
    textKey: "testimonial1",
    authorKey: "testimonial1Author",
    roleKey: "testimonial1Role",
    rating: 5
  }, {
    textKey: "testimonial2",
    authorKey: "testimonial2Author",
    roleKey: "testimonial2Role",
    rating: 5
  }, {
    textKey: "testimonial3",
    authorKey: "testimonial3Author",
    roleKey: "testimonial3Role",
    rating: 5
  }];
  return <div className="min-h-screen bg-background">
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

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => <Card key={index} className="p-6 bg-card border-primary/20 hover:border-primary/50 transition-all duration-300 animate-slide-up relative" style={{
            animationDelay: `${index * 100}ms`
          }}>
                {/* Quote icon */}
                
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                </div>

                {/* Text */}
                <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed italic">
                  "{t(testimonial.textKey)}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <span className="text-primary font-bold text-lg">
                      {t(testimonial.authorKey).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{t(testimonial.authorKey)}</p>
                    <p className="text-sm text-muted-foreground">{t(testimonial.roleKey)}</p>
                  </div>
                </div>
              </Card>)}
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
    </div>;
};
export default Testimonials;