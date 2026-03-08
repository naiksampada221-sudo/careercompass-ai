import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Suggestion = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

type AnalysisResult = {
  score: number;
  headline_score: number;
  summary_score: number;
  experience_score: number;
  skills_score: number;
  network_score: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  headline_suggestion: string;
  summary_suggestion: string;
  industry: string;
  seniority: "entry" | "mid" | "senior" | "executive";
  completeness: number;
  profile_name: string;
};

type EvidenceChunk = {
  sourceUrl: string;
  title?: string;
  snippet?: string;
  markdown?: string;
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const toJson = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: jsonHeaders });

const clampScore = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const sanitizeTextArray = (value: unknown, maxItems = 10) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item).trim())
        .filter(Boolean)
        .slice(0, maxItems)
    : [];

const normalizePriority = (value: unknown): "high" | "medium" | "low" => {
  const priority = String(value || "").toLowerCase();
  if (priority === "high" || priority === "medium" || priority === "low") return priority;
  return "medium";
};

const parseAiJson = (content: string) => {
  const cleaned = content.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Failed to parse analysis results");
  }
};

const normalizeUrl = (rawUrl: string) => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const extractProfileHandle = (profileUrl: string) => {
  const match = profileUrl.match(/linkedin\.com\/in\/([^\/?#]+)/i);
  return match ? match[1].trim() : "";
};

const canonicalToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const canonicalHandle = (value: string) => canonicalToken(value).replace(/\s+/g, "");

const extractHandleFromLinkedInUrl = (url: string) => {
  const match = url.match(/linkedin\.com\/in\/([^\/?#]+)/i);
  return match ? match[1] : "";
};

const isLinkedInProfileUrl = (url: string) => /https?:\/\/(?:[a-z]+\.)?linkedin\.com\/in\//i.test(url);

const isHandleMatch = (expectedHandle: string, candidateUrl: string) => {
  if (!expectedHandle) return true;
  const candidateHandle = extractHandleFromLinkedInUrl(candidateUrl);
  if (!candidateHandle) return false;

  const expected = canonicalHandle(expectedHandle);
  const candidate = canonicalHandle(candidateHandle);
  if (!expected || !candidate) return false;

  return expected === candidate || expected.includes(candidate) || candidate.includes(expected);
};

const timeoutFetch = async (url: string, init: RequestInit, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const buildEvidenceText = (chunks: EvidenceChunk[]) =>
  chunks
    .map((chunk, index) => {
      const parts = [
        `Evidence #${index + 1}`,
        `Source URL: ${chunk.sourceUrl}`,
        chunk.title ? `Title: ${chunk.title}` : "",
        chunk.snippet ? `Snippet: ${chunk.snippet}` : "",
        chunk.markdown ? `Content: ${chunk.markdown}` : "",
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n---\n\n")
    .trim();

const containsEvidenceTerm = (evidenceText: string, term: string) => {
  const e = canonicalToken(evidenceText);
  const t = canonicalToken(term);
  if (!t || t.length < 2) return false;
  return e.includes(t);
};

const normalizeAnalysis = (raw: any, evidenceText: string): AnalysisResult => {
  const rawSkills = sanitizeTextArray(raw?.skills, 20);
  const verifiedSkills = rawSkills.filter((skill) => containsEvidenceTerm(evidenceText, skill));

  const profileName = String(raw?.profile_name || "").trim();
  const profileNameVerified = profileName && containsEvidenceTerm(evidenceText, profileName) ? profileName : "";

  return {
    score: clampScore(raw?.score),
    headline_score: clampScore(raw?.headline_score),
    summary_score: clampScore(raw?.summary_score),
    experience_score: clampScore(raw?.experience_score),
    skills_score: clampScore(raw?.skills_score),
    network_score: clampScore(raw?.network_score),
    skills: verifiedSkills,
    strengths: sanitizeTextArray(raw?.strengths, 8),
    weaknesses: sanitizeTextArray(raw?.weaknesses, 8),
    suggestions: Array.isArray(raw?.suggestions)
      ? raw.suggestions
          .slice(0, 8)
          .map((item: any) => ({
            title: String(item?.title || "Suggestion").slice(0, 100),
            description: String(item?.description || "").slice(0, 600),
            priority: normalizePriority(item?.priority),
          }))
          .filter((item: Suggestion) => item.description.trim().length > 0)
      : [],
    headline_suggestion: String(raw?.headline_suggestion || "").slice(0, 220),
    summary_suggestion: String(raw?.summary_suggestion || "").slice(0, 1200),
    industry: String(raw?.industry || "Unknown"),
    seniority: (["entry", "mid", "senior", "executive"].includes(String(raw?.seniority))
      ? raw.seniority
      : "entry") as AnalysisResult["seniority"],
    completeness: clampScore(raw?.completeness),
    profile_name: profileNameVerified,
  };
};

const collectRealtimeProfileSignals = async (profileUrl: string) => {
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") || "";
  const SERP_API_KEY = Deno.env.get("SERP_API_KEY") || "";

  const normalizedProfileUrl = normalizeUrl(profileUrl);
  const profileHandle = extractProfileHandle(normalizedProfileUrl);
  const handleQuery = profileHandle ? profileHandle.replace(/-/g, " ") : normalizedProfileUrl;

  const candidateChunks: EvidenceChunk[] = [];
  const matchedUrls = new Set<string>();

  if (!FIRECRAWL_API_KEY && !SERP_API_KEY) {
    return {
      profileHandle,
      sourceCount: 0,
      evidenceText: "",
      qualityScore: 0,
      matchedUrls: [] as string[],
    };
  }

  const firecrawlSearchPromise = FIRECRAWL_API_KEY
    ? timeoutFetch(
        "https://api.firecrawl.dev/v1/search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `site:linkedin.com/in "${handleQuery}"`,
            limit: 8,
            scrapeOptions: { formats: ["markdown"] },
          }),
        },
        13000,
      ).then(async (resp) => ({ ok: resp.ok, status: resp.status, data: await resp.json() }))
    : Promise.resolve({ ok: false, status: 0, data: null });

  const serpSearchPromise = SERP_API_KEY
    ? timeoutFetch(
        `https://serpapi.com/search.json?${new URLSearchParams({
          engine: "google",
          q: `site:linkedin.com/in "${handleQuery}"`,
          hl: "en",
          num: "10",
          api_key: SERP_API_KEY,
        }).toString()}`,
        { method: "GET" },
        13000,
      ).then(async (resp) => ({ ok: resp.ok, status: resp.status, data: await resp.json() }))
    : Promise.resolve({ ok: false, status: 0, data: null });

  const [firecrawlResult, serpResult] = await Promise.allSettled([firecrawlSearchPromise, serpSearchPromise]);

  if (firecrawlResult.status === "fulfilled" && firecrawlResult.value.ok) {
    const rows = Array.isArray(firecrawlResult.value.data?.data) ? firecrawlResult.value.data.data : [];

    for (const row of rows) {
      const url = String(row?.url || "").trim();
      if (!url || !isLinkedInProfileUrl(url) || !isHandleMatch(profileHandle, url)) continue;

      matchedUrls.add(url);
      candidateChunks.push({
        sourceUrl: url,
        title: row?.title ? String(row.title).slice(0, 240) : undefined,
        snippet: row?.description ? String(row.description).slice(0, 500) : undefined,
        markdown: row?.markdown ? String(row.markdown).slice(0, 2200) : undefined,
      });
    }
  }

  if (serpResult.status === "fulfilled" && serpResult.value.ok) {
    const organic = Array.isArray(serpResult.value.data?.organic_results) ? serpResult.value.data.organic_results : [];

    for (const item of organic.slice(0, 10)) {
      const url = String(item?.link || "").trim();
      if (!url || !isLinkedInProfileUrl(url) || !isHandleMatch(profileHandle, url)) continue;

      matchedUrls.add(url);
      candidateChunks.push({
        sourceUrl: url,
        title: item?.title ? String(item.title).slice(0, 240) : undefined,
        snippet: item?.snippet ? String(item.snippet).slice(0, 500) : undefined,
      });
    }
  }

  // Fresh direct scrape only for strongly matched URLs
  if (FIRECRAWL_API_KEY) {
    const scrapeTargets = [normalizedProfileUrl, ...matchedUrls]
      .filter((url, index, arr) => Boolean(url) && arr.indexOf(url) === index)
      .filter((url) => isLinkedInProfileUrl(url) && isHandleMatch(profileHandle, url))
      .slice(0, 3);

    const scrapeTasks = scrapeTargets.map(async (url) => {
      try {
        const resp = await timeoutFetch(
          "https://api.firecrawl.dev/v1/scrape",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url,
              formats: ["markdown"],
              onlyMainContent: true,
              waitFor: 1500,
            }),
          },
          15000,
        );

        if (!resp.ok) return;
        const body = await resp.json();
        const markdown = String(body?.data?.markdown || body?.markdown || "").slice(0, 2800);
        const title = String(body?.data?.metadata?.title || body?.metadata?.title || "").slice(0, 240);
        if (!markdown) return;

        matchedUrls.add(url);
        candidateChunks.push({
          sourceUrl: url,
          title: title || undefined,
          markdown,
        });
      } catch {
        // best effort
      }
    });

    await Promise.all(scrapeTasks);
  }

  const dedupedChunks = Array.from(
    new Map(
      candidateChunks
        .filter((chunk) => chunk.sourceUrl && (chunk.snippet || chunk.markdown || chunk.title))
        .map((chunk) => {
          const key = `${chunk.sourceUrl}|${chunk.title || ""}|${chunk.snippet || ""}|${chunk.markdown || ""}`;
          return [key, chunk] as const;
        }),
    ).values(),
  );

  const evidenceText = buildEvidenceText(dedupedChunks);
  const lowerEvidence = evidenceText.toLowerCase();
  const qualitySignals = [
    /experience|worked|internship|role|company/g.test(lowerEvidence),
    /skills|technologies|tools|python|java|react|machine learning|ai/g.test(lowerEvidence),
    /about|summary|headline|student|engineer|developer/g.test(lowerEvidence),
  ].filter(Boolean).length;

  const qualityScore =
    Math.min(50, matchedUrls.size * 15) +
    Math.min(35, Math.floor(evidenceText.length / 120)) +
    qualitySignals * 5;

  return {
    profileHandle,
    sourceCount: dedupedChunks.length,
    evidenceText,
    qualityScore,
    matchedUrls: [...matchedUrls],
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const profileUrl = String(body?.profileUrl || "").trim();
    const profileText = String(body?.profileText || "").trim();

    if (!profileUrl && !profileText) {
      return toJson({ error: "Please provide a LinkedIn profile URL or profile text." }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const sections: string[] = [];
    let sourceCount = 0;
    let qualityScore = 0;
    let evidenceText = "";

    if (profileText) {
      sections.push(`User provided LinkedIn content (trusted source):\n${profileText}`);
      evidenceText += `\n${profileText}`;
    }

    if (profileUrl) {
      const liveSignals = await collectRealtimeProfileSignals(profileUrl);
      sourceCount = liveSignals.sourceCount;
      qualityScore = liveSignals.qualityScore;
      evidenceText += `\n${liveSignals.evidenceText}`;

      console.log("Searching for LinkedIn profile:", liveSignals.profileHandle || profileUrl);
      console.log("Realtime source count:", sourceCount);
      console.log("Evidence quality score:", qualityScore);

      if (liveSignals.evidenceText) {
        sections.push(
          `LinkedIn Profile URL: ${normalizeUrl(profileUrl)}\nProfile Handle: ${liveSignals.profileHandle || "unknown"}\n\nStrict real-time evidence:\n\n${liveSignals.evidenceText}`,
        );
      }
    }

    // Strict anti-fake gate for URL-only mode
    if (!profileText) {
      const hasEnoughEvidence = sourceCount >= 3 && qualityScore >= 50 && evidenceText.length >= 700;
      if (!hasEnoughEvidence) {
        return toJson({
          success: false,
          showManualInput: true,
          error:
            "Not enough verified real-time profile data found. To avoid fake predictions, please paste your LinkedIn profile content for an accurate professional analysis.",
          meta: {
            strict_mode: true,
            realtime_sources_used: sourceCount,
            evidence_quality_score: qualityScore,
          },
        });
      }
    }

    const contentToAnalyze = sections.join("\n\n===\n\n").trim();
    if (!contentToAnalyze || contentToAnalyze.length < 80) {
      return toJson({
        success: false,
        showManualInput: true,
        error: "Not enough profile content to analyze. Please paste your LinkedIn profile text.",
      });
    }

    const systemPrompt = `You are an expert LinkedIn analyst working in STRICT FACT MODE.

NON-NEGOTIABLE RULES:
1) Use ONLY facts explicitly present in the provided evidence.
2) Do NOT infer or guess missing skills, experience, projects, names, companies, or achievements.
3) If data is missing, state it as missing.
4) skills[] must contain only exact or near-exact skills found in evidence text.
5) Suggestions must be practical and professional, but must not claim unverified facts.

Return valid JSON only, with this exact structure:
{
  "score": <0-100>,
  "headline_score": <0-100>,
  "summary_score": <0-100>,
  "experience_score": <0-100>,
  "skills_score": <0-100>,
  "network_score": <0-100>,
  "skills": ["..."],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestions": [{"title":"...","description":"...","priority":"high|medium|low"}],
  "headline_suggestion": "...",
  "summary_suggestion": "...",
  "industry": "...",
  "seniority": "entry|mid|senior|executive",
  "completeness": <0-100>,
  "profile_name": "..."
}`;

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
          { role: "user", content: `Analyze this profile using strict evidence-only reasoning:\n\n${contentToAnalyze}` },
        ],
        temperature: 0,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return toJson({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      }
      if (response.status === 402) {
        return toJson({ error: "AI credits exhausted. Please add credits." }, 402);
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = String(aiData?.choices?.[0]?.message?.content || "");
    const parsed = normalizeAnalysis(parseAiJson(content), evidenceText);

    return toJson({
      success: true,
      data: parsed,
      meta: {
        strict_mode: true,
        realtime_sources_used: sourceCount,
        evidence_quality_score: qualityScore,
      },
    });
  } catch (error) {
    console.error("LinkedIn analyzer error:", error);
    return toJson(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      500,
    );
  }
});
