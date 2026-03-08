import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import HeaderNav from "@/components/HeaderNav";
import { useAuth } from "@/contexts/AuthContext";
import GreetingBadge from "@/components/GreetingBadge";
import NotificationBell from "@/components/NotificationBell";
import Index from "./pages/Index";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ATSScanner from "./pages/ATSScanner";
import CareerPrediction from "./pages/CareerPrediction";
import SkillExplorer from "./pages/SkillExplorer";
import InterviewCoach from "./pages/InterviewCoach";
import VoiceInterview from "./pages/VoiceInterview";
import LinkedInAnalyzer from "./pages/LinkedInAnalyzer";
import CareerRoadmap from "./pages/CareerRoadmap";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

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
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-40 h-14 flex items-center border-b border-border/50 bg-background/60 backdrop-blur-xl px-4 header-glow">
                  <SidebarTrigger className="hover:scale-110 transition-transform" />
                  <div className="ml-3 flex items-center gap-2 flex-1">
                    <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center animate-pulse-glow">
                      <span className="text-xs font-bold">✦</span>
                    </div>
                    <span className="font-display font-bold text-sm gradient-text">CareerCompass AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GreetingBadge />
                    <HeaderNav />
                  </div>
                </header>
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                    <Route path="/ats-scanner" element={<ATSScanner />} />
                    <Route path="/career-prediction" element={<CareerPrediction />} />
                    <Route path="/skill-explorer" element={<SkillExplorer />} />
                    <Route path="/interview-coach" element={<InterviewCoach />} />
                    <Route path="/voice-interview" element={<VoiceInterview />} />
                    <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
                    <Route path="/career-roadmap" element={<CareerRoadmap />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/history" element={<History />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
