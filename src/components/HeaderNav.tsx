import { ArrowLeft, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HeaderNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  if (isHome) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Go home"
      >
        <Home className="h-4 w-4" />
      </button>
    </div>
  );
}
