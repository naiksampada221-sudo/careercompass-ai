import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  resumesAnalyzed: number;
  atsScans: number;
  interviewSessions: number;
  totalActivities: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      // Count activities by type across all users (public counts)
      const { count: resumeCount } = await supabase
        .from("activity_history")
        .select("*", { count: "exact", head: true })
        .eq("activity_type", "resume_analysis");

      const { count: atsCount } = await supabase
        .from("activity_history")
        .select("*", { count: "exact", head: true })
        .eq("activity_type", "ats_scan");

      const { count: interviewCount } = await supabase
        .from("activity_history")
        .select("*", { count: "exact", head: true })
        .eq("activity_type", "interview_practice");

      const { count: totalCount } = await supabase
        .from("activity_history")
        .select("*", { count: "exact", head: true });

      return {
        resumesAnalyzed: resumeCount || 0,
        atsScans: atsCount || 0,
        interviewSessions: interviewCount || 0,
        totalActivities: totalCount || 0,
      } as PlatformStats;
    },
    staleTime: 60_000, // refresh every minute
  });
}
