import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StockList } from "@/components/StockList";
import { Onboarding } from "@/components/Onboarding";
import { Tutorial } from "@/components/Tutorial";

const Index = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const checkOnboarding = () => {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user has a PIN
        const { data: pinData } = await supabase
          .from('user_pins')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (pinData) {
          navigate('/pin-login');
        } else {
          navigate('/portfolio');
        }
      }
    };

    checkOnboarding();
    checkSession();
  }, [navigate]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    
    // Check if we should start tutorial
    const shouldStartTutorial = localStorage.getItem('startTutorial');
    if (shouldStartTutorial === 'true') {
      localStorage.removeItem('startTutorial');
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        setTimeout(() => setShowTutorial(true), 500);
      }
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      <Navbar />
      <HeroSection />
      <StockList />
    </div>
  );
};

export default Index;
