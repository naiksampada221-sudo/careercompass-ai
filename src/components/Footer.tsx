import { Compass, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-btn rounded-lg p-1.5">
                <Compass className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">CareerCompass AI</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Your AI-powered career companion. Analyze resumes, predict career paths, and prepare for interviews with cutting-edge AI technology.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Product</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/resume-analyzer" className="block hover:text-foreground transition-colors">Resume Analyzer</Link>
              <Link to="/ats-scanner" className="block hover:text-foreground transition-colors">ATS Scanner</Link>
              <Link to="/interview-coach" className="block hover:text-foreground transition-colors">Interview Coach</Link>
              <Link to="/career-roadmap" className="block hover:text-foreground transition-colors">Career Roadmap</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Company</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="#" className="block hover:text-foreground transition-colors">About</a>
              <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="block hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="block hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2026 CareerCompass AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
