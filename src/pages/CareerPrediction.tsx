import { useState, useEffect, useRef, useCallback } from "react";
import {
  TrendingUp, Plus, X, Sparkles, Briefcase, IndianRupee, BarChart3,
  Zap, BookOpen, ChevronDown, ChevronUp, Loader2, Search, Building2,
  Users, ArrowUpRight, Globe, Target, Rocket, GraduationCap, Star,
  Shield, Award, Flame, Eye, MapPin, Clock, CheckCircle2, CircleDot
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LiveJob {
  title: string;
  company: string;
  location: string;
  via: string;
  posted: string;
  salary: string;
  link: string;
  thumbnail: string;
}

interface Prediction {
  role: string;
  match: number;
  salary_range: string;
  demand: string;
  reason: string;
  key_skills_matched: string[];
  skills_to_learn: string[];
  top_companies?: string[];
  job_openings_estimate?: string;
  growth_outlook?: string;
  live_jobs?: LiveJob[];
  live_job_count?: number;
}

const popularSkills = [
  "Python", "JavaScript", "React", "Node.js", "SQL", "Machine Learning",
  "Data Analysis", "AWS", "Docker", "TypeScript", "Java", "C++",
  "TensorFlow", "Figma", "UI/UX Design", "Product Management",
  "Cybersecurity", "Blockchain", "DevOps", "Agile",
];

const demandConfig: Record<string, { color: string; icon: typeof Flame; label: string }> = {
  "Very High": { color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20", icon: Flame, label: "🔥 Very High" },
  "High": { color: "text-green-400 bg-green-500/15 border-green-500/20", icon: TrendingUp, label: "📈 High" },
  "Medium": { color: "text-amber-400 bg-amber-500/15 border-amber-500/20", icon: BarChart3, label: "📊 Medium" },
  "Low": { color: "text-muted-foreground bg-muted border-border", icon: CircleDot, label: "Low" },
};

// Animated score ring
function AnimatedScoreRing({ score, size = 100, delay = 0 }: { score: number; size?: number; delay?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 6);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 85 ? "hsl(142, 76%, 46%)" : score >= 70 ? "hsl(258, 90%, 62%)" : score >= 50 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)";

  return (
    <motion.div
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6}
          fill="none" stroke="hsl(var(--muted))" strokeWidth="4"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6}
          fill="none" stroke={scoreColor} strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ delay: delay + 0.3, duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        <span className="font-display font-bold" style={{ fontSize: size * 0.28, color: scoreColor }}>
          {score}%
        </span>
      </motion.div>
    </motion.div>
  );
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            background: `hsla(258, 90%, 62%, ${0.1 + Math.random() * 0.15})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Pulse dot for live indicator
function PulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

export default function CareerPredictionPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [grounded, setGrounded] = useState(false);
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [liveJobs, setLiveJobs] = useState<LiveJob[]>([]);
  const [totalJobsFound, setTotalJobsFound] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadingSteps = [
    { text: "Scanning live job market data...", icon: Search, emoji: "🔍" },
    { text: "Analyzing real-time salary trends...", icon: IndianRupee, emoji: "💰" },
    { text: "Identifying top hiring companies...", icon: Building2, emoji: "🏢" },
    { text: "Mapping career growth trajectories...", icon: Rocket, emoji: "🚀" },
    { text: "Generating AI-powered predictions...", icon: Sparkles, emoji: "✨" },
  ];

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-prediction", {
        body: { skills: [query], action: "suggest_skills" },
      });
      if (!error && data?.suggestions) {
        const filtered = data.suggestions.filter((s: string) => !skills.includes(s));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch { /* silently fail */ } finally { setLoadingSuggestions(false); }
  }, [skills]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (input.trim().length >= 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(input.trim()), 300);
    } else { setSuggestions([]); setShowSuggestions(false); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      toast({ title: "✅ Skill added", description: `${trimmed} has been added to your profile.` });
    }
    setInput(""); setSuggestions([]); setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) { e.preventDefault(); addSkill(input); }
  };

  const predict = async () => {
    if (skills.length < 2) {
      toast({ title: "⚠️ More skills needed", description: "Add at least 2 skills for accurate predictions.", variant: "destructive" });
      return;
    }
    setLoading(true); setPredictions([]); setExpandedIdx(null);
    const stepInterval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingSteps.length), 2500);
    try {
      const { data, error } = await supabase.functions.invoke("career-prediction", { body: { skills } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPredictions(data.predictions || []);
      setGrounded(!!data.grounded);
      setSources(data.sources || []);
      setLiveJobs(data.live_job_results || []);
      setTotalJobsFound(data.total_jobs_found || 0);
      toast({ title: "🎯 Predictions ready!", description: `Found ${data.predictions?.length || 0} career matches for you.` });
      if (user) {
        saveActivity({
          userId: user.id, activityType: "career_prediction",
          title: `Career Prediction – ${skills.length} skills`,
          score: data.predictions?.[0]?.match || null,
          summary: `Top match: ${data.predictions?.[0]?.role || "N/A"}`,
          resultData: { skills, predictions: data.predictions },
        });
      }
    } catch (e: any) {
      toast({ title: "❌ Prediction failed", description: e.message || "Something went wrong.", variant: "destructive" });
    } finally { clearInterval(stepInterval); setLoading(false); setLoadingStep(0); }
  };

  const reset = () => { setPredictions([]); setSkills([]); setExpandedIdx(null); setGrounded(false); setSources([]); setSelectedPrediction(null); setLiveJobs([]); setTotalJobsFound(0); };

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton onClick={predictions.length > 0 ? reset : undefined} /></div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 relative"
      >
        <FloatingParticles />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Target className="h-8 w-8 text-primary-foreground" />
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "var(--gradient-primary)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-3"
        >
          AI Career Prediction
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto"
        >
          Enter your skills and discover career paths powered by AI with real market intelligence
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-muted/80 border border-border text-xs text-muted-foreground"
        >
          <PulseDot />
          <span>Live AI Analysis</span>
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">BETA</span>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {predictions.length === 0 && !loading ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Skill input card */}
            <AnimatedSection>
              <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "var(--gradient-glow)" }}
                />
                <div className="relative z-10">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm mb-4">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    Add Your Skills
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {skills.length}/20 skills
                    </span>
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                          placeholder="Search for a skill (e.g., Python, React, AWS)..."
                          className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                        />
                        {loadingSuggestions && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px hsla(258, 90%, 62%, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addSkill(input)}
                        disabled={!input.trim()}
                        className="gradient-btn px-5 rounded-xl disabled:opacity-40 flex items-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* AI Autocomplete */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl glass-card border border-border overflow-hidden shadow-xl"
                        >
                          <div className="px-3 py-2 border-b border-border/50 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">AI Suggestions</span>
                          </div>
                          {suggestions.map((s, i) => (
                            <motion.button
                              key={s}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => addSkill(s)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-all flex items-center gap-3 border-b border-border/30 last:border-0 group/item"
                            >
                              <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                                <Plus className="h-3 w-3 text-primary" />
                              </div>
                              <span className="font-medium">{s}</span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/0 group-hover/item:text-primary ml-auto transition-colors" />
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected skills as chips */}
                  <AnimatePresence>
                    {skills.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2 mt-4"
                      >
                        {skills.map((skill, i) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: -10 }}
                            whileHover={{ scale: 1.08, boxShadow: "0 0 12px hsla(258, 90%, 62%, 0.3)" }}
                            layout
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium cursor-default group/chip"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive transition-all opacity-60 group-hover/chip:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Popular skills */}
                  <div className="mt-5">
                    <p className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-amber-500" />
                      <span className="font-medium">Trending skills</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSkills
                        .filter((s) => !skills.includes(s))
                        .slice(0, 12)
                        .map((skill, i) => (
                          <motion.button
                            key={skill}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.08, y: -2, boxShadow: "0 4px 12px hsla(258, 90%, 62%, 0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-muted-foreground text-xs hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-medium"
                          >
                            + {skill}
                          </motion.button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Predict button */}
            <AnimatedSection delay={0.1}>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -5px hsla(258, 90%, 62%, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={predict}
                disabled={skills.length < 2}
                className="w-full gradient-btn py-4 rounded-2xl font-display font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  initial={false}
                  whileHover={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 0.6 }}
                />
                <Rocket className="h-5 w-5" />
                Predict My Career Paths
                <motion.div
                  className="absolute right-4"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowUpRight className="h-4 w-4 opacity-60" />
                </motion.div>
              </motion.button>
              {skills.length > 0 && skills.length < 2 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1.5"
                >
                  <Shield className="h-3 w-3" /> Add at least 2 skills for accurate predictions
                </motion.p>
              )}
            </AnimatedSection>
          </motion.div>
        ) : loading ? (
          /* =================== LOADING STATE =================== */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="glass-card rounded-2xl p-10 text-center relative overflow-hidden">
              <FloatingParticles />
              <div className="relative z-10">
                {/* Animated orb */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-9 w-9 text-primary-foreground" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "var(--gradient-primary)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "var(--gradient-primary)" }}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  {loadingSteps.map((step, i) =>
                    i === loadingStep ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="mb-2"
                      >
                        <span className="text-2xl mb-2 block">{step.emoji}</span>
                        <p className="text-sm font-medium">{step.text}</p>
                      </motion.div>
                    ) : null
                  )}
                </AnimatePresence>

                {/* Progress bar */}
                <div className="mt-6 h-1.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <p className="text-[10px] text-muted-foreground mt-3">
                  Analyzing {skills.length} skills • Step {loadingStep + 1}/{loadingSteps.length}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =================== RESULTS =================== */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Status bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                {grounded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <PulseDot />
                    <span className="text-xs font-semibold text-emerald-500">Live AI Analysis</span>
                  </motion.div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{predictions.length} career paths found</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* ===== TOP PREDICTION HERO ===== */}
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                whileHover={{ y: -4, boxShadow: "0 20px 60px -15px hsla(258, 90%, 62%, 0.25)" }}
                className="glass-card rounded-2xl p-8 text-center relative overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPrediction(predictions[0])}
              >
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500" style={{ background: "var(--gradient-primary)" }} />
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ background: "var(--gradient-primary)" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold mb-4"
                  >
                    <Award className="h-3.5 w-3.5" /> #1 Best Match
                  </motion.div>

                  <h3 className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-5">{predictions[0].role}</h3>

                  <div className="flex justify-center mb-5">
                    <AnimatedScoreRing score={predictions[0].match} size={120} delay={0.4} />
                  </div>

                  <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
                    <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                      <IndianRupee className="h-4 w-4 text-primary" /> {predictions[0].salary_range}
                    </span>
                    {(() => {
                      const d = demandConfig[predictions[0].demand] || demandConfig["Medium"];
                      return (
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${d.color}`}>
                          {d.label} Demand
                        </span>
                      );
                    })()}
                    {predictions[0].job_openings_estimate && (
                      <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Users className="h-3.5 w-3.5" /> {predictions[0].job_openings_estimate} openings
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">{predictions[0].reason}</p>

                  {predictions[0].growth_outlook && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 mb-4"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> {predictions[0].growth_outlook}
                    </motion.div>
                  )}

                  {predictions[0].top_companies && predictions[0].top_companies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-center gap-2 flex-wrap mt-2"
                    >
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      {predictions[0].top_companies.map((c, i) => (
                        <motion.span
                          key={c}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="px-2.5 py-1 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-medium hover:border-primary/30 hover:text-primary transition-all cursor-default"
                        >
                          {c}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {predictions[0].key_skills_matched?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{s}</span>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Eye className="h-3 w-3" /> Click to view full details
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ===== OTHER PREDICTIONS ===== */}
            <div className="space-y-3">
              {predictions.slice(1).map((p, i) => {
                const demand = demandConfig[p.demand] || demandConfig["Medium"];
                return (
                  <motion.div
                    key={p.role}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileHover={{ y: -3, boxShadow: "0 12px 40px -10px hsla(258, 90%, 62%, 0.15)" }}
                    onHoverStart={() => setHoveredCard(i)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="glass-card rounded-2xl overflow-hidden relative group cursor-pointer"
                  >
                    {/* Hover flash */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "var(--gradient-primary)" }}
                      animate={{ opacity: hoveredCard === i ? 0.03 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      <button
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        className="w-full text-left p-5 flex items-center gap-4"
                      >
                        <div className="shrink-0">
                          <AnimatedScoreRing score={p.match} size={56} delay={0.3 + i * 0.08} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-display font-semibold text-sm truncate">{p.role}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${demand.color}`}>
                              {demand.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{p.reason}</p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          <span className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50">
                            <IndianRupee className="h-3 w-3 text-primary" /> {p.salary_range}
                          </span>
                          <motion.div animate={{ rotate: expandedIdx === i ? 180 : 0 }}>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedIdx === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
                              {/* Stats row */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {p.job_openings_estimate && (
                                  <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition-all"
                                  >
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                      <Users className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground font-medium">Job Openings</p>
                                      <p className="text-xs font-bold">{p.job_openings_estimate}</p>
                                    </div>
                                  </motion.div>
                                )}
                                {p.growth_outlook && (
                                  <motion.div
                                    whileHover={{ scale: 1.03 }}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border hover:border-emerald-500/20 transition-all"
                                  >
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground font-medium">Growth</p>
                                      <p className="text-xs font-bold">{p.growth_outlook}</p>
                                    </div>
                                  </motion.div>
                                )}
                                <motion.div
                                  whileHover={{ scale: 1.03 }}
                                  className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition-all"
                                >
                                  <div className="p-1.5 rounded-lg bg-primary/10">
                                    <IndianRupee className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground font-medium">Salary (INR)</p>
                                    <p className="text-xs font-bold">{p.salary_range}</p>
                                  </div>
                                </motion.div>
                              </div>

                              {/* Companies */}
                              {p.top_companies && p.top_companies.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3 text-primary" /> Top Hiring Companies
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {p.top_companies.map((c) => (
                                      <motion.span
                                        key={c}
                                        whileHover={{ scale: 1.08, y: -1 }}
                                        className="px-2.5 py-1 rounded-lg bg-accent border border-border text-accent-foreground text-xs font-medium hover:border-primary/30 transition-all"
                                      >
                                        {c}
                                      </motion.span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Skills */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <Zap className="h-3 w-3 text-primary" /> Matched Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {p.key_skills_matched.map((s) => (
                                      <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                    <GraduationCap className="h-3 w-3 text-secondary" /> Skills to Learn
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {p.skills_to_learn.map((s) => (
                                      <span key={s} className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs font-medium">{s}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* View full details button */}
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedPrediction(p); }}
                                className="w-full py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"
                              >
                                <Eye className="h-3.5 w-3.5" /> View Full Analysis
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Try again */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 8px 30px -5px hsla(258, 90%, 62%, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="gradient-btn px-8 py-3 rounded-xl font-display font-semibold text-sm inline-flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Try Different Skills
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DETAIL POPUP DIALOG ===== */}
      <Dialog open={!!selectedPrediction} onOpenChange={(open) => { if (!open) setSelectedPrediction(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedPrediction && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl gradient-text flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {selectedPrediction.role}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                <div className="flex items-center justify-center">
                  <AnimatedScoreRing score={selectedPrediction.match} size={100} />
                </div>

                <p className="text-sm text-muted-foreground text-center">{selectedPrediction.reason}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                    <IndianRupee className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Salary</p>
                    <p className="text-sm font-bold">{selectedPrediction.salary_range}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                    <BarChart3 className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Demand</p>
                    <p className="text-sm font-bold">{selectedPrediction.demand}</p>
                  </div>
                  {selectedPrediction.job_openings_estimate && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                      <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">Openings</p>
                      <p className="text-sm font-bold">{selectedPrediction.job_openings_estimate}</p>
                    </div>
                  )}
                  {selectedPrediction.growth_outlook && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                      <ArrowUpRight className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">Growth</p>
                      <p className="text-sm font-bold">{selectedPrediction.growth_outlook}</p>
                    </div>
                  )}
                </div>

                {selectedPrediction.top_companies && selectedPrediction.top_companies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Hiring Companies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrediction.top_companies.map((c) => (
                        <motion.span
                          key={c}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1.5 rounded-lg bg-accent border border-border text-accent-foreground text-xs font-medium"
                        >
                          <MapPin className="h-3 w-3 inline mr-1" />{c}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Your Matching Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrediction.key_skills_matched.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-secondary" /> Recommended to Learn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPrediction.skills_to_learn.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
