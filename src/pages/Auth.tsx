import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Car, Bike, Mail, Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { z } from "zod";

type AuthMode = "login" | "signup" | "forgot";

const Auth = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const authSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordMin"))
  });

  const emailSchema = z.object({
    email: z.string().email(t("invalidEmail"))
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      if (mode === "forgot") {
        emailSchema.parse({ email });
      } else {
        authSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach(err => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast({
          title: t("error"),
          description: t("resetEmailError"),
          variant: "destructive"
        });
      } else {
        setResetSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "forgot") {
      await handleForgotPassword();
      return;
    }

    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: t("error"),
              description: t("wrongCredentials"),
              variant: "destructive"
            });
          } else {
            toast({
              title: t("error"),
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: t("successLogin"),
            description: t("welcomeBack")
          });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: t("error"),
              description: t("emailExists"),
              variant: "destructive"
            });
          } else {
            toast({
              title: t("error"),
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: t("accountCreated"),
            description: t("startUsing")
          });
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPasswordForm = () => {
    if (resetSent) {
      return (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">{t("resetLinkSent")}</h2>
          <p className="text-muted-foreground">{t("resetLinkSentDesc")}</p>
          <Button
            variant="outline"
            onClick={() => {
              setMode("login");
              setResetSent(false);
              setEmail("");
            }}
            className="mt-4"
          >
            {t("backToLogin")}
          </Button>
        </div>
      );
    }

    return (
      <>
        <h2 className="text-center mb-2 text-3xl font-bold">
          {t("resetPassword")}
        </h2>
        <p className="text-center text-muted-foreground mb-6 text-sm">
          {t("resetPasswordDesc")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Mail className="w-4 h-4 text-primary" />
              {t("email")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className={`bg-card border-border focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              t("sendResetLink")
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("backToLogin")}
          </button>
        </div>
      </>
    );
  };

  const renderLoginSignupForm = () => (
    <>
      <h2 className="text-center mb-6 text-3xl font-bold">
        {mode === "login" ? t("signIn") : t("signUp")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4 text-primary" />
            {t("email")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className={`bg-card border-border focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Lock className="w-4 h-4 text-primary" />
            {t("password")}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`bg-card border-border focus:border-primary pr-10 ${errors.password ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        {mode === "login" && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-sm text-primary hover:underline"
            >
              {t("forgotPassword")}
            </button>
          </div>
        )}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : mode === "login" ? (
            t("signIn")
          ) : (
            t("signUp")
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" ? (
            <>
              {t("noAccount")} <span className="text-primary">{t("signUp")}</span>
            </>
          ) : (
            <>
              {t("hasAccount")} <span className="text-primary">{t("signIn")}</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div ref={ref} className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("goBack")}
        </Button>

        <Card className="glass-card p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative flex items-center gap-1 p-3 rounded-xl bg-primary/10">
                <Car className="w-7 h-7 text-primary" />
                <Bike className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">{t("title").split("A")[0]}A</span>
                <span className="text-foreground">{t("title").slice(t("title").indexOf("A") + 1)}</span>
              </h1>
            </div>
          </div>

          {mode === "forgot" ? renderForgotPasswordForm() : renderLoginSignupForm()}
        </Card>
      </div>
    </div>
  );
});

Auth.displayName = "Auth";
export default Auth;