import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";
const MAX_SEARCH_ATTEMPTS = 18;
const PROCESS_CONCURRENCY = 2;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  if (searchContext.length > 120 && hasVehicleSignal(searchContext) && !looksBlocked(searchContext)) {
    return {
      text: searchContext,
      markdown: null,
      summary: null,
      usedFallback: true,
    };
  }
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

async function quickExtract(aiKey: string, text: string): Promise<{ make?: string; model?: string; year?: number | null }> {
  try {
    const response = await fetchJson(LOVABLE_AI, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Iš teksto ištrauk transporto markę, modelį ir metus. Grąžink TIK JSON: {\"make\": string|null, \"model\": string|null, \"year\": number|null}. Jei neaišku — null." },
          { role: "user", content: text.slice(0, 4000) },
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
      }),
    }, 20000);
    const content = response?.choices?.[0]?.message?.content;
    if (!content) return {};
    const parsed = parseAiJson(content);
    return { make: parsed.make || undefined, model: parsed.model || undefined, year: typeof parsed.year === "number" ? parsed.year : null };
  } catch {
    return {};
  }
}

async function webResearch(fcKey: string, info: { make?: string; model?: string; year?: number | null }, kind: "used" | "damaged"): Promise<string> {
  if (!info.make || !info.model) return "";
  const label = `${info.make} ${info.model}${info.year ? ` ${info.year}` : ""}`;
  const queries = [
    `${label} kaina Lietuvoje naudoti automobiliai`,
    `${label} dažniausios problemos patikimumas`,
  ];
  if (kind === "damaged") queries.push(`${label} remontas kaštai daužtas`);
  const blocks: string[] = [];
  for (const query of queries) {
    try {
      const payload = await fetchJson(`${FIRECRAWL}/search`, {
        method: "POST",
        headers: { Authorization: `Bearer ${fcKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 4 }),
      }, 15000);
      const items = extractSearchItems(payload).slice(0, 4);
      const lines = items.map((it: any) => {
        const title = it?.title || it?.metadata?.title || "";
        const desc = it?.description || it?.snippet || it?.markdown || "";
        return `• ${title} — ${String(desc).slice(0, 280)}`;
      }).filter((l: string) => l.length > 5);
      if (lines.length) blocks.push(`Užklausa: ${query}\n${lines.join("\n")}`);
    } catch {
      // ignore individual research failures
    }
  }
  return blocks.join("\n\n");
}

async function analyzeListing(aiKey: string, candidate: ListingCandidate, text: string, fcKey: string) {
  const info = await quickExtract(aiKey, text);
  const research = await webResearch(fcKey, info, candidate.kind);

  const damageHint = candidate.kind === "damaged"
    ? "DĖMESIO: skelbimas iš daužtų / salvage / Unfallwagen kategorijos — vertink kaip galimai apgadintą ir aiškiai įvardink defektus warnings sąraše."
    : "Skelbimas iš naudotų automobilių kategorijos.";

  const description = [
    `Šaltinis: ${candidate.source}`,
    damageHint,
    candidate.title ? `Antraštė: ${candidate.title}` : "",
    "",
    "SKELBIMO TEKSTAS:",
    text.slice(0, 14000),
    research ? `\nPAPILDOMA RINKOS INFORMACIJA IŠ INTERNETO (naudok kaip referenciją, bet remkis pirmiausia skelbimo duomenimis):\n${research}` : "",
  ].filter(Boolean).join("\n");

  // Naudok tą pačią analyze-vehicle funkciją kaip vartotojų analizėje, kad rezultatas būtų identiškas struktūra ir kokybe.
  const response = await fetchJson(`${SUPABASE_URL}/functions/v1/analyze-vehicle`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, listingUrl: candidate.url }),
  }, 90000);

  if (response?.error) throw new Error(String(response.error));
  return { result: response, info, research };
}

function toInsert(candidate: ListingCandidate, scrape: any, payload: any): InsertableAnalysis | null {
  const analysis = payload?.result || payload;
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
    web_research: payload?.research || null,
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

async function runLimited<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  });
  await Promise.all(workers);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
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

    const backgroundJob = async () => {
      const discovery = await discoverListings(fcKey, service, total, sourceNames);
      const processingPool = discovery.picked.slice(0, Math.min(discovery.picked.length, total));
      console.log("Bot discovery", { requested: total, discovered: discovery.discovered, picked: processingPool.length, errors: discovery.errors.slice(0, 5) });

      let inserted = 0;
      const failures: string[] = [];
      await runLimited(processingPool, PROCESS_CONCURRENCY, async (candidate) => {
        try {
          const scrape = await scrapeListing(fcKey, candidate);
          if (!hasVehicleSignal(scrape.text)) {
            failures.push(`${candidate.source}: per mažai skelbimo duomenų`);
            return;
          }
          const analysis = await analyzeListing(aiKey, candidate, scrape.text, fcKey);
          const row = toInsert(candidate, scrape, analysis);
          if (!row) {
            failures.push(`${candidate.source}: netinkamas arba užblokuotas puslapis`);
            return;
          }
          const { error } = await service.from("auto_analyses").insert(row);
          if (error) throw error;
          inserted++;
        } catch (error) {
          failures.push(`${candidate.source}: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
      console.log("Bot finished", { requested: total, attempted: processingPool.length, inserted, failures: failures.slice(0, 8) });
    };

    EdgeRuntime.waitUntil(backgroundJob());

    return jsonResponse({
      ok: true,
      started: true,
      requested: total,
      message: `Botas pradėjo rinkti ir analizuoti ${total} skelbimų. Rezultatai lentelėje atsiras automatiškai.`,
    });
  } catch (error) {
    console.error("scrape-listings error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
