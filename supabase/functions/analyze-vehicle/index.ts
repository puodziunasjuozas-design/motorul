import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, listingUrl, imageBase64List } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting vehicle analysis...");
    console.log("Description length:", description?.length || 0);
    console.log("Images count:", imageBase64List?.length || 0);
    console.log("Listing URL:", listingUrl || "none");

    // Fetch market knowledge from previous analyses to improve accuracy
    let knowledgeContext = "";
    let feedbackContext = "";
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY) {
        const supa = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data: knowledge } = await supa
          .from("market_knowledge")
          .select("vehicle_make, vehicle_model, vehicle_year, mileage, asking_price, market_average, estimated_repair_cost, price_rating")
          .order("created_at", { ascending: false })
          .limit(50);
        if (knowledge && knowledge.length > 0) {
          knowledgeContext = `\n\nANKSTESNIŲ ANALIZIŲ DUOMENYS (naudok kaip referencinę bazę kainoms ir remontui):\n${knowledge.map(k => `- ${k.vehicle_make} ${k.vehicle_model} (${k.vehicle_year || "?"}), rida ${k.mileage || "?"}: prašoma ${k.asking_price || "?"}€, rinkos vidurkis ${k.market_average || "?"}€, remontas ${k.estimated_repair_cost || "?"}€, įvertinimas: ${k.price_rating || "?"}`).join("\n")}`;
        }

        // Admin feedback loop: include reviewed examples
        const { data: good } = await supa.from("auto_analyses")
          .select("vehicle_make, vehicle_model, vehicle_year, current_price, analysis_data")
          .eq("review_status", "good").order("reviewed_at", { ascending: false }).limit(3);
        const { data: bad } = await supa.from("auto_analyses")
          .select("vehicle_make, vehicle_model, admin_notes, analysis_data")
          .eq("review_status", "bad").order("reviewed_at", { ascending: false }).limit(2);
        const goodTxt = (good || []).map((g: any) => `- ${g.vehicle_make} ${g.vehicle_model} (${g.vehicle_year}): rekomendacija "${g.analysis_data?.recommendation || ""}", kaina ${g.current_price}€`).join("\n");
        const badTxt = (bad || []).map((b: any) => `- ${b.vehicle_make} ${b.vehicle_model}: KLAIDA — ${b.admin_notes || "netiksli analizė"}`).join("\n");
        if (goodTxt || badTxt) {
          feedbackContext = `\n\nVADOVO PATVIRTINTI GERI PAVYZDŽIAI (sek šį stilių):\n${goodTxt}\n\nKLAIDOS, KURIŲ VENK:\n${badTxt}`;
        }
      }
    } catch (e) {
      console.log("Could not fetch market knowledge:", e);
    }

    const systemPrompt = `Tu esi profesionalus automobilių ir motociklų ekspertas Lietuvoje su 20+ metų patirtimi.

GRIEŽTOS TAISYKLĖS:
1. Analizuoji TIK transporto priemonių skelbimus. Jei pateikta informacija nesusijusi su transporto priemone, grąžink: {"error": "Pateikta informacija nesusijusi su transporto priemone."}
2. NIEKADA neišgalvok duomenų. Jei skelbime/nuotraukose nėra konkretaus duomens (markė, modelis, metai, rida, kuras, pavarų dėžė, kaina) — naudok "Nenurodyta" arba 0. NEMELUOK ir nespėliok.
3. Skelbimo duomenis (markė, modelis, metai, rida, kuras, pavarų dėžė, kaina) PERRAŠYK TIKSLIAI taip kaip nurodyta skelbime. Nieko nepridėk ir nekeisk.
4. Visus skaičius (kainas, remonto kaštus) grįsk konkrečiais argumentais. Nesiūlyk fantastinių rekomendacijų.
5. Jei trūksta informacijos tiksliai analizei — pažymėk tai įspėjimuose (warnings) ir konservatyviai vertink.
${knowledgeContext}
${feedbackContext}

Tavo užduotis - išanalizuoti transporto priemonės skelbimą ir pateikti pagrįstą pirkimo rekomendaciją.

VISADA atsakyk JSON formatu su tokia struktūra:
{
  "vehicleInfo": {
    "make": "TIKSLI markė iš skelbimo arba 'Nenurodyta'",
    "model": "TIKSLUS modelis iš skelbimo arba 'Nenurodyta'",
    "year": 2020,
    "mileage": "TIKSLI rida iš skelbimo arba 'Nenurodyta'",
    "fuelType": "TIKSLUS kuro tipas arba 'Nenurodyta'",
    "transmission": "TIKSLI pavarų dėžė arba 'Nenurodyta'"
  },
  "marketAnalysis": {
    "currentPrice": 15000,
    "marketAverage": 16000,
    "priceRating": "good/average/overpriced",
    "estimatedResaleValue": 13000,
    "resaleTimeframe": "per 1 metus"
  },
  "repairEstimate": {
    "totalCost": 2000,
    "items": [
      {"name": "Detalės pavadinimas", "cost": 500, "urgency": "high/medium/low"}
    ]
  },
  "profitability": {
    "isProfitable": true,
    "potentialProfit": 3000,
    "recommendation": "Konkreti, pagrįsta rekomendacija lietuvių kalba – ar verta pirkti, kokios rizikos, ką patikrinti prieš perkant. Be spėlionių."
  },
  "warnings": ["Konkretus perspėjimas su paaiškinimu (ne abstraktus)"],
  "positives": ["Konkretus privalumas su paaiškinimu (ne abstraktus)"],
  "youtubeSearchQueries": ["BMW N47 timing chain replacement", "BMW 320d common problems"]
}

Analizės kokybė:
- Remonto kainas skaičiuok pagal Lietuvos rinką (darbas + detalės), naudok realistinius skaičius
- Identifikuok TIK realias, žinomas šio modelio/metų/variklio problemas — nespėliok
- Jei trūksta nuotraukų ar aprašymo detalių, NEDARYK išvadų apie būklę (žymėk warnings)
- Įvertink ridos realumą tik jei yra pakankamai duomenų
- Perpardavimo vertę grįsk realiomis Lietuvos rinkos kainomis
- Geriau būk konservatyvus nei pernelyg optimistiškas

youtubeSearchQueries lauke pateik 3-5 angliškus paieškos terminus, kurie padėtų rasti remonto video šiam konkrečiam automobiliui.`;

    const userContent: any[] = [];
    
    if (description) {
      userContent.push({
        type: "text",
        text: `Skelbimo aprašymas:\n${description}${listingUrl ? `\n\nSkelbimo nuoroda: ${listingUrl}` : ''}`
      });
    }

    if (imageBase64List && imageBase64List.length > 0) {
      for (const imageBase64 of imageBase64List.slice(0, 5)) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: imageBase64
          }
        });
      }
      userContent.push({
        type: "text",
        text: "Išanalizuok šias nuotraukas ir įvertink transporto priemonės būklę pagal tai, kas iš tikrųjų matosi nuotraukose. Nedaryk prielaidų apie tai, ko nematai."
      });
    }

    if (userContent.length === 0) {
      throw new Error("Nepateikta jokia informacija analizei");
    }

    console.log("Calling Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
        reasoning: { effort: "medium" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Tuščias AI atsakymas");
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Nepavyko apdoroti AI atsakymo");
    }

    // Check if AI returned an error (non-transport content)
    if (analysisResult.error) {
      return new Response(JSON.stringify({ error: analysisResult.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analysis completed successfully");

    // Save to market knowledge for future learning
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_KEY && analysisResult.vehicleInfo) {
        const supa = createClient(SUPABASE_URL, SERVICE_KEY);
        await supa.from("market_knowledge").insert({
          vehicle_make: analysisResult.vehicleInfo.make || "Nenurodyta",
          vehicle_model: analysisResult.vehicleInfo.model || "Nenurodyta",
          vehicle_year: typeof analysisResult.vehicleInfo.year === "number" ? analysisResult.vehicleInfo.year : null,
          mileage: analysisResult.vehicleInfo.mileage,
          fuel_type: analysisResult.vehicleInfo.fuelType,
          transmission: analysisResult.vehicleInfo.transmission,
          asking_price: analysisResult.marketAnalysis?.currentPrice ?? null,
          market_average: analysisResult.marketAnalysis?.marketAverage ?? null,
          estimated_repair_cost: analysisResult.repairEstimate?.totalCost ?? null,
          price_rating: analysisResult.marketAnalysis?.priceRating,
          source: "analysis",
        });
        console.log("Saved to market knowledge for future learning");
      }
    } catch (e) {
      console.log("Could not save market knowledge:", e);
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-vehicle:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Įvyko klaida analizuojant" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
