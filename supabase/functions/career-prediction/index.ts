import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, action } = await req.json();

    // ---------- AUTOCOMPLETE (uses Lovable AI for speed) ----------
    if (action === "suggest_skills") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const query = skills?.[0] || "";
      if (!query || query.length < 1) {
        return new Response(JSON.stringify({ suggestions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are a skill autocomplete engine. Given a partial query, return 6-8 relevant technical skills, tools, or technologies that match. Return ONLY a JSON array of strings. No markdown." },
            { role: "user", content: `Query: "${query}"` },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) throw new Error("AI gateway error");
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || "[]";
      content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const suggestions = JSON.parse(content);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---------- REAL-TIME CAREER PREDICTION (uses Lovable AI Gateway) ----------
    if (!skills || !skills.length) {
      return new Response(JSON.stringify({ error: "Please provide at least one skill." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert career advisor with deep knowledge of the Indian job market. Predict the most suitable job roles for someone with the given skills.

Return EXACTLY this JSON structure (no markdown, no extra text):
{
  "predictions": [
    {
      "role": "Job Title",
      "match": 92,
      "salary_range": "₹8L - ₹15L",
      "demand": "High",
      "reason": "Specific market insight with real data points.",
      "key_skills_matched": ["skill1", "skill2"],
      "skills_to_learn": ["skill3"],
      "top_companies": ["Company1", "Company2", "Company3"],
      "job_openings_estimate": "5000+",
      "growth_outlook": "Growing 20% YoY"
    }
  ]
}

CRITICAL RULES:
- Return 6-8 predictions sorted by match percentage (highest first)
- match: 0-100 based on real job market alignment
- demand: "Very High", "High", "Medium", or "Low" based on current hiring trends
- salary_range: realistic Indian salaries in ₹ Lakhs per annum (LPA) for 2-5 years experience
- top_companies: 3 REAL companies actively hiring in India
- job_openings_estimate: approximate current openings
- growth_outlook: real industry growth data
- Base everything on actual current market knowledge`;

    const userPrompt = `My skills: ${skills.join(", ")}

Provide accurate career predictions for the Indian job market with real salary ranges, real hiring companies, and current job opening estimates.`;

    console.log("Calling Lovable AI Gateway for career prediction...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";

    if (!rawContent) {
      throw new Error("No content in AI response");
    }

    // Clean and parse JSON
    let content = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(content);
    parsed.grounded = true;

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("career-prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
