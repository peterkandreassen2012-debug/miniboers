import { Navbar } from "@/components/Navbar";
import { StockListWithPurchase } from "@/components/StockListWithPurchase";

const Aksjer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Tilgjengelige <span className="text-primary">aksjer</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Utforsk og invester i lovende norske bedrifter
            </p>
          </div>
          <StockListWithPurchase />
        </div>
      </div>
    </div>
  );
};

export default Aksjer;
