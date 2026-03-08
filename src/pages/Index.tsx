import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { FileText, Search, Brain, TrendingUp, Compass, ArrowRight, Sparkles, Upload, Target, GraduationCap, Mic, Star, Shield, Zap, ChevronRight, Heart, Globe, Users, Activity } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import TextReveal from "@/components/TextReveal";
import TypingText from "@/components/TypingText";
import AnimatedCounter from "@/components/AnimatedCounter";
import MagneticButton from "@/components/MagneticButton";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useRef } from "react";

const features = [
  { icon: FileText, title: "Resume Analyzer", desc: "AI-powered resume scoring with actionable improvement tips.", link: "/resume-analyzer", color: "from-violet-500 to-purple-600", emoji: "📄" },
  { icon: Search, title: "ATS Scanner", desc: "Optimize your resume for Applicant Tracking Systems.", link: "/ats-scanner", color: "from-blue-500 to-cyan-500", emoji: "🔍" },
  { icon: Brain, title: "AI Interview Coach", desc: "Practice with skill-based questions at every difficulty level.", link: "/interview-coach", color: "from-pink-500 to-rose-500", emoji: "🧠" },
  { icon: TrendingUp, title: "Career Prediction", desc: "Discover best-fit roles with AI probability analysis.", link: "/career-prediction", color: "from-amber-500 to-orange-500", emoji: "📈" },
  { icon: Compass, title: "Skill Explorer", desc: "Enter any skill and get a complete learning roadmap.", link: "/skill-explorer", color: "from-emerald-500 to-teal-500", emoji: "🧭" },
  { icon: Mic, title: "Voice Mock Interview", desc: "Simulate real interviews with voice recording and AI feedback.", link: "/voice-interview", color: "from-sky-500 to-blue-600", emoji: "🎙️" },
];

const steps = [
  { icon: Upload, num: "01", title: "Upload Resume", desc: "Drop your PDF resume and let AI do the rest", link: "/resume-analyzer" },
  { icon: Sparkles, num: "02", title: "ATS Scan", desc: "Check your resume against job descriptions for ATS compatibility", link: "/ats-scanner" },
  { icon: Target, num: "03", title: "Career Insights", desc: "Explore career paths, skill roadmaps & predictions", link: "/career-roadmap" },
  { icon: GraduationCap, num: "04", title: "Interview Prep", desc: "Practice with AI-powered mock interviews", link: "/interview-coach" },
];

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <AnimatedSection key={f.title} delay={i * 0.08}>
      <Link to={f.link}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          whileHover={{ y: -6 }}
          className="group glass-card-premium rounded-2xl p-6 cursor-pointer h-full"
        >
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(300px circle at ${mouseX.get()}px ${mouseY.get()}px, hsla(258, 90%, 62%, 0.08), transparent 40%)`
            }}
          />
          <div className="relative z-10">
            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
              <f.icon className="h-5 w-5 text-primary-foreground" />
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                style={{ background: `linear-gradient(135deg, transparent, hsla(0, 0%, 100%, 0.2))` }}
              />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            <motion.div
              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">Try Now</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </AnimatedSection>
  );
}

export default function HomePage() {
  const { data: platformStats } = usePlatformStats();

  const stats = [
    { value: `${platformStats?.resumes_analyzed ?? 0}`, label: "Resumes Analyzed", icon: FileText },
    { value: `${platformStats?.ats_scans ?? 0}`, label: "ATS Scans", icon: Search },
    { value: `${platformStats?.interview_sessions ?? 0}`, label: "Interviews", icon: Brain },
    { value: `${platformStats?.total_users ?? 0}`, label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated orbs */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.15), transparent)", left: "5%", top: "-15%" }}
            animate={{ y: [0, 40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.12), transparent)", right: "0%", bottom: "-5%" }}
            animate={{ y: [0, -30, 0], x: [0, -15, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(258, 80%, 70%, 0.1), transparent)", left: "40%", top: "30%" }}
            animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(hsla(0,0%,100%,0.1) 1px, transparent 1px), linear-gradient(90deg, hsla(0,0%,100%,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-36">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/20 backdrop-blur-md text-primary-foreground/90 text-sm font-medium mb-8 shadow-[0_0_30px_-4px_hsla(258,90%,62%,0.3)]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_2px_hsla(145,80%,55%,0.5)]" />
              </span>
              <span className="tracking-wide">Powered by Google Gemini AI</span>
              <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
            </motion.div>

            <TextReveal>
              <motion.h1
                className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.05] tracking-tight"
              >
                Your AI-Powered
                <br />
                <TypingText
                  words={["Career Engine", "Resume Analyzer", "Interview Coach", "Skill Navigator"]}
                  className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent"
                  interval={2500}
                />
              </motion.h1>
            </TextReveal>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-primary-foreground/60 text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed"
            >
              Analyze resumes, predict career paths, and ace interviews — all powered by cutting-edge AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MagneticButton strength={0.2}>
                <Link
                  to="/resume-analyzer"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-primary-foreground font-semibold shadow-[0_8px_30px_-6px_hsla(258,90%,62%,0.5)] hover:shadow-[0_16px_50px_-6px_hsla(258,90%,62%,0.6)] hover:-translate-y-1 transition-all duration-300 shimmer"
                >
                  <Sparkles className="h-4 w-4" /> Analyze My Resume <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-primary-foreground/15 text-primary-foreground/80 font-semibold backdrop-blur-sm hover:bg-primary-foreground/5 hover:border-primary-foreground/25 transition-all duration-300"
                >
                  Explore Features
                </a>
              </MagneticButton>
            </motion.div>

            {/* Stats bar with animated counters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  whileHover={{ scale: 1.05, borderColor: "hsla(258, 90%, 62%, 0.3)" }}
                  className="text-center px-4 py-3 rounded-xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 transition-colors"
                >
                  <div className="font-display font-bold text-xl text-primary-foreground">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-primary-foreground/50 text-xs mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="section-padding bg-background aurora-bg">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <AnimatedSection>
              <span className="floating-badge mb-4 inline-flex">
                <Sparkles className="h-3.5 w-3.5" /> Features
              </span>
            </AnimatedSection>
            <TextReveal>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Everything You Need to <br /><span className="gradient-text">Land Your Dream Job</span>
              </h2>
            </TextReveal>
            <AnimatedSection delay={0.2}>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">Six powerful AI tools designed to accelerate your career journey.</p>
            </AnimatedSection>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} f={f} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.06), transparent)" }} />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.06), transparent)" }} />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <AnimatedSection className="text-center mb-14">
            <span className="floating-badge mb-4 inline-flex">
              <Zap className="h-3.5 w-3.5" /> Process
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to transform your career trajectory</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.12}>
                <Link to={s.link} className="relative text-center group block">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 0.4 }}
                    className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card-premium mb-5"
                  >
                    <s.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-btn text-xs font-bold flex items-center justify-center shadow-lg animate-subtle-bounce">{s.num}</span>
                  </motion.div>
                  <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  <motion.span
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
                    initial={{ opacity: 0 }}
                    whileHover={{ x: 3 }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Start <ArrowRight className="h-3 w-3 inline" />
                    </span>
                  </motion.span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden gradient-bg p-12 sm:p-16 text-center border-glow-card"
            >
              {/* Animated floating orbs */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    left: `${10 + i * 11}%`,
                    top: `${15 + (i % 3) * 25}%`,
                    background: `hsla(${258 + i * 15}, 80%, 65%, ${0.15 + Math.random() * 0.2})`,
                  }}
                  animate={{
                    y: [-20, 20, -20],
                    x: [-5, 5, -5],
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
              <div className="relative">
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
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                    Ready to Transform <br />Your Career?
                  </h2>
                </TextReveal>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-primary-foreground/60 max-w-lg mx-auto mb-8 text-lg"
                >
                  Join thousands of professionals using AI to land their dream jobs.
                </motion.p>
                <MagneticButton strength={0.2}>
                  <Link
                    to="/resume-analyzer"
                    className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-semibold backdrop-blur-sm hover:bg-primary-foreground/15 transition-all shimmer"
                  >
                    Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>




      {/* Footer */}
      <footer className="py-12 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 100%, hsla(258, 90%, 62%, 0.08), transparent)"
        }} />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div className="flex items-center gap-1 text-sm text-muted-foreground">
              Crafted with
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="h-4 w-4 text-destructive fill-destructive inline" />
              </motion.span>
              and AI
            </motion.div>
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
              className="h-0.5 w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), transparent)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
            <motion.p
              className="text-xs text-muted-foreground/50 mt-2"
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
