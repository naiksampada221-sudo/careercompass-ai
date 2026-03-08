import { useState, useEffect, useRef, useCallback } from "react";
import { Map, Loader2, BookOpen, Youtube, ExternalLink, Award, Wrench, FolderOpen, Clock, ChevronRight, Sparkles, ArrowLeft, Search, TrendingUp, Download, MessageSquare, GraduationCap, Briefcase, DollarSign, Building2, Target, Zap, CheckCircle2, ChevronDown, ChevronUp as ChevronUpIcon, Brain, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

// ── Types ──
interface MarketInsights {
  averageSalaryUSD: string;
  averageSalaryINR: string;
  demandLevel: string;
  growthRate: string;
  topHiringCompanies: string[];
  jobOpenings: string;
}

interface SubTopicSkill {
  name: string;
  level: string;
  description: string;
  subTopics?: string[];
}

interface RoadmapTopic {
  name: string;
  description: string;
  subTopics?: string[];
  resources: string[];
  youtubeSearch: string;
  difficulty?: string;
  estimatedHours?: number;
}

interface RoadmapStage {
  title: string;
  duration: string;
  color: string;
  topics: RoadmapTopic[];
  projects: string[];
  milestones?: string[];
}

interface Certification {
  name: string;
  provider: string;
  difficulty: string;
  cost?: string;
  url?: string;
}

interface CareerRoadmap {
  career: string;
  overview: string;
  totalMonths: number;
  marketInsights?: MarketInsights;
  requiredSkills: SubTopicSkill[];
  stages: RoadmapStage[];
  certifications: Certification[];
  interviewTopics?: string[];
}

interface CareerPath {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
}

// ── Constants ──
const categoryColors: Record<string, string> = {
  Tech: "from-blue-500 to-cyan-500",
  Business: "from-amber-500 to-orange-500",
  Creative: "from-pink-500 to-rose-500",
  Science: "from-emerald-500 to-green-500",
  Healthcare: "from-red-500 to-pink-500",
  Engineering: "from-indigo-500 to-violet-500",
};

const categoryBg: Record<string, string> = {
  Tech: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Business: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Creative: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Science: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Healthcare: "bg-red-500/10 text-red-400 border-red-500/20",
  Engineering: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

const levelColors: Record<string, string> = {
  Essential: "bg-red-500/10 text-red-400 border-red-500/30",
  Important: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "Nice to Have": "bg-green-500/10 text-green-400 border-green-500/30",
};

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const exampleCareers: CareerPath[] = [
  { id: "data-scientist", title: "Data Scientist", icon: "📊", category: "Tech", description: "Analyze complex data to help organizations make better decisions using ML & statistics." },
  { id: "full-stack-dev", title: "Full Stack Developer", icon: "💻", category: "Tech", description: "Build complete web applications from frontend to backend and deployment." },
  { id: "ml-engineer", title: "ML Engineer", icon: "🤖", category: "Tech", description: "Design and deploy machine learning models into production systems." },
  { id: "cloud-architect", title: "Cloud Architect", icon: "☁️", category: "Tech", description: "Design and manage scalable cloud infrastructure on AWS, GCP, or Azure." },
  { id: "cybersecurity-analyst", title: "Cybersecurity Analyst", icon: "🔒", category: "Tech", description: "Protect systems and networks from cyber threats and vulnerabilities." },
  { id: "devops-engineer", title: "DevOps Engineer", icon: "⚙️", category: "Engineering", description: "Automate development pipelines and manage infrastructure as code." },
  { id: "ui-ux-designer", title: "UI/UX Designer", icon: "🎨", category: "Creative", description: "Design intuitive and beautiful user interfaces and experiences." },
  { id: "product-manager", title: "Product Manager", icon: "📋", category: "Business", description: "Lead product strategy, roadmap, and cross-functional team collaboration." },
  { id: "data-engineer", title: "Data Engineer", icon: "🔧", category: "Engineering", description: "Build and maintain data pipelines and warehousing infrastructure." },
  { id: "ai-researcher", title: "AI Researcher", icon: "🧠", category: "Science", description: "Push the boundaries of artificial intelligence through novel research." },
  { id: "mobile-developer", title: "Mobile Developer", icon: "📱", category: "Tech", description: "Build native and cross-platform mobile apps for iOS and Android." },
  { id: "blockchain-dev", title: "Blockchain Developer", icon: "⛓️", category: "Tech", description: "Build decentralized applications and smart contracts." },
  { id: "game-developer", title: "Game Developer", icon: "🎮", category: "Creative", description: "Create interactive games using Unity, Unreal, or custom engines." },
  { id: "biotech-scientist", title: "Biotech Scientist", icon: "🧬", category: "Science", description: "Apply technology to biological systems for medical and agricultural advances." },
  { id: "healthcare-analyst", title: "Healthcare Data Analyst", icon: "🏥", category: "Healthcare", description: "Analyze health data to improve patient outcomes and operational efficiency." },
  { id: "digital-marketer", title: "Digital Marketer", icon: "📈", category: "Business", description: "Drive growth through SEO, social media, paid ads, and content strategy." },
  { id: "robotics-engineer", title: "Robotics Engineer", icon: "🦾", category: "Engineering", description: "Design and build robotic systems combining hardware and software." },
  { id: "quant-analyst", title: "Quantitative Analyst", icon: "📐", category: "Business", description: "Use mathematical models to analyze financial markets and manage risk." },
];

// ── Pulse dot component ──
const PulseDot = ({ color = "bg-primary" }: { color?: string }) => (
  <span className="relative flex h-3 w-3">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
    <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`} />
  </span>
);

// ── Glowing card wrapper ──
const GlowCard = ({ children, className = "", glowColor = "primary" }: { children: React.ReactNode; className?: string; glowColor?: string }) => (
  <motion.div
    whileHover={{ scale: 1.01, y: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`relative group ${className}`}
  >
    <div className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor}/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative glass-card rounded-2xl overflow-hidden">
      {children}
    </div>
  </motion.div>
);

export default function CareerRoadmapPage() {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CareerPath[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleStage = (i: number) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleTopic = (key: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Real-time AI search
  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setLoadingSearch(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { career: query, action: "suggest_careers" },
      });
      if (!error && data?.result) { setSearchResults(data.result); setShowDropdown(true); }
    } catch {} finally { setLoadingSearch(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSearchResults(searchQuery.trim()), 500);
    } else { setSearchResults([]); setShowDropdown(false); }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, fetchSearchResults]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const generatePDF = (rm: CareerRoadmap) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 0;
    const checkPage = (needed: number) => { if (y + needed > pageH - 25) { doc.addPage(); drawPageBorder(); y = 25; } };
    const drawPageBorder = () => { doc.setDrawColor(120, 80, 220); doc.setLineWidth(0.5); doc.roundedRect(8, 8, pageW - 16, pageH - 16, 3, 3); };
    const drawSectionHeader = (title: string, emoji: string) => {
      checkPage(18);
      doc.setFillColor(120, 80, 220);
      doc.roundedRect(20, y - 2, pageW - 40, 10, 2, 2, "F");
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text(`${emoji}  ${title}`, 26, y + 5);
      doc.setTextColor(40, 40, 40); y += 16;
    };

    drawPageBorder();
    doc.setFillColor(120, 80, 220); doc.rect(8, 8, pageW - 16, 50, "F");
    doc.setFontSize(28); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text(rm.career, pageW / 2, 32, { align: "center" });
    doc.setFontSize(13); doc.setFont("helvetica", "normal");
    doc.text("Career Roadmap & Skill Guide", pageW / 2, 44, { align: "center" });
    doc.setTextColor(40, 40, 40); y = 75;

    const overviewText = doc.splitTextToSize(rm.overview, pageW - 56);
    const boxH = overviewText.length * 5 + 12;
    doc.setFillColor(245, 243, 255); doc.roundedRect(20, y - 4, pageW - 40, boxH, 3, 3, "F");
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    doc.text(overviewText, 28, y + 4); y += boxH + 10;

    // Market insights
    if (rm.marketInsights) {
      drawSectionHeader("Market Insights", "📊");
      const mi = rm.marketInsights;
      const insights = [
        `Salary (USD): ${mi.averageSalaryUSD}`,
        `Salary (INR): ${mi.averageSalaryINR}`,
        `Demand: ${mi.demandLevel} | Growth: ${mi.growthRate}`,
        `Top Companies: ${mi.topHiringCompanies?.join(", ")}`,
      ];
      insights.forEach(text => {
        checkPage(8);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
        doc.text(text, 28, y + 3); y += 7;
      });
      y += 6;
    }

    drawSectionHeader("Required Skills", "⚡");
    rm.requiredSkills.forEach((sk, i) => {
      checkPage(16);
      if (i % 2 === 0) { doc.setFillColor(250, 248, 255); doc.roundedRect(22, y - 3, pageW - 44, 12, 1.5, 1.5, "F"); }
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 30, 120); doc.text(sk.name, 28, y + 3);
      const lc = sk.level === "Essential" ? [220, 50, 50] : sk.level === "Important" ? [200, 150, 20] : [50, 160, 80];
      doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(lc[0], lc[1], lc[2]); doc.text(`[${sk.level}]`, 85, y + 3);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
      doc.text(sk.description, 110, y + 3, { maxWidth: pageW - 140 }); y += 12;
    });
    y += 6;

    rm.stages.forEach((stage, si) => {
      checkPage(22);
      doc.setFillColor(120, 80, 220); doc.circle(28, y + 3, 5, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
      doc.text(`${si + 1}`, 28, y + 5, { align: "center" });
      doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(50, 30, 120);
      doc.text(stage.title, 38, y + 5);
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(140, 140, 140);
      doc.text(`(${stage.duration})`, 38 + doc.getTextWidth(stage.title) + 4, y + 5); y += 14;

      stage.topics.forEach((topic) => {
        checkPage(18);
        const topicDesc = doc.splitTextToSize(topic.description, pageW - 70);
        const cardH = topicDesc.length * 4.5 + 10;
        doc.setFillColor(248, 246, 255); doc.roundedRect(30, y - 2, pageW - 54, cardH, 2, 2, "F");
        doc.setFillColor(160, 120, 240); doc.rect(30, y - 2, 2, cardH, "F");
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(60, 40, 140);
        doc.text(`▪ ${topic.name}`, 36, y + 4);
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
        doc.text(topicDesc, 36, y + 10); y += cardH + 4;
      });

      if (si < rm.stages.length - 1) {
        checkPage(8); doc.setDrawColor(200, 180, 255); doc.setLineWidth(0.3);
        doc.setLineDashPattern([2, 2], 0); doc.line(28, y, 28, y + 6);
        doc.setLineDashPattern([], 0); y += 8;
      }
    });

    doc.addPage(); drawPageBorder();
    doc.setFillColor(120, 80, 220); doc.roundedRect(30, 60, pageW - 60, 50, 6, 6, "F");
    doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("You're ready to begin!", pageW / 2, 82, { align: "center" });
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Master these skills & topics step by step.", pageW / 2, 96, { align: "center" });
    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text("Generated by CareerCompass AI", pageW / 2, 130, { align: "center" });
    doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageW / 2, 138, { align: "center" });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(180, 180, 180);
      doc.text(`Page ${i} of ${totalPages}`, pageW / 2, pageH - 12, { align: "center" });
    }
    doc.save(`${rm.career.replace(/\s+/g, "_")}_Roadmap.pdf`);
    toast({ title: "PDF Downloaded!", description: `Your ${rm.career} roadmap has been saved.` });
  };

  const selectCareer = async (career: string) => {
    setSelectedCareer(career);
    setShowDropdown(false);
    setLoadingRoadmap(true);
    setRoadmap(null);
    setExpandedStages(new Set());
    setExpandedTopics(new Set());
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { career, action: "get_roadmap" },
      });
      if (error) throw error;
      setRoadmap(data.result);
      // Auto-expand first stage
      setExpandedStages(new Set([0]));
      if (user) {
        saveActivity({
          userId: user.id,
          activityType: "skill_explorer",
          title: `Career Roadmap: ${career}`,
          summary: `${data.result.totalMonths} month roadmap with ${data.result.stages?.length || 0} stages`,
          resultData: data.result,
        });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e.message || "Failed to generate roadmap.", variant: "destructive" });
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const allCategories = ["All", ...Array.from(new Set(exampleCareers.map((c) => c.category)))];
  const filtered = exampleCareers.filter((c) => {
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Loading animation phrases ──
  const loadingPhrases = [
    "Analyzing current job market trends...",
    "Fetching real salary data...",
    "Identifying top skills in demand...",
    "Building your personalized roadmap...",
    "Finding the best learning resources...",
  ];
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  useEffect(() => {
    if (!loadingRoadmap) return;
    const interval = setInterval(() => setLoadingPhrase(p => (p + 1) % loadingPhrases.length), 2500);
    return () => clearInterval(interval);
  }, [loadingRoadmap]);

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      <PageHeader icon={<Map className="h-7 w-7" />} title="AI Career Roadmap" subtitle="Get a real-time AI-generated roadmap with live market data, skills, topics & resources." />

      {!selectedCareer && !loadingRoadmap && (
        <div className="max-w-5xl mx-auto">
          {/* Search bar */}
          <AnimatedSection className="relative z-[60]">
            <div className="glass-card rounded-2xl p-5 mb-6" style={{ overflow: 'visible' }}>
              <div className="flex flex-col gap-4" style={{ overflow: 'visible' }}>
                <div className="relative z-[70]" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) selectCareer(searchQuery.trim()); }}
                    placeholder="Search any career path... (e.g., AI Engineer, UX Designer, Biomedical...)"
                    className="w-full rounded-xl bg-muted pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  />
                  {loadingSearch && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                  )}

                  <AnimatePresence>
                    {showDropdown && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute z-[80] top-full mt-2 left-0 right-0 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl shadow-primary/10 max-h-80 overflow-y-auto"
                      >
                        <div className="px-4 py-2.5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                          <p className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 animate-pulse" /> AI-suggested careers
                          </p>
                        </div>
                        {searchResults.map((r, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => selectCareer(r.title)}
                            className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-all duration-200 flex items-center gap-3 text-sm border-b border-border/30 last:border-0 group"
                          >
                            <span className="text-xl group-hover:scale-125 transition-transform duration-200">{r.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate group-hover:text-primary transition-colors">{r.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${categoryBg[r.category] || "bg-muted"}`}>
                              {r.category}
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {allCategories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        filterCategory === cat
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-muted border-border hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Career cards */}
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm text-muted-foreground">Popular Career Paths</h3>
            <PulseDot color="bg-green-500" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((career, i) => (
              <AnimatedSection key={career.id} delay={i * 0.04}>
                <motion.button
                  onClick={() => selectCareer(career.title)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left glass-card rounded-2xl overflow-hidden group relative"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500 rounded-2xl" />
                  <div className={`bg-gradient-to-r ${categoryColors[career.category] || "from-gray-500 to-gray-600"} p-3 flex items-center justify-between relative`}>
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{career.icon}</span>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full text-white backdrop-blur-sm">{career.category}</span>
                  </div>
                  <div className="p-4 relative">
                    <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2 group-hover:text-primary transition-colors duration-300">
                      {career.title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{career.description}</p>
                  </div>
                </motion.button>
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No matching careers found. Try searching above!</p>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loadingRoadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 max-w-lg mx-auto">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-secondary/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="font-display font-bold text-xl mb-3">Generating your roadmap...</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingPhrase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-muted-foreground text-sm"
            >
              {loadingPhrases[loadingPhrase]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Roadmap display */}
      <AnimatePresence>
        {roadmap && !loadingRoadmap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => { setSelectedCareer(null); setRoadmap(null); }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to careers
            </motion.button>

            {/* Overview */}
            <GlowCard>
              <div className="p-6">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-display font-bold text-2xl mb-3 gradient-text"
                >
                  {roadmap.career}
                </motion.h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{roadmap.overview}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                  <Clock className="h-3.5 w-3.5" /> Estimated: {roadmap.totalMonths} months
                </div>
              </div>
            </GlowCard>

            {/* Required Skills with sub-topics as bullet points */}
            <AnimatedSection delay={0.1}>
              <GlowCard>
                <div className="p-6">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" /> Required Skills
                  </h3>
                  <div className="space-y-4">
                    {roadmap.requiredSkills.map((skill, i) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{skill.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[skill.level] || "bg-muted"}`}>{skill.level}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{skill.description}</p>
                        {skill.subTopics && skill.subTopics.length > 0 && (
                          <ul className="space-y-1 ml-1">
                            {skill.subTopics.map((st, j) => (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.03 }}
                                className="text-xs text-muted-foreground flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> {st}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>

            {/* Stages - skills & topics only */}
            {roadmap.stages.map((stage, si) => (
              <AnimatedSection key={si} delay={si * 0.08}>
                <GlowCard>
                  <motion.button
                    onClick={() => toggleStage(si)}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/20 transition-colors"
                    style={{
                      background: `linear-gradient(135deg, ${stage.color}15, ${stage.color}05)`,
                      borderBottom: expandedStages.has(si) ? `2px solid ${stage.color}44` : "none",
                    }}
                  >
                    <motion.span
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                      style={{ background: stage.color, boxShadow: `0 4px 15px ${stage.color}40` }}
                    >
                      {si + 1}
                    </motion.span>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-base">{stage.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" /> {stage.duration} • {stage.topics.length} topics
                      </p>
                    </div>
                    <motion.div animate={{ rotate: expandedStages.has(si) ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {expandedStages.has(si) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-4">
                          {stage.topics.map((topic, ti) => (
                            <motion.div
                              key={ti}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: ti * 0.06 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/20 transition-all"
                            >
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <p className="font-semibold text-sm">{topic.name}</p>
                                {topic.difficulty && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${difficultyColors[topic.difficulty] || "bg-muted"}`}>
                                    {topic.difficulty}
                                  </span>
                                )}
                                {topic.estimatedHours && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {topic.estimatedHours}h
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{topic.description}</p>

                              {/* Sub-topics as bullet points - always visible */}
                              {topic.subTopics && topic.subTopics.length > 0 && (
                                <ul className="space-y-1.5 mb-3 ml-1">
                                  {topic.subTopics.map((st, j) => (
                                    <motion.li
                                      key={j}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.03 }}
                                      className="text-xs text-muted-foreground flex items-center gap-1.5"
                                    >
                                      <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> {st}
                                    </motion.li>
                                  ))}
                                </ul>
                              )}

                              {/* YouTube links */}
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { lang: "English", flag: "🇬🇧", suffix: " tutorial english" },
                                  { lang: "Hindi", flag: "🇮🇳", suffix: " tutorial hindi" },
                                  { lang: "Spanish", flag: "🇪🇸", suffix: " tutorial español" },
                                ].map((l) => (
                                  <motion.a
                                    key={l.lang}
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.youtubeSearch + l.suffix)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-destructive/10 text-destructive px-2.5 py-1 rounded-md flex items-center gap-1.5 hover:bg-destructive/20 transition-all"
                                  >
                                    <Youtube className="h-3 w-3" /> {l.flag} {l.lang}
                                  </motion.a>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlowCard>
              </AnimatedSection>
            ))}

            {/* Action buttons */}
            <AnimatedSection delay={0.2}>
              <GlowCard>
                <div className="p-6 flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => generatePDF(roadmap)}
                    className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/interview-coach")}
                    className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" /> Start Interview Prep
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedCareer(null); setRoadmap(null); }}
                      className="px-6 py-3 rounded-xl font-semibold text-sm bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Explore Another Career
                    </motion.button>
                  </div>
                </div>
              </GlowCard>
            </AnimatedSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
