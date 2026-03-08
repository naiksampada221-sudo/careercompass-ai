import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Autocomplete action
    if (action === "suggest_skills") {
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
            { role: "system", content: `You are a skill autocomplete engine. Given a partial query, return 6-8 relevant technical skills, tools, or technologies that match. Return ONLY a JSON array of strings. Example: ["Data Analysis", "Data Science", "Data Engineering", "Database Administration"]. No markdown.` },
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

    // Prediction action
    if (!skills || !skills.length) {
      return new Response(JSON.stringify({ error: "Please provide at least one skill." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an expert career advisor and Indian job market analyst. Given a list of skills, predict the most suitable job roles with salaries in Indian Rupees (INR).

Return EXACTLY this JSON structure (no markdown, no extra text):
{
  "predictions": [
    {
      "role": "Job Title",
      "match": 92,
      "salary_range": "₹8L - ₹15L",
      "demand": "High",
      "reason": "One sentence explaining why this role matches.",
      "key_skills_matched": ["skill1", "skill2"],
      "skills_to_learn": ["skill3"]
    }
  ]
}

Rules:
- Return 6-8 predictions sorted by match percentage (highest first)
- match is a percentage 0-100 based on how well skills align
- demand is one of: "Very High", "High", "Medium", "Low"
- salary_range MUST be in Indian Rupees using format like ₹6L - ₹12L (L = Lakhs per annum) or ₹1Cr - ₹1.5Cr for very high salaries
- Reflect current Indian job market rates
- key_skills_matched lists which of the user's skills apply
- skills_to_learn lists 1-2 skills they should add for this role
- Be realistic and accurate with predictions`;

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
          { role: "user", content: `My skills: ${skills.join(", ")}` },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(content);
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
