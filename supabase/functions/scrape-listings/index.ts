import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const FIRECRAWL = "https://api.firecrawl.dev/v2";
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SOURCES: Record<string, { search: string; site: string }> = {
  autoplius: { site: "autoplius.lt", search: "site:autoplius.lt skelbimai automobiliai daužtas OR avarinis" },
  autogidas: { site: "autogidas.lt", search: "site:autogidas.lt automobilis daužtas OR avarinis" },
  copart: { site: "copart.com", search: "site:copart.com salvage damaged vehicle" },
  iaai: { site: "iaai.com", search: "site:iaai.com salvage damaged vehicle" },
  mobile_de: { site: "mobile.de", search: "site:mobile.de unfallwagen damaged" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const token = auth.replace("Bearer ", "");
    const { data: claims } = await supabase.auth.getClaims(token);
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub;

    // admin check
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { count = 10, sources = ["autoplius", "autogidas", "copart"] } = await req.json().catch(() => ({}));
    const total = Math.min(100, Math.max(1, Number(count)));

    const FC = Deno.env.get("FIRECRAWL_API_KEY");
    const AI = Deno.env.get("LOVABLE_API_KEY");
    if (!FC || !AI) {
      return new Response(JSON.stringify({ error: "Missing keys" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 1) discover listing URLs via search across sources
    const perSource = Math.ceil(total / sources.length);
    const urls: { url: string; source: string }[] = [];
    for (const s of sources) {
      const cfg = SOURCES[s];
      if (!cfg) continue;
      const sr = await fetch(`${FIRECRAWL}/search`, {
        method: "POST",
        headers: { Authorization: `Bearer ${FC}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: cfg.search, limit: perSource }),
      });
      const sd = await sr.json().catch(() => ({}));
      const items = sd?.data || sd?.web || [];
      for (const it of items) {
        const u = it.url || it.link;
        if (u && u.includes(cfg.site)) urls.push({ url: u, source: s });
      }
    }

    const picked = urls.slice(0, total);
    const results: any[] = [];

    // 2) for each URL: scrape -> extract structured -> AI analyze -> insert
    for (const { url, source } of picked) {
      try {
        const sc = await fetch(`${FIRECRAWL}/scrape`, {
          method: "POST",
          headers: { Authorization: `Bearer ${FC}`, "Content-Type": "application/json" },
          body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
        });
        const scd = await sc.json().catch(() => ({}));
        const md = scd?.markdown || scd?.data?.markdown || "";
        if (!md) continue;

        const aiRes = await fetch(LOVABLE_AI, {
          method: "POST",
          headers: { Authorization: `Bearer ${AI}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Ištrauk skelbimo duomenis ir atlik trumpą investicinę analizę. Grąžink TIK JSON: {make,model,year,mileage,fuel,transmission,price_eur,description_summary,is_damaged,estimated_repair_eur,market_avg_eur,potential_profit_eur,is_profitable,recommendation}. Jei trūksta lauko - 'Nenurodyta'. Jokio prozos teksto." },
              { role: "user", content: md.slice(0, 12000) },
            ],
            response_format: { type: "json_object" },
          }),
        });
        const aid = await aiRes.json();
        const content = aid?.choices?.[0]?.message?.content || "{}";
        let parsed: any = {};
        try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

        const { data: ins } = await supabase.from("auto_analyses").insert({
          listing_url: url,
          source,
          scraped_data: { markdown: md.slice(0, 4000) },
          analysis_data: parsed,
          vehicle_make: parsed.make || null,
          vehicle_model: parsed.model || null,
          vehicle_year: typeof parsed.year === "number" ? parsed.year : null,
          current_price: typeof parsed.price_eur === "number" ? parsed.price_eur : null,
        }).select().single();
        results.push(ins);
      } catch (e) {
        console.error("scrape item err", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, scraped: results.length, attempted: picked.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});