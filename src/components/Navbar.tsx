import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl font-bold text-foreground">Minibørs</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#aksjer" className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
            Aksjer
          </a>
          <a href="#hvordan" className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
            Hvordan det virker
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Logg inn
              </Button>
              <Button size="sm" variant="default" onClick={() => navigate('/auth')}>
                Registrer deg
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
