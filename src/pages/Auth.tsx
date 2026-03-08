import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, User, Sparkles, KeyRound, Shield, Zap, Star, CheckCircle2, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup" | "magic-link" | "forgot" | "otp-verify";

const floatingIcons = [
  { icon: "🎯", delay: 0, x: "10%", y: "15%" },
  { icon: "💼", delay: 1.5, x: "85%", y: "20%" },
  { icon: "🚀", delay: 0.8, x: "15%", y: "75%" },
  { icon: "⚡", delay: 2, x: "80%", y: "70%" },
  { icon: "🧠", delay: 1.2, x: "50%", y: "8%" },
  { icon: "📊", delay: 0.5, x: "90%", y: "45%" },
];

const OTP_DURATION = 300; // 5 minutes in seconds

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(OTP_DURATION);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // OTP countdown timer
  useEffect(() => {
    if (mode !== "otp-verify" || otpTimer <= 0 || otpSuccess) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [mode, otpTimer, otpSuccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timerProgress = otpTimer / OTP_DURATION;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've been signed in successfully." });
        navigate("/dashboard");
      } else if (mode === "signup") {
        // Step 1: Send OTP to email for verification
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        // Move to OTP verification screen
        setOtpCode(["", "", "", "", "", ""]);
        setOtpTimer(OTP_DURATION);
        setOtpSuccess(false);
        setMode("otp-verify");
        toast({ title: "OTP Sent! 📧", description: `A 6-digit code has been sent to ${email}` });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpCode];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpCode(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join("");
    if (code.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter the full 6-digit code.", variant: "destructive" });
      return;
    }
    setOtpVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;

      // Set password after OTP verification
      if (password) {
        await supabase.auth.updateUser({ password });
      }

      setOtpSuccess(true);
      toast({ title: "Email verified! ✅", description: "Your account has been created successfully." });
      
      // Brief delay to show success animation
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (e: any) {
      toast({ title: "Verification failed", description: e.message, variant: "destructive" });
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, data: { full_name: fullName } },
      });
      if (error) throw error;
      setOtpTimer(OTP_DURATION);
      setOtpCode(["", "", "", "", "", ""]);
      toast({ title: "Code resent! 📧", description: "A new OTP has been sent to your email." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast({ title: "Magic link sent!", description: "Check your email inbox for the login link." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(258, 90%, 62%, 0.15), transparent)", left: "-15%", top: "-15%" }}
          animate={{ y: [0, 40, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(220, 70%, 55%, 0.12), transparent)", right: "-10%", bottom: "-10%" }}
          animate={{ y: [0, -30, 0], x: [0, -15, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, hsla(180, 70%, 55%, 0.08), transparent)", left: "40%", top: "60%" }}
          animate={{ y: [0, -25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -20, 0], rotate: [0, 15, -15, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
          >
            {item.icon}
          </motion.div>
        ))}

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(hsl(258, 90%, 62%) 1px, transparent 1px), linear-gradient(90deg, hsl(258, 90%, 62%) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <motion.div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-btn mb-5 relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Compass className="h-8 w-8" />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: "linear-gradient(135deg, transparent 40%, hsla(0,0%,100%,0.3) 50%, transparent 60%)" }}
              animate={{ x: ["-150%", "150%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-2">
                {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Reset Password" : mode === "otp-verify" ? "Verify Email" : "Magic Link"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mode === "login"
                  ? "Sign in to access your career dashboard"
                  : mode === "signup"
                  ? "Start your AI-powered career journey"
                  : mode === "forgot"
                  ? "We'll send you a link to reset your password"
                  : mode === "otp-verify"
                  ? `Enter the 6-digit code sent to ${email}`
                  : "We'll email you a passwordless login link"}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          whileHover={{ boxShadow: "0 20px 60px -10px hsla(258, 90%, 62%, 0.2)" }}
          transition={{ duration: 0.4 }}
        >
          {/* Shimmer border effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, transparent, hsla(258, 90%, 62%, 0.1), transparent, hsla(220, 70%, 55%, 0.1), transparent)", backgroundSize: "400% 400%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          <div className="relative z-10">
            {/* ───── OTP VERIFICATION SCREEN ───── */}
            {mode === "otp-verify" && (
              <AnimatePresence mode="wait">
                {otpSuccess ? (
                  <motion.div
                    key="otp-success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </motion.div>
                    <motion.h3
                      className="font-display font-bold text-xl mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Email Verified! 🎉
                    </motion.h3>
                    <motion.p
                      className="text-sm text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Redirecting to your dashboard...
                    </motion.p>
                    <motion.div
                      className="mt-4 h-1 bg-primary/20 rounded-full overflow-hidden mx-auto w-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "linear" }}
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp-input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Animated countdown timer */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-24 h-24">
                        {/* Background circle */}
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" className="stroke-muted/30" />
                          <motion.circle
                            cx="50" cy="50" r="42"
                            fill="none"
                            strokeWidth="6"
                            className="stroke-primary"
                            strokeLinecap="round"
                            strokeDasharray={264}
                            strokeDashoffset={264 * (1 - timerProgress)}
                            transition={{ duration: 1 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className="flex items-center gap-1"
                            animate={otpTimer <= 30 ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Timer className={`h-3.5 w-3.5 ${otpTimer <= 30 ? "text-destructive" : "text-primary"}`} />
                            <span className={`text-sm font-mono font-bold ${otpTimer <= 30 ? "text-destructive" : "text-foreground"}`}>
                              {formatTime(otpTimer)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      {otpTimer <= 0 && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-destructive font-medium"
                        >
                          Code expired
                        </motion.p>
                      )}
                    </div>

                    {/* OTP Input boxes */}
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otpCode.map((digit, index) => (
                        <motion.input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 border-border bg-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                          whileFocus={{ scale: 1.08, borderColor: "hsl(258, 90%, 62%)" }}
                        />
                      ))}
                    </div>

                    {/* Verify button */}
                    <motion.button
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpCode.join("").length !== 6 || otpTimer <= 0}
                      className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        {otpVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Verify & Create Account
                      </span>
                    </motion.button>

                    {/* Resend & back */}
                    <div className="flex flex-col items-center gap-2 text-sm">
                      <button
                        onClick={handleResendOtp}
                        disabled={loading || otpTimer > 0}
                        className="text-primary font-medium hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {loading ? "Sending..." : "Resend Code"}
                      </button>
                      <button
                        onClick={() => setMode("signup")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back to sign up
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* ───── GOOGLE & MAGIC LINK BUTTONS ───── */}
            {mode !== "forgot" && mode !== "otp-verify" && (
              <>
                <motion.button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-background/80 hover:bg-accent text-foreground font-medium text-sm transition-all disabled:opacity-50 mb-3 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  {googleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span className="relative z-10">Continue with Google</span>
                </motion.button>

                {mode !== "magic-link" && (
                  <motion.button
                    onClick={() => { setMode("magic-link"); setMagicLinkSent(false); }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-background/80 hover:bg-accent text-foreground font-medium text-sm transition-all mb-5 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="relative z-10">Sign in with Email Link</span>
                  </motion.button>
                )}
              </>
            )}

            {/* ───── MAGIC LINK MODE ───── */}
            {mode === "magic-link" && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">email magic link</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <AnimatePresence mode="wait">
                  {magicLinkSent ? (
                    <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Mail className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="font-display font-bold text-lg mb-2">Check your email!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We sent a login link to <strong className="text-foreground">{email}</strong>
                      </p>
                      <button onClick={() => setMagicLinkSent(false)} className="text-sm text-primary hover:underline">Try a different email</button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleMagicLink} className="space-y-4">
                      <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" focused={focusedField === "ml-email"} onFocus={() => setFocusedField("ml-email")} onBlur={() => setFocusedField(null)} />
                      <SubmitButton loading={loading} icon={<Sparkles className="h-4 w-4" />} text="Send Magic Link" />
                    </motion.form>
                  )}
                </AnimatePresence>
                <p className="text-center text-sm text-muted-foreground mt-5">
                  <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Back to password login</button>
                </p>
              </>
            )}

            {/* ───── FORGOT PASSWORD MODE ───── */}
            {mode === "forgot" && (
              <>
                <AnimatePresence mode="wait">
                  {resetSent ? (
                    <motion.div key="reset-sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Mail className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="font-display font-bold text-lg mb-2">Check your email!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We sent a reset link to <strong className="text-foreground">{email}</strong>
                      </p>
                      <button onClick={() => { setResetSent(false); setMode("login"); }} className="text-sm text-primary hover:underline">Back to sign in</button>
                    </motion.div>
                  ) : (
                    <motion.form key="forgot-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleForgotPassword} className="space-y-4">
                      <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" focused={focusedField === "fg-email"} onFocus={() => setFocusedField("fg-email")} onBlur={() => setFocusedField(null)} />
                      <SubmitButton loading={loading} icon={<KeyRound className="h-4 w-4" />} text="Send Reset Link" />
                    </motion.form>
                  )}
                </AnimatePresence>
                <p className="text-center text-sm text-muted-foreground mt-5">
                  <button onClick={() => { setMode("login"); setResetSent(false); }} className="text-primary font-medium hover:underline">Back to sign in</button>
                </p>
              </>
            )}

            {/* ───── LOGIN / SIGNUP FORM ───── */}
            {(mode === "login" || mode === "signup") && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or use password</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence>
                    {mode === "signup" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <InputField icon={User} label="Full Name" type="text" value={fullName} onChange={setFullName} placeholder="John Doe" focused={focusedField === "name"} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} required />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputField icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" focused={focusedField === "email"} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <motion.div
                      className="relative rounded-xl"
                      variants={{ focused: { scale: 1.02, boxShadow: "0 0 20px hsla(258, 90%, 62%, 0.15)" }, unfocused: { scale: 1, boxShadow: "0 0 0px transparent" } }}
                      animate={focusedField === "password" ? "focused" : "unfocused"}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                        placeholder="••••••••"
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </motion.div>
                  </div>

                  {mode === "login" && (
                    <div className="text-right">
                      <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot password?</button>
                    </div>
                  )}

                  <SubmitButton loading={loading} icon={<ArrowRight className="h-4 w-4" />} text={mode === "login" ? "Sign In" : "Send Verification Code"} />
                </form>

                <p className="text-center text-sm text-muted-foreground mt-5">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary font-semibold hover:underline">
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-6 text-muted-foreground/50"
        >
          <div className="flex items-center gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            <span>AI-Powered</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5" />
            <span>Free to Start</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Reusable animated input
function InputField({ icon: Icon, label, type, value, onChange, placeholder, focused, onFocus, onBlur, required = true }: {
  icon: any; label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
  focused: boolean; onFocus: () => void; onBlur: () => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <motion.div
        className="relative rounded-xl"
        variants={{ focused: { scale: 1.02, boxShadow: "0 0 20px hsla(258, 90%, 62%, 0.15)" }, unfocused: { scale: 1, boxShadow: "0 0 0px transparent" } }}
        animate={focused ? "focused" : "unfocused"}
        transition={{ duration: 0.2 }}
      >
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </motion.div>
    </div>
  );
}

// Reusable submit button with hover flash
function SubmitButton({ loading, icon, text }: { loading: boolean; icon: React.ReactNode; text: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      className="w-full gradient-btn py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {text}
      </span>
    </motion.button>
  );
}
