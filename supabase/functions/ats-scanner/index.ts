import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, jobDescription, fileBase64, fileName } = await req.json();
    if ((!resumeText && !fileBase64) || !jobDescription) throw new Error("Both resume and job description are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Compare the resume against the job description and return a JSON object with:
- score (number 0-100): ATS compatibility score
- matchedKeywords (string[]): keywords found in both resume and job description
- missingKeywords (string[]): important keywords from the job description missing in the resume
- suggestions (string[]): 4-6 specific, actionable suggestions to improve ATS compatibility

Be precise and compare actual keywords. Return ONLY valid JSON, no markdown.`;

    const userContent: any[] = [];

    if (fileBase64 && fileName) {
      const ext = (fileName || "").split(".").pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        txt: "text/plain",
      };
      const mimeType = mimeMap[ext || ""] || "application/octet-stream";
      userContent.push({
        type: "file",
        file: { filename: fileName, file_data: `data:${mimeType};base64,${fileBase64}` },
      });
      userContent.push({ type: "text", text: `Compare this resume against the following job description:\n\n${jobDescription}` });
    } else {
      userContent.push({ type: "text", text: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}` });
    }

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
          { role: "user", content: userContent },
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
    
    let result;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ats-scanner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
