import { useState } from "react";
import { Clock, FileText, Search, Compass, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const typeConfig = {
  resume_analysis: { icon: FileText, label: "Resume Analysis", color: "from-violet-500 to-purple-600", link: "/resume-analyzer" },
  ats_scan: { icon: Search, label: "ATS Scan", color: "from-blue-500 to-cyan-500", link: "/ats-scanner" },
  skill_explorer: { icon: Compass, label: "Skill Explorer", color: "from-emerald-500 to-teal-500", link: "/skill-explorer" },
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ["activity_history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_history").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity_history"] });
      toast({ title: "Deleted", description: "Activity removed from history." });
    },
  });

  const filtered = filter === "all" ? history : history?.filter((h: any) => h.activity_type === filter);

  if (!user) {
    return (
      <div className="page-container text-center py-20">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Sign in to view history</h2>
        <p className="text-muted-foreground mb-6">Your activity history is saved when you're signed in.</p>
        <Link to="/auth" className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2">
          Sign In <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      <PageHeader icon={<Clock className="h-7 w-7" />} title="Activity History" subtitle="View all your past analyses, scans, and explorations." />

      <div className="max-w-3xl mx-auto">
        {/* Filters */}
        <AnimatedSection className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "resume_analysis", label: "Resume" },
            { key: "ats_scan", label: "ATS Scan" },
            { key: "skill_explorer", label: "Skills" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key ? "gradient-btn" : "bg-muted text-muted-foreground hover:bg-accent"}`}
            >
              {f.label}
            </button>
          ))}
        </AnimatedSection>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        ) : !filtered?.length ? (
          <AnimatedSection className="text-center py-16">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display font-semibold text-lg mb-2">No activity yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Start analyzing resumes, scanning for ATS, or exploring skills.</p>
            <Link to="/resume-analyzer" className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2">
              Get Started <ChevronRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered?.map((item: any, i: number) => {
                const config = typeConfig[item.activity_type as keyof typeof typeConfig];
                const Icon = config?.icon || FileText;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card rounded-2xl p-5 card-hover group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config?.color || "from-gray-500 to-gray-600"} flex items-center justify-center shrink-0`}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">{config?.label}</span>
                          {item.score != null && (
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${item.score >= 80 ? "bg-green-500/10 text-green-600" : item.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
                              Score: {item.score}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                        {item.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
