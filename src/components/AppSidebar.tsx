import { FileText, Search, TrendingUp, Compass, Brain, Mic, Linkedin, Map, LayoutDashboard, Home, Sun, Moon, Clock, LogOut, User, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Resume Analyzer", url: "/resume-analyzer", icon: FileText },
  { title: "ATS Scanner", url: "/ats-scanner", icon: Search },
  { title: "Career Prediction", url: "/career-prediction", icon: TrendingUp },
  { title: "Skill Explorer", url: "/skill-explorer", icon: Compass },
  { title: "Interview Coach", url: "/interview-coach", icon: Brain },
  { title: "Voice Interview", url: "/voice-interview", icon: Mic },
  { title: "LinkedIn Analyzer", url: "/linkedin-analyzer", icon: Linkedin },
  { title: "Career Roadmap", url: "/career-roadmap", icon: Map },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: Settings },
  { title: "History", url: "/history", icon: Clock },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent className="sidebar-premium">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <Compass className="h-4 w-4" />
              </motion.div>
              {!collapsed && (
                <span className="font-display font-bold text-sm gradient-text">CareerCompass AI</span>
              )}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-0.5">
              {navItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        onClick={handleNavClick}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group
                          ${active
                            ? "text-primary bg-primary/10 border border-primary/20 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 border border-transparent"
                          }`}
                        activeClassName=""
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                          active
                            ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
                            : "group-hover:text-primary group-hover:drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]"
                        }`} />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-1 border-t border-sidebar-border/50">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 mb-1">
            <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user.email}</p>
                <p className="text-[10px] text-sidebar-foreground/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_hsl(145,80%,55%)]" />
                  Online
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 transition-all duration-300 w-full group"
        >
          {dark ? (
            <Sun className="h-4 w-4 shrink-0 group-hover:text-amber-400 group-hover:drop-shadow-[0_0_6px_hsl(45,90%,55%/0.6)] transition-all" />
          ) : (
            <Moon className="h-4 w-4 shrink-0 group-hover:text-blue-400 group-hover:drop-shadow-[0_0_6px_hsl(220,70%,55%/0.6)] transition-all" />
          )}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {user && (
          <button
            onClick={() => { signOut(); handleNavClick(); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-300 w-full group"
          >
            <LogOut className="h-4 w-4 shrink-0 group-hover:drop-shadow-[0_0_6px_hsl(0,84%,60%/0.6)] transition-all" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
