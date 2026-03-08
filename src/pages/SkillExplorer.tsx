import { useState } from "react";
import { Compass, Search, BookOpen, Youtube, Clock, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

interface LearningStep {
  week: string;
  topic: string;
  description: string;
  resources: string[];
  youtubeSearch: string;
}

interface SkillPlan {
  skill: string;
  overview: string;
  totalWeeks: number;
  steps: LearningStep[];
}

export default function SkillExplorerPage() {
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SkillPlan | null>(null);
  const { toast } = useToast();

  const handleExplore = async () => {
    if (!skill.trim()) return;
    setLoading(true);
    setPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("skill-explorer", {
        body: { skill: skill.trim() },
      });

      if (error) throw error;
      setPlan(data.plan);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to generate plan. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      <PageHeader icon={<Compass className="h-7 w-7" />} title="Skill Explorer" subtitle="Enter any skill and get a complete AI-powered learning roadmap with resources." />

      <div className="max-w-3xl mx-auto">
        <AnimatedSection>
          <div className="glass-card rounded-2xl p-6">
            <label className="block font-semibold text-sm mb-3">What skill do you want to learn?</label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                  placeholder="e.g., Docker, React, Machine Learning, Python..."
                  className="w-full rounded-xl bg-muted pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleExplore}
                disabled={!skill.trim() || loading}
                className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compass className="h-4 w-4" />}
                Explore
              </button>
            </div>
          </div>
        </AnimatedSection>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">Generating learning plan...</h3>
            <p className="text-muted-foreground text-sm">AI is researching the best resources for "{skill}"</p>
          </motion.div>
        )}

        <AnimatePresence>
          {plan && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-6">
              {/* Overview */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold text-xl mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><BookOpen className="h-4 w-4" /></span>
                  {plan.skill} Learning Plan
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{plan.overview}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Estimated: {plan.totalWeeks} weeks
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {plan.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-sm">{step.topic}</p>
                        <p className="text-xs text-muted-foreground">{step.week}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                      {step.resources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Resources</p>
                          <div className="space-y-1">
                            {step.resources.map((r, j) => (
                              <p key={j} className="text-sm flex items-start gap-2">
                                <ExternalLink className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                {r}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.youtubeSearch)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                      >
                        <Youtube className="h-4 w-4" />
                        Watch on YouTube
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => { setPlan(null); setSkill(""); }}
                className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm"
              >
                Explore Another Skill
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
