import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Lightbulb, Zap, ChevronRight, Rocket, Copy, Check, ExternalLink, BookOpen, Users, Briefcase, Award, TrendingUp } from "lucide-react";

interface Suggestion {
  title: string;
  description: string;
  priority: string;
}

interface ScoreBreakdown {
  headlineScore: number;
  summaryScore: number;
  experienceScore: number;
  skillsScore: number;
  networkScore: number;
}

interface LinkedInResultsProps {
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  headlineSuggestion: string;
  summarySuggestion: string;
  scores?: ScoreBreakdown;
}

const priorityColors: Record<string, string> = {
  high: "hsl(0, 84%, 60%)",
  medium: "hsl(45, 93%, 47%)",
  low: "hsl(142, 71%, 45%)",
};

const improvementSteps = [
  {
    icon: BookOpen,
    title: "Optimize Your Headline",
    scoreKey: "headlineScore" as const,
    tips: [
      "Include your job title, specialty, and a value proposition",
      "Use keywords recruiters search for in your industry",
      "Avoid generic titles like 'Student' or 'Looking for opportunities'",
      "Keep it under 120 characters for full visibility",
    ],
    linkedinSection: "Edit intro → Headline",
  },
  {
    icon: Lightbulb,
    title: "Strengthen Your About Section",
    scoreKey: "summaryScore" as const,
    tips: [
      "Open with a compelling hook about your professional mission",
      "Include 3-5 measurable achievements or impact statements",
      "Mention key skills and technologies naturally within the text",
      "End with a clear call-to-action (what you're open to)",
    ],
    linkedinSection: "Edit intro → About",
  },
  {
    icon: Briefcase,
    title: "Enhance Experience Section",
    scoreKey: "experienceScore" as const,
    tips: [
      "Use bullet points starting with action verbs (Led, Built, Increased)",
      "Quantify results: revenue, %, users, time saved",
      "Add media (presentations, articles, project links) to each role",
      "Include volunteer work and freelance projects if applicable",
    ],
    linkedinSection: "Add profile section → Experience",
  },
  {
    icon: Award,
    title: "Boost Your Skills",
    scoreKey: "skillsScore" as const,
    tips: [
      "Add at least 10-15 relevant skills to your profile",
      "Pin your top 3 most important skills",
      "Request endorsements from colleagues for key skills",
      "Take LinkedIn Skill Assessments to earn badges",
    ],
    linkedinSection: "Add profile section → Skills",
  },
  {
    icon: Users,
    title: "Grow Your Network",
    scoreKey: "networkScore" as const,
    tips: [
      "Connect with 5-10 people weekly in your industry",
      "Personalize every connection request with context",
      "Engage with posts: comment thoughtfully, not just 'Great post!'",
      "Publish 1-2 posts per week sharing insights or learnings",
    ],
    linkedinSection: "My Network → Grow",
  },
];

const getScoreColor = (score: number) => {
  if (score >= 75) return "hsl(142, 71%, 45%)";
  if (score >= 50) return "hsl(45, 93%, 47%)";
  return "hsl(0, 84%, 60%)";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  return "Critical";
};

export default function LinkedInResults({
  skills, strengths, weaknesses, suggestions, headlineSuggestion, summarySuggestion, scores,
}: LinkedInResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* AI Suggested Headline & Summary */}
      {(headlineSuggestion || summarySuggestion) && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card-premium rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(258, 90%, 62%), transparent)" }} />
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2 relative">
            <span className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center">
              <Lightbulb className="h-4 w-4" />
            </span>
            AI-Suggested Improvements
          </h3>
          {headlineSuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 group relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-primary">Suggested Headline</p>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(headlineSuggestion, 0)}
                  className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10">
                  {copiedIndex === 0 ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
              <p className="text-sm font-medium">{headlineSuggestion}</p>
            </motion.div>
          )}
          {summarySuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-primary/5 border border-primary/10 group relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-primary">Suggested About Section</p>
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(summarySuggestion, 1)}
                  className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10">
                  {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                </motion.button>
              </div>
              <p className="text-sm leading-relaxed">{summarySuggestion}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Real-Time Improvement Guide */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card-premium rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(160, 84%, 39%), transparent)" }} />
        <h3 className="font-display font-semibold text-lg mb-2 flex items-center gap-2 relative">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(160, 84%, 39%), hsl(142, 71%, 45%))" }}>
            <Rocket className="h-4.5 w-4.5 text-white" />
          </span>
          Real-Time Improvement Guide
        </h3>
        <p className="text-xs text-muted-foreground mb-5 ml-11">
          Follow these steps right now to boost your profile score. Click each section to expand.
        </p>

        <div className="space-y-3">
          {improvementSteps.map((step, i) => {
            const Icon = step.icon;
            const score = scores?.[step.scoreKey] ?? 50;
            const isExpanded = expandedStep === i;
            const color = getScoreColor(score);
            const label = getScoreLabel(score);

            return (
              <motion.div key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}>
                <motion.button
                  onClick={() => setExpandedStep(isExpanded ? null : i)}
                  whileHover={{ x: 3 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-primary/10 transition-all duration-300 text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{step.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{ backgroundColor: `${color}15`, color }}>
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }} />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}%</span>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="shrink-0">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <div className="pt-2 pb-1 px-4 space-y-2">
                        {step.tips.map((tip, j) => (
                          <motion.div key={j}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.05 }}
                            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/40">
                            <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs leading-relaxed text-foreground/80">{tip}</p>
                          </motion.div>
                        ))}
                        <div className="flex items-center gap-2 pt-1 pb-2">
                          <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" />
                            Open LinkedIn → {step.linkedinSection}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
        className="glass-card-premium rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Detected Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <motion.span key={s}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium border border-primary/10 cursor-default transition-shadow hover:shadow-md">
              {s}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Strengths & Weaknesses side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="glass-card-premium rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: "hsl(142, 71%, 45%)" }} /> Strengths
          </h3>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-green-500/5 border border-green-500/10">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
          className="glass-card-premium rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: "hsl(45, 93%, 47%)" }} /> Areas to Improve
          </h3>
          <div className="space-y-2">
            {weaknesses.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Prioritized Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-card-premium rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.2), transparent)" }} />
        <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2 relative">
          <span className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center">
            <ChevronRight className="h-4 w-4" />
          </span>
          Action Plan
        </h3>
        <div className="space-y-3 relative">
          {suggestions.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
              whileHover={{ x: 4, backgroundColor: "hsla(258, 90%, 62%, 0.04)" }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-primary/10 transition-all duration-300 cursor-default">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <motion.span whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold">{i + 1}</motion.span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[s.priority] || priorityColors.medium }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors.high }} /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors.medium }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors.low }} /> Low</span>
        </div>
      </motion.div>
    </div>
  );
}
