import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function GreetingBadge() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  const name = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  const firstName = name.split(" ")[0];

  return (
    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-border" />
      ) : null}
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
        Hi, <span className="text-foreground font-semibold">{firstName}</span> 👋
      </span>
    </Link>
  );
}
