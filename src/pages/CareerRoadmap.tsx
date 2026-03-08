import { useState, useEffect, useRef, useCallback } from "react";
import { Map, Loader2, BookOpen, Youtube, ExternalLink, Award, Wrench, FolderOpen, Clock, ChevronRight, Sparkles, ArrowLeft, Search, TrendingUp, Download, MessageSquare, GraduationCap } from "lucide-react";
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

interface CareerPath {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
}

interface RoadmapTopic {
  name: string;
  description: string;
  resources: string[];
  youtubeSearch: string;
}

interface RoadmapStage {
  title: string;
  duration: string;
  color: string;
  topics: RoadmapTopic[];
  projects: string[];
}

interface RequiredSkill {
  name: string;
  level: string;
  description: string;
}

interface Certification {
  name: string;
  provider: string;
  difficulty: string;
}

interface CareerRoadmap {
  career: string;
  overview: string;
  totalMonths: number;
  requiredSkills: RequiredSkill[];
  stages: RoadmapStage[];
  certifications: Certification[];
}

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
  Beginner: "bg-green-500/10 text-green-400",
  Intermediate: "bg-amber-500/10 text-amber-400",
  Advanced: "bg-red-500/10 text-red-400",
};

// Instant example career paths — shown immediately, no API call needed
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

export default function CareerRoadmapPage() {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CareerPath[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Real-time AI search for career paths
  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { career: query, action: "suggest_careers" },
      });
      if (!error && data?.result) {
        setSearchResults(data.result);
        setShowDropdown(true);
      }
    } catch {
      // silently fail for autocomplete
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSearchResults(searchQuery.trim()), 500);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, fetchSearchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const generatePDF = (rm: CareerRoadmap) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > 275) { doc.addPage(); y = 20; }
    };

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`${rm.career} — Career Roadmap`, pageW / 2, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Estimated: ${rm.totalMonths} months to become job-ready`, pageW / 2, y, { align: "center" });
    y += 8;
    doc.setDrawColor(100);
    doc.line(20, y, pageW - 20, y);
    y += 8;

    // Overview
    doc.setFontSize(10);
    const overviewLines = doc.splitTextToSize(rm.overview, pageW - 40);
    doc.text(overviewLines, 20, y);
    y += overviewLines.length * 5 + 6;

    // Required Skills
    checkPage(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Required Skills", 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    rm.requiredSkills.forEach((sk) => {
      checkPage(10);
      doc.text(`• ${sk.name} [${sk.level}] — ${sk.description}`, 24, y, { maxWidth: pageW - 48 });
      const lines = doc.splitTextToSize(`• ${sk.name} [${sk.level}] — ${sk.description}`, pageW - 48);
      y += lines.length * 4.5 + 2;
    });
    y += 4;

    // Stages
    rm.stages.forEach((stage, si) => {
      checkPage(25);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Stage ${si + 1}: ${stage.title} (${stage.duration})`, 20, y);
      y += 7;

      stage.topics.forEach((topic) => {
        checkPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`▸ ${topic.name}`, 24, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(topic.description, pageW - 52);
        doc.text(descLines, 28, y);
        y += descLines.length * 4.5 + 1;

        topic.resources.forEach((r) => {
          checkPage(6);
          doc.text(`  📖 ${r}`, 28, y);
          y += 4.5;
        });

        // YouTube links
        const ytBase = `https://youtube.com/results?search_query=`;
        checkPage(6);
        doc.setTextColor(200, 0, 0);
        doc.text(`  🎥 YouTube: English | Hindi | Spanish`, 28, y);
        doc.setTextColor(0);
        y += 6;
      });

      if (stage.projects.length > 0) {
        checkPage(10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Projects:", 24, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        stage.projects.forEach((p) => {
          checkPage(6);
          doc.text(`  🛠 ${p}`, 28, y);
          y += 4.5;
        });
      }
      y += 6;
    });

    // Certifications
    if (rm.certifications?.length > 0) {
      checkPage(20);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recommended Certifications", 20, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      rm.certifications.forEach((c) => {
        checkPage(6);
        doc.text(`🏅 ${c.name} — ${c.provider} [${c.difficulty}]`, 24, y);
        y += 5;
      });
    }

    // Footer
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("You're ready to start your journey!", pageW / 2, y, { align: "center" });
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by CareerCompass AI", pageW / 2, y, { align: "center" });

    doc.save(`${rm.career.replace(/\s+/g, "_")}_Roadmap.pdf`);
    toast({ title: "PDF Downloaded!", description: `Your ${rm.career} roadmap has been saved.` });
  };


  const selectCareer = async (career: string) => {
    setSelectedCareer(career);
    setShowDropdown(false);
    setLoadingRoadmap(true);
    setRoadmap(null);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { career, action: "get_roadmap" },
      });
      if (error) throw error;
      setRoadmap(data.result);
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
      toast({ title: "Error", description: "Failed to generate roadmap.", variant: "destructive" });
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

  return (
    <div className="page-container">
      <div className="mb-6"><BackButton /></div>
      <PageHeader icon={<Map className="h-7 w-7" />} title="AI Career Roadmap" subtitle="Choose what you want to become — get a real-time AI-generated roadmap with skills, topics & resources." />

      {!selectedCareer && !loadingRoadmap && (
        <div className="max-w-5xl mx-auto">
          {/* Search bar with real-time AI dropdown */}
          <AnimatedSection>
            <div className="glass-card rounded-2xl p-5 mb-6">
              <div className="flex flex-col gap-4">
                <div className="relative" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && searchQuery.trim()) selectCareer(searchQuery.trim()); }}
                    placeholder="Search any career path... (e.g., AI Engineer, UX Designer, Biomedical...)"
                    className="w-full rounded-xl bg-muted pl-11 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {loadingSearch && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}

                  {/* AI-powered search dropdown */}
                  <AnimatePresence>
                    {showDropdown && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-50 top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                      >
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> AI-suggested careers
                          </p>
                        </div>
                        {searchResults.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => selectCareer(r.title)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center gap-3 text-sm border-b border-border/50 last:border-0"
                          >
                            <span className="text-lg">{r.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{r.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${categoryBg[r.category] || "bg-muted"}`}>
                              {r.category}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category filter chips */}
                <div className="flex gap-2 flex-wrap">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        filterCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted border-border hover:border-primary/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Example career path cards — instant, no loading */}
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm text-muted-foreground">Popular Career Paths</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((career, i) => (
              <AnimatedSection key={career.id} delay={i * 0.04}>
                <motion.button
                  onClick={() => selectCareer(career.title)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left glass-card rounded-2xl overflow-hidden card-hover group"
                >
                  <div className={`bg-gradient-to-r ${categoryColors[career.category] || "from-gray-500 to-gray-600"} p-3 flex items-center justify-between`}>
                    <span className="text-2xl">{career.icon}</span>
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full text-white">{career.category}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
                      {career.title}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{career.description}</p>
                  </div>
                </motion.button>
              </AnimatedSection>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No matching careers found. Try searching above — AI will find related career paths!</p>
            </div>
          )}
        </div>
      )}

      {/* Loading roadmap */}
      {loadingRoadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 max-w-3xl mx-auto">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">Generating your roadmap...</h3>
          <p className="text-muted-foreground text-sm">AI is building a personalized career roadmap for "{selectedCareer}"</p>
        </motion.div>
      )}

      {/* Roadmap display */}
      <AnimatePresence>
        {roadmap && !loadingRoadmap && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
            <button
              onClick={() => { setSelectedCareer(null); setRoadmap(null); }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to careers
            </button>

            {/* Overview */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display font-bold text-2xl mb-3 gradient-text">{roadmap.career}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{roadmap.overview}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Estimated: {roadmap.totalMonths} months to become job-ready
              </div>
            </div>

            {/* Required Skills */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> Required Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmap.requiredSkills.map((skill) => (
                  <div key={skill.name} className="p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{skill.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[skill.level] || "bg-muted"}`}>{skill.level}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stages */}
            {roadmap.stages.map((stage, si) => (
              <AnimatedSection key={si} delay={si * 0.1}>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${stage.color}22, ${stage.color}11)`, borderBottom: `2px solid ${stage.color}44` }}>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: stage.color }}>{si + 1}</span>
                    <div>
                      <h3 className="font-display font-bold text-base">{stage.title}</h3>
                      <p className="text-xs text-muted-foreground">{stage.duration}</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Topics */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5" /> Topics to Learn
                      </h4>
                      <div className="space-y-3">
                        {stage.topics.map((topic, ti) => (
                          <div key={ti} className="p-4 rounded-xl bg-muted/30 border border-border">
                            <p className="font-semibold text-sm mb-1">{topic.name}</p>
                            <p className="text-xs text-muted-foreground mb-3">{topic.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              {topic.resources.map((r, ri) => (
                                <span key={ri} className="text-xs bg-primary/5 text-primary px-2 py-1 rounded-md flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" /> {r}
                                </span>
                              ))}
                            </div>
                            {/* YouTube links in 3 languages */}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {[
                                { lang: "English", flag: "🇬🇧", suffix: " tutorial english" },
                                { lang: "Hindi", flag: "🇮🇳", suffix: " tutorial hindi" },
                                { lang: "Spanish", flag: "🇪🇸", suffix: " tutorial español" },
                              ].map((l) => (
                                <a
                                  key={l.lang}
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.youtubeSearch + l.suffix)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-destructive/10 text-destructive px-2.5 py-1 rounded-md flex items-center gap-1.5 hover:bg-destructive/20 transition-colors"
                                >
                                  <Youtube className="h-3 w-3" />
                                  <span>{l.flag}</span>
                                  <span>{l.lang}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects */}
                    {stage.projects.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                          <FolderOpen className="h-3.5 w-3.5" /> Hands-On Projects
                        </h4>
                        <ul className="space-y-1">
                          {stage.projects.map((p, pi) => (
                            <li key={pi} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">▸</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}

            {/* Certifications */}
            {roadmap.certifications?.length > 0 && (
              <AnimatedSection>
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Recommended Certifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {roadmap.certifications.map((cert, ci) => (
                      <div key={ci} className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                        <p className="font-semibold text-sm mb-1">{cert.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{cert.provider}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[cert.difficulty] || "bg-muted"}`}>
                          {cert.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Action buttons */}
            <AnimatedSection delay={0.2}>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> What's Next?
                </h3>
                <p className="text-sm text-muted-foreground">
                  You now have a complete roadmap to become a <span className="font-semibold text-foreground">{roadmap.career}</span>. 
                  Download this roadmap as a PDF to track your progress, or start preparing for interviews right away!
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => generatePDF(roadmap)}
                    className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download Roadmap PDF
                  </button>
                  <button
                    onClick={() => navigate("/interview-coach")}
                    className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" /> Start Interview Prep
                  </button>
                  <button
                    onClick={() => { setSelectedCareer(null); setRoadmap(null); }}
                    className="px-6 py-3 rounded-xl font-semibold text-sm bg-muted hover:bg-muted/80 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" /> Explore Another Career
                  </button>
                </div>
              </div>
            </AnimatedSection>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
