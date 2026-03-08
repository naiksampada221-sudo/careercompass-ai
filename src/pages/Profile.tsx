import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Loader2, Briefcase, Bell, ChevronDown, Sparkles, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import AnimatedSection from "@/components/AnimatedSection";

const experienceLevels = [
  { value: "junior", label: "Junior (0-2 years)", emoji: "🌱" },
  { value: "mid", label: "Mid-Level (2-5 years)", emoji: "🚀" },
  { value: "senior", label: "Senior (5-10 years)", emoji: "⭐" },
  { value: "lead", label: "Lead / Staff (10+ years)", emoji: "👑" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      if (data) {
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setPreferredRole(data.preferred_role || "");
        setExperienceLevel(data.experience_level || "mid");
        setEmailNotifications(data.email_notifications ?? true);
        setAvatarUrl(data.avatar_url);
      } else {
        setFullName(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
      }
    } catch (e: any) {
      console.error("Error fetching profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please choose an image under 2MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase.from("profiles").upsert({ user_id: user.id, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      toast({ title: "Avatar updated!", description: "Your profile picture has been changed." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        user_id: user.id, full_name: fullName, bio, preferred_role: preferredRole,
        experience_level: experienceLevel, email_notifications: emailNotifications,
        avatar_url: avatarUrl, updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      toast({ title: "Profile saved!", description: "Your changes have been saved successfully." });
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
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
          <User className="h-8 w-8 text-primary-foreground" />
        </motion.div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar */}
        <AnimatedSection>
          <motion.div whileHover={{ y: -2 }} className="glass-card-premium rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20 shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </motion.div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-colors cursor-pointer">
                {uploading ? <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" /> :
                  <Camera className="h-6 w-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-lg">{fullName || "Your Name"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:underline mt-1 font-medium">Change photo</button>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Personal info */}
        <AnimatedSection delay={0.1}>
          <motion.div whileHover={{ y: -2 }} className="glass-card-premium rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Personal Info
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="premium-input" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="premium-input resize-none" placeholder="Tell us a bit about yourself..." />
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Career */}
        <AnimatedSection delay={0.2}>
          <motion.div whileHover={{ y: -2 }} className="glass-card-premium rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Career Preferences
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Role / Title</label>
              <input type="text" value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)}
                className="premium-input" placeholder="e.g. Full Stack Developer, Data Scientist" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Experience Level</label>
              <div className="grid grid-cols-2 gap-2">
                {experienceLevels.map((lvl) => (
                  <motion.button
                    key={lvl.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExperienceLevel(lvl.value)}
                    className={`p-3 rounded-xl text-left text-sm transition-all border-2 ${
                      experienceLevel === lvl.value
                        ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                        : "border-transparent bg-muted/50 hover:bg-accent/50"
                    }`}
                  >
                    <span className="mr-1.5">{lvl.emoji}</span>
                    <span className="font-medium">{lvl.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* Notifications */}
        <AnimatedSection delay={0.3}>
          <motion.div whileHover={{ y: -2 }} className="glass-card-premium rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h3>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <motion.div
                onClick={() => setEmailNotifications(!emailNotifications)}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${emailNotifications ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow-sm"
                  animate={{ x: emailNotifications ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.div>
              <span className="text-sm">Email notifications for analysis results</span>
            </label>
          </motion.div>
        </AnimatedSection>

        {/* Save */}
        <AnimatedSection delay={0.4}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 magnetic-hover"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </motion.button>
        </AnimatedSection>
      </div>
    </div>
  );
}
