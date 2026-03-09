import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { FileText, Search, Brain, TrendingUp, Compass, ArrowRight, Sparkles, Upload, Target, GraduationCap, Mic, Zap, Users, ChevronRight, Star, Shield, Clock, Award, Send, MessageSquare } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import TextReveal from "@/components/TextReveal";
import TypingText from "@/components/TypingText";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const features = [
  { icon: FileText, title: "Resume Analyzer", desc: "AI-powered resume scoring with actionable improvement tips.", link: "/resume-analyzer", color: "from-violet-500 to-purple-600", glow: "hsla(258, 90%, 62%, 0.4)" },
  { icon: Search, title: "ATS Scanner", desc: "Optimize your resume for Applicant Tracking Systems.", link: "/ats-scanner", color: "from-blue-500 to-cyan-500", glow: "hsla(200, 90%, 55%, 0.4)" },
  { icon: Brain, title: "AI Interview Coach", desc: "Practice with skill-based questions at every difficulty level.", link: "/interview-coach", color: "from-pink-500 to-rose-500", glow: "hsla(340, 90%, 60%, 0.4)" },
  { icon: TrendingUp, title: "Career Prediction", desc: "Discover best-fit roles with AI probability analysis.", link: "/career-prediction", color: "from-amber-500 to-orange-500", glow: "hsla(30, 90%, 55%, 0.4)" },
  { icon: Compass, title: "Skill Explorer", desc: "Enter any skill and get a complete learning roadmap.", link: "/skill-explorer", color: "from-emerald-500 to-teal-500", glow: "hsla(160, 70%, 45%, 0.4)" },
  { icon: Mic, title: "Voice Mock Interview", desc: "Simulate real interviews with voice recording and AI feedback.", link: "/voice-interview", color: "from-sky-500 to-blue-600", glow: "hsla(210, 90%, 55%, 0.4)" },
];

const steps = [
  { icon: Upload, num: "01", title: "Upload Resume", desc: "Drop your PDF resume and let AI do the rest", link: "/resume-analyzer" },
  { icon: Sparkles, num: "02", title: "ATS Scan", desc: "Check your resume against job descriptions for ATS compatibility", link: "/ats-scanner" },
  { icon: Target, num: "03", title: "Career Insights", desc: "Explore career paths, skill roadmaps & predictions", link: "/career-roadmap" },
  { icon: GraduationCap, num: "04", title: "Interview Prep", desc: "Practice with AI-powered mock interviews", link: "/interview-coach" },
];


function FlashCard({ f, i }: { f: typeof features[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useTransform(mouseY, [0, 1], [8, -8]);
  const rotateY = useTransform(mouseX, [0, 1], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <AnimatedSection delay={i * 0.1}>
      <Link to={f.link}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformPerspective: 800,
          }}
          className="group relative rounded-2xl p-[1px] cursor-pointer h-full"
        >
          {/* Animated border gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${f.glow}, transparent 50%, ${f.glow})`,
              backgroundSize: "200% 200%",
            }}
            animate={isHovered ? { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative rounded-2xl bg-card p-6 h-full overflow-hidden border border-border/50 group-hover:border-transparent transition-colors duration-500">
            {/* Flash/spotlight effect on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(400px circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, ${f.glow}, transparent 40%)`,
              }}
              animate={{ opacity: isHovered ? 0.15 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shimmer flash on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.15) 45%, hsla(0,0%,100%,0.05) 50%, transparent 55%)",
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={isHovered ? { x: "200%", opacity: 1 } : { x: "-100%", opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <motion.div
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5`}
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <f.icon className="h-6 w-6 text-primary-foreground" />
                {/* Icon glow pulse */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, transparent, hsla(0,0%,100%,0.3))` }}
                  animate={isHovered ? { opacity: [0, 0.5, 0] } : { opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {/* Floating ring */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl border-2"
                  style={{ borderColor: f.glow }}
                  animate={isHovered ? { scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] } : { opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{f.desc}</p>

              <motion.div
                className="flex items-center gap-2 text-sm font-medium text-primary"
                initial={{ opacity: 0, x: -10 }}
                animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <span>Explore</span>
                <motion.div animate={isHovered ? { x: [0, 5, 0] } : {}} transition={{ duration: 1, repeat: Infinity }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Link>
    </AnimatedSection>
  );
}

function MarqueeBar() {
  const items = [
    "✨ AI-Powered Analysis",
    "🚀 10x Faster Job Search",
    "🎯 98% ATS Pass Rate",
    "🧠 Smart Interview Prep",
    "📊 Career Prediction",
    "🔒 Secure & Private",
  ];

  return (
    <div className="relative overflow-hidden py-4 border-y border-border/30 bg-muted/20 backdrop-blur-sm">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm font-medium text-muted-foreground/70 flex items-center gap-2">
            {item}
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}


interface FeedbackItem {
  id: string;
  name: string;
  role: string | null;
  message: string;
  rating: number;
  created_at: string;
}

function FeedbackSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as FeedbackItem[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to leave feedback"); return; }
    if (!name.trim() || !message.trim()) { toast.error("Name and message are required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      name: name.trim(),
      role: role.trim() || null,
      message: message.trim(),
      rating,
    });
    setSubmitting(false);
    if (error) { toast.error("Failed to submit feedback"); return; }
    toast.success("Thank you for your feedback! 🎉");
    setName(""); setRole(""); setMessage(""); setRating(5);
    queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-14">
          <span className="floating-badge mb-4 inline-flex">
            <MessageSquare className="h-3.5 w-3.5" /> Feedback
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What Users <span className="gradient-text">Say</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">Real feedback from real users of CareerCompass AI.</p>
        </AnimatedSection>

        {feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {feedbacks.map((fb, i) => (
              <AnimatedSection key={fb.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group glass-card-premium rounded-2xl p-6 h-full cursor-default relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "linear-gradient(105deg, transparent 40%, hsla(258,90%,62%,0.06) 45%, transparent 55%)" }}
                  />
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: fb.rating }).map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0, rotate: -90 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + j * 0.08, type: "spring", stiffness: 300 }}
                      >
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed italic">"{fb.message}"</p>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md">
                      {fb.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{fb.name}</p>
                      {fb.role && <p className="text-xs text-muted-foreground">{fb.role}</p>}
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection>
            <div className="text-center py-12 mb-16">
              <MessageSquare className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No feedback yet. Be the first to share!</p>
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection delay={0.2}>
          <motion.div className="max-w-xl mx-auto glass-card-premium rounded-3xl p-8 relative overflow-hidden" whileHover={{ y: -2 }}>
            <motion.div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.08), transparent 70%)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <h3 className="font-display text-xl font-bold text-center mb-1 relative">Leave Your Feedback</h3>
            <p className="text-xs text-muted-foreground text-center mb-6 relative">Share your experience with CareerCompass AI</p>
            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Your Name *" value={name} onChange={(e) => setName(e.target.value)} className="premium-input" required />
                <input type="text" placeholder="Your Role (optional)" value={role} onChange={(e) => setRole(e.target.value)} className="premium-input" />
              </div>
              <textarea placeholder="Share your experience... *" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="premium-input resize-none" required />
              <div className="flex items-center gap-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="p-1"
                  >
                    <Star className={`h-6 w-6 transition-colors duration-200 ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  </motion.button>
                ))}
              </div>
              <MagneticButton strength={0.1}>
                <motion.button
                  type="submit" disabled={submitting || !user} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-primary-foreground shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.2) 45%, hsla(0,0%,100%,0.05) 50%, transparent 55%)" }}
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                  <Send className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{submitting ? "Submitting..." : "Submit Feedback"}</span>
                </motion.button>
              </MagneticButton>
              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to leave feedback
                </p>
              )}
            </form>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function TrustBadge({ icon: Icon, label, delay }: { icon: any; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground"
    >
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
    </motion.div>
  );
}

export default function HomePage() {
  const { data: platformStats } = usePlatformStats();
  const heroRef = useRef<HTMLDivElement>(null);

  const stats = [
    { value: `${platformStats?.resumes_analyzed ?? 0}`, label: "Resumes Analyzed", icon: FileText },
    { value: `${platformStats?.ats_scans ?? 0}`, label: "ATS Scans", icon: Search },
    { value: `${platformStats?.interview_sessions ?? 0}`, label: "Interviews", icon: Brain },
    { value: `${platformStats?.total_users ?? 0}`, label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden gradient-bg">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated mesh gradient orbs */}
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.2), transparent 70%)", left: "-5%", top: "-20%" }}
            animate={{ y: [0, 60, 0], x: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.15), transparent 70%)", right: "-10%", bottom: "-10%" }}
            animate={{ y: [0, -40, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-2xl"
            style={{ background: "radial-gradient(circle, hsla(180, 60%, 50%, 0.08), transparent 70%)", left: "50%", top: "40%" }}
            animate={{ y: [0, 30, 0], x: [0, -25, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 4,
                height: 2 + Math.random() * 4,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsla(${258 + Math.random() * 60}, 80%, 70%, ${0.3 + Math.random() * 0.4})`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-10, 10, -10],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/25 backdrop-blur-xl text-primary-foreground/90 text-xs sm:text-sm font-medium mb-8 shadow-[0_0_40px_-4px_hsla(258,90%,62%,0.35)]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_3px_hsla(145,80%,55%,0.5)]" />
              </span>
              <span className="tracking-wide">Powered by Gemini AI</span>
              <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
            </motion.div>

            {/* Heading */}
            <TextReveal>
              <motion.h1
                className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-primary-foreground mb-6 leading-[1.05] tracking-tight"
              >
                Your AI-Powered
                <br />
                <TypingText
                  words={["Career Engine", "Resume Analyzer", "Interview Coach", "Skill Navigator"]}
                  className="bg-gradient-to-r from-purple-400 via-violet-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_hsla(258,90%,62%,0.3)]"
                  interval={2500}
                />
              </motion.h1>
            </TextReveal>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-primary-foreground/55 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed px-4"
            >
              Analyze resumes, predict career paths, and ace interviews — all powered by cutting-edge AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0"
            >
              <MagneticButton strength={0.15}>
                <Link
                  to="/resume-analyzer"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-primary-foreground font-semibold shadow-[0_8px_40px_-8px_hsla(258,90%,62%,0.5)] hover:shadow-[0_20px_60px_-8px_hsla(258,90%,62%,0.65)] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden text-sm sm:text-base"
                >
                  {/* Button flash effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.2) 45%, hsla(0,0%,100%,0.05) 50%, transparent 55%)" }}
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />
                  <Sparkles className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Analyze My Resume</span>
                  <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <a
                  href="#features"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-primary-foreground/15 text-primary-foreground/80 font-semibold backdrop-blur-sm hover:bg-primary-foreground/8 hover:border-primary-foreground/30 hover:-translate-y-1 transition-all duration-300 text-sm sm:text-base"
                >
                  Explore Features
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </MagneticButton>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  whileHover={{ scale: 1.08, borderColor: "hsla(258, 90%, 62%, 0.4)" }}
                  className="group text-center px-4 py-3.5 rounded-2xl bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 transition-all duration-300 hover:bg-primary-foreground/8"
                >
                  <stat.icon className="h-4 w-4 mx-auto mb-1.5 text-primary-foreground/40 group-hover:text-primary-foreground/70 transition-colors" />
                  <div className="font-display font-bold text-xl sm:text-2xl text-primary-foreground">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-primary-foreground/45 text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Hero bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Marquee */}
      <MarqueeBar />

      {/* Trust badges */}
      <section className="py-8 bg-background">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-3">
          <TrustBadge icon={Shield} label="Enterprise Security" delay={0.1} />
          <TrustBadge icon={Clock} label="Real-time Analysis" delay={0.2} />
          <TrustBadge icon={Award} label="99.9% Uptime" delay={0.3} />
          <TrustBadge icon={Users} label="10K+ Users" delay={0.4} />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-padding bg-background relative overflow-hidden">
        {/* Background aurora */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.08), transparent)", left: "-10%", top: "20%" }}
            animate={{ y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
            style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.06), transparent)", right: "-5%", bottom: "10%" }}
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <AnimatedSection>
              <motion.span
                className="floating-badge mb-4 inline-flex"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Features
              </motion.span>
            </AnimatedSection>
            <TextReveal>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-5">
                Everything You Need to <br />
                <span className="gradient-text">Land Your Dream Job</span>
              </h2>
            </TextReveal>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">
                Six powerful AI tools designed to accelerate your career journey.
              </p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FlashCard key={f.title} f={f} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.08), transparent)" }} />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.08), transparent)" }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <AnimatedSection className="text-center mb-16">
            <span className="floating-badge mb-4 inline-flex">
              <Zap className="h-3.5 w-3.5" /> Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to transform your career trajectory</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.12}>
                <Link to={s.link} className="relative text-center group block">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px">
                      <motion.div
                        className="h-full w-full"
                        style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.3), transparent)" }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                      />
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card-premium mb-5 group-hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] transition-shadow duration-500"
                  >
                    <s.icon className="h-8 w-8 text-primary" />
                    <motion.span
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-btn text-xs font-bold flex items-center justify-center shadow-lg"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {s.num}
                    </motion.span>
                  </motion.div>
                  <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  <motion.span
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    Start <ArrowRight className="h-3 w-3 inline" />
                  </motion.span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* User Feedback */}
      <FeedbackSection />

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden gradient-bg p-10 sm:p-14 lg:p-20 text-center border-glow-card"
            >
              {/* Animated floating orbs */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 3 + Math.random() * 6,
                    height: 3 + Math.random() * 6,
                    left: `${5 + i * 8}%`,
                    top: `${10 + (i % 4) * 20}%`,
                    background: `hsla(${258 + i * 12}, 80%, 65%, ${0.15 + Math.random() * 0.25})`,
                  }}
                  animate={{
                    y: [-25, 25, -25],
                    x: [-8, 8, -8],
                    opacity: [0.2, 0.7, 0.2],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-primary-foreground/10"
                >
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </motion.div>
                <TextReveal>
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-primary-foreground mb-4">
                    Ready to Transform <br />Your Career?
                  </h2>
                </TextReveal>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-primary-foreground/55 max-w-lg mx-auto mb-8 text-lg"
                >
                  Join thousands of professionals using AI to land their dream jobs.
                </motion.p>
                <MagneticButton strength={0.15}>
                  <Link
                    to="/resume-analyzer"
                    className="group relative inline-flex items-center gap-2.5 px-10 py-4.5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-semibold backdrop-blur-sm hover:bg-primary-foreground/18 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.15) 45%, hsla(0,0%,100%,0.05) 50%, transparent 55%)" }}
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                    />
                    <span className="relative z-10">Get Started Free</span>
                    <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14 border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 100%, hsla(258, 90%, 62%, 0.1), transparent)"
        }} />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.h3
              className="font-display text-xl font-bold gradient-text"
              initial={{ letterSpacing: "0.3em", opacity: 0 }}
              whileInView={{ letterSpacing: "0.05em", opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              Made by Aditya W
            </motion.h3>
            <motion.div
              className="h-0.5 w-24 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), transparent)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.p
              className="text-xs text-muted-foreground/40 mt-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              © 2026 CareerCompass AI. All rights reserved.
            </motion.p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
