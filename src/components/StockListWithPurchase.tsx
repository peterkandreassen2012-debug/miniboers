import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState<number>(1);
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handlePurchase = async () => {
    if (!selectedStock || !user) return;

    if (shares <= 0 || shares > selectedStock.available_shares) {
      toast({
        title: 'Ugyldig antall',
        description: `Vennligst velg mellom 1 og ${selectedStock.available_shares} aksjer`,
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);

    try {
      const totalAmount = shares * Number(selectedStock.price);

      // Insert investment
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          investor_id: user.id,
          stock_id: selectedStock.id,
          shares,
          price_per_share: selectedStock.price,
          total_amount: totalAmount,
        });

      if (investmentError) throw investmentError;

      // Update stock available shares
      const { error: updateError } = await supabase
        .from('stocks')
        .update({ available_shares: selectedStock.available_shares - shares })
        .eq('id', selectedStock.id);

      if (updateError) throw updateError;

      toast({
        title: 'Kjøp vellykket!',
        description: `Du har kjøpt ${shares} aksjer i ${selectedStock.name}`,
      });

      setSelectedStock(null);
      setShares(1);
      fetchStocks();
    } catch (error: any) {
      toast({
        title: 'Kjøp feilet',
        description: error.message || 'Kunne ikke gjennomføre kjøpet',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(false);
    }
  };

  const totalCost = selectedStock ? shares * Number(selectedStock.price) : 0;

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
                    onClick={() => setSelectedStock(stock)}
                    disabled={!user}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Kjøp aksjer
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kjøp aksjer i {selectedStock?.name}</DialogTitle>
            <DialogDescription>
              Velg antall aksjer du ønsker å kjøpe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Antall aksjer</Label>
              <Input
                id="shares"
                type="number"
                min={1}
                max={selectedStock?.available_shares}
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Maks: {selectedStock?.available_shares} aksjer
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pris per aksje:</span>
                <span className="font-medium">{selectedStock && Number(selectedStock.price).toFixed(2)} NOK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Antall aksjer:</span>
                <span className="font-medium">{shares}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Totalt:</span>
                <span className="font-bold text-lg">{totalCost.toFixed(2)} NOK</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedStock(null)} disabled={purchasing}>
              Avbryt
            </Button>
            <Button onClick={handlePurchase} disabled={purchasing}>
              {purchasing ? 'Behandler...' : 'Bekreft kjøp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
