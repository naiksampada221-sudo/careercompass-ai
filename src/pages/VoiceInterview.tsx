import { useState } from "react";
import { Mic, MicOff, Play, Target, Sparkles, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";

const jobRoles = [
  { label: "Software Developer", emoji: "💻" },
  { label: "Data Scientist", emoji: "📊" },
  { label: "ML Engineer", emoji: "🤖" },
  { label: "Web Developer", emoji: "🌐" },
  { label: "Data Analyst", emoji: "📈" },
  { label: "Product Manager", emoji: "📋" },
];

const mockQuestions = [
  "Tell me about yourself and your experience.",
  "What is your greatest technical strength?",
  "Describe a challenging project you worked on.",
  "How do you stay updated with new technologies?",
  "Where do you see yourself in 5 years?",
];

function ScoreRing({ score, label, color, size = 90 }: { score: number; label: string; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}44)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="font-display font-bold text-lg" style={{ color }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function VoiceInterviewPage() {
  const [role, setRole] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [recording, setRecording] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleStart = () => { if (role) setStarted(true); };
  const handleNext = () => {
    if (currentQ < mockQuestions.length - 1) { setCurrentQ(currentQ + 1); setRecording(false); }
    else setCompleted(true);
  };
  const handleReset = () => { setCompleted(false); setStarted(false); setCurrentQ(0); setRole(""); };

  if (completed) {
    return (
      <div className="page-container">
        <div className="mb-6"><BackButton onClick={handleReset} /></div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 gradient-btn">
            <Sparkles className="h-8 w-8" />
          </motion.div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground">Mock interview for {role} — here's your performance breakdown.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card-premium rounded-3xl p-8 text-center">
            <h3 className="font-display font-semibold text-xl mb-8">Overall Performance</h3>
            <div className="flex justify-center gap-10 flex-wrap">
              <ScoreRing score={75} label="Confidence" color="hsl(258, 90%, 62%)" />
              <ScoreRing score={82} label="Answer Quality" color="hsl(142, 71%, 45%)" />
              <ScoreRing score={68} label="Clarity" color="hsl(38, 92%, 50%)" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card-premium rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Suggested Improvements
            </h3>
            <div className="space-y-3">
              {["Use the STAR method for behavioral questions", "Include more specific technical examples", "Slow down your pace for better clarity", "Quantify achievements with numbers and metrics"].map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-transparent hover:border-primary/10 transition-all cursor-default"
                >
                  <span className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <p className="text-sm leading-relaxed">{s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full gradient-btn py-3.5 rounded-2xl text-sm font-semibold magnetic-hover flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Start New Interview
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton onClick={started ? () => setStarted(false) : undefined} /></div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative" style={{ background: "var(--gradient-primary)" }}>
          <Mic className="h-8 w-8 text-primary-foreground" />
          <motion.div className="absolute inset-0 rounded-2xl" style={{ background: "var(--gradient-primary)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Voice Mock Interview</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">Practice answering interview questions using your microphone with AI feedback.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <AnimatedSection className="max-w-lg mx-auto">
              <div className="glass-card-premium rounded-3xl p-6 sm:p-8">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Select Job Role
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {jobRoles.map((r) => (
                    <motion.button
                      key={r.label}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRole(r.label)}
                      className={`text-left px-4 py-3.5 rounded-xl text-sm transition-all border-2 ${
                        role === r.label
                          ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                          : "border-transparent bg-muted/50 hover:bg-accent/50 hover:border-primary/10"
                      }`}
                    >
                      <span className="text-lg mr-2">{r.emoji}</span>
                      <span className="font-medium">{r.label}</span>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  disabled={!role}
                  className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 magnetic-hover"
                >
                  <Play className="h-4 w-4" /> Start Interview
                </motion.button>
              </div>
            </AnimatedSection>
          </motion.div>
        ) : (
          <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Question {currentQ + 1}/{mockQuestions.length}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }}
                  animate={{ width: `${((currentQ + 1) / mockQuestions.length) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>

            {/* Question card */}
            <motion.div
              key={currentQ}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card-premium rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
            >
              <motion.div className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />
              <div className="mb-3 flex items-center justify-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="floating-badge text-[10px]">Listen & Answer</span>
              </div>
              <p className="font-display text-xl sm:text-2xl font-semibold mb-10 relative leading-relaxed">{mockQuestions[currentQ]}</p>

              {/* Recording button */}
              <motion.button
                onClick={() => setRecording(!recording)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all relative ${recording ? "bg-destructive" : "gradient-btn"}`}
              >
                {recording && (
                  <motion.div className="absolute inset-0 rounded-full border-4 border-destructive/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
                {recording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
              </motion.button>
              <p className="text-sm text-muted-foreground mt-4">{recording ? "Recording... Click to stop" : "Click to start recording"}</p>
            </motion.div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="gradient-btn px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 magnetic-hover"
              >
                {currentQ < mockQuestions.length - 1 ? "Next Question" : "Finish Interview"} <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
