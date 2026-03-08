import { useState } from "react";
import { Clock, FileText, Search, Compass, Trash2, ChevronRight, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BackButton from "@/components/BackButton";
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-3xl glass-card-premium flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Sign in to view history</h2>
          <p className="text-muted-foreground mb-6">Your activity history is saved when you're signed in.</p>
          <Link to="/" className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 magnetic-hover">
            Go Home <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative" style={{ background: "var(--gradient-primary)" }}>
          <Clock className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Activity History</h1>
        <p className="text-muted-foreground">View all your past analyses, scans, and explorations.</p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {/* Filters */}
        <AnimatedSection className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All", icon: Sparkles },
            { key: "resume_analysis", label: "Resume", icon: FileText },
            { key: "ats_scan", label: "ATS Scan", icon: Search },
            { key: "skill_explorer", label: "Skills", icon: Compass },
          ].map((f) => (
            <motion.button
              key={f.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                filter === f.key ? "gradient-btn" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </motion.button>
          ))}
        </AnimatedSection>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm">Loading history...</p>
          </div>
        ) : !filtered?.length ? (
          <AnimatedSection className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-3xl glass-card-premium flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">No activity yet</h3>
              <p className="text-muted-foreground text-sm mb-6">Start analyzing resumes, scanning for ATS, or exploring skills.</p>
              <Link to="/resume-analyzer" className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 magnetic-hover">
                Get Started <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
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
                    whileHover={{ x: 4 }}
                    className="glass-card-premium rounded-2xl p-5 group cursor-default"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config?.color || "from-gray-500 to-gray-600"} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">{config?.label}</span>
                          {item.score != null && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2 + i * 0.03, type: "spring" }}
                              className={`px-2 py-0.5 rounded-md text-xs font-semibold ${item.score >= 80 ? "bg-green-500/10 text-green-600" : item.score >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}
                            >
                              Score: {item.score}
                            </motion.span>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                        {item.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
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
