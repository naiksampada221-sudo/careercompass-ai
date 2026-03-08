import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Lightbulb, Zap, ChevronRight } from "lucide-react";

interface Suggestion {
  title: string;
  description: string;
  priority: string;
}

interface LinkedInResultsProps {
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  headlineSuggestion: string;
  summarySuggestion: string;
}

const priorityColors: Record<string, string> = {
  high: "hsl(0, 84%, 60%)",
  medium: "hsl(45, 93%, 47%)",
  low: "hsl(142, 71%, 45%)",
};

export default function LinkedInResults({
  skills, strengths, weaknesses, suggestions, headlineSuggestion, summarySuggestion,
}: LinkedInResultsProps) {
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
              className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">Suggested Headline</p>
              <p className="text-sm font-medium">{headlineSuggestion}</p>
            </motion.div>
          )}
          {summarySuggestion && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">Suggested About Section</p>
              <p className="text-sm leading-relaxed">{summarySuggestion}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Skills */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
        className="glass-card-premium rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Detected Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <motion.span key={s}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              whileHover={{ scale: 1.08, y: -2 }}
              className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium border border-primary/10 cursor-default transition-shadow hover:shadow-md">
              {s}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Strengths & Weaknesses side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="glass-card-premium rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: "hsl(142, 71%, 45%)" }} /> Strengths
          </h3>
          <div className="space-y-2">
            {strengths.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-green-500/5 border border-green-500/10">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
          className="glass-card-premium rounded-2xl p-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: "hsl(45, 93%, 47%)" }} /> Areas to Improve
          </h3>
          <div className="space-y-2">
            {weaknesses.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed">{s}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Prioritized Suggestions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 + i * 0.07 }}
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
