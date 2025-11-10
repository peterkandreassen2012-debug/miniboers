import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Stock {
  id: string;
  name: string;
  sector: string;
  price: number;
  available_shares: number;
  logo_url: string;
}

export const StockList = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .gt('available_shares', 0)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="aksjer" className="py-12 md:py-20 px-4 bg-muted/30" data-tutorial="stocks">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12 px-2">
          <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
            Tilgjengelige aksjer
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg">
            Utforsk vårt utvalg av håndplukkede private aksjer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground text-sm">Laster aksjer...</p>
          ) : stocks.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground text-sm">Ingen aksjer tilgjengelig for øyeblikket</p>
          ) : (
            stocks.map((stock) => (
              <Card key={stock.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => navigate('/auth')}>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start justify-between">
                    {stock.logo_url ? (
                      <img
                        src={stock.logo_url}
                        alt={stock.name}
                        className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-base md:text-lg mb-1 truncate">{stock.name}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stock.sector}</p>
                  </div>

                  <div className="pt-3 md:pt-4 border-t border-border">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl md:text-2xl font-bold">{Number(stock.price).toFixed(2)}</span>
                      <span className="text-xs md:text-sm text-muted-foreground">NOK</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 md:mb-4">
                      {stock.available_shares.toLocaleString()} aksjer tilgjengelig
                    </p>

                    <Button className="w-full text-xs md:text-sm" variant="outline" size="sm">
                      Se detaljer
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Button size="default" variant="outline" onClick={() => navigate('/auth')} className="text-xs md:text-base touch-manipulation">
            Se alle aksjer
          </Button>
        </div>
      </div>
    </section>
  );
};
