import { useState } from "react";
import { Linkedin, Sparkles, Link2, FileText, Loader2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";
import LinkedInScoreCard from "@/components/linkedin/LinkedInScoreCard";
import LinkedInResults from "@/components/linkedin/LinkedInResults";

interface AnalysisResult {
  score: number;
  headline_score: number;
  summary_score: number;
  experience_score: number;
  skills_score: number;
  network_score: number;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: { title: string; description: string; priority: string }[];
  headline_suggestion: string;
  summary_suggestion: string;
  industry: string;
  seniority: string;
  completeness: number;
}

const loadingSteps = [
  "Fetching profile data...",
  "Analyzing headline & summary...",
  "Evaluating experience & skills...",
  "Generating recommendations...",
];

export default function LinkedInAnalyzerPage() {
  const [profileUrl, setProfileUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleAnalyze = async () => {
    if (!profileText.trim()) {
      toast.error("Please paste your LinkedIn profile content");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, 1800);

    try {
      const { data, error } = await supabase.functions.invoke("linkedin-analyzer", {
        body: { profileText: profileText.trim(), profileUrl: profileUrl.trim() || undefined },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.data) throw new Error("No analysis returned");

      setResult(data.data);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error("LinkedIn analysis error:", err);
      toast.error(err.message || "Failed to analyze profile. Try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setProfileUrl("");
    setProfileText("");
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <BackButton onClick={result ? reset : undefined} />
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 relative">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
          style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}
        >
          <Linkedin className="h-8 w-8 text-primary-foreground" />
          <motion.div className="absolute inset-0 rounded-2xl"
            style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">LinkedIn Profile Analyzer</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Get AI-powered insights to optimize your LinkedIn profile and stand out to recruiters.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-lg mx-auto text-center py-16">
            <div className="relative w-36 h-36 mx-auto mb-8">
              <motion.div className="absolute inset-0 rounded-full border-4 border-primary/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="absolute inset-3 rounded-full border-4 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                style={{ borderTopColor: "transparent", borderRightColor: "transparent" }} />
              <motion.div className="absolute inset-8 rounded-full border-4 border-primary/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                style={{ borderBottomColor: "transparent" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}>
                  <Linkedin className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl mb-3">Analyzing Profile</h3>
            <div className="space-y-2">
              {loadingSteps.map((step, i) => (
                <motion.div key={step}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: loadingStep >= i ? 1 : 0.3 }}
                  className="flex items-center justify-center gap-2 text-sm">
                  {loadingStep > i ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">✓</span>
                    </motion.div>
                  ) : loadingStep === i ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />
                  )}
                  <span className={loadingStep >= i ? "text-foreground" : "text-muted-foreground"}>{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input */}
        {!result && !loading && (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <AnimatedSection className="max-w-2xl mx-auto space-y-4">
              {/* URL field */}
              <div className="glass-card-premium rounded-2xl p-5">
                <label className="flex items-center gap-2 font-display font-semibold text-sm mb-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  LinkedIn Profile URL <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="premium-input"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              {/* Profile text */}
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8">
                <label className="flex items-center gap-2 font-display font-semibold text-sm mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Profile Content
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Copy your LinkedIn profile page content (About, Experience, Skills, Education) and paste it below.
                </p>
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  rows={10}
                  className="premium-input resize-none mb-4"
                  placeholder={"Paste your LinkedIn profile content here...\n\nTip: Visit your LinkedIn profile → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste here"}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={!profileText.trim()}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 magnetic-hover"
                >
                  <Sparkles className="h-4 w-4" /> Analyze with AI
                </motion.button>
              </div>
            </AnimatedSection>
          </motion.div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6">
            <LinkedInScoreCard
              score={result.score}
              headlineScore={result.headline_score}
              summaryScore={result.summary_score}
              experienceScore={result.experience_score}
              skillsScore={result.skills_score}
              networkScore={result.network_score}
              completeness={result.completeness}
              seniority={result.seniority}
              industry={result.industry}
            />

            <LinkedInResults
              skills={result.skills}
              strengths={result.strengths}
              weaknesses={result.weaknesses}
              suggestions={result.suggestions}
              headlineSuggestion={result.headline_suggestion}
              summarySuggestion={result.summary_suggestion}
            />

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={reset}
              className="w-full gradient-btn py-3.5 rounded-2xl text-sm font-semibold magnetic-hover flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Analyze Another Profile
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
