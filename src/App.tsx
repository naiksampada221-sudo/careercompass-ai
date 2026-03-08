import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import HeaderNav from "@/components/HeaderNav";
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
import History from "./pages/History";
import Auth from "./pages/Auth";
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
                <header className="sticky top-0 z-40 h-14 flex items-center border-b border-border bg-background/80 backdrop-blur-sm px-4">
                  <SidebarTrigger />
                  <span className="ml-3 font-display font-semibold text-sm gradient-text flex-1">CareerCompass AI</span>
                  <HeaderNav />
                </header>
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                    <Route path="/ats-scanner" element={<ATSScanner />} />
                    <Route path="/career-prediction" element={<CareerPrediction />} />
                    <Route path="/skill-explorer" element={<SkillExplorer />} />
                    <Route path="/interview-coach" element={<InterviewCoach />} />
                    <Route path="/voice-interview" element={<VoiceInterview />} />
                    <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
                    <Route path="/career-roadmap" element={<CareerRoadmap />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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
