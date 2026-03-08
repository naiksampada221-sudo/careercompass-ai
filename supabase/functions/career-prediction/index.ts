import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fetch real job listings from Google Jobs via SerpAPI
async function fetchGoogleJobs(query: string, apiKey: string): Promise<{ total: number; jobs: any[] }> {
  try {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: query,
      location: "India",
      hl: "en",
      api_key: apiKey,
    });

    console.log(`Fetching Google Jobs for: "${query}"`);
    const resp = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("SerpAPI error:", resp.status, errText);
      return { total: 0, jobs: [] };
    }

    const data = await resp.json();
    const jobResults = data.jobs_results || [];
    const totalStr = data.search_information?.total_results || jobResults.length;

    const jobs = jobResults.slice(0, 5).map((j: any) => ({
      title: j.title || "",
      company: j.company_name || "",
      location: j.location || "",
      via: j.via || "",
      posted: j.detected_extensions?.posted_at || "",
      salary: j.detected_extensions?.salary || "",
      link: j.share_link || j.related_links?.[0]?.link || "",
      thumbnail: j.thumbnail || "",
    }));

    return { total: typeof totalStr === "number" ? totalStr : jobResults.length, jobs };
  } catch (e) {
    console.error("SerpAPI fetch error:", e);
    return { total: 0, jobs: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, action } = await req.json();

    // ---------- AUTOCOMPLETE ----------
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

    // ---------- REAL-TIME CAREER PREDICTION + GOOGLE JOBS ----------
    if (!skills || !skills.length) {
      return new Response(JSON.stringify({ error: "Please provide at least one skill." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const SERP_API_KEY = Deno.env.get("SERP_API_KEY") || "";

    // Step 1: Fetch real Google Jobs data in parallel with AI prediction
    const skillsQuery = skills.join(" ") + " jobs";
    const googleJobsPromise = SERP_API_KEY
      ? fetchGoogleJobs(skillsQuery, SERP_API_KEY)
      : Promise.resolve({ total: 0, jobs: [] });

    // Also fetch per-role jobs after we get predictions, but first get AI predictions
    const systemPrompt = `You are an expert career advisor with deep knowledge of the Indian job market.

Return EXACTLY this JSON (no markdown):
{
  "predictions": [
    {
      "role": "Job Title",
      "search_query": "job title india",
      "match": 92,
      "salary_range": "₹8L - ₹15L",
      "demand": "High",
      "reason": "Specific insight.",
      "key_skills_matched": ["skill1"],
      "skills_to_learn": ["skill3"],
      "top_companies": ["Company1", "Company2", "Company3"],
      "job_openings_estimate": "5000+",
      "growth_outlook": "Growing 20% YoY"
    }
  ]
}

RULES:
- 6-8 predictions sorted by match (highest first)
- search_query: a Google Jobs search query for this role in India
- salary_range: realistic INR LPA for 2-5 yrs experience
- top_companies: 3 real companies hiring in India
- Base on actual current market knowledge`;

    const userPrompt = `Skills: ${skills.join(", ")}`;

    console.log("Calling AI + SerpAPI in parallel...");

    const [aiResponse, googleJobsData] = await Promise.all([
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
      googleJobsPromise,
    ]);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";
    if (!rawContent) throw new Error("No content in AI response");

    let content = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) content = content.substring(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(content);

    // Step 2: Fetch real job counts per predicted role (top 3 only, to stay within rate limits)
    if (SERP_API_KEY && parsed.predictions?.length > 0) {
      const topRoles = parsed.predictions.slice(0, 3);
      const roleJobPromises = topRoles.map((p: any) =>
        fetchGoogleJobs(p.search_query || `${p.role} India`, SERP_API_KEY)
      );
      const roleJobResults = await Promise.all(roleJobPromises);

      for (let i = 0; i < topRoles.length; i++) {
        parsed.predictions[i].live_jobs = roleJobResults[i].jobs;
        parsed.predictions[i].live_job_count = roleJobResults[i].total;
      }
    }

    // Attach general job results
    parsed.grounded = true;
    parsed.live_job_results = googleJobsData.jobs;
    parsed.total_jobs_found = googleJobsData.total;

    console.log(`Done. ${googleJobsData.total} live jobs found, ${parsed.predictions?.length} predictions.`);

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
