import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users, DollarSign, TrendingUp, MessageSquare, BarChart3, Shield, Star,
  Check, X, Trash2, Bot, ExternalLink, ShoppingBag as ShoppingBagIcon,
} from "lucide-react";

interface UserRow {
  user_id: string; email: string | null; display_name: string | null;
  created_at: string; analysis_credits: number; consultation_credits: number;
}
interface PurchaseRow {
  id: string; user_id: string; product_name: string; amount: number;
  status: string; created_at: string; email?: string | null;
}
interface TestimonialRow {
  id: string; author_name: string; rating: number; text: string;
  country: string; is_approved: boolean; created_at: string;
}
interface AutoAnalysisRow {
  id: string; listing_url: string; source: string;
  vehicle_make: string | null; vehicle_model: string | null;
  vehicle_year: number | null; current_price: number | null;
  analysis_data: any; review_status: string;
  admin_notes: string | null; created_at: string;
}

const Admin = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [analysesCount, setAnalysesCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [autoRows, setAutoRows] = useState<AutoAnalysisRow[]>([]);
  const [scrapeCount, setScrapeCount] = useState(20);
  const [scraping, setScraping] = useState(false);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    checkAdminAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roles) { setIsAdmin(false); return; }
    setIsAdmin(true);
    await loadData();
  };

  const loadData = async () => {
    const [profilesRes, creditsRes, purchasesRes, testimonialsRes, analysesRes, chatsRes, autoRes] = await Promise.all([
      supabase.from("profiles").select("user_id, email, display_name, created_at"),
      supabase.from("user_credits").select("user_id, analysis_credits, consultation_credits"),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("user_testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("analysis_history").select("id", { count: "exact", head: true }),
      supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
      supabase.from("auto_analyses").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    const creditsMap = new Map((creditsRes.data || []).map((c: any) => [c.user_id, c]));
    const merged: UserRow[] = (profilesRes.data || []).map((p: any) => ({
      user_id: p.user_id, email: p.email, display_name: p.display_name, created_at: p.created_at,
      analysis_credits: creditsMap.get(p.user_id)?.analysis_credits ?? 0,
      consultation_credits: creditsMap.get(p.user_id)?.consultation_credits ?? 0,
    }));
    setUsers(merged);
    const emailMap = new Map(merged.map(u => [u.user_id, u.email]));
    setPurchases((purchasesRes.data || []).map((p: any) => ({ ...p, email: emailMap.get(p.user_id) })));
    setTestimonials(testimonialsRes.data || []);
    setAnalysesCount(analysesRes.count || 0);
    setChatsCount(chatsRes.count || 0);
    setAutoRows((autoRes.data as any) || []);
  };

  const setApproval = async (id: string, value: boolean) => {
    const { error } = await supabase.from("user_testimonials").update({ is_approved: value }).eq("id", id);
    if (error) return toast({ title: "Klaida", description: error.message, variant: "destructive" });
    setTestimonials((prev) => prev.map((t) => t.id === id ? { ...t, is_approved: value } : t));
  };
  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from("user_testimonials").delete().eq("id", id);
    if (error) return toast({ title: "Klaida", description: error.message, variant: "destructive" });
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const reviewAuto = async (id: string, status: "good" | "bad") => {
    const notes = noteDraft[id] || null;
    const { error } = await supabase.from("auto_analyses").update({
      review_status: status, admin_notes: notes,
      reviewed_by: user!.id, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast({ title: "Klaida", description: error.message, variant: "destructive" });
    setAutoRows((prev) => prev.map((r) => r.id === id ? { ...r, review_status: status, admin_notes: notes } : r));
    toast({ title: status === "good" ? "Pažymėta gerai" : "Pažymėta blogai" });
  };

  const runBot = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-listings", {
        body: { count: scrapeCount, sources: ["autoplius", "autogidas", "copart", "iaai", "mobile_de"] },
      });
      if (error) throw error;
      toast({ title: "Botas baigė", description: `Surinkta ${data?.scraped || 0} skelbimų` });
      await loadData();
    } catch (e: any) {
      toast({ title: "Klaida", description: e.message, variant: "destructive" });
    } finally {
      setScraping(false);
    }
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
  const estimatedProfit = totalRevenue * 0.7;
  const completedPurchases = purchases.filter(p => p.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-extrabold">Vadovo skydelis</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <StatCard icon={Users} label="Vartotojai" value={users.length} />
          <StatCard icon={DollarSign} label="Pajamos" value={`${totalRevenue.toFixed(2)}€`} />
          <StatCard icon={TrendingUp} label="Pelnas (~70%)" value={`${estimatedProfit.toFixed(2)}€`} />
          <StatCard icon={ShoppingBagIcon} label="Pirkimai" value={completedPurchases} />
          <StatCard icon={BarChart3} label="Analizės" value={analysesCount} />
          <StatCard icon={MessageSquare} label="Konsultacijos" value={chatsCount} />
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-3xl">
            <TabsTrigger value="users">Vartotojai</TabsTrigger>
            <TabsTrigger value="purchases">Pirkimai</TabsTrigger>
            <TabsTrigger value="testimonials">Atsiliepimai</TabsTrigger>
            <TabsTrigger value="auto">Auto‑analizės</TabsTrigger>
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
                      <TableHead>Įvert.</TableHead>
                      <TableHead>Tekstas</TableHead>
                      <TableHead>Statusas</TableHead>
                      <TableHead>Veiksmai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testimonials.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{t.author_name}</TableCell>
                        <TableCell>{t.country}</TableCell>
                        <TableCell><span className="inline-flex items-center gap-1">{t.rating} <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /></span></TableCell>
                        <TableCell className="max-w-md text-xs">{t.text}</TableCell>
                        <TableCell>{t.is_approved ? <Badge className="bg-green-600">Patvirtinta</Badge> : <Badge variant="outline">Laukia</Badge>}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!t.is_approved ? (
                              <Button size="sm" variant="outline" onClick={() => setApproval(t.id, true)} title="Patvirtinti"><Check className="w-3 h-3" /></Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setApproval(t.id, false)} title="Atšaukti"><X className="w-3 h-3" /></Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteTestimonial(t.id)} title="Trinti"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {testimonials.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nėra atsiliepimų</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auto">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" /> Automatinės analizės</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-3 mb-4 p-3 rounded-lg bg-zinc-900/50 border border-border">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Skelbimų kiekis (10‑100)</label>
                    <Input type="number" min={10} max={100} value={scrapeCount}
                      onChange={(e) => setScrapeCount(Math.min(100, Math.max(10, Number(e.target.value) || 10)))}
                      className="w-32" />
                  </div>
                  <Button onClick={runBot} disabled={scraping}>
                    <Bot className="w-4 h-4 mr-2" />
                    {scraping ? "Renkama..." : "Paleisti botą"}
                  </Button>
                  <p className="text-xs text-muted-foreground">Šaltiniai: autoplius.lt, autogidas.lt, copart.com, iaai.com, mobile.de — orientacija į daužtus.</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Šaltinis</TableHead>
                        <TableHead>Automobilis</TableHead>
                        <TableHead>Kaina</TableHead>
                        <TableHead>Rekomendacija</TableHead>
                        <TableHead>Statusas</TableHead>
                        <TableHead>Vertinimas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {autoRows.map(r => (
                        <TableRow key={r.id} className="align-top">
                          <TableCell className="text-xs whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell><Badge variant="outline">{r.source}</Badge></TableCell>
                          <TableCell className="text-sm">
                            {r.vehicle_make || "—"} {r.vehicle_model || ""} {r.vehicle_year ? `(${r.vehicle_year})` : ""}
                            <a href={r.listing_url} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center text-primary hover:underline text-xs">
                              <ExternalLink className="w-3 h-3" /> nuoroda
                            </a>
                          </TableCell>
                          <TableCell>{r.current_price ? `${r.current_price}€` : "—"}</TableCell>
                          <TableCell className="max-w-xs text-xs">{r.analysis_data?.recommendation || r.analysis_data?.description_summary || "—"}</TableCell>
                          <TableCell>
                            {r.review_status === "good" && <Badge className="bg-green-600">Gerai</Badge>}
                            {r.review_status === "bad" && <Badge variant="destructive">Blogai</Badge>}
                            {r.review_status === "pending" && <Badge variant="outline">Laukia</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 min-w-[200px]">
                              <Textarea
                                placeholder="Komentaras (jei blogai)"
                                value={noteDraft[r.id] ?? r.admin_notes ?? ""}
                                onChange={(e) => setNoteDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                                rows={2}
                                className="text-xs"
                              />
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => reviewAuto(r.id, "good")}><Check className="w-3 h-3 mr-1" /> Gerai</Button>
                                <Button size="sm" variant="outline" onClick={() => reviewAuto(r.id, "bad")}><X className="w-3 h-3 mr-1" /> Blogai</Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {autoRows.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Dar nėra auto‑analizių. Paspausk „Paleisti botą".</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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

export default Admin;
