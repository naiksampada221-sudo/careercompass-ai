import { useState } from "react";
import { Search, Loader2, Upload, FileText, CheckCircle, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import ScoreCircle from "@/components/ScoreCircle";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export default function ATSScannerPage() {
  const [jobDesc, setJobDesc] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [step, setStep] = useState<"upload" | "jobdesc">("upload");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      setResumeText(e.target?.result as string);
      setStep("jobdesc");
    };
    reader.readAsText(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0] || null);
  };

  const handleScan = async () => {
    if (!jobDesc.trim() || !resumeText.trim()) {
      toast({ title: "Missing input", description: "Please provide both resume and job description.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ats-scanner", {
        body: { resumeText: resumeText.trim(), jobDescription: jobDesc.trim() },
      });
      if (error) throw error;
      setResult(data.result);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to scan. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResumeText("");
    setJobDesc("");
    setResult(null);
    setStep("upload");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(142, 71%, 45%)";
    if (score >= 60) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  return (
    <div className="page-container">
      <div className="mb-6">
        <BackButton onClick={result ? handleReset : step === "jobdesc" ? () => setStep("upload") : undefined} />
      </div>
      <PageHeader icon={<Search className="h-7 w-7" />} title="ATS Resume Scanner" subtitle="Upload your resume, paste a job description, and get AI-powered ATS compatibility analysis." />

      {/* Step indicators */}
      {!result && !loading && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === "upload" ? "gradient-btn" : "bg-accent text-accent-foreground"}`}>
              <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">1</span>
              Upload Resume
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === "jobdesc" ? "gradient-btn" : "bg-muted text-muted-foreground"}`}>
              <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">2</span>
              Job Description
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload Resume */}
      {step === "upload" && !result && !loading && (
        <AnimatedSection className="max-w-2xl mx-auto space-y-5">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative glass-card rounded-3xl p-16 text-center cursor-pointer card-hover border-2 border-dashed border-border hover:border-primary/40 transition-all group"
          >
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="font-display font-semibold text-xl mb-2">Drag & Drop your Resume</h3>
            <p className="text-muted-foreground text-sm mb-4">or click to browse files</p>
            <span className="inline-block px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">TXT, PDF, DOC supported</span>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-3">or paste your resume text directly</p>
            <button
              onClick={() => setStep("jobdesc")}
              className="text-sm font-medium text-primary hover:underline"
            >
              Skip to paste text →
            </button>
          </div>
        </AnimatedSection>
      )}

      {/* Step 2: Job Description */}
      {step === "jobdesc" && !result && !loading && (
        <AnimatedSection className="max-w-2xl mx-auto space-y-5">
          {file && (
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">Resume uploaded successfully</p>
              </div>
              <CheckCircle className="h-5 w-5" style={{ color: "hsl(142, 71%, 45%)" }} />
            </div>
          )}

          {!file && (
            <div className="glass-card rounded-2xl p-6">
              <label className="block font-semibold mb-2 text-sm">Paste Your Resume Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-muted p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Paste your resume content here..."
              />
            </div>
          )}

          <div className="glass-card rounded-2xl p-6">
            <label className="block font-semibold mb-2 text-sm">Paste Job Description</label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-muted p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Paste the full job description here to compare against your resume..."
            />
          </div>

          <button
            onClick={handleScan}
            disabled={!jobDesc.trim() || !resumeText.trim()}
            className="w-full gradient-btn py-4 rounded-2xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" /> Scan for ATS Compatibility
          </button>
        </AnimatedSection>
      )}

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Search className="absolute inset-0 m-auto h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-xl mb-2">Scanning with AI...</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Comparing your resume against the job description for keyword matches and ATS optimization
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6 mt-4">
            {/* Score Card */}
            <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${getScoreColor(result.score)}, transparent)` }} />
              <div className="flex flex-col sm:flex-row items-center gap-8 relative">
                <ScoreCircle score={result.score} size={170} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display font-bold text-2xl mb-2">ATS Compatibility Score</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {result.score >= 80
                      ? "Excellent! Your resume is highly optimized for this position."
                      : result.score >= 60
                      ? "Good match, but there are opportunities to improve keyword alignment."
                      : "Your resume needs significant optimization for this job posting."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      result.score >= 80 ? "bg-green-500/10 text-green-600" : result.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                    }`}>
                      {result.score >= 80 ? "✓ ATS Optimized" : result.score >= 60 ? "⚠ Partially Optimized" : "✗ Needs Optimization"}
                    </span>
                    {file && (
                      <span className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {file.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Keywords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsla(142, 71%, 45%, 0.1), hsla(142, 71%, 45%, 0.05))" }}>
                  <CheckCircle className="h-5 w-5" style={{ color: "hsl(142, 71%, 45%)" }} />
                  <h3 className="font-display font-semibold" style={{ color: "hsl(142, 71%, 45%)" }}>Matched Keywords ({result.matchedKeywords.length})</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((k) => (
                      <span key={k} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-2" style={{ background: "linear-gradient(135deg, hsla(25, 95%, 53%, 0.1), hsla(25, 95%, 53%, 0.05))" }}>
                  <AlertTriangle className="h-5 w-5" style={{ color: "hsl(25, 95%, 53%)" }} />
                  <h3 className="font-display font-semibold" style={{ color: "hsl(25, 95%, 53%)" }}>Missing Keywords ({result.missingKeywords.length})</h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((k) => (
                      <span key={k} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.15), transparent)" }} />
              <h3 className="font-display font-semibold text-lg mb-5 flex items-center gap-2 relative">
                <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><Lightbulb className="h-4 w-4" /></span>
                Optimization Suggestions
              </h3>
              <div className="space-y-3 relative">
                {result.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-accent/30 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-sm leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleReset} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-muted text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" /> Scan Another Resume
              </button>
              <a href="/resume-analyzer" className="flex-1 py-3 rounded-2xl font-semibold text-sm gradient-btn text-center flex items-center justify-center gap-2">
                Analyze Resume →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
