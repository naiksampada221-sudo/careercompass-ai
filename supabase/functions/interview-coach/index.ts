import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(messages: any[], temperature = 0.7) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limit exceeded. Please try again later.");
    if (response.status === 402) throw new Error("Usage limit reached. Please add credits.");
    throw new Error("AI gateway error");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseJSON(content: string) {
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonStr);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, ...params } = await req.json();

    if (action === "generate_questions") {
      const { role, company, interviewType, difficulty, count } = params;
      const content = await callAI([
        {
          role: "system",
          content: `You are an expert interview coach. Generate realistic interview questions that would be asked at top companies. Return ONLY valid JSON, no markdown.`
        },
        {
          role: "user",
          content: `Generate ${count || 5} ${interviewType} interview questions for a ${role} position${company ? ` at ${company}` : ""}. Difficulty: ${difficulty || "Mixed"}.

Return JSON array:
[{
  "id": 1,
  "question": "...",
  "difficulty": "Easy|Medium|Hard",
  "category": "Technical|Behavioral|System Design|Problem Solving|Leadership",
  "timeLimit": 120,
  "tips": "Brief tip for answering"
}]`
        }
      ], 0.8);

      const questions = parseJSON(content);
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "evaluate_answer") {
      const { question, answer, role, company, interviewType } = params;
      const content = await callAI([
        {
          role: "system",
          content: `You are a senior interview coach at a top company. Evaluate the candidate's answer thoroughly and provide detailed, actionable feedback. Be honest but encouraging. Return ONLY valid JSON.`
        },
        {
          role: "user",
          content: `Role: ${role}${company ? ` at ${company}` : ""}
Interview Type: ${interviewType}
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate and return JSON:
{
  "score": <number 0-100>,
  "rating": "Excellent|Good|Average|Needs Improvement|Poor",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "modelAnswer": "A strong model answer for this question...",
  "feedback": "Detailed paragraph of personalized feedback",
  "metrics": {
    "relevance": <0-100>,
    "clarity": <0-100>,
    "depth": <0-100>,
    "structure": <0-100>,
    "confidence": <0-100>
  }
}`
        }
      ], 0.3);

      const evaluation = parseJSON(content);
      return new Response(JSON.stringify({ evaluation }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_report") {
      const { role, company, interviewType, results } = params;
      const content = await callAI([
        {
          role: "system",
          content: `You are an expert interview coach. Generate a comprehensive interview performance report. Return ONLY valid JSON.`
        },
        {
          role: "user",
          content: `Generate an interview performance report.
Role: ${role}${company ? ` at ${company}` : ""}
Type: ${interviewType}
Results: ${JSON.stringify(results)}

Return JSON:
{
  "overallScore": <0-100>,
  "overallRating": "Excellent|Good|Average|Needs Improvement",
  "summary": "2-3 sentence overall summary",
  "topStrengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "readinessLevel": "Ready|Almost Ready|Needs More Practice|Not Ready",
  "nextSteps": "Paragraph about what to focus on next"
}`
        }
      ], 0.3);

      const report = parseJSON(content);
      return new Response(JSON.stringify({ report }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (e) {
    console.error("interview-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
