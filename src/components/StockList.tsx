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
    <section id="aksjer" className="py-20 px-4 bg-muted/30" data-tutorial="stocks">
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
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">Laster aksjer...</p>
          ) : stocks.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">Ingen aksjer tilgjengelig for øyeblikket</p>
          ) : (
            stocks.map((stock) => (
              <Card key={stock.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/auth')}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    {stock.logo_url ? (
                      <img
                        src={stock.logo_url}
                        alt={stock.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-1">{stock.name}</h3>
                    <p className="text-sm text-muted-foreground">{stock.sector}</p>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{Number(stock.price).toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">NOK</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {stock.available_shares.toLocaleString()} aksjer tilgjengelig
                    </p>

                    <Button className="w-full" variant="outline">
                      Se detaljer
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Se alle aksjer
          </Button>
        </div>
      </div>
    </section>
  );
};
