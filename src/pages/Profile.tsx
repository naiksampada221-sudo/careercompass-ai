import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, Save, Loader2, Briefcase, Bell, Palette, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";

const experienceLevels = [
  { value: "junior", label: "Junior (0-2 years)" },
  { value: "mid", label: "Mid-Level (2-5 years)" },
  { value: "senior", label: "Senior (5-10 years)" },
  { value: "lead", label: "Lead / Staff (10+ years)" },
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
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || "");
        setBio(data.bio || "");
        setPreferredRole(data.preferred_role || "");
        setExperienceLevel(data.experience_level || "mid");
        setEmailNotifications(data.email_notifications ?? true);
        setAvatarUrl(data.avatar_url);
      } else {
        // Profile doesn't exist yet (e.g. existing user before trigger), create it
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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);

      // Update profile with new avatar URL
      await supabase
        .from("profiles")
        .upsert({ user_id: user.id, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

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
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: fullName,
          bio,
          preferred_role: preferredRole,
          experience_level: experienceLevel,
          email_notifications: emailNotifications,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      // Also update auth metadata
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      <PageHeader icon={<User className="h-7 w-7" />} title="Profile Settings" subtitle="Manage your account and preferences" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar section */}
        <AnimatedSection>
          <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-primary/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/40 flex items-center justify-center transition-colors cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-6 w-6 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display font-bold text-lg">{fullName || "Your Name"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary hover:underline mt-1"
              >
                Change photo
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Personal info */}
        <AnimatedSection delay={0.1}>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Personal Info
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Career preferences */}
        <AnimatedSection delay={0.2}>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Career Preferences
            </h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Preferred Role / Title</label>
              <input
                type="text"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Full Stack Developer, Data Scientist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Experience Level</label>
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                >
                  {experienceLevels.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Notifications */}
        <AnimatedSection delay={0.3}>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${emailNotifications ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground transition-transform ${emailNotifications ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm">Email notifications for analysis results</span>
            </label>
          </div>
        </AnimatedSection>

        {/* Save button */}
        <AnimatedSection delay={0.4}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </motion.button>
        </AnimatedSection>
      </div>
    </div>
  );
}
