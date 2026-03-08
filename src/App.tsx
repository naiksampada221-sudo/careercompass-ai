import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ATSScanner from "./pages/ATSScanner";
import CareerPrediction from "./pages/CareerPrediction";
import SkillGap from "./pages/SkillGap";
import InterviewCoach from "./pages/InterviewCoach";
import VoiceInterview from "./pages/VoiceInterview";
import LinkedInAnalyzer from "./pages/LinkedInAnalyzer";
import CareerRoadmap from "./pages/CareerRoadmap";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/ats-scanner" element={<ATSScanner />} />
          <Route path="/career-prediction" element={<CareerPrediction />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/interview-coach" element={<InterviewCoach />} />
          <Route path="/voice-interview" element={<VoiceInterview />} />
          <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
          <Route path="/career-roadmap" element={<CareerRoadmap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
