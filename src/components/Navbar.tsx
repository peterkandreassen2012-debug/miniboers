import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleShowGuide = () => {
    localStorage.removeItem('hasSeenOnboarding');
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border md:top-4 md:left-4 md:right-4 md:rounded-2xl md:border md:shadow-xl">
      <div className="container mx-auto px-3 md:px-6 h-14 md:h-16 flex items-center justify-between touch-manipulation">
        <div 
          className="flex items-center gap-2 cursor-pointer touch-manipulation flex-shrink-0" 
          onClick={() => {
            navigate('/');
            setIsOpen(false);
          }}
          data-tutorial="logo"
        >
          <span className="text-lg md:text-2xl font-bold text-foreground whitespace-nowrap">Minibørs</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => navigate('/aksjer')} 
            className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            data-tutorial="marketplace"
          >
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
          <button onClick={handleShowGuide} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            Guide
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0" data-tutorial="auth">
          {user ? (
            <Button size="sm" variant="ghost" onClick={signOut} className="touch-manipulation text-xs md:text-sm">
              <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Logg ut</span>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex touch-manipulation text-xs md:text-sm">
                Logg inn
              </Button>
              <Button size="sm" variant="default" onClick={() => navigate('/auth')} className="touch-manipulation text-xs md:text-sm whitespace-nowrap">
                Registrer
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
                <button 
                  onClick={() => {
                    handleShowGuide();
                    setIsOpen(false);
                  }} 
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation flex items-center gap-2"
                >
                  <HelpCircle className="h-5 w-5" />
                  Vis guide
                </button>
                {user ? (
                  <button 
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-left py-3 touch-manipulation flex items-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Logg ut
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
