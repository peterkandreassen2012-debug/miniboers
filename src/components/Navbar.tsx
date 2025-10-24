import { Button } from "@/components/ui/button";
import logo from "@/assets/minibors-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-lg border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Minibørs" className="h-10 w-auto" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#aksjer" className="text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors">
            Aksjer
          </a>
          <a href="#hvordan" className="text-sm font-medium text-primary-foreground hover:text-primary-foreground/80 transition-colors">
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
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/auth')}>
                Logg inn
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('/auth')}>
                Registrer deg
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
