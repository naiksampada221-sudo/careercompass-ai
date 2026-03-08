import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import HeaderNav from "@/components/HeaderNav";
import GreetingBadge from "@/components/GreetingBadge";
import NotificationBell from "@/components/NotificationBell";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import ParticleBackground from "@/components/ParticleBackground";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider defaultOpen={false}>
            <div className="min-h-screen flex w-full">
              <ParticleBackground />
              <CursorGlow />
              <ScrollProgress />
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-40 h-14 flex items-center bg-background/60 backdrop-blur-xl px-3 sm:px-4 header-glow relative">
                  {/* Animated gradient bottom border */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{
                      background: "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), hsl(180, 70%, 55%), transparent)",
                      backgroundSize: "200% 100%",
                    }}
                    animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                  <SidebarTrigger className="hover:scale-110 transition-transform shrink-0" />
                  <div className="ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <MagneticButton strength={0.4}>
                      <motion.div
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl gradient-btn flex items-center justify-center relative overflow-hidden shrink-0"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <motion.span
                          className="text-[10px] sm:text-xs font-bold relative z-10"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          ✦
                        </motion.span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                      </motion.div>
                    </MagneticButton>
                    <span className="font-display font-bold text-xs sm:text-sm gradient-text tracking-wide truncate">CareerCompass AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GreetingBadge />
                    <NotificationBell />
                    <HeaderNav />
                  </div>
                </header>
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
