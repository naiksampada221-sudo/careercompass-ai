import { supabase } from "@/integrations/supabase/client";

type NotificationType = "job_match" | "analysis" | "tip" | "info";

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info",
  link?: string
) {
  const { error } = await supabase.rpc("create_notification", {
    p_user_id: userId,
    p_title: title,
    p_message: message,
    p_type: type,
    p_link: link || null,
  });
  if (error) console.error("Failed to send notification:", error);
}
