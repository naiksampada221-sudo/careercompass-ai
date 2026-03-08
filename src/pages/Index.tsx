import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Search, Brain, TrendingUp, Compass, ArrowRight, Sparkles, Upload, Target, GraduationCap, Mic } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const features = [
  { icon: FileText, title: "Resume Analyzer", desc: "AI-powered resume scoring with actionable improvement tips.", link: "/resume-analyzer", color: "from-violet-500 to-purple-600" },
  { icon: Search, title: "ATS Scanner", desc: "Optimize your resume for Applicant Tracking Systems.", link: "/ats-scanner", color: "from-blue-500 to-cyan-500" },
  { icon: Brain, title: "AI Interview Coach", desc: "Practice with skill-based questions at every difficulty level.", link: "/interview-coach", color: "from-pink-500 to-rose-500" },
  { icon: TrendingUp, title: "Career Prediction", desc: "Discover best-fit roles with AI probability analysis.", link: "/career-prediction", color: "from-amber-500 to-orange-500" },
  { icon: Compass, title: "Skill Explorer", desc: "Enter any skill and get a complete learning roadmap.", link: "/skill-explorer", color: "from-emerald-500 to-teal-500" },
  { icon: Mic, title: "Voice Mock Interview", desc: "Simulate real interviews with voice recording and AI feedback.", link: "/voice-interview", color: "from-sky-500 to-blue-600" },
];

const steps = [
  { icon: Upload, num: "01", title: "Upload Resume", desc: "Drop your PDF resume and let AI do the rest" },
  { icon: Sparkles, num: "02", title: "AI Analysis", desc: "Advanced NLP extracts skills, experience & insights" },
  { icon: Target, num: "03", title: "Career Insights", desc: "Get personalized career paths and role predictions" },
  { icon: GraduationCap, num: "04", title: "Interview Prep", desc: "Practice with tailored questions and mock interviews" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.15), transparent)", left: "10%", top: "-10%" }}
            animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.12), transparent)", right: "5%", bottom: "0%" }}
            animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/20 backdrop-blur-md text-primary-foreground/90 text-sm font-medium mb-8 shadow-[0_0_20px_-4px_hsla(258,90%,62%,0.3)]"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_2px_hsla(145,80%,55%,0.5)]" />
              </span>
              <span className="tracking-wide">Powered by Google Gemini AI</span>
              <Sparkles className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-[1.05] tracking-tight">
              Welcome to
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                CareerCompass AI
              </span>
            </h1>

            <p className="text-primary-foreground/60 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Analyze your resume, discover career paths, and prepare for interviews with AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/resume-analyzer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-primary-foreground font-semibold shadow-[0_8px_30px_-6px_hsla(258,90%,62%,0.5)] hover:shadow-[0_12px_40px_-6px_hsla(258,90%,62%,0.6)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Analyze Resume <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-primary-foreground/15 text-primary-foreground/80 font-semibold backdrop-blur-sm hover:bg-primary-foreground/5 transition-all duration-300"
              >
                Explore Features
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="section-padding bg-background">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Everything You Need to <span className="gradient-text">Land Your Dream Job</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Six powerful AI tools designed to accelerate your career journey.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.08}>
                <Link to={f.link} className="group block glass-card rounded-2xl p-6 card-hover relative overflow-hidden">
                  <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Try Now <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">Process</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              How It <span className="gradient-text">Works</span>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <AnimatedSection key={s.title} delay={i * 0.12}>
                <div className="relative text-center group">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card mb-5 group-hover:shadow-[var(--shadow-elevated)] transition-shadow">
                    <s.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full gradient-btn text-xs font-bold flex items-center justify-center shadow-lg">{s.num}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden gradient-bg p-10 sm:p-14 text-center">
              <div className="relative">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-primary-foreground/60 max-w-lg mx-auto mb-8">
                  Start analyzing your resume and get AI-powered career insights today.
                </p>
                <Link
                  to="/resume-analyzer"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground font-semibold backdrop-blur-sm hover:bg-primary-foreground/15 transition-all"
                >
                  Get Started Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.p
              className="text-sm text-muted-foreground tracking-wide"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Crafted with passion
            </motion.p>
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
              className="h-0.5 w-16 rounded-full"
              style={{ background: "var(--gradient-primary)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
