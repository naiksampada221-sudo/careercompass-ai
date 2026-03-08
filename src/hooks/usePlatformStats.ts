import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  resumes_analyzed: number;
  ats_scans: number;
  interview_sessions: number;
  total_activities: number;
  total_users: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_platform_stats");
      if (error) throw error;
      return data as unknown as PlatformStats;
    },
    staleTime: 60_000,
  });
}
