import { Button } from "@/components/ui/button";
import logo from "@/assets/minibors-logo.png";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Minibørs" className="h-8 w-auto" />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Aksjer
          </a>
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Om oss
          </a>
          <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Hvordan det virker
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Logg inn
          </Button>
          <Button size="sm">
            Registrer deg
          </Button>
        </div>
      </div>
    </nav>
  );
};
