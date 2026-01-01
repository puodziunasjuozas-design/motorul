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
    const { searchQueries, vehicleMake, vehicleModel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Searching YouTube videos for:", vehicleMake, vehicleModel);
    console.log("Search queries:", searchQueries);

    const systemPrompt = `Tu esi automobilių remonto video ekspertas. Tavo užduotis - sugeneruoti tikroviškus YouTube video pasiūlymus remontui.

Pagal pateiktus paieškos terminus, sugeneruok 3-6 video pasiūlymus su:
- Tikrovišku pavadinimu anglų kalba
- YouTube nuoroda (naudok tikrovišką formatą bet su pavyzdiniu ID)
- Thumbnail nuoroda (naudok placeholder paveikslėlį)

VISADA atsakyk JSON formatu:
{
  "videos": [
    {
      "title": "How to Replace Timing Chain on BMW N47 Engine - Step by Step Guide",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "thumbnail": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=225&fit=crop",
      "searchQuery": "BMW N47 timing chain replacement"
    }
  ]
}

Sukurk realiai naudingus video pavadinimus, kurie padėtų žmogui išmokti taisyti šį automobilį.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Automobilis: ${vehicleMake} ${vehicleModel}\n\nPaieškos terminai:\n${searchQueries?.join('\n') || 'general car repair tutorial'}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ videos: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let result = { videos: [] };
    if (content) {
      try {
        result = JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse YouTube response");
      }
    }

    console.log("Found videos:", result.videos?.length || 0);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in search-youtube:", error);
    return new Response(JSON.stringify({ videos: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
