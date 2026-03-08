import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, Plus, X, Sparkles, Briefcase, DollarSign, BarChart3, Zap, BookOpen, ChevronDown, ChevronUp, Loader2, Search, Building2, Users, ArrowUpRight, ExternalLink, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import ScoreCircle from "@/components/ScoreCircle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

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
}

const popularSkills = [
  "Python", "JavaScript", "React", "Node.js", "SQL", "Machine Learning",
  "Data Analysis", "AWS", "Docker", "TypeScript", "Java", "C++",
  "TensorFlow", "Figma", "UI/UX Design", "Product Management",
  "Cybersecurity", "Blockchain", "DevOps", "Agile",
];

const demandColors: Record<string, string> = {
  "Very High": "text-green-500 bg-green-500/10",
  "High": "text-emerald-500 bg-emerald-500/10",
  "Medium": "text-yellow-500 bg-yellow-500/10",
  "Low": "text-muted-foreground bg-muted",
};

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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadingSteps = [
    { text: "Analyzing your skill set...", icon: Sparkles },
    { text: "Matching with Indian job market...", icon: Briefcase },
    { text: "Calculating compatibility scores...", icon: BarChart3 },
    { text: "Generating career predictions...", icon: TrendingUp },
  ];

  // Fetch AI autocomplete suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
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
    } catch {
      // silently fail
    } finally {
      setLoadingSuggestions(false);
    }
  }, [skills]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (input.trim().length >= 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(input.trim()), 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [input, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addSkill(input);
    }
  };

  const predict = async () => {
    if (skills.length < 2) {
      toast({ title: "Add more skills", description: "Please add at least 2 skills for accurate predictions.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setPredictions([]);
    setExpandedIdx(null);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke("career-prediction", {
        body: { skills },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPredictions(data.predictions || []);
      setGrounded(!!data.grounded);
      setSources(data.sources || []);
      if (user) {
        saveActivity({
          userId: user.id,
          activityType: "career_prediction",
          title: `Career Prediction – ${skills.length} skills`,
          score: data.predictions?.[0]?.match || null,
          summary: `Top match: ${data.predictions?.[0]?.role || "N/A"}`,
          resultData: { skills, predictions: data.predictions },
        });
      }
    } catch (e: any) {
      toast({ title: "Prediction failed", description: e.message || "Something went wrong.", variant: "destructive" });
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const reset = () => {
    setPredictions([]);
    setSkills([]);
    setExpandedIdx(null);
  };

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton onClick={predictions.length > 0 ? reset : undefined} /></div>
      <PageHeader
        icon={<TrendingUp className="h-7 w-7" />}
        title="AI Career Prediction"
        subtitle="Enter your skills and discover the best career paths powered by Google Gemini AI."
      />

      <AnimatePresence mode="wait">
        {predictions.length === 0 && !loading ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Skill input */}
            <AnimatedSection>
              <div className="glass-card rounded-2xl p-6">
                <label className="block font-display font-semibold text-sm mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Add Your Skills
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
                        placeholder="Type a skill (e.g., Python, React, Data Analysis)..."
                        className="w-full rounded-xl bg-muted pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      {loadingSuggestions && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addSkill(input)}
                      disabled={!input.trim()}
                      className="gradient-btn px-4 rounded-xl disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl glass-card border border-border overflow-hidden shadow-lg"
                        style={{ transformOrigin: "top" }}
                      >
                        {suggestions.map((s, i) => (
                          <motion.button
                            key={s}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => addSkill(s)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent/80 transition-colors flex items-center gap-2 border-b border-border/50 last:border-0"
                          >
                            <Sparkles className="h-3 w-3 text-primary shrink-0" />
                            <span>{s}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected skills */}
                <AnimatePresence>
                  {skills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mt-4"
                    >
                      {skills.map((skill) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          layout
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Popular skills */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSkills
                      .filter((s) => !skills.includes(s))
                      .slice(0, 12)
                      .map((skill) => (
                        <motion.button
                          key={skill}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addSkill(skill)}
                          className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          + {skill}
                        </motion.button>
                      ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Predict button */}
            <AnimatedSection delay={0.1}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={predict}
                disabled={skills.length < 2}
                className="w-full gradient-btn py-4 rounded-2xl font-display font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Predict My Career Paths
              </motion.button>
              {skills.length > 0 && skills.length < 2 && (
                <p className="text-xs text-muted-foreground text-center mt-2">Add at least 2 skills to get predictions</p>
              )}
            </AnimatedSection>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="glass-card rounded-2xl p-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-btn flex items-center justify-center"
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>

              <AnimatePresence mode="wait">
                {loadingSteps.map((step, i) =>
                  i === loadingStep ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <step.icon className="h-4 w-4 text-primary" />
                      {step.text}
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>

              <div className="mt-6 flex justify-center gap-1.5">
                {loadingSteps.map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 rounded-full"
                    animate={{
                      width: i === loadingStep ? 24 : 8,
                      backgroundColor: i === loadingStep ? "hsl(258 90% 62%)" : "hsl(230 20% 80%)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Skills used */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5"
            >
              <p className="text-xs text-muted-foreground mb-2 font-medium">Skills analyzed:</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">{s}</span>
                ))}
              </div>
            </motion.div>

            {/* Top prediction hero */}
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="glass-card rounded-2xl p-8 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-primary)" }} />
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                    className="mb-4"
                  >
                    <span className="text-4xl">🏆</span>
                  </motion.div>
                  <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Best Career Match</p>
                  <h3 className="font-display text-2xl font-bold mb-4 gradient-text">{predictions[0].role}</h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <ScoreCircle score={predictions[0].match} size={120} />
                  </motion.div>
                  <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <DollarSign className="h-4 w-4 text-primary" /> {predictions[0].salary_range}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${demandColors[predictions[0].demand] || demandColors["Medium"]}`}>
                      <BarChart3 className="h-3 w-3" /> {predictions[0].demand} Demand
                    </span>
                    {predictions[0].job_openings_estimate && (
                      <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        <Users className="h-3 w-3" /> {predictions[0].job_openings_estimate} openings
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{predictions[0].reason}</p>

                  {/* Growth & Companies */}
                  {predictions[0].growth_outlook && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-500">
                      <ArrowUpRight className="h-3 w-3" /> {predictions[0].growth_outlook}
                    </div>
                  )}
                  {predictions[0].top_companies && predictions[0].top_companies.length > 0 && (
                    <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {predictions[0].top_companies.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">{c}</span>
                      ))}
                    </div>
                  )}

                  {/* Skills breakdown for top prediction */}
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {predictions[0].key_skills_matched?.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* All predictions */}
            <div className="space-y-3">
              {predictions.slice(1).map((p, i) => (
                <motion.div
                  key={p.role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden card-hover"
                >
                  <button
                    onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    className="w-full text-left p-5 flex items-center gap-4"
                  >
                    <div className="relative shrink-0">
                      <ScoreCircle score={p.match} size={56} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-display font-semibold text-sm truncate">{p.role}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${demandColors[p.demand] || demandColors["Medium"]}`}>
                          {p.demand}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{p.reason}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        {p.salary_range}
                      </span>
                      {expandedIdx === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedIdx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            {p.job_openings_estimate && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Openings</p>
                                  <p className="text-xs font-semibold">{p.job_openings_estimate}</p>
                                </div>
                              </div>
                            )}
                            {p.growth_outlook && (
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-muted-foreground">Growth</p>
                                  <p className="text-xs font-semibold">{p.growth_outlook}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                              <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground">Salary (INR)</p>
                                <p className="text-xs font-semibold">{p.salary_range}</p>
                              </div>
                            </div>
                          </div>

                          {p.top_companies && p.top_companies.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                <Building2 className="h-3 w-3 text-primary" /> Top Hiring Companies
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {p.top_companies.map((c) => (
                                  <span key={c} className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                              <Zap className="h-3 w-3 text-primary" /> Matched Skills
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {p.key_skills_matched.map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3 text-secondary" /> Skills to Learn
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {p.skills_to_learn.map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Try again */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="gradient-btn px-8 py-3 rounded-xl font-display font-semibold text-sm"
              >
                Try Different Skills
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
