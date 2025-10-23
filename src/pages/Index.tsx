import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StockList } from "@/components/StockList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StockList />
    </div>
  );
};

export default Index;
