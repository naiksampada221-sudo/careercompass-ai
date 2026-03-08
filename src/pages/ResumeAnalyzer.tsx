import { useState, useEffect, useRef } from "react";
import { FileText, Upload, CheckCircle, AlertCircle, Lightbulb, BookOpen, Award, Briefcase, FolderOpen, Loader2, Shield, Eye, Sparkles, ScanLine, ChevronRight, ArrowRight, RotateCcw, Zap, Target, TrendingUp } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import ScoreCircle from "@/components/ScoreCircle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";
import { sendNotification } from "@/lib/sendNotification";

interface ResumeResult {
  score: number;
  skills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

const scanSteps = [
  { label: "Initializing AI scanner...", icon: Zap },
  { label: "Extracting text content...", icon: FileText },
  { label: "Analyzing skills & keywords...", icon: Target },
  { label: "Evaluating experience...", icon: Briefcase },
  { label: "Checking ATS compatibility...", icon: Shield },
  { label: "Scoring resume quality...", icon: TrendingUp },
  { label: "Generating insights...", icon: Sparkles },
];

function ScanningAnimation({ fileName }: { fileName?: string }) {
  const [step, setStep] = useState(0);
  const [scanY, setScanY] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanY((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    return () => clearInterval(scanInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          {/* Resume preview mockup with scanning line */}
          <div className="w-48 sm:w-56 shrink-0">
            <div className="relative bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden aspect-[3/4]">
              {/* Mock resume lines */}
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted-foreground/15 mx-auto" />
                <div className="h-2 w-1/2 rounded bg-muted-foreground/10 mx-auto mt-1" />
                <div className="mt-4 space-y-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`s-${i}`} className="h-2 rounded bg-primary/20" style={{ width: `${70 + Math.random() * 30}%` }} />
                  ))}
                </div>
                <div className="mt-3 h-3 w-2/3 rounded bg-muted-foreground/12" />
                <div className="mt-1 space-y-1.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`e-${i}`} className="h-2 rounded bg-muted-foreground/10" style={{ width: `${60 + Math.random() * 40}%` }} />
                  ))}
                </div>
                <div className="mt-3 h-3 w-1/2 rounded bg-muted-foreground/12" />
                <div className="mt-1 space-y-1.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`p-${i}`} className="h-2 rounded bg-muted-foreground/10" style={{ width: `${50 + Math.random() * 50}%` }} />
                  ))}
                </div>
              </div>

              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-0.5"
                style={{ top: `${scanY}%` }}
              >
                <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="h-8 -mt-4 bg-gradient-to-b from-primary/20 to-transparent" />
              </motion.div>

              {/* Corner scan markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-sm" />
            </div>
            {fileName && (
              <p className="text-xs text-muted-foreground text-center mt-3 truncate">{fileName}</p>
            )}
          </div>

          {/* Steps progress */}
          <div className="flex-1 w-full">
            <h3 className="font-display font-bold text-xl mb-1">Analyzing your resume</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Pinpointing the exact changes needed to get you more interviews.
            </p>

            <div className="space-y-3">
              {scanSteps.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isDone = i < step;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : isDone
                        ? "opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? "gradient-btn"
                        : isDone
                        ? "bg-primary/20"
                        : "bg-muted"
                    }`}>
                      {isDone ? (
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-foreground" : ""}`}>
                      {s.label}
                    </span>
                    {isDone && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                      >
                        Done
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / scanSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [useText, setUseText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = async (text: string, fileBase64?: string, fileName?: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const body: Record<string, string> = {};
      if (fileBase64 && fileName) {
        body.fileBase64 = fileBase64;
        body.fileName = fileName;
      } else {
        body.resumeText = text;
      }

      const { data, error } = await supabase.functions.invoke("resume-analyzer", { body });
      if (error) throw error;
      setResult(data.result);
      if (user) {
        saveActivity({
          userId: user.id,
          activityType: "resume_analysis",
          title: "Resume Analysis",
          summary: `Score: ${data.result.score}/100 • ${data.result.skills?.length || 0} skills detected`,
          score: data.result.score,
          resultData: data.result,
        });
        sendNotification(
          user.id,
          "Resume Analysis Complete",
          `Your resume scored ${data.result.score}/100 with ${data.result.skills?.length || 0} skills detected.`,
          "analysis",
          "/resume-analyzer"
        );
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to analyze resume.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    const isBinary = /\.(pdf|doc|docx)$/i.test(f.name);

    if (isBinary) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        handleAnalyze("", base64, f.name);
      };
      reader.readAsDataURL(f);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleAnalyze(text);
      };
      reader.readAsText(f);
    }
  };

  const handleTextSubmit = () => {
    if (!resumeText.trim()) return;
    handleAnalyze(resumeText.trim());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setAnalyzing(false);
    setResumeText("");
  };

  return (
    <div className="page-container">
      {/* Upload/paste state - Jobswagon-inspired hero */}
      <AnimatePresence mode="wait">
        {!file && !analyzing && !result && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto pt-8 sm:pt-16"
          >
            {/* Hero headline */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6"
              >
                <ScanLine className="h-3.5 w-3.5" />
                AI-Powered Resume Scanner
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight"
              >
                <span className="gradient-text">75% of resumes</span> are
                <br />rejected by robots.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto"
              >
                Our AI, trained on thousands of successful resumes from top companies, will analyse yours and give actionable feedback in seconds.
              </motion.p>
            </div>

            {/* Upload card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass-card rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full opacity-30" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent)" }} />

              <div className="relative z-10">
                <div className="flex gap-2 justify-center mb-6">
                  <button
                    onClick={() => setUseText(false)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${!useText ? "gradient-btn shadow-lg" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />Upload File
                  </button>
                  <button
                    onClick={() => setUseText(true)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${useText ? "gradient-btn shadow-lg" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />Paste Text
                  </button>
                </div>

                {!useText ? (
                  <motion.div
                    layout
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      const input = document.getElementById("resume-file-input") as HTMLInputElement;
                      input?.click();
                    }}
                    className={`relative rounded-2xl p-12 sm:p-16 text-center cursor-pointer border-2 border-dashed transition-all group ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border/60 hover:border-primary/40 hover:bg-accent/30"
                    }`}
                  >
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                      onChange={(e) => { handleFile(e.target.files?.[0] || null); e.target.value = ""; }}
                    />
                    <motion.div
                      animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                      className="w-20 h-20 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-shadow"
                    >
                      <Upload className="h-9 w-9" />
                    </motion.div>
                    <h3 className="font-display font-bold text-xl mb-2">
                      {isDragging ? "Drop it here!" : "Upload Resume"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-5">Drag & drop or click to browse</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {["PDF", "DOC", "DOCX", "TXT"].map((fmt) => (
                        <span key={fmt} className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-medium">{fmt}</span>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div layout>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={8}
                      className="w-full rounded-xl bg-muted p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                      placeholder="Paste your full resume content here..."
                    />
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleTextSubmit}
                      disabled={!resumeText.trim()}
                      className="w-full gradient-btn py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" /> Get My Free Analysis
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 sm:gap-6 mt-6 text-muted-foreground flex-wrap"
            >
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Eye className="h-3.5 w-3.5 text-green-500" />
                <span>100% Data Privacy</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span>Under 30 seconds</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Analyzing - scanning animation */}
        {analyzing && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-8 sm:pt-12"
          >
            <ScanningAnimation fileName={file?.name} />
          </motion.div>
        )}

        {/* Results */}
        {result && !analyzing && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mt-4 max-w-4xl mx-auto"
          >
            {/* Report header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                <CheckCircle className="h-3.5 w-3.5" /> Analysis Complete
              </div>
              <h2 className="font-display font-bold text-2xl">Your Free Resume Review Report</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {result.score >= 70
                  ? "Your resume is competitive! Here's how to make it even stronger."
                  : "You are getting fewer interviews than others in your field. Let's fix that."}
              </p>
            </motion.div>

            {/* Score card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${result.score >= 70 ? "hsl(142, 71%, 45%)" : "hsl(25, 95%, 53%)"}, transparent)` }} />
              <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                <ScoreCircle score={result.score} size={160} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display font-bold text-2xl mb-1">Resume Score</h3>
                  <p className="text-muted-foreground text-sm mb-4">Based on content quality, keyword density, ATS compatibility, and structure analysis</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${result.score >= 80 ? "bg-green-500/10 text-green-600" : result.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                      {result.score >= 80 ? "🏆 Excellent" : result.score >= 60 ? "⚡ Needs Improvement" : "🔧 Needs Work"}
                    </span>
                    <span className="px-4 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                      {result.skills.length} Skills Found
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><Target className="h-4 w-4" /></span>
                Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.03 }}
                    className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium border border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-colors cursor-default"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Education", icon: BookOpen, items: result.education, color: "from-blue-500 to-cyan-500" },
                { title: "Experience", icon: Briefcase, items: result.experience, color: "from-violet-500 to-purple-500" },
                { title: "Projects", icon: FolderOpen, items: result.projects, color: "from-amber-500 to-orange-500" },
              ].map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <div className={`bg-gradient-to-r ${section.color} px-5 py-3.5 flex items-center gap-2`}>
                    <section.icon className="h-4 w-4 text-primary-foreground" />
                    <h3 className="font-display font-semibold text-sm text-primary-foreground">{section.title}</h3>
                    <span className="ml-auto text-xs text-primary-foreground/70">{section.items.length} found</span>
                  </div>
                  <div className="p-5 space-y-2.5">
                    {section.items.length > 0 ? section.items.map((item) => (
                      <p key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        {item}
                      </p>
                    )) : <p className="text-sm text-muted-foreground italic">Not detected</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Certifications */}
            {result.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.certifications.map((c) => (
                    <span key={c} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium flex items-center gap-2 border border-border/50">
                      <Award className="h-3.5 w-3.5 text-primary" /> {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card rounded-2xl p-6 border-l-4 border-l-green-500"
              >
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" /> Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs bg-green-500/10 text-green-500">✓</span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500"
              >
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" /> Weaknesses
                </h3>
                <ul className="space-y-3">
                  {result.weaknesses.map((w, i) => (
                    <motion.li
                      key={w}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs bg-amber-500/10 text-amber-500">!</span>
                      {w}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><Lightbulb className="h-4 w-4" /></span>
                How to Improve Your Score
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-accent/50 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-sm leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-3 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-muted text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Analyze Another
              </motion.button>
              <Link
                to="/ats-scanner"
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm gradient-btn text-center flex items-center justify-center gap-2 shadow-lg"
              >
                Run ATS Scan <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
