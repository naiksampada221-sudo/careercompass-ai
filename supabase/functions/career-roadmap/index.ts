import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { career, action } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // For suggest_careers and suggest_skills, use fast Lovable gateway
    if (action === "suggest_careers" || action === "suggest_skills") {
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      let systemPrompt = "";
      let prompt = "";

      if (action === "suggest_careers") {
        systemPrompt = `You are a career advisor. Given a partial search query, suggest 6-8 relevant career paths. Return a JSON array of objects with:
- id (string, kebab-case)
- title (string): career title
- icon (string): one emoji
- category (string): one of "Tech", "Business", "Creative", "Science", "Healthcare", "Engineering"
- description (string): one sentence
Return ONLY valid JSON array.`;
        prompt = `Suggest career paths matching: "${career || ""}"`;
      } else {
        systemPrompt = `You are a career skills advisor. Suggest 8 relevant skills matching the query. Return a JSON array with:
- skill (string): skill name
- category (string): "Programming", "Data", "Design", "Business", "DevOps", "AI/ML"
Return ONLY valid JSON array.`;
        prompt = `Suggest skills matching: "${career || ""}"`;
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI gateway error: ${response.status}`);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For get_roadmap, use Gemini directly with Google Search grounding for real-time data
    if (action === "get_roadmap") {
      if (!career) throw new Error("Career is required");
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

      const systemPrompt = `You are an expert career advisor with access to real-time job market data. Create an extremely detailed, comprehensive, and CURRENT career roadmap for becoming a "${career}" in 2025-2026.

CRITICAL RULES:
- Use REAL, CURRENT data from actual job postings, industry reports, and market trends
- Include REAL salary ranges based on current market data (in USD and INR)
- Reference REAL courses, certifications, books, and documentation that actually exist
- Include REAL companies that hire for this role
- Every topic must have detailed sub-topics that are actually taught in industry

Return a JSON object with this EXACT structure:
{
  "career": "${career}",
  "overview": "3-4 sentences about this career including current demand, average salary (USD & INR), and growth outlook based on real 2025 data",
  "totalMonths": <number>,
  "marketInsights": {
    "averageSalaryUSD": "<range>",
    "averageSalaryINR": "<range>",
    "demandLevel": "High" | "Very High" | "Moderate",
    "growthRate": "<percentage>",
    "topHiringCompanies": ["<real company names, 5-6>"],
    "jobOpenings": "<approximate number based on real data>"
  },
  "requiredSkills": [
    {
      "name": "<skill>",
      "level": "Essential" | "Important" | "Nice to Have",
      "description": "<why this matters>",
      "subTopics": ["<specific sub-topic 1>", "<specific sub-topic 2>", "<specific sub-topic 3>"]
    }
  ],
  "stages": [
    {
      "title": "<stage name>",
      "duration": "<e.g. 2-3 months>",
      "color": "<hex color>",
      "topics": [
        {
          "name": "<topic name>",
          "description": "<detailed description of what to learn>",
          "subTopics": ["<specific concept 1>", "<specific concept 2>", "<specific concept 3>", "<specific concept 4>"],
          "resources": ["<REAL course/book/doc name - must actually exist>", "<REAL resource 2>", "<REAL resource 3>"],
          "youtubeSearch": "<specific YouTube search query>",
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "estimatedHours": <number>
        }
      ],
      "projects": ["<detailed project description 1>", "<detailed project description 2>", "<detailed project description 3>"],
      "milestones": ["<what you should be able to do after this stage>"]
    }
  ],
  "certifications": [
    {
      "name": "<REAL certification name>",
      "provider": "<REAL provider>",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "cost": "<approximate cost>",
      "url": "<real URL if known>"
    }
  ],
  "interviewTopics": ["<common interview topic 1>", "<topic 2>", "<topic 3>", "<topic 4>", "<topic 5>"]
}

Make it extremely detailed with 5-6 stages, 4-6 topics per stage, and 3-5 sub-topics per topic. Use ONLY real, verifiable information.
Return ONLY valid JSON, no markdown.`;

      // Use Gemini API directly with Google Search grounding
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt }],
            },
          ],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 16000,
          },
        }),
      });

      if (!geminiResponse.ok) {
        const errText = await geminiResponse.text();
        console.error("Gemini API error:", errText);
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      
      // Extract text from Gemini response
      let content = "";
      const candidate = geminiData.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) content += part.text;
        }
      }

      if (!content) {
        console.error("Empty Gemini response:", JSON.stringify(geminiData));
        throw new Error("Empty AI response");
      }

      let parsed;
      try {
        const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(jsonStr);
      } catch {
        console.error("Failed to parse Gemini response:", content.substring(0, 500));
        throw new Error("Failed to parse AI response");
      }

      // Validate structure
      if (!parsed.career || !parsed.stages || !Array.isArray(parsed.stages)) {
        throw new Error("Invalid roadmap structure");
      }

      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("career-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
