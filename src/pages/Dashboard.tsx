import { LayoutDashboard, FileText, TrendingUp, Brain, Map, Search, Compass, ArrowRight, Clock, Mic, Linkedin, Sparkles, Zap } from "lucide-react";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const quickLinks = [
  { icon: FileText, label: "Resume Analyzer", desc: "Score your resume", to: "/resume-analyzer", color: "from-violet-500 to-purple-600" },
  { icon: Search, label: "ATS Scanner", desc: "Optimize for ATS", to: "/ats-scanner", color: "from-blue-500 to-cyan-500" },
  { icon: Brain, label: "Interview Coach", desc: "Practice questions", to: "/interview-coach", color: "from-pink-500 to-rose-500" },
  { icon: TrendingUp, label: "Career Prediction", desc: "Find best roles", to: "/career-prediction", color: "from-amber-500 to-orange-500" },
  { icon: Compass, label: "Skill Explorer", desc: "Learn new skills", to: "/skill-explorer", color: "from-emerald-500 to-teal-500" },
  { icon: Map, label: "Career Roadmap", desc: "Plan your path", to: "/career-roadmap", color: "from-sky-500 to-blue-600" },
  { icon: Mic, label: "Voice Interview", desc: "Mock interviews", to: "/voice-interview", color: "from-fuchsia-500 to-pink-500" },
  { icon: Linkedin, label: "LinkedIn Analyzer", desc: "Optimize profile", to: "/linkedin-analyzer", color: "from-indigo-500 to-violet-500" },
];

function AnimatedScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const size = 100;
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
          <motion.span
            className="font-display font-bold text-xl"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: history } = useQuery({
    queryKey: ["dashboard_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const latestResume = history?.find((h: any) => h.activity_type === "resume_analysis");
  const latestATS = history?.find((h: any) => h.activity_type === "ats_scan");
  const totalActivities = history?.length || 0;

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
          style={{ background: "var(--gradient-primary)" }}
        >
          <LayoutDashboard className="h-8 w-8 text-primary-foreground" />
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ background: "var(--gradient-primary)" }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {user ? `Welcome back, ${user.email?.split("@")[0]}` : "Your career analysis hub"}
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Stats row */}
        {user && (latestResume || latestATS) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {latestResume && (
              <AnimatedSection>
                <motion.div whileHover={{ y: -4 }} className="glass-card-premium rounded-2xl p-6 text-center">
                  <AnimatedScoreCircle score={latestResume.score || 0} label="Resume Score" color="hsl(258, 90%, 62%)" />
                  <p className="text-xs text-muted-foreground mt-3">Latest analysis</p>
                </motion.div>
              </AnimatedSection>
            )}
            {latestATS && (
              <AnimatedSection delay={0.1}>
                <motion.div whileHover={{ y: -4 }} className="glass-card-premium rounded-2xl p-6 text-center">
                  <AnimatedScoreCircle score={latestATS.score || 0} label="ATS Score" color="hsl(220, 70%, 55%)" />
                  <p className="text-xs text-muted-foreground mt-3">Latest scan</p>
                </motion.div>
              </AnimatedSection>
            )}
            <AnimatedSection delay={0.2}>
              <motion.div whileHover={{ y: -4 }} className="glass-card-premium rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                <motion.div
                  className="font-display text-4xl font-bold gradient-text"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                >
                  {totalActivities}
                </motion.div>
                <p className="text-sm text-muted-foreground mt-2">Total Activities</p>
                <Link to="/history" className="text-xs text-primary mt-2 hover:underline flex items-center gap-1 font-medium">
                  View History <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        )}

        {/* Welcome card */}
        {(!user || !history?.length) && (
          <AnimatedSection>
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-card-premium rounded-3xl p-8 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
                style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.3), transparent)" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="floating-badge text-[10px]">Getting Started</span>
              </div>
              <h3 className="font-display font-bold text-2xl mb-2 relative">
                {user ? "Welcome to CareerCompass AI" : "Explore AI Career Tools"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-lg relative mb-5">
                Start by analyzing your resume to unlock personalized career insights, skill gap analysis, and interview preparation.
              </p>
              <Link
                to="/resume-analyzer"
                className="group inline-flex items-center gap-2 gradient-btn px-6 py-3 rounded-xl font-semibold text-sm relative magnetic-hover"
              >
                <Zap className="h-4 w-4" /> Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatedSection>
        )}

        {/* Recent activity */}
        {user && history && history.length > 0 && (
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Recent Activity
              </h3>
              <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {history.slice(0, 3).map((item: any, idx: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="glass-card-premium rounded-2xl p-4 flex items-center gap-4 cursor-default"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                    item.activity_type === "resume_analysis" ? "from-violet-500 to-purple-600" :
                    item.activity_type === "ats_scan" ? "from-blue-500 to-cyan-500" :
                    "from-emerald-500 to-teal-500"
                  } flex items-center justify-center shrink-0 shadow-md`}>
                    {item.activity_type === "resume_analysis" ? <FileText className="h-5 w-5 text-primary-foreground" /> :
                     item.activity_type === "ats_scan" ? <Search className="h-5 w-5 text-primary-foreground" /> :
                     <Compass className="h-5 w-5 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.summary}</p>
                  </div>
                  {item.score != null && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${item.score >= 80 ? "bg-green-500/10 text-green-600" : item.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}
                    >
                      {item.score}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Quick links */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" /> Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((l, i) => (
              <AnimatedSection key={l.label} delay={i * 0.05}>
                <Link to={l.to}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="glass-card-premium rounded-2xl p-5 flex items-start gap-3 group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      <l.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{l.label}</h4>
                      <p className="text-xs text-muted-foreground">{l.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
