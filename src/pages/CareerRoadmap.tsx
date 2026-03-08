import { useState, useEffect, useRef, useCallback } from "react";
import { Map, Loader2, BookOpen, Youtube, ExternalLink, Award, Wrench, FolderOpen, Clock, ChevronRight, Sparkles, ArrowLeft, Search, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveActivity } from "@/lib/saveActivity";

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
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoadingCareers(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap", {
        body: { action: "list_careers" },
      });
      if (error) throw error;
      setCareers(data.result || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load career paths.", variant: "destructive" });
    } finally {
      setLoadingCareers(false);
    }
  };

  const selectCareer = async (career: string) => {
    setSelectedCareer(career);
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

  const categories = ["All", ...Array.from(new Set(careers.map((c) => c.category)))];
  const filtered = careers.filter((c) => {
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
          {/* Search & Filter */}
          <AnimatedSection>
            <div className="glass-card rounded-2xl p-5 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search career paths..."
                    className="w-full rounded-xl bg-muted pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
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

          {loadingCareers ? (
            <div className="text-center py-20">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading career paths...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((career, i) => (
                <AnimatedSection key={career.id} delay={i * 0.05}>
                  <motion.button
                    onClick={() => selectCareer(career.title)}
                    whileHover={{ scale: 1.02 }}
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
                              <a
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.youtubeSearch)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-md flex items-center gap-1 hover:bg-destructive/20 transition-colors"
                              >
                                <Youtube className="h-3 w-3" /> YouTube
                              </a>
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

            <button
              onClick={() => { setSelectedCareer(null); setRoadmap(null); }}
              className="gradient-btn px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Explore Another Career
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
