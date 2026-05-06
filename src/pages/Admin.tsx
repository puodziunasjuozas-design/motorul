import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, MessageSquare, BarChart3, Shield, Star } from "lucide-react";

interface UserRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  analysis_credits: number;
  consultation_credits: number;
}

interface PurchaseRow {
  id: string;
  user_id: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
  email?: string | null;
}

interface TestimonialRow {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  country: string;
  is_approved: boolean;
  created_at: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [analysesCount, setAnalysesCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdminAndLoad();
  }, [user, loading]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
    await loadData();
  };

  const loadData = async () => {
    const [profilesRes, creditsRes, purchasesRes, testimonialsRes, analysesRes, chatsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, email, display_name, created_at"),
      supabase.from("user_credits").select("user_id, analysis_credits, consultation_credits"),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("user_testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("analysis_history").select("id", { count: "exact", head: true }),
      supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
    ]);

    const creditsMap = new Map((creditsRes.data || []).map((c: any) => [c.user_id, c]));
    const merged: UserRow[] = (profilesRes.data || []).map((p: any) => ({
      user_id: p.user_id,
      email: p.email,
      display_name: p.display_name,
      created_at: p.created_at,
      analysis_credits: creditsMap.get(p.user_id)?.analysis_credits ?? 0,
      consultation_credits: creditsMap.get(p.user_id)?.consultation_credits ?? 0,
    }));
    setUsers(merged);

    const emailMap = new Map(merged.map(u => [u.user_id, u.email]));
    setPurchases((purchasesRes.data || []).map((p: any) => ({ ...p, email: emailMap.get(p.user_id) })));
    setTestimonials(testimonialsRes.data || []);
    setAnalysesCount(analysesRes.count || 0);
    setChatsCount(chatsRes.count || 0);
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 text-center">
          <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-3xl font-bold mb-2">Prieiga uždrausta</h1>
          <p className="text-muted-foreground">Šis puslapis prieinamas tik administratoriams.</p>
        </div>
      </div>
    );
  }

  const totalRevenue = purchases.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount || 0), 0);
  const estimatedProfit = totalRevenue * 0.7; // assume ~70% margin
  const completedPurchases = purchases.filter(p => p.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-extrabold">Vadovo skydelis</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard icon={Users} label="Vartotojai" value={users.length} />
          <StatCard icon={DollarSign} label="Pajamos" value={`${totalRevenue.toFixed(2)}€`} />
          <StatCard icon={TrendingUp} label="Pelnas (~70%)" value={`${estimatedProfit.toFixed(2)}€`} />
          <StatCard icon={ShoppingBagIcon} label="Pirkimai" value={completedPurchases} />
          <StatCard icon={BarChart3} label="Analizės" value={analysesCount} />
          <StatCard icon={MessageSquare} label="Konsultacijos" value={chatsCount} />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="users">Vartotojai</TabsTrigger>
            <TabsTrigger value="purchases">Pirkimai</TabsTrigger>
            <TabsTrigger value="testimonials">Atsiliepimai</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>Visi vartotojai ({users.length})</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>El. paštas</TableHead>
                      <TableHead>Vardas</TableHead>
                      <TableHead>Analizės</TableHead>
                      <TableHead>Konsultacijos</TableHead>
                      <TableHead>Registracija</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-mono text-xs">{u.email || "—"}</TableCell>
                        <TableCell>{u.display_name || "—"}</TableCell>
                        <TableCell>{u.analysis_credits}</TableCell>
                        <TableCell>{u.consultation_credits}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader><CardTitle>Pirkimai ({purchases.length})</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Vartotojas</TableHead>
                      <TableHead>Produktas</TableHead>
                      <TableHead>Suma</TableHead>
                      <TableHead>Statusas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-xs">{p.email || p.user_id.slice(0, 8)}</TableCell>
                        <TableCell>{p.product_name}</TableCell>
                        <TableCell className="font-bold text-primary">{Number(p.amount).toFixed(2)}€</TableCell>
                        <TableCell><Badge>{p.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                    {purchases.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nėra pirkimų</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card>
              <CardHeader><CardTitle>Atsiliepimai ({testimonials.length})</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Autorius</TableHead>
                      <TableHead>Šalis</TableHead>
                      <TableHead>Įvertinimas</TableHead>
                      <TableHead>Tekstas</TableHead>
                      <TableHead>Patvirtintas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{t.author_name}</TableCell>
                        <TableCell>{t.country}</TableCell>
                        <TableCell className="flex items-center gap-1">{t.rating} <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /></TableCell>
                        <TableCell className="max-w-md truncate">{t.text}</TableCell>
                        <TableCell>{t.is_approved ? <Badge className="bg-green-600">Taip</Badge> : <Badge variant="outline">Ne</Badge>}</TableCell>
                      </TableRow>
                    ))}
                    {testimonials.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nėra atsiliepimų</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <Card className="bg-zinc-900 border-primary/20">
    <CardContent className="p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
    </CardContent>
  </Card>
);

import { ShoppingBag as ShoppingBagIcon } from "lucide-react";

export default Admin;