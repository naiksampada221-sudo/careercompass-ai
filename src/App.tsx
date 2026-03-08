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
