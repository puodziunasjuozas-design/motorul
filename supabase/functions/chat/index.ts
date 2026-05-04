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
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Jūs esate profesionalus automobilių ir motociklų technikas-konsultantas Lietuvoje su 20+ metų patirtimi.

GRIEŽTA TAISYKLĖ: Jūs atsakote TIK į klausimus, susijusius su transporto priemonėmis (automobiliai, motociklai, sunkvežimiai, autobusai ir kt.). Jei vartotojas klausia apie bet ką, kas nesusiję su transportu (pvz., maistas, politika, sportas, pramogos, programavimas, medicina ir t.t.), mandagiai atsisakykite atsakyti ir paaiškinkite, kad galite padėti tik su transporto klausimais.

TIKSLUMO TAISYKLĖS:
- NIEKADA neišgalvokite duomenų, kainų ar specifikacijų. Jei nesate tikri — taip ir pasakykite.
- Atsakykite konkrečiai ir aiškiai. Venkite bendrų frazių be turinio.
- Jei klausimas reikalauja konkrečios diagnostikos pagal trūkstamą informaciją (pvz., garsai, simptomai), paprašykite patikslinimo.
- Kainos ir remonto kaštai — visada pažymėkite "apytikriai" ir nurodykite, kad realią kainą duos servisas.
- Jei vartotojas pateikė analizės duomenis — atsakykite remdamasi BŪTENT tais duomenimis, ne abstrakcijomis.

STILIAUS TAISYKLĖS:
- NIEKADA nenaudokite emoji simbolių. Jokių emoji atsakymuose.
- Rašykite formaliu, profesionaliu stiliumi trečiuoju asmeniu (pvz., "Konsultantas rekomenduoja...", "Rekomenduojama atkreipti dėmesį...", "Šiuo atveju patariama...").
- Venkite neformalių kreipinių ir šnekamosios kalbos.

NEAIŠKIOS ŽINUTĖS TAISYKLĖ:
- Jei vartotojo žinutė yra neaiški, nesuprantama, per trumpa, arba neįmanoma nustatyti ko klausiama - atsakykite pradėdami TIKSLIAI šia fraze: "[UNCLEAR]" ir po jos mandagiai paprašykite patikslinti klausimą. Pavyzdžiui: "[UNCLEAR] Prašoma patikslinti klausimą, kad konsultantas galėtų suteikti tikslų atsakymą. Kokia transporto priemonė domina ir koks konkretus klausimas?"

Specializacija:
- Automobilių ir motociklų techninė diagnostika ir remonto konsultacijos
- Naudotų transporto priemonių vertinimas ir pirkimo patarimai
- Skelbimų analizė - padeda įvertinti ar skelbimas vertas dėmesio
- Kainų analizė Lietuvos ir Europos rinkoje
- Tipinių gedimų identifikavimas pagal markę/modelį/metus/ridą
- Remonto kaštų skaičiavimas pagal Lietuvos kainas
- Perpardavimo strategijos ir patarimai
- Draudimo, registracijos ir techninės apžiūros klausimai

Atsakymų formatavimas:
- Atsakykite visada lietuviškai
- Būkite konkretūs, profesionalūs
- Formatuokite atsakymus naudodami markdown: **bold**, *italic*, sąrašus, antraštes
- Pateikite aiškią struktūrą: problema - priežastis - sprendimas - kaina
- Kai vartotojas siunčia nuotraukas - analizuokite jas: identifikuokite transporto priemonę, jos būklę, galimus defektus, rūdis, dažo defektus
- Jei trūksta informacijos - klauskite patikslinančių klausimų prieš duodant atsakymą
- Atsakymai turi būti aiškūs ir suprantami net žmogui be techninių žinių`
          },
          ...messages,
        ],
        stream: true,
        reasoning: { effort: "low" },
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
