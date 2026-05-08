import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const MAX_SEARCH_ATTEMPTS = 28;
const PROCESS_CONCURRENCY = 3;

const SOURCE_CONFIG: Record<string, { site: string; kind: "used" | "damaged"; queries: string[] }> = {
  autoplius: {
    site: "autoplius.lt",
    kind: "used",
    queries: [
      'site:autoplius.lt/skelbimai/ "€" "km" "naudoti automobiliai"',
      'site:autoplius.lt/skelbimai/ "dyzelinas" "€" automobilis',
      'site:autoplius.lt/skelbimai/ "benzinas" "€" automobilis',
    ],
  },
  autoplius_damaged: {
    site: "autoplius.lt",
    kind: "damaged",
    queries: [
      'site:autoplius.lt/skelbimai/ "daužtas" automobilis "€"',
      'site:autoplius.lt/skelbimai/ "defektas" automobilis "€"',
      'site:autoplius.lt/skelbimai/ "avarinis" automobilis "€"',
    ],
  },
  autogidas: {
    site: "autogidas.lt",
    kind: "used",
    queries: [
      'site:autogidas.lt/skelbimas/ automobilis "€" "km"',
      'site:autogidas.lt/skelbimas/ "dyzelinas" "€"',
      'site:autogidas.lt/skelbimas/ "benzinas" "€"',
    ],
  },
  autogidas_damaged: {
    site: "autogidas.lt",
    kind: "damaged",
    queries: [
      'site:autogidas.lt/skelbimas/ "daužtas" "€"',
      'site:autogidas.lt/skelbimas/ "defektas" "€"',
      'site:autogidas.lt/skelbimas/ "avarinis" "€"',
    ],
  },
  mobile_de: {
    site: "mobile.de",
    kind: "used",
    queries: [
      'site:mobile.de "auto-inserat" gebrauchtwagen preis km',
      'site:mobile.de "details.html?id=" gebrauchtwagen preis km',
      'site:mobile.de "fahrzeuge/details.html" gebrauchtwagen',
    ],
  },
  mobile_de_damaged: {
    site: "mobile.de",
    kind: "damaged",
    queries: [
      'site:mobile.de "Unfallwagen" "auto-inserat"',
      'site:mobile.de "beschädigt" "auto-inserat"',
      'site:mobile.de "damaged" "details.html?id="',
    ],
  },
  copart: {
    site: "copart.com",
    kind: "damaged",
    queries: [
      'site:copart.com/lot/ salvage damaged vehicle',
      'site:copart.com/lot/ "damage" "odometer"',
    ],
  },
  iaai: {
    site: "iaai.com",
    kind: "damaged",
    queries: [
      'site:iaai.com/VehicleDetail salvage damaged vehicle',
      'site:iaai.com/VehicleDetail "primary damage" "odometer"',
    ],
  },
};

type ListingCandidate = {
  url: string;
  source: string;
  kind: "used" | "damaged";
  title?: string;
  description?: string;
};

type InsertableAnalysis = {
  listing_url: string;
  source: string;
  scraped_data: Record<string, unknown>;
  analysis_data: Record<string, unknown>;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  current_price: number | null;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeUrl(value: unknown): string | null {
  if (!value) return null;
  try {
    const url = new URL(String(value).trim());
    url.hash = "";
    const cleaned = url.toString().replace(/^https:\/\/m\./, "https://").replace(/\/$/, "");
    return cleaned;
  } catch {
    return null;
  }
}

function isLikelyListingUrl(url: string, source: string): boolean {
  const lower = url.toLowerCase();
  if (lower.includes("/paieska") || lower.includes("/search") || lower.includes("/suchen") || lower.includes("/cars/") || lower.includes("/naudoti-automobiliai")) {
    return false;
  }
  if (source.startsWith("autoplius")) return /autoplius\.lt\/skelbimai\/.+\.html/.test(lower);
  if (source.startsWith("autogidas")) return /autogidas\.lt\/skelbimas\/.+\.html/.test(lower);
  if (source.startsWith("mobile_de")) return lower.includes("/auto-inserat/") || lower.includes("details.html?id=") || lower.includes("/fahrzeuge/details.html");
  if (source === "copart") return lower.includes("copart.com/lot/");
  if (source === "iaai") return lower.includes("iaai.com/vehicledetail") || lower.includes("iaai.com/vehicle-detail");
  return true;
}

function extractSearchItems(payload: any): any[] {
  const candidates = [
    payload?.data,
    payload?.results,
    payload?.web,
    payload?.web?.results,
    payload?.data?.web,
    payload?.data?.results,
    payload?.data?.web?.results,
  ];
  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }
  return [];
}

function looksBlocked(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("captcha") || lower.includes("cloudflare") || lower.includes("checking your browser") || lower.includes("access denied") || lower.includes("enable javascript") || lower.includes("apsaugos nuo robot") || lower.includes("žmogaus patvirtin");
}

function hasVehicleSignal(text: string): boolean {
  const lower = text.toLowerCase();
  const hasPrice = /\b\d[\d\s.,]{2,}\s*(€|eur|usd|\$)/i.test(text) || lower.includes("price") || lower.includes("kaina") || lower.includes("preis");
  const hasVehicleWord = /(bmw|audi|volkswagen|vw|toyota|mercedes|benz|ford|opel|volvo|skoda|škoda|kia|hyundai|nissan|mazda|peugeot|renault|citroen|honda|lexus|tesla|porsche|automobil|vehicle|wagen|sedan|suv|hatchback|coupe)/i.test(text);
  return hasPrice && hasVehicleWord;
}

function parseAiJson(content: string): any {
  const cleaned = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Nepavyko nuskaityti analizės JSON");
  }
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d,.-]/g, "").replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function cleanText(parts: Array<unknown>): string {
  return parts.map((part) => typeof part === "string" ? part : "").join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function fetchJson(url: string, init: RequestInit, timeoutMs = 25000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let payload: any = {};
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { raw: text }; }
    if (!response.ok) {
      const message = payload?.error || payload?.message || text || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function expandSources(input: unknown): string[] {
  const base = Array.isArray(input) && input.length ? input.filter((s): s is string => typeof s === "string") : ["autoplius", "autogidas", "mobile_de", "copart", "iaai"];
  const expanded = new Set<string>();
  for (const source of base) {
    if (SOURCE_CONFIG[source]) expanded.add(source);
    const damaged = `${source}_damaged`;
    if (SOURCE_CONFIG[damaged]) expanded.add(damaged);
  }
  if (!expanded.size) {
    ["autoplius", "autoplius_damaged", "autogidas", "autogidas_damaged", "mobile_de", "mobile_de_damaged", "copart", "iaai"].forEach((s) => expanded.add(s));
  }
  return [...expanded];
}

function planSourceOrder(sources: string[], total: number): string[] {
  const used = sources.filter((s) => SOURCE_CONFIG[s]?.kind === "used");
  const damaged = sources.filter((s) => SOURCE_CONFIG[s]?.kind === "damaged");
  const damagedTarget = Math.min(Math.max(2, Math.ceil(total * 0.2)), Math.max(2, total - 1));
  const usedTarget = Math.max(1, total - damagedTarget);
  const plan: string[] = [];
  for (let i = 0; i < Math.max(usedTarget, damagedTarget); i++) {
    if (i < usedTarget && used.length) plan.push(used[i % used.length]);
    if (i < damagedTarget && damaged.length) plan.push(damaged[i % damaged.length]);
  }
  return plan.length ? plan : sources;
}

async function discoverListings(fcKey: string, supabase: any, total: number, sourceNames: string[]) {
  const targetPool = Math.min(140, Math.max(total * 5, total + 20));
  const candidates: ListingCandidate[] = [];
  const seen = new Set<string>();
  const sourceOrder = planSourceOrder(sourceNames, total);
  const errors: string[] = [];

  const { data: existing } = await supabase.from("auto_analyses").select("listing_url").order("created_at", { ascending: false }).limit(500);
  for (const row of existing || []) {
    const normalized = normalizeUrl(row.listing_url);
    if (normalized) seen.add(normalized);
  }

  let attempts = 0;
  for (const source of sourceOrder) {
    const cfg = SOURCE_CONFIG[source];
    if (!cfg || candidates.length >= targetPool || attempts >= MAX_SEARCH_ATTEMPTS) continue;
    for (const query of cfg.queries) {
      if (candidates.length >= targetPool || attempts >= MAX_SEARCH_ATTEMPTS) break;
      attempts++;
      try {
        const payload = await fetchJson(`${FIRECRAWL}/search`, {
          method: "POST",
          headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: Math.min(10, Math.max(5, Math.ceil(total / 2))), lang: cfg.site.endsWith(".lt") ? "lt" : "en" }),
        }, 20000);
        const items = extractSearchItems(payload);
        for (const item of items) {
          const normalized = normalizeUrl(item?.url || item?.link);
          if (!normalized || seen.has(normalized) || !normalized.includes(cfg.site) || !isLikelyListingUrl(normalized, source)) continue;
          seen.add(normalized);
          candidates.push({
            url: normalized,
            source,
            kind: cfg.kind,
            title: item?.title || item?.metadata?.title,
            description: item?.description || item?.snippet || item?.markdown,
          });
          if (candidates.length >= targetPool) break;
        }
      } catch (error) {
        errors.push(`${source}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  const damaged = candidates.filter((c) => c.kind === "damaged");
  const used = candidates.filter((c) => c.kind === "used");
  const damagedTarget = Math.min(damaged.length, Math.max(2, Math.ceil(total * 0.2)));
  const picked: ListingCandidate[] = [];
  for (let i = 0; i < total; i++) {
    if (picked.length < damagedTarget && damaged.length) picked.push(damaged.shift()!);
    else if (used.length) picked.push(used.shift()!);
    else if (damaged.length) picked.push(damaged.shift()!);
  }

  return { picked, discovered: candidates.length, errors };
}

async function scrapeListing(fcKey: string, candidate: ListingCandidate) {
  const searchContext = cleanText([candidate.title, candidate.description]);
  try {
    const payload = await fetchJson(`${FIRECRAWL}/scrape`, {
      method: "POST",
      headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: candidate.url,
        formats: ["markdown", "summary"],
        onlyMainContent: true,
        waitFor: 1200,
      }),
    }, 30000);
    const markdown = payload?.markdown || payload?.data?.markdown || "";
    const summary = payload?.summary || payload?.data?.summary || "";
    const metadataTitle = payload?.metadata?.title || payload?.data?.metadata?.title || "";
    const text = cleanText([metadataTitle, searchContext, summary, markdown]);
    return {
      text,
      markdown: markdown ? markdown.slice(0, 8000) : null,
      summary: summary || null,
      usedFallback: false,
    };
  } catch (error) {
    return {
      text: searchContext,
      markdown: null,
      summary: null,
      usedFallback: true,
      scrapeError: error instanceof Error ? error.message : String(error),
    };
  }
}

async function analyzeListing(aiKey: string, candidate: ListingCandidate, text: string) {
  const response = await fetchJson(LOVABLE_AI, {
    method: "POST",
    headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Esi formalus transporto konsultantas. Iš automobilio skelbimo paruošk trumpą, bet praktišką investicinę analizę lietuvių kalba.

Taisyklės:
- Analizuok tik transporto skelbimą.
- Neišgalvok markės, modelio, metų, ridos, kuro, kainos ar defektų. Jei nėra aiškaus duomens, rašyk "Nenurodyta" arba null.
- Jei skelbimas yra daužtas / salvage / Unfallwagen / su defektais, tai aiškiai pažymėk.
- Remonto ir rinkos kainas vertink konservatyviai pagal Lietuvos rinką.
- Jei informacijos mažai, rekomendacijoje parašyk, kokių duomenų trūksta, bet vis tiek pateik preliminarų vadovo peržiūrai naudingą vertinimą.

Grąžink TIK JSON:
{
  "vehicleInfo": {"make": string, "model": string, "year": number|null, "mileage": string, "fuelType": string, "transmission": string},
  "marketAnalysis": {"currentPrice": number|null, "marketAverage": number|null, "priceRating": "good"|"average"|"overpriced"|"unknown", "estimatedResaleValue": number|null, "resaleTimeframe": string},
  "repairEstimate": {"totalCost": number|null, "items": [{"name": string, "cost": number, "urgency": "high"|"medium"|"low"}]},
  "profitability": {"isProfitable": boolean, "potentialProfit": number|null, "recommendation": string},
  "condition": {"isDamaged": boolean|null, "damageSignals": string[], "dataQuality": "good"|"limited"},
  "warnings": string[],
  "positives": string[],
  "recommendation": string,
  "description_summary": string
}`,
        },
        {
          role: "user",
          content: `Šaltinis: ${candidate.source}\nTipas: ${candidate.kind === "damaged" ? "tikėtina daužtas / defektuotas" : "naudotas automobilis"}\nNuoroda: ${candidate.url}\n\nSkelbimo tekstas:\n${text.slice(0, 16000)}`,
        },
      ],
      response_format: { type: "json_object" },
      reasoning: { effort: "medium" },
      max_tokens: 5000,
    }),
  }, 45000);

  const content = response?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Tuščias analizės atsakymas");
  return parseAiJson(content);
}

function toInsert(candidate: ListingCandidate, scrape: any, analysis: any): InsertableAnalysis | null {
  const text = scrape.text || "";
  if (!hasVehicleSignal(text)) return null;
  if (looksBlocked(text) && !hasVehicleSignal(cleanText([candidate.title, candidate.description]))) return null;

  const vehicle = analysis?.vehicleInfo || {};
  const market = analysis?.marketAnalysis || {};
  const profitability = analysis?.profitability || {};
  const make = typeof vehicle.make === "string" && vehicle.make !== "Nenurodyta" ? vehicle.make : null;
  const model = typeof vehicle.model === "string" && vehicle.model !== "Nenurodyta" ? vehicle.model : null;
  const currentPrice = asNumber(market.currentPrice ?? analysis.price_eur ?? analysis.currentPrice);
  const year = asNumber(vehicle.year ?? analysis.year);

  const normalizedAnalysis = {
    ...analysis,
    recommendation: analysis?.recommendation || profitability?.recommendation || "Peržiūrėti vadovui – analizė paruošta iš riboto skelbimo teksto.",
    description_summary: analysis?.description_summary || `${make || "Automobilis"} ${model || ""}`.trim(),
    source_kind: candidate.kind,
    listing_url: candidate.url,
  };

  return {
    listing_url: candidate.url,
    source: candidate.source,
    scraped_data: {
      title: candidate.title || null,
      description: candidate.description || null,
      markdown: scrape.markdown ? String(scrape.markdown).slice(0, 5000) : null,
      summary: scrape.summary || null,
      usedFallback: scrape.usedFallback,
      scrapeError: scrape.scrapeError || null,
    },
    analysis_data: normalizedAnalysis,
    vehicle_make: make,
    vehicle_model: model,
    vehicle_year: year,
    current_price: currentPrice,
  };
}

async function runLimited<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R | null>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      const result = await worker(current);
      if (result) results.push(result);
    }
  });
  await Promise.all(workers);
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const token = auth.replace("Bearer ", "");
    const { data: claims } = await supabase.auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({} as any));
    const total = Math.min(100, Math.max(10, Number(body.count ?? 20) || 20));
    const sourceNames = expandSources(body.sources);

    const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
    const aiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!fcKey) return jsonResponse({ error: "Firecrawl ryšys nesukonfigūruotas" }, 500);
    if (!aiKey) return jsonResponse({ error: "Analizės raktas nesukonfigūruotas" }, 500);

    const discovery = await discoverListings(fcKey, supabase, total, sourceNames);
    const processingPool = discovery.picked.slice(0, Math.min(discovery.picked.length, total * 2));
    const failures: string[] = [];

    const insertable = await runLimited(processingPool, PROCESS_CONCURRENCY, async (candidate) => {
      try {
        const scrape = await scrapeListing(fcKey, candidate);
        if (!hasVehicleSignal(scrape.text)) {
          failures.push(`${candidate.source}: per mažai skelbimo duomenų`);
          return null;
        }
        const analysis = await analyzeListing(aiKey, candidate, scrape.text);
        const row = toInsert(candidate, scrape, analysis);
        if (!row) failures.push(`${candidate.source}: netinkamas arba užblokuotas puslapis`);
        return row;
      } catch (error) {
        failures.push(`${candidate.source}: ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    });

    const rows = insertable.slice(0, total);
    let inserted: any[] = [];
    if (rows.length) {
      const { data, error } = await supabase.from("auto_analyses").insert(rows).select();
      if (error) throw error;
      inserted = data || [];
    }

    return jsonResponse({
      ok: true,
      scraped: inserted.length,
      attempted: processingPool.length,
      discovered: discovery.discovered,
      damaged: inserted.filter((row: any) => String(row.source).includes("damaged") || row.source === "copart" || row.source === "iaai").length,
      message: inserted.length
        ? `Surinkta ir išanalizuota ${inserted.length} skelbimų.`
        : "Nepavyko rasti pakankamai tikrų skelbimų. Reikia patikrinti Firecrawl limitus arba šaltinių blokavimą.",
      warnings: [...discovery.errors, ...failures].slice(0, 12),
    });
  } catch (error) {
    console.error("scrape-listings error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
