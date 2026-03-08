import { FileText, Search, TrendingUp, Compass, Brain, Mic, Linkedin, Map, LayoutDashboard, Home, Sun, Moon, Clock, LogIn, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  { title: "History", url: "/history", icon: Clock },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
                <Compass className="h-4 w-4" />
              </div>
              {!collapsed && <span className="font-display font-bold text-sm gradient-text">CareerCompass AI</span>}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      onClick={handleNavClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-1">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50 mb-1">
            <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.email}</p>
                <p className="text-xs text-sidebar-foreground/50">Signed in</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full"
        >
          {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {user ? (
          <button
            onClick={() => { signOut(); handleNavClick(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        ) : (
          <button
            onClick={() => { navigate("/auth"); handleNavClick(); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium gradient-btn w-full"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
