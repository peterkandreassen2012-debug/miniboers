import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border md:top-4 md:left-4 md:right-4 md:rounded-2xl md:border md:shadow-xl safe-top">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between touch-manipulation">
        <div className="flex items-center gap-2 cursor-pointer touch-manipulation" onClick={() => {
          navigate('/');
          setIsOpen(false);
        }}>
          <span className="text-xl md:text-2xl font-bold text-foreground">Minibørs</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/aksjer')} className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
            Markedsplass
          </button>
          {user && (
            <button onClick={() => navigate('/portfolio')} className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
              Portefølje
            </button>
          )}
          <button onClick={() => navigate('/hvordan-virker-det')} className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
            Hvordan det virker
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')} className="touch-manipulation">
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex touch-manipulation">
                Logg inn
              </Button>
              <Button size="sm" variant="default" onClick={() => navigate('/auth')} className="touch-manipulation">
                Registrer deg
              </Button>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="touch-manipulation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                <button 
                  onClick={() => {
                    navigate('/aksjer');
                    setIsOpen(false);
                  }} 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation"
                >
                  Markedsplass
                </button>
                {user && (
                  <button 
                    onClick={() => {
                      navigate('/portfolio');
                      setIsOpen(false);
                    }} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation"
                  >
                    Portefølje
                  </button>
                )}
                <button 
                  onClick={() => {
                    navigate('/hvordan-virker-det');
                    setIsOpen(false);
                  }} 
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation"
                >
                  Hvordan det virker
                </button>
                {user ? (
                  <button 
                    onClick={() => {
                      navigate('/dashboard');
                      setIsOpen(false);
                    }} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigate('/auth');
                      setIsOpen(false);
                    }} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation"
                  >
                    Logg inn
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
