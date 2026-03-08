import { useState, useEffect, useRef } from "react";
import { Brain, Loader2, Play, ChevronRight, Clock, Target, Award, CheckCircle, AlertTriangle, Lightbulb, BarChart3, Send, RotateCcw, ArrowRight, Sparkles, Trophy, TrendingUp, MessageSquare, FileText, Zap, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import ScoreCircle from "@/components/ScoreCircle";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

type Phase = "setup" | "interview" | "evaluating" | "feedback" | "report";

interface Question {
  id: number;
  question: string;
  difficulty: string;
  category: string;
  timeLimit: number;
  tips: string;
}

interface Evaluation {
  score: number;
  rating: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  feedback: string;
  metrics: {
    relevance: number;
    clarity: number;
    depth: number;
    structure: number;
    confidence: number;
  };
}

interface QuestionResult {
  question: Question;
  answer: string;
  evaluation: Evaluation;
}

interface Report {
  overallScore: number;
  overallRating: string;
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  readinessLevel: string;
  nextSteps: string;
}

const interviewTypes = [
  { id: "technical", label: "Technical", icon: "💻", desc: "Data structures, algorithms, system design" },
  { id: "behavioral", label: "Behavioral", icon: "🧠", desc: "STAR method, leadership, teamwork" },
  { id: "mixed", label: "Full Interview", icon: "🎯", desc: "Complete mock interview experience" },
  { id: "system-design", label: "System Design", icon: "🏗️", desc: "Architecture, scalability, trade-offs" },
];

const popularRoles = [
  "Software Engineer", "Data Scientist", "Product Manager", "ML Engineer",
  "Frontend Developer", "Backend Developer", "DevOps Engineer", "UI/UX Designer",
  "Data Analyst", "Cloud Architect", "Full Stack Developer", "QA Engineer",
];

const popularCompanies = [
  "Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix",
  "Uber", "Airbnb", "Stripe", "Salesforce", "Adobe", "Any Company",
];

const difficultyLevels = [
  { id: "easy", label: "Easy", color: "from-emerald-500 to-green-500", desc: "Entry level" },
  { id: "medium", label: "Medium", color: "from-amber-500 to-orange-500", desc: "Mid level" },
  { id: "hard", label: "Hard", color: "from-red-500 to-pink-500", desc: "Senior level" },
  { id: "mixed", label: "Mixed", color: "from-violet-500 to-purple-500", desc: "All levels" },
];

const ratingColors: Record<string, string> = {
  "Excellent": "text-emerald-500",
  "Good": "text-green-500",
  "Average": "text-amber-500",
  "Needs Improvement": "text-orange-500",
  "Poor": "text-red-500",
};

const readinessColors: Record<string, string> = {
  "Ready": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Almost Ready": "bg-green-500/10 text-green-500 border-green-500/20",
  "Needs More Practice": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Not Ready": "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function InterviewCoachPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(5);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Timer
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [isTimerRunning, timeLeft]);

  const startInterview = async () => {
    if (!role || !interviewType) {
      toast({ title: "Missing info", description: "Please select a role and interview type.", variant: "destructive" });
      return;
    }
    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-coach", {
        body: { action: "generate_questions", role, company, interviewType, difficulty, count: questionCount },
      });
      if (error) throw error;
      setQuestions(data.questions);
      setCurrentIndex(0);
      setResults([]);
      setPhase("interview");
      setTimeLeft(data.questions[0]?.timeLimit || 120);
      setIsTimerRunning(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast({ title: "Empty answer", description: "Please type your answer before submitting.", variant: "destructive" });
      return;
    }
    setIsTimerRunning(false);
    setEvaluating(true);
    setPhase("evaluating");

    try {
      const q = questions[currentIndex];
      const { data, error } = await supabase.functions.invoke("interview-coach", {
        body: { action: "evaluate_answer", question: q.question, answer: answer.trim(), role, company, interviewType },
      });
      if (error) throw error;

      const result: QuestionResult = { question: q, answer: answer.trim(), evaluation: data.evaluation };
      setResults((prev) => [...prev, result]);
      setCurrentEvaluation(data.evaluation);
      setPhase("feedback");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setPhase("interview");
      setIsTimerRunning(true);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      generateReport();
      return;
    }
    setCurrentIndex(next);
    setAnswer("");
    setCurrentEvaluation(null);
    setShowModelAnswer(false);
    setTimeLeft(questions[next]?.timeLimit || 120);
    setIsTimerRunning(true);
    setPhase("interview");
    textareaRef.current?.focus();
  };

  const generateReport = async () => {
    setPhase("evaluating");
    try {
      const { data, error } = await supabase.functions.invoke("interview-coach", {
        body: {
          action: "generate_report",
          role, company, interviewType,
          results: results.map((r) => ({ question: r.question.question, score: r.evaluation.score, rating: r.evaluation.rating })),
        },
      });
      if (error) throw error;
      setReport(data.report);
      setPhase("report");

      if (user) {
        saveActivity({
          userId: user.id,
          activityType: "interview_practice",
          title: `Mock Interview: ${role}${company && company !== "Any Company" ? ` at ${company}` : ""}`,
          summary: `Score: ${data.report.overallScore}/100 • ${results.length} questions • ${data.report.readinessLevel}`,
          score: data.report.overallScore,
          resultData: { report: data.report, results: results.map((r) => ({ q: r.question.question, score: r.evaluation.score })) },
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const endInterviewEarly = () => {
    setIsTimerRunning(false);
    if (results.length > 0) {
      generateReport();
    } else {
      toast({ title: "No answers yet", description: "Answer at least one question before ending.", variant: "destructive" });
    }
  };

  const resetAll = () => {
    setPhase("setup");
    setQuestions([]);
    setResults([]);
    setReport(null);
    setCurrentIndex(0);
    setAnswer("");
    setCurrentEvaluation(null);
    setShowModelAnswer(false);
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + (phase === "feedback" ? 1 : 0)) / questions.length) * 100 : 0;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="page-container">
      <div className="mb-6">
        <BackButton onClick={phase !== "setup" ? resetAll : undefined} />
      </div>
      <PageHeader
        icon={<Brain className="h-7 w-7" />}
        title="AI Interview Coach"
        subtitle="Practice realistic interviews with AI-powered evaluation and detailed feedback."
      />

      {/* ──── SETUP PHASE ──── */}
      {phase === "setup" && !loadingQuestions && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Role Selection */}
          <AnimatedSection>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Target Role
              </h3>
              <p className="text-muted-foreground text-sm mb-4">What position are you interviewing for?</p>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full rounded-xl bg-muted p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {popularRoles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${role === r ? "gradient-btn" : "bg-accent text-accent-foreground hover:bg-primary/10"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Company */}
          <AnimatedSection delay={0.1}>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Company (Optional)
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Questions will be tailored to this company's interview style.</p>
              <div className="flex flex-wrap gap-2">
                {popularCompanies.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCompany(c === "Any Company" ? "" : c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      (company === c || (c === "Any Company" && !company))
                        ? "gradient-btn"
                        : "bg-accent text-accent-foreground hover:bg-primary/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Interview Type */}
          <AnimatedSection delay={0.2}>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Interview Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {interviewTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInterviewType(t.id)}
                    className={`p-4 rounded-xl text-center transition-all border-2 ${
                      interviewType === t.id
                        ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                        : "border-transparent bg-muted/50 hover:bg-accent/50"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{t.icon}</span>
                    <span className="font-semibold text-sm block">{t.label}</span>
                    <span className="text-muted-foreground text-xs">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Difficulty & Count */}
          <AnimatedSection delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Difficulty
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyLevels.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={`p-3 rounded-xl text-center transition-all border-2 ${
                        difficulty === d.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold text-sm">{d.label}</span>
                      <span className="text-muted-foreground text-xs block">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Questions
                </h3>
                <div className="flex gap-2">
                  {[3, 5, 8, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-3 rounded-xl text-center font-semibold transition-all border-2 ${
                        questionCount === n ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs mt-2 text-center">Number of questions in this session</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Start Button */}
          <AnimatedSection delay={0.4}>
            <button
              onClick={startInterview}
              disabled={!role || !interviewType}
              className="w-full gradient-btn py-4 rounded-2xl font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Play className="h-5 w-5" /> Start Mock Interview
            </button>
          </AnimatedSection>
        </div>
      )}

      {/* ──── LOADING QUESTIONS ──── */}
      {loadingQuestions && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 max-w-md mx-auto">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div className="absolute inset-0 rounded-full border-4 border-primary/20" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.div className="absolute inset-2 rounded-full border-4 border-primary/30" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
            <motion.div className="absolute inset-4 rounded-full border-4 border-primary/40" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ borderTopColor: "transparent", borderRightColor: "transparent" }} />
            <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center">
                <Brain className="h-7 w-7" />
              </div>
            </motion.div>
          </div>
          <motion.h3 className="font-display font-semibold text-xl mb-3" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
            Preparing Your Interview...
          </motion.h3>
          <div className="space-y-2 text-left mt-6">
            {[`Analyzing ${role} role requirements`, "Crafting tailored questions", company ? `Adapting to ${company} style` : "Customizing difficulty levels", "Setting up evaluation criteria"].map((step, i) => (
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/50">
                <motion.div className="w-5 h-5 rounded-full border-2 border-primary" animate={{ backgroundColor: ["hsla(258,90%,62%,0)", "hsla(258,90%,62%,1)"] }} transition={{ delay: i * 0.8 + 0.5, duration: 0.3 }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.8 + 0.5 }} className="w-full h-full rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </motion.div>
                </motion.div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ──── INTERVIEW PHASE ──── */}
      {phase === "interview" && currentQuestion && (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Progress Bar */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Question {currentIndex + 1} of {questions.length}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={endInterviewEarly}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> End Interview
                </button>
                <span className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 30 ? "text-red-500" : "text-muted-foreground"}`}>
                  <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  currentQuestion.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-500" :
                  currentQuestion.difficulty === "Medium" ? "bg-amber-500/10 text-amber-500" :
                  "bg-red-500/10 text-red-500"
                }`}>{currentQuestion.difficulty}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-primary)" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          {/* Question Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsla(258,90%,62%,0.3), transparent)" }} />
            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium mb-3">{currentQuestion.category}</span>
              <h3 className="font-display font-bold text-xl leading-relaxed mb-4">{currentQuestion.question}</h3>
              {currentQuestion.tips && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{currentQuestion.tips}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Answer Input */}
          <div className="glass-card rounded-2xl p-6">
            <label className="block font-semibold text-sm mb-2">Your Answer</label>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              className="w-full rounded-xl bg-muted p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Type your answer here... Be detailed and structured. Use examples from your experience."
              autoFocus
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">{answer.length} characters</span>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="gradient-btn px-8 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="h-4 w-4" /> Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── EVALUATING ──── */}
      {phase === "evaluating" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div className="absolute inset-0 rounded-full border-4 border-primary/40" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ borderTopColor: "transparent" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="font-display font-semibold text-lg">Evaluating your answer...</h3>
          <p className="text-muted-foreground text-sm mt-2">AI is analyzing your response for clarity, depth, and relevance</p>
        </motion.div>
      )}

      {/* ──── FEEDBACK PHASE ──── */}
      {phase === "feedback" && currentEvaluation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-5">
          {/* Score */}
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreCircle score={currentEvaluation.score} size={140} />
              <div className="flex-1 text-center sm:text-left">
                <h3 className={`font-display font-bold text-2xl mb-1 ${ratingColors[currentEvaluation.rating] || ""}`}>{currentEvaluation.rating}</h3>
                <p className="text-muted-foreground text-sm mb-3">{currentEvaluation.feedback}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-display font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Performance Metrics</h4>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(currentEvaluation.metrics).map(([key, val]) => (
                <div key={key} className="text-center">
                  <div className="relative w-14 h-14 mx-auto mb-2">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${val}, 100`} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{val}</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 border-l-4" style={{ borderLeftColor: "hsl(142,71%,45%)" }}>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><CheckCircle className="h-4 w-4" style={{ color: "hsl(142,71%,45%)" }} /> Strengths</h4>
              <ul className="space-y-2">
                {currentEvaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(142,71%,45%)" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-5 border-l-4" style={{ borderLeftColor: "hsl(25,95%,53%)" }}>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4" style={{ color: "hsl(25,95%,53%)" }} /> To Improve</h4>
              <ul className="space-y-2">
                {currentEvaluation.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "hsl(25,95%,53%)" }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Answer */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button onClick={() => setShowModelAnswer(!showModelAnswer)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
              <span className="font-semibold text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> View Model Answer</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showModelAnswer ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {showModelAnswer && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-5 overflow-hidden">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm leading-relaxed">{currentEvaluation.modelAnswer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentIndex + 1 < questions.length && (
              <button onClick={endInterviewEarly} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" /> End Interview
              </button>
            )}
            <button onClick={nextQuestion} className="flex-1 gradient-btn py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
              {currentIndex + 1 >= questions.length ? (
                <><Trophy className="h-5 w-5" /> View Final Report</>
              ) : (
                <><ArrowRight className="h-5 w-5" /> Next Question ({currentIndex + 2}/{questions.length})</>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ──── REPORT PHASE ──── */}
      {phase === "report" && report && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
          {/* Celebration Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-center mb-4"
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {report.overallScore >= 80 ? "🏆" : report.overallScore >= 60 ? "⭐" : "💪"}
            </motion.div>
            <motion.h2
              className="font-display font-bold text-3xl gradient-text mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Interview Complete!
            </motion.h2>
            <motion.p
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Here's your detailed performance breakdown
            </motion.p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{ background: "var(--gradient-primary)" }}
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="flex flex-col sm:flex-row items-center gap-8 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, duration: 0.8, type: "spring", bounce: 0.3 }}
              >
                <ScoreCircle score={report.overallScore} size={170} />
              </motion.div>
              <div className="flex-1 text-center sm:text-left">
                <motion.h3
                  className="font-display font-bold text-2xl mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  Interview Performance Report
                </motion.h3>
                <motion.p
                  className="text-muted-foreground text-sm mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {role}{company && company !== "Any Company" ? ` at ${company}` : ""} • {interviewType} Interview • {results.length} questions answered
                </motion.p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${readinessColors[report.readinessLevel] || "bg-muted text-muted-foreground"}`}>
                    {report.readinessLevel}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${ratingColors[report.overallRating] || ""} bg-muted`}>
                    {report.overallRating}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <p className="text-sm leading-relaxed">{report.summary}</p>
          </motion.div>

          {/* Strengths, Improvements, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Top Strengths", items: report.topStrengths, icon: Trophy, color: "hsl(142,71%,45%)" },
              { title: "Areas to Improve", items: report.areasToImprove, icon: TrendingUp, color: "hsl(25,95%,53%)" },
              { title: "Recommendations", items: report.recommendations, icon: Lightbulb, color: "hsl(258,90%,62%)" },
            ].map((section, si) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + si * 0.15, type: "spring" }}
                className="glass-card rounded-2xl p-5 card-hover"
              >
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <section.icon className="h-4 w-4" style={{ color: section.color }} /> {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + si * 0.15 + i * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: section.color }} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Question Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="glass-card rounded-2xl p-6"
          >
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Question-by-Question Results
            </h4>
            <div className="space-y-3">
              {results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 + i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-accent/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl gradient-btn flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.question.question}</p>
                    <span className="text-xs text-muted-foreground">{r.question.category} • {r.question.difficulty}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold text-lg ${r.evaluation.score >= 80 ? "text-emerald-500" : r.evaluation.score >= 60 ? "text-amber-500" : "text-red-500"}`}>{r.evaluation.score}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h4 className="font-display font-semibold mb-3 flex items-center gap-2"><ArrowRight className="h-5 w-5 text-primary" /> Next Steps</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{report.nextSteps}</p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <button onClick={resetAll} className="flex-1 py-3 rounded-2xl font-semibold text-sm bg-muted text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Practice Again
            </button>
            <button onClick={resetAll} className="flex-1 py-3 rounded-2xl font-semibold text-sm gradient-btn flex items-center justify-center gap-2">
              <Brain className="h-4 w-4" /> New Interview
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
