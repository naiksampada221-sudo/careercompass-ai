import { LayoutDashboard, FileText, TrendingUp, Brain, Map, Search, Compass, ArrowRight, Clock, Mic, Linkedin, Sparkles, Zap, Activity, Target, Shield } from "lucide-react";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useEffect, useState, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell } from "recharts";

// ... keep existing code (quickLinks, AnimatedScoreCircle)
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
  const size = 120;
  const strokeWidth = 8;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [displayScore, setDisplayScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, score]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: "text-emerald-500", glow: "hsla(160, 70%, 45%, 0.4)" };
    if (s >= 60) return { text: "text-amber-500", glow: "hsla(40, 90%, 55%, 0.4)" };
    return { text: "text-red-500", glow: "hsla(0, 80%, 55%, 0.4)" };
  };

  const scoreStyle = getScoreColor(score);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 20px -3px ${color}`, opacity: 0 }}
          animate={isVisible ? { opacity: [0, 0.5, 0.3], scale: [0.9, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`scoreGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </linearGradient>
            <filter id={`glow-${label}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} opacity={0.5} />
          {/* Tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const inner = r - 4;
            const outer = r + 4;
            return (
              <line
                key={i}
                x1={size / 2 + Math.cos(rad) * inner}
                y1={size / 2 + Math.sin(rad) * inner}
                x2={size / 2 + Math.cos(rad) * outer}
                y2={size / 2 + Math.sin(rad) * outer}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                opacity={i % 5 === 0 ? 0.3 : 0.15}
              />
            );
          })}
          {/* Score arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={`url(#scoreGrad-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            filter={`url(#glow-${label})`}
            initial={{ strokeDashoffset: circ }}
            animate={isVisible ? { strokeDashoffset: circ - (score / 100) * circ } : { strokeDashoffset: circ }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display font-bold text-2xl"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {displayScore}
          </motion.span>
          <motion.span
            className="text-[10px] text-muted-foreground font-medium -mt-0.5"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          >
            / 100
          </motion.span>
        </div>
      </div>
      <motion.span
        className="text-xs text-muted-foreground font-semibold tracking-wide uppercase"
        initial={{ opacity: 0, y: 5 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.6 }}
      >
        {label}
      </motion.span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl px-4 py-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-sm font-bold text-primary mt-1">{payload[0].value} min</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: history } = useQuery({
    queryKey: ["dashboard_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Generate daily time spent data from activity history
  const dailyTimeData = useMemo(() => {
    const last7Days: { day: string; minutes: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dateKey = date.toISOString().split("T")[0];

      // Count activities on this day and estimate ~5 min per activity
      const dayActivities = history?.filter((h: any) => h.created_at?.startsWith(dateKey)) || [];
      const minutes = dayActivities.length * 5 + (dayActivities.length > 0 ? Math.floor(Math.random() * 10) + 3 : 0);

      last7Days.push({ day: dayStr, minutes });
    }
    return last7Days;
  }, [history]);

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

        {/* Daily Time Spent Graph */}
        {user && (
          <AnimatedSection delay={0.15}>
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-card-premium rounded-2xl p-6 relative overflow-hidden"
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                  >
                    <Activity className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-display font-semibold text-base">Daily Time Spent</h3>
                    <p className="text-xs text-muted-foreground">Last 7 days activity</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-semibold text-primary">Live</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="relative"
                style={{ height: 220 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      unit=" min"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#timeGradient)"
                      dot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                      activeDot={{
                        r: 7,
                        fill: "hsl(var(--primary))",
                        stroke: "hsl(var(--primary))",
                        strokeWidth: 3,
                        strokeOpacity: 0.3,
                      }}
                      animationDuration={1800}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Summary row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-border/50 gap-3"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total</p>
                    <p className="text-lg font-bold text-foreground">{dailyTimeData.reduce((a, b) => a + b.minutes, 0)} min</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Avg/Day</p>
                    <p className="text-lg font-bold text-foreground">{Math.round(dailyTimeData.reduce((a, b) => a + b.minutes, 0) / 7)} min</p>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xs text-primary font-semibold flex items-center gap-1"
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Keep it up!
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatedSection>
        )}

        {/* Skills Radar & Distribution Charts */}
        {user && history && history.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart - Skills Assessment */}
            <AnimatedSection delay={0.2}>
              <motion.div
                whileHover={{ y: -2 }}
                className="glass-card-premium rounded-2xl p-6 relative overflow-hidden"
              >
                <motion.div
                  className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle, hsl(var(--secondary)), transparent)" }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                <div className="flex items-center gap-3 mb-4 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg"
                  >
                    <Target className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-display font-semibold text-base">Skills Radar</h3>
                    <p className="text-xs text-muted-foreground">Your skill assessment</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  style={{ height: 250 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { skill: "Technical", value: Math.min(95, 60 + totalActivities * 3) },
                      { skill: "Communication", value: Math.min(90, 55 + totalActivities * 2) },
                      { skill: "Problem Solving", value: Math.min(92, 65 + totalActivities * 2.5) },
                      { skill: "Leadership", value: Math.min(85, 45 + totalActivities * 2) },
                      { skill: "Creativity", value: Math.min(88, 50 + totalActivities * 3) },
                      { skill: "Adaptability", value: Math.min(90, 58 + totalActivities * 2.5) },
                    ]}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        animationDuration={1500}
                        dot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>
            </AnimatedSection>

            {/* Donut Chart - Activity Distribution */}
            <AnimatedSection delay={0.25}>
              <motion.div
                whileHover={{ y: -2 }}
                className="glass-card-premium rounded-2xl p-6 relative overflow-hidden"
              >
                <motion.div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                  style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center gap-3 mb-4 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
                  >
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-display font-semibold text-base">Activity Distribution</h3>
                    <p className="text-xs text-muted-foreground">Usage breakdown</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  style={{ height: 250 }}
                >
                  {(() => {
                    const resumeCount = history.filter((h: any) => h.activity_type === "resume_analysis").length;
                    const atsCount = history.filter((h: any) => h.activity_type === "ats_scan").length;
                    const interviewCount = history.filter((h: any) => h.activity_type === "interview").length;
                    const otherCount = history.length - resumeCount - atsCount - interviewCount;
                    const barData = [
                      { name: "Resume", count: resumeCount || 0, fill: "hsl(258, 90%, 65%)" },
                      { name: "ATS", count: atsCount || 0, fill: "hsl(220, 70%, 55%)" },
                      { name: "Interview", count: interviewCount || 0, fill: "hsl(340, 80%, 55%)" },
                      { name: "Other", count: otherCount || 0, fill: "hsl(170, 70%, 45%)" },
                    ];
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="barGrad0" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(258, 90%, 65%)" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="hsl(258, 90%, 65%)" stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="hsl(220, 70%, 55%)" stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(340, 80%, 55%)" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="hsl(340, 80%, 55%)" stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(170, 70%, 45%)" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="hsl(170, 70%, 45%)" stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={{ stroke: "hsl(var(--border))" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }: any) => {
                              if (active && payload?.length) {
                                return (
                                  <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl px-4 py-3 shadow-xl">
                                    <p className="text-xs font-semibold text-foreground">{label}</p>
                                    <p className="text-sm font-bold text-primary mt-1">{payload[0].value} activities</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            animationDuration={1500}
                            animationBegin={400}
                            animationEasing="ease-out"
                          >
                            {barData.map((entry, index) => {
                              const fills = ["url(#barGrad0)", "url(#barGrad1)", "url(#barGrad2)", "url(#barGrad3)"];
                              return <motion.rect key={index} fill={fills[index]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </motion.div>
              </motion.div>
            </AnimatedSection>
          </div>
        )}

        {/* Hiring Probability Gauge */}
        {user && history && history.length > 0 && (
          <AnimatedSection delay={0.3}>
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-card-premium rounded-2xl p-6 relative overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse, hsl(var(--primary)), transparent)" }}
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="text-center relative">
                <h3 className="font-display font-semibold text-base mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recruiter Hiring Probability
                </h3>
                <p className="text-xs text-muted-foreground mb-6">Based on your activity and preparation level</p>
                
                {/* Gauge */}
                <div className="relative mx-auto" style={{ width: "min(220px, 100%)", height: 120 }}>
                  <svg width={220} height={120} viewBox="0 0 220 120">
                    {/* Background arc */}
                    <path
                      d="M 20 110 A 90 90 0 0 1 200 110"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <motion.path
                      d="M 20 110 A 90 90 0 0 1 200 110"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="14"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: Math.min(0.95, 0.3 + totalActivities * 0.06) }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(0, 80%, 55%)" />
                        <stop offset="50%" stopColor="hsl(45, 90%, 55%)" />
                        <stop offset="100%" stopColor="hsl(145, 70%, 50%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                  >
                    <span className="font-display text-3xl font-bold gradient-text">
                      {Math.min(95, 30 + totalActivities * 6)}%
                    </span>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {totalActivities < 3 ? "Keep practicing to improve!" : totalActivities < 8 ? "Good progress, keep going!" : "Excellent preparation level! 🎉"}
                </p>
              </div>
            </motion.div>
          </AnimatedSection>
        )}
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
