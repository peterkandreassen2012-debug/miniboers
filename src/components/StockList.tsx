import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

// Mock data - vil erstattes med ekte data senere
const mockStocks = [
  {
    id: 1,
    name: "TechStart AS",
    sector: "Teknologi",
    price: 125.50,
    change: 5.2,
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "GreenEnergy Norge",
    sector: "Fornybar energi",
    price: 89.75,
    change: -2.1,
    logo: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "HealthTech Solutions",
    sector: "Helse",
    price: 210.00,
    change: 8.5,
    logo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "FinTech Innovations",
    sector: "Finans",
    price: 156.25,
    change: 3.7,
    logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop",
  },
];

export const StockList = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tilgjengelige aksjer
          </h2>
          <p className="text-muted-foreground text-lg">
            Utforsk vårt utvalg av håndplukkede private aksjer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mockStocks.map((stock) => (
            <Card key={stock.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <img
                    src={stock.logo}
                    alt={stock.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stock.change > 0 ? "text-success" : "text-destructive"
                  }`}>
                    {stock.change > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(stock.change)}%
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-1">{stock.name}</h3>
                  <p className="text-sm text-muted-foreground">{stock.sector}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold">{stock.price}</span>
                    <span className="text-sm text-muted-foreground">NOK</span>
                  </div>

                  <Button className="w-full" variant="outline">
                    Se detaljer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Se alle aksjer
          </Button>
        </div>
      </div>
    </section>
  );
};
