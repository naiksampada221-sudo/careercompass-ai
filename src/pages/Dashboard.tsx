import { LayoutDashboard, FileText, TrendingUp, Brain, Map, Search, Compass, ArrowRight, Clock, Mic, Linkedin } from "lucide-react";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import ScoreCircle from "@/components/ScoreCircle";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
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
      <PageHeader icon={<LayoutDashboard className="h-7 w-7" />} title="Dashboard" subtitle={user ? `Welcome back, ${user.email?.split("@")[0]}` : "Your career analysis hub"} />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Stats row - only show if user has data */}
        {user && (latestResume || latestATS) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {latestResume && (
              <AnimatedSection>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <ScoreCircle score={latestResume.score || 0} size={90} label="Resume Score" />
                  <p className="text-xs text-muted-foreground mt-2">Latest analysis</p>
                </div>
              </AnimatedSection>
            )}
            {latestATS && (
              <AnimatedSection delay={0.1}>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <ScoreCircle score={latestATS.score || 0} size={90} label="ATS Score" />
                  <p className="text-xs text-muted-foreground mt-2">Latest scan</p>
                </div>
              </AnimatedSection>
            )}
            <AnimatedSection delay={0.2}>
              <div className="glass-card rounded-2xl p-6 text-center flex flex-col items-center justify-center">
                <div className="font-display text-3xl font-bold gradient-text">{totalActivities}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Activities</p>
                <Link to="/history" className="text-xs text-primary mt-2 hover:underline flex items-center gap-1">
                  View History <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        )}

        {/* Welcome card for non-authenticated or new users */}
        {(!user || !history?.length) && (
          <AnimatedSection>
            <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.3), transparent)" }} />
              <h3 className="font-display font-bold text-2xl mb-2 relative">
                {user ? "Welcome to CareerCompass AI" : "Sign in to get started"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-lg relative mb-4">
                {user
                  ? "Start by analyzing your resume to unlock personalized career insights, skill gap analysis, and interview preparation."
                  : "Create an account to save your analysis results and track your career progress over time."}
              </p>
              <Link
                to={user ? "/resume-analyzer" : "/auth"}
                className="inline-flex items-center gap-2 gradient-btn px-6 py-3 rounded-xl font-semibold text-sm relative"
              >
                {user ? "Analyze Resume" : "Sign In"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>
        )}

        {/* Recent activity */}
        {user && history && history.length > 0 && (
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Recent Activity
              </h3>
              <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {history.slice(0, 3).map((item: any) => (
                <div key={item.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                    item.activity_type === "resume_analysis" ? "from-violet-500 to-purple-600" :
                    item.activity_type === "ats_scan" ? "from-blue-500 to-cyan-500" :
                    "from-emerald-500 to-teal-500"
                  } flex items-center justify-center shrink-0`}>
                    {item.activity_type === "resume_analysis" ? <FileText className="h-5 w-5 text-primary-foreground" /> :
                     item.activity_type === "ats_scan" ? <Search className="h-5 w-5 text-primary-foreground" /> :
                     <Compass className="h-5 w-5 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.summary}</p>
                  </div>
                  {item.score != null && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.score >= 80 ? "bg-green-500/10 text-green-600" : item.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                      {item.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Quick links */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((l, i) => (
              <AnimatedSection key={l.label} delay={i * 0.05}>
                <Link to={l.to} className="glass-card rounded-2xl p-5 flex items-start gap-3 card-hover group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <l.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{l.label}</h4>
                    <p className="text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
