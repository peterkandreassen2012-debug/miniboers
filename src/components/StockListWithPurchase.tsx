import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Stock {
  id: string;
  name: string;
  sector: string;
  price: number;
  available_shares: number;
  logo_url: string;
  description: string;
}

export const StockListWithPurchase = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste aksjer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {loading ? (
          <p className="col-span-full text-center text-muted-foreground py-8">Laster aksjer...</p>
        ) : stocks.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">Ingen aksjer tilgjengelig for øyeblikket</p>
        ) : (
          stocks.map((stock) => (
            <Card key={stock.id} className="p-6 hover:shadow-lg transition-all touch-manipulation">
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
                  {stock.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{stock.description}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold">{Number(stock.price).toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">NOK</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {stock.available_shares.toLocaleString()} aksjer tilgjengelig
                  </p>

                  <Button 
                    className="w-full touch-manipulation" 
                    onClick={() => navigate(`/aksje/${stock.id}`)}
                  >
                    Se detaljer
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

    </>
  );
};
