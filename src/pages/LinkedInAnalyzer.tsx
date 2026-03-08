import { useState } from "react";
import { Linkedin, Sparkles, Link2, FileText, Loader2, RotateCcw, Globe, ChevronDown } from "lucide-react";
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
  profile_name?: string;
}

const loadingSteps = [
  "Fetching LinkedIn profile...",
  "Extracting profile data...",
  "Analyzing with AI...",
  "Generating recommendations...",
];

export default function LinkedInAnalyzerPage() {
  const [profileUrl, setProfileUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleAnalyze = async () => {
    if (!profileUrl.trim() && !profileText.trim()) {
      toast.error("Please enter a LinkedIn profile URL or paste profile content");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1));
    }, 2200);

    try {
      const { data, error } = await supabase.functions.invoke("linkedin-analyzer", {
        body: {
          profileUrl: profileUrl.trim() || undefined,
          profileText: profileText.trim() || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.showManualInput) {
          setShowManualInput(true);
        }
        throw new Error(data.error);
      }
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
    setShowManualInput(false);
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
          Paste your LinkedIn URL and get instant AI-powered profile optimization insights.
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
                      <span className="text-[8px] text-primary-foreground font-bold">✓</span>
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
              {/* URL input — primary */}
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8">
                <label className="flex items-center gap-2 font-display font-semibold text-sm mb-3">
                  <Globe className="h-4 w-4 text-primary" />
                  LinkedIn Profile URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="premium-input flex-1"
                    placeholder="https://linkedin.com/in/username"
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  We'll automatically fetch and analyze your public LinkedIn profile.
                </p>

                {/* Toggle manual input */}
                <motion.button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {showManualInput ? "Hide" : "Or paste profile text manually"}
                  <motion.span animate={{ rotate: showManualInput ? 180 : 0 }}>
                    <ChevronDown className="h-3 w-3" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {showManualInput && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        value={profileText}
                        onChange={(e) => setProfileText(e.target.value)}
                        rows={8}
                        className="premium-input resize-none mt-3"
                        placeholder="Paste your LinkedIn profile content here as a fallback..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={!profileUrl.trim() && !profileText.trim()}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 magnetic-hover mt-5"
                >
                  <Sparkles className="h-4 w-4" /> Analyze Profile
                </motion.button>
              </div>
            </AnimatedSection>
          </motion.div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6">

            {result.profile_name && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center mb-2">
                <h2 className="font-display font-bold text-lg text-foreground">{result.profile_name}</h2>
                {profileUrl && (
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                    <Link2 className="h-3 w-3" /> View Profile
                  </a>
                )}
              </motion.div>
            )}

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
