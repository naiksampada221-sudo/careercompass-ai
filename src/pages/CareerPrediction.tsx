import { useState } from "react";
import { TrendingUp, Plus, X, Sparkles, Briefcase, DollarSign, BarChart3, Zap, BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadingSteps = [
    { text: "Analyzing your skill set...", icon: Sparkles },
    { text: "Matching with job market data...", icon: Briefcase },
    { text: "Calculating compatibility scores...", icon: BarChart3 },
    { text: "Generating career predictions...", icon: TrendingUp },
  ];

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setInput("");
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
        subtitle="Enter your skills and discover the best career paths powered by AI."
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

                <div className="flex gap-2 mb-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
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

                {/* Selected skills */}
                <AnimatePresence>
                  {skills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mb-4"
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
                <div>
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
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-primary" /> {predictions[0].salary_range}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${demandColors[predictions[0].demand] || demandColors["Medium"]}`}>
                      <BarChart3 className="h-3 w-3" /> {predictions[0].demand} Demand
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{predictions[0].reason}</p>
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
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display font-semibold text-sm truncate">{p.role}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${demandColors[p.demand] || demandColors["Medium"]}`}>
                          {p.demand}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{p.reason}</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> {p.salary_range}
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
