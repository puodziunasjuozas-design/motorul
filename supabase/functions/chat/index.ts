import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `Tu esi profesionalus automobilių ir motociklų technikas-konsultantas Lietuvoje su 20+ metų patirtimi. 
Tavo specializacija:
- Automobilių techninė diagnostika ir remonto konsultacijos
- Naudotų automobilių vertinimas ir pirkimo patarimai  
- Kainų analizė Lietuvos ir Europos rinkoje
- Tipinių gedimų identifikavimas pagal markę/modelį
- Remonto kaštų skaičiavimas pagal Lietuvos kainas
- Perpardavimo strategijos ir patarimai

Atsakyk visada lietuviškai. Būk konkretus, profesionalus ir draugiškas. Naudok emoji kai tinka.
Jei vartotojas siunčia nuotraukas - analizuok jas kaip Google Lens / vaizdo atpažinimas: identifikuok automobilį, jo būklę, galimus defektus, rūdis, dažo defektus ir t.t.`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Per daug užklausų. Pabandykite vėliau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Pasiektas limitas. Susisiekite su administratoriumi." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI klaida" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Nežinoma klaida" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
