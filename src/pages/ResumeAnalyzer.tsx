import { useState } from "react";
import { FileText, Upload, CheckCircle, AlertCircle, Lightbulb, BookOpen, Award, Briefcase, FolderOpen, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import ScoreCircle from "@/components/ScoreCircle";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

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

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [useText, setUseText] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnalyze = async (text: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("resume-analyzer", {
        body: { resumeText: text },
      });
      if (error) throw error;
      setResult(data.result);
      // Save to history
      if (user) {
        saveActivity({
          userId: user.id,
          activityType: "resume_analysis",
          title: "Resume Analysis",
          summary: `Score: ${data.result.score}/100 • ${data.result.skills?.length || 0} skills detected`,
          score: data.result.score,
          resultData: data.result,
        });
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
    // Read file as text (for txt) or use placeholder for PDF
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleAnalyze(text);
    };
    reader.readAsText(f);
  };

  const handleTextSubmit = () => {
    if (!resumeText.trim()) return;
    handleAnalyze(resumeText.trim());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0] || null);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setAnalyzing(false);
    setResumeText("");
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <BackButton onClick={result ? handleReset : undefined} />
      </div>

      <PageHeader icon={<FileText className="h-7 w-7" />} title="Resume Analyzer" subtitle="Upload or paste your resume for AI-powered analysis and improvement suggestions." />

      {/* Upload/paste state */}
      {!file && !analyzing && !result && (
        <AnimatedSection className="max-w-2xl mx-auto space-y-4">
          <div className="flex gap-2 justify-center mb-4">
            <button onClick={() => setUseText(false)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!useText ? "gradient-btn" : "bg-muted text-muted-foreground"}`}>
              Upload File
            </button>
            <button onClick={() => setUseText(true)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${useText ? "gradient-btn" : "bg-muted text-muted-foreground"}`}>
              Paste Text
            </button>
          </div>

          {!useText ? (
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
          ) : (
            <div className="glass-card rounded-2xl p-6">
              <label className="block font-semibold text-sm mb-2">Paste Your Resume Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full rounded-xl bg-muted p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Paste your full resume content here..."
              />
              <button
                onClick={handleTextSubmit}
                disabled={!resumeText.trim()}
                className="mt-4 w-full gradient-btn py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lightbulb className="h-4 w-4" /> Analyze Resume
              </button>
            </div>
          )}
        </AnimatedSection>
      )}

      {/* Analyzing */}
      {analyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">Analyzing your resume...</h3>
          <p className="text-muted-foreground text-sm">AI is extracting skills, experience, and insights</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mt-4 max-w-4xl mx-auto">
            {/* Score */}
            <div className="glass-card rounded-3xl p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreCircle score={result.score} size={160} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display font-bold text-2xl mb-1">Resume Score</h3>
                  <p className="text-muted-foreground text-sm mb-4">Based on content quality, keyword density, and structure analysis</p>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${result.score >= 80 ? "bg-green-500/10 text-green-600" : result.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                    {result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good — Needs Improvement" : "Needs Work"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><Lightbulb className="h-4 w-4" /></span>
                Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills.map((s) => (
                  <span key={s} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium border border-border/50">{s}</span>
                ))}
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Education", icon: BookOpen, items: result.education, color: "from-blue-500 to-cyan-500" },
                { title: "Experience", icon: Briefcase, items: result.experience, color: "from-violet-500 to-purple-500" },
                { title: "Projects", icon: FolderOpen, items: result.projects, color: "from-amber-500 to-orange-500" },
              ].map((section) => (
                <div key={section.title} className="glass-card rounded-2xl overflow-hidden card-hover">
                  <div className={`bg-gradient-to-r ${section.color} px-5 py-3 flex items-center gap-2`}>
                    <section.icon className="h-4 w-4 text-primary-foreground" />
                    <h3 className="font-display font-semibold text-sm text-primary-foreground">{section.title}</h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {section.items.length > 0 ? section.items.map((item) => (
                      <p key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {item}
                      </p>
                    )) : <p className="text-sm text-muted-foreground">Not detected</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            {result.certifications.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.certifications.map((c) => (
                    <span key={c} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-card rounded-2xl p-6 border-l-4" style={{ borderLeftColor: "hsl(142 71% 45%)" }}>
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" style={{ color: "hsl(142 71% 45%)" }} /> Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s) => (
                    <li key={s} className="text-sm text-muted-foreground flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs" style={{ background: "hsla(142, 71%, 45%, 0.1)", color: "hsl(142 71% 45%)" }}>✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-6 border-l-4" style={{ borderLeftColor: "hsl(25 95% 53%)" }}>
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" style={{ color: "hsl(25 95% 53%)" }} /> Weaknesses
                </h3>
                <ul className="space-y-3">
                  {result.weaknesses.map((w) => (
                    <li key={w} className="text-sm text-muted-foreground flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs" style={{ background: "hsla(25, 95%, 53%, 0.1)", color: "hsl(25 95% 53%)" }}>!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center"><Lightbulb className="h-4 w-4" /></span>
                Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
                    <span className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <p className="text-sm leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleReset} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-muted text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" /> Analyze Another
              </button>
              <Link to="/ats-scanner" className="flex-1 py-3 rounded-2xl font-semibold text-sm gradient-btn text-center flex items-center justify-center gap-2">
                Run ATS Scan →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
