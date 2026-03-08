import { useState } from "react";
import { Linkedin, Sparkles, CheckCircle, AlertTriangle, Target, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";

const mockResult = {
  score: 72,
  skills: ["Python", "Machine Learning", "Data Science", "TensorFlow", "SQL", "Deep Learning"],
  strengths: [
    "Strong technical skill set in ML/AI domain",
    "Clear project descriptions with outcomes",
    "Good education section with relevant coursework",
  ],
  suggestions: [
    "Improve your headline — use keywords recruiters search for",
    "Add a professional summary with quantified achievements",
    "Include at least 3 project descriptions with outcomes",
    "Add certifications and courses to boost credibility",
    "Request recommendations from colleagues and mentors",
    "Use a professional headshot and custom banner image",
  ],
};

function ScoreReveal({ score }: { score: number }) {
  const size = 160;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "hsl(142, 71%, 45%)" : score >= 60 ? "hsl(258, 90%, 62%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-[-10px] rounded-full"
        style={{ border: `2px solid ${color}22` }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}55)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-black text-4xl"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  );
}

export default function LinkedInAnalyzerPage() {
  const [text, setText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 2500);
  };

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton onClick={analyzed ? () => setAnalyzed(false) : undefined} /></div>

      {/* Hero header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
          style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}
        >
          <Linkedin className="h-8 w-8 text-primary-foreground" />
          <motion.div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">LinkedIn Analyzer</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">Paste your LinkedIn profile text and get AI-powered optimization suggestions.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-lg mx-auto text-center py-16">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div className="absolute inset-0 rounded-full border-4 border-primary/20" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.div className="absolute inset-4 rounded-full border-4 border-primary/30" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ borderTopColor: "transparent" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(220, 70%, 45%), hsl(258, 90%, 62%))" }}>
                  <Linkedin className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl mb-2">Analyzing your profile...</h3>
            <p className="text-muted-foreground text-sm">AI is scanning your LinkedIn content</p>
          </motion.div>
        )}

        {/* Input */}
        {!analyzed && !loading && (
          <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <AnimatedSection className="max-w-2xl mx-auto">
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8">
                <label className="flex items-center gap-2 font-display font-semibold text-sm mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  Paste Your LinkedIn Profile Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="premium-input resize-none mb-4"
                  placeholder="Copy and paste your LinkedIn 'About' section, experience, skills, etc."
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={!text.trim()}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 magnetic-hover"
                >
                  <Sparkles className="h-4 w-4" /> Analyze Profile
                </motion.button>
              </div>
            </AnimatedSection>
          </motion.div>
        )}

        {/* Results */}
        {analyzed && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
            {/* Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-premium rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
            >
              <motion.div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(258, 90%, 62%), transparent)" }}
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
              <h3 className="font-display font-bold text-xl mb-6 relative">Profile Strength</h3>
              <div className="flex justify-center relative">
                <ScoreReveal score={mockResult.score} />
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mt-4 inline-flex items-center gap-2 floating-badge">
                <TrendingUp className="h-3.5 w-3.5" /> Room for improvement
              </motion.div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass-card-premium rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {mockResult.skills.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium border border-primary/10 cursor-default transition-shadow hover:shadow-md"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Strengths */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="glass-card-premium rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" style={{ color: "hsl(142, 71%, 45%)" }} /> Strengths
              </h3>
              <div className="space-y-2">
                {mockResult.strengths.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{s}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="glass-card-premium rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.15), transparent)" }} />
              <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2 relative">
                <span className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center"><AlertTriangle className="h-4 w-4" /></span>
                Optimization Suggestions
              </h3>
              <div className="space-y-3 relative">
                {mockResult.suggestions.map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    whileHover={{ x: 4, backgroundColor: "hsla(258, 90%, 62%, 0.04)" }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-transparent hover:border-primary/10 transition-all duration-300 cursor-default"
                  >
                    <motion.span whileHover={{ scale: 1.15, rotate: 5 }}
                      className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</motion.span>
                    <p className="text-sm leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAnalyzed(false)}
              className="w-full gradient-btn py-3.5 rounded-2xl text-sm font-semibold magnetic-hover"
            >
              Analyze Another Profile
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
