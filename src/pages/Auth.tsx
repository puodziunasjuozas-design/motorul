import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car, Bike, Mail, Lock, ArrowLeft } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  password: z.string().min(6, "Slaptažodis turi būti bent 6 simbolių"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Klaida",
              description: "Neteisingas el. paštas arba slaptažodis",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Klaida",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Sėkmingai prisijungėte!",
            description: "Sveiki sugrįžę",
          });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Klaida",
              description: "Šis el. paštas jau užregistruotas",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Klaida",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Paskyra sukurta!",
            description: "Galite pradėti naudotis",
          });
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md relative">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Grįžti
        </Button>

        <Card className="glass-card p-8">
          {/* Logo */}
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
                <span className="gradient-text">Auto</span>
                <span className="text-foreground">Analizė</span>
              </h1>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">
            {isLogin ? "Prisijungti" : "Registracija"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-primary" />
                El. paštas
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jusu@pastas.lt"
                className={`bg-card border-border focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-4 h-4 text-primary" />
                Slaptažodis
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`bg-card border-border focus:border-primary ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : isLogin ? (
                "Prisijungti"
              ) : (
                "Registruotis"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Neturite paskyros? <span className="text-primary">Registruotis</span></>
              ) : (
                <>Jau turite paskyrą? <span className="text-primary">Prisijungti</span></>
              )}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
