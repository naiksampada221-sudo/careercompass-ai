import { motion } from "framer-motion";
import { TrendingUp, Award, Star } from "lucide-react";

function ScoreRing({ score, label, size = 80, delay = 0 }: { score: number; label: string; size?: number; delay?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? "hsl(142, 71%, 45%)" : score >= 60 ? "hsl(258, 90%, 62%)" : score >= 40 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.8, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}44)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span className="font-bold text-lg" style={{ color }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}>
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

interface LinkedInScoreCardProps {
  score: number;
  headlineScore: number;
  summaryScore: number;
  experienceScore: number;
  skillsScore: number;
  networkScore: number;
  completeness: number;
  seniority: string;
  industry: string;
}

export default function LinkedInScoreCard({
  score, headlineScore, summaryScore, experienceScore, skillsScore, networkScore,
  completeness, seniority, industry,
}: LinkedInScoreCardProps) {
  const mainSize = 180;
  const mainR = (mainSize - 14) / 2;
  const mainCirc = 2 * Math.PI * mainR;
  const mainColor = score >= 80 ? "hsl(142, 71%, 45%)" : score >= 60 ? "hsl(258, 90%, 62%)" : score >= 40 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good — Room to grow" : score >= 40 ? "Needs improvement" : "Weak profile";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-premium rounded-3xl p-8 sm:p-10 relative overflow-hidden"
    >
      <motion.div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${mainColor}, transparent)` }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />

      <div className="flex flex-col lg:flex-row items-center gap-8 relative">
        {/* Main score */}
        <div className="text-center">
          <div className="relative" style={{ width: mainSize, height: mainSize }}>
            <motion.div className="absolute inset-[-12px] rounded-full"
              style={{ border: `2px solid ${mainColor}22` }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.08, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }} />
            <svg width={mainSize} height={mainSize} className="-rotate-90">
              <circle cx={mainSize / 2} cy={mainSize / 2} r={mainR} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <motion.circle
                cx={mainSize / 2} cy={mainSize / 2} r={mainR} fill="none" stroke={mainColor} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={mainCirc}
                initial={{ strokeDashoffset: mainCirc }}
                animate={{ strokeDashoffset: mainCirc - (score / 100) * mainCirc }}
                transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: `drop-shadow(0 0 10px ${mainColor}55)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span className="font-display font-black text-5xl" style={{ color: mainColor }}
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}>
                {score}
              </motion.span>
              <span className="text-[10px] text-muted-foreground font-medium">out of 100</span>
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-3 inline-flex items-center gap-1.5 floating-badge text-xs">
            <TrendingUp className="h-3 w-3" /> {label}
          </motion.div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Score Breakdown
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            <ScoreRing score={headlineScore} label="Headline" delay={0.2} />
            <ScoreRing score={summaryScore} label="Summary" delay={0.3} />
            <ScoreRing score={experienceScore} label="Experience" delay={0.4} />
            <ScoreRing score={skillsScore} label="Skills" delay={0.5} />
            <ScoreRing score={networkScore} label="Network" delay={0.6} />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-5 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <Star className="h-3 w-3 inline mr-1" />{industry}
            </span>
            <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold border border-primary/10 capitalize">
              {seniority} level
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
              {completeness}% complete
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
