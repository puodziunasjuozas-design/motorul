import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
        redirectTo: `${window.location.origin}/reset-password`,
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: t("error"),
          description: result.error.message || "Google prisijungimas nepavyko",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate("/");
    } catch (e) {
      toast({
        title: t("error"),
        description: e instanceof Error ? e.message : "Google prisijungimas nepavyko",
        variant: "destructive",
      });
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

      <div className="mt-4">
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">arba</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Prisijungti su Google
        </Button>
      </div>

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