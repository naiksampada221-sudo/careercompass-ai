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

    const systemPrompt = `You are an expert career advisor with deep knowledge of the current Indian job market as of 2025-2026. You have up-to-date knowledge of job portals like Naukri, LinkedIn India, Indeed India, and Glassdoor India.

Given a list of skills, predict the most suitable job roles with REAL salary data from the Indian job market.

Return EXACTLY this JSON structure (no markdown, no extra text):
{
  "predictions": [
    {
      "role": "Job Title",
      "match": 92,
      "salary_range": "₹8L - ₹15L",
      "demand": "High",
      "reason": "One sentence with specific market insight explaining why this matches.",
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
- match is a percentage 0-100 based on how well skills align with current job market demand
- demand is one of: "Very High", "High", "Medium", "Low" — based on actual Indian hiring trends in 2025
- salary_range MUST be realistic Indian salaries in ₹ Lakhs per annum (e.g. ₹6L - ₹12L for mid-level, ₹15L - ₹30L for senior, ₹40L+ for top roles)
- Include salary ranges for 2-5 years experience unless skills suggest senior level
- top_companies: list 3 real Indian companies or MNCs in India actively hiring for this role
- job_openings_estimate: approximate number of current openings on Indian job portals
- growth_outlook: real industry growth trend for this role in India
- key_skills_matched: which user skills apply
- skills_to_learn: 1-2 specific, actionable skills they should add
- reason should reference actual market conditions, not generic statements
- Be ACCURATE — don't inflate numbers. Use realistic data based on your knowledge of 2024-2025 Indian tech market`;

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
          { role: "user", content: `My skills: ${skills.join(", ")}\n\nAnalyze these skills against the current Indian job market and provide accurate career predictions with real salary data, hiring companies, and market trends.` },
        ],
        temperature: 0.1,
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