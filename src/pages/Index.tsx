import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StockList } from "@/components/StockList";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
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

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StockList />
    </div>
  );
};

export default Index;
