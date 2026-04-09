import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const systemPrompt = `Tu esi profesionalus automobilių ir motociklų ekspertas Lietuvoje su 20+ metų patirtimi.

GRIEŽTA TAISYKLĖ: Tu analizuoji TIK transporto priemonių skelbimus (automobiliai, motociklai, sunkvežimiai ir kt.). Jei pateikta informacija ar nuotraukos nėra susijusios su transporto priemone, grąžink klaidą:
{"error": "Pateikta informacija nesusijusi su transporto priemone. Prašau pateikti automobilio ar motociklo skelbimą."}

Tavo užduotis - išanalizuoti transporto priemonės skelbimą ir pateikti išsamią pirkimo rekomendaciją.

VISADA atsakyk JSON formatu su tokia struktūra:
{
  "vehicleInfo": {
    "make": "Markė",
    "model": "Modelis", 
    "year": 2020,
    "mileage": "100,000 km",
    "fuelType": "Dyzelinas/Benzinas/Elektra/Hibridas",
    "transmission": "Automatinė/Mechaninė"
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
    "recommendation": "Išsami rekomendacija lietuvių kalba – ar verta pirkti, kokios rizikos, ką patikrinti prieš perkant"
  },
  "warnings": ["Konkretus perspėjimas su paaiškinimu"],
  "positives": ["Konkretus privalumas su paaiškinimu"],
  "youtubeSearchQueries": ["BMW N47 timing chain replacement", "BMW 320d common problems"]
}

Analizės kokybė:
- Remonto kainas skaičiuok pagal Lietuvos rinką (tiek darbas, tiek detalės)
- Identifikuok KONKREČIAS tipines šio modelio/metų/variklio problemas
- Įvertink ridos realumą (ar gali būti sukta)
- Įvertink nuotraukose matomą būklę detaliai (rūdys, dažo defektai, salono būklė)
- Pateik sezoninį kainų svyravimą
- Perpardavimo potencialą su konkrečiais skaičiais
- Recommendations turi būti konkretūs ir praktiški

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
        text: "Išanalizuok šias nuotraukas ir detaliai įvertink transporto priemonės būklę – dažo būklę, rūdis, salono nusidėvėjimą, padangų būklę ir kitus matomus aspektus."
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
        response_format: { type: "json_object" }
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
