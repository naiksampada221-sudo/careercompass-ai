import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { career, action } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let prompt = "";
    let systemPrompt = "";

    if (action === "list_careers") {
      systemPrompt = `You are a career advisor. Return a JSON array of 20+ diverse career paths across tech, business, creative, science, and healthcare fields. Each item should have:
- id (string, kebab-case)
- title (string)
- icon (string, one emoji)
- category (string: "Tech", "Business", "Creative", "Science", "Healthcare", "Engineering")
- description (string, one sentence)

Return ONLY valid JSON array, no markdown.`;
      prompt = "List all major career paths someone can pursue.";
    } else if (action === "get_roadmap") {
      if (!career) throw new Error("Career is required");
      systemPrompt = `You are an expert career advisor. Create a comprehensive, practical career roadmap for becoming a ${career}. Return a JSON object with:
- career (string): the career title
- overview (string): 2-3 sentences about this career, salary range, and demand
- totalMonths (number): estimated months to become job-ready
- requiredSkills (array of objects): each has:
  - name (string): skill name
  - level (string): "Essential" | "Important" | "Nice to Have"
  - description (string): why this skill matters
- stages (array of 4-5 objects): each stage has:
  - title (string): stage name (e.g. "Foundation", "Core Skills", "Advanced", "Specialization")
  - duration (string): e.g. "2-3 months"
  - color (string): a hex color for the stage
  - topics (array of objects): each topic has:
    - name (string)
    - description (string): what to learn
    - resources (string[]): 2-3 specific real resources (courses, docs, books)
    - youtubeSearch (string): YouTube search query for best tutorial
  - projects (string[]): 2-3 hands-on projects to build
- certifications (array of objects): each has:
  - name (string)
  - provider (string)
  - difficulty (string): "Beginner" | "Intermediate" | "Advanced"

Use real, current resources. Be specific. Return ONLY valid JSON, no markdown.`;
      prompt = `Create a complete career roadmap for: ${career}`;
    } else if (action === "suggest_skills") {
      const query = career || "";
      systemPrompt = `You are a career skills advisor. Given a partial search query, suggest 8 relevant skills that match. Return a JSON array of objects with:
- skill (string): skill name
- category (string): category like "Programming", "Data", "Design", "Business", "DevOps", "AI/ML"

Return ONLY valid JSON array, no markdown. If the query is empty or very short, suggest trending/popular skills.`;
      prompt = `Suggest skills matching: "${query}"`;
    }

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
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("career-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
