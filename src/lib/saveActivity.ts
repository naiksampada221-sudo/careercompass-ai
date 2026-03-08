import { supabase } from "@/integrations/supabase/client";

export async function saveActivity({
  userId,
  activityType,
  title,
  summary,
  score,
  resultData,
}: {
  userId: string;
  activityType: "resume_analysis" | "ats_scan" | "skill_explorer" | "interview_practice" | "career_roadmap";
  title: string;
  summary?: string;
  score?: number;
  resultData?: any;
}) {
  const { error } = await supabase.from("activity_history").insert({
    user_id: userId,
    activity_type: activityType,
    title,
    summary,
    score,
    result_data: resultData,
  });
  if (error) console.error("Failed to save activity:", error);
}
