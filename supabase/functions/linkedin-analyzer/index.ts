import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileUrl, profileText } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let contentToAnalyze = profileText || "";

    // If URL provided, use Firecrawl search to find profile info
    if (profileUrl && profileUrl.trim() && !contentToAnalyze) {
      const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
      if (!FIRECRAWL_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Firecrawl is not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract username from URL for search
      const urlMatch = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/i);
      const username = urlMatch ? urlMatch[1].replace(/-/g, " ") : profileUrl;

      console.log("Searching for LinkedIn profile:", username);

      // Use Firecrawl search to find publicly available profile info
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `site:linkedin.com/in "${username}" profile summary experience skills`,
          limit: 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        console.error("Firecrawl search error:", searchData);
        if (searchResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "Firecrawl credits exhausted. Please top up your Firecrawl plan." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "Could not search for profile. Please paste your profile content manually instead." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Gather all scraped content from search results
      const results = searchData.data || [];
      const gathered = results
        .map((r: any) => {
          const parts = [];
          if (r.title) parts.push(`Title: ${r.title}`);
          if (r.description) parts.push(`Description: ${r.description}`);
          if (r.markdown) parts.push(r.markdown);
          return parts.join("\n");
        })
        .join("\n\n---\n\n");

      if (gathered.length < 50) {
        return new Response(
          JSON.stringify({ 
            error: "Could not find enough public information for this LinkedIn profile. LinkedIn limits public access to profiles. Please paste your profile content using the manual input option below.",
            showManualInput: true 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      contentToAnalyze = `LinkedIn Profile URL: ${profileUrl}\n\nPublicly available profile information:\n\n${gathered}`;
      console.log("Gathered content length:", contentToAnalyze.length);
    }

    if (!contentToAnalyze || contentToAnalyze.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "No profile content to analyze. Please provide a LinkedIn URL or paste your profile text." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze with Gemini
    const systemPrompt = `You are an expert LinkedIn profile analyst and career coach. You analyze LinkedIn profiles and provide detailed, actionable feedback.

You MUST respond with valid JSON only, no markdown, no explanation outside JSON. Use this exact structure:
{
  "score": <number 0-100>,
  "headline_score": <number 0-100>,
  "summary_score": <number 0-100>,
  "experience_score": <number 0-100>,
  "skills_score": <number 0-100>,
  "network_score": <number 0-100>,
  "skills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": [
    {"title": "short title", "description": "detailed actionable suggestion", "priority": "high|medium|low"},
    ...
  ],
  "headline_suggestion": "suggested improved headline",
  "summary_suggestion": "suggested improved summary/about section (2-3 sentences)",
  "industry": "detected industry",
  "seniority": "entry|mid|senior|executive",
  "completeness": <number 0-100>,
  "profile_name": "detected full name from profile"
}

Scoring guidelines:
- 90-100: Outstanding, top 1% profile
- 75-89: Strong profile, minor improvements needed
- 60-74: Good but needs work in key areas
- 40-59: Below average, significant improvements needed
- 0-39: Incomplete or very weak profile

If profile data is limited (from public search results), score based on available info and note what's missing. Be specific, honest, and actionable. Reference actual content from their profile.`;

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
          { role: "user", content: `Analyze this LinkedIn profile:\n\n${contentToAnalyze}` },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("LinkedIn analyzer error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
