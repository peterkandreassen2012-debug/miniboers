import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, ArrowLeft, ShoppingCart, Building2, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  available_shares: number;
  total_shares: number;
  sector: string;
  description: string;
  logo_url: string;
  company_id: string;
  companies: {
    name: string;
    description: string;
    website: string;
    sector: string;
  };
}

const StockDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [shares, setShares] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchStock();
  }, [id]);

  const fetchStock = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select(`
          *,
          companies (
            name,
            description,
            website,
            sector
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setStock(data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste aksjedetaljer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!stock || !user) return;

    if (shares <= 0 || shares > stock.available_shares) {
      toast({
        title: 'Ugyldig antall',
        description: `Vennligst velg mellom 1 og ${stock.available_shares} aksjer`,
        variant: 'destructive',
      });
      return;
    }

    setPurchasing(true);

    try {
      const totalAmount = shares * Number(stock.price);

      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          investor_id: user.id,
          stock_id: stock.id,
          shares,
          price_per_share: stock.price,
          total_amount: totalAmount,
        });

      if (investmentError) throw investmentError;

      const { error: updateError } = await supabase
        .from('stocks')
        .update({ available_shares: stock.available_shares - shares })
        .eq('id', stock.id);

      if (updateError) throw updateError;

      toast({
        title: 'Kjøp vellykket!',
        description: `Du har kjøpt ${shares} aksjer i ${stock.name}`,
      });

      setShowBuyDialog(false);
      setShares(1);
      fetchStock();
      
      // Navigate to portfolio
      setTimeout(() => navigate('/portfolio'), 1000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-center text-muted-foreground">Laster...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <p className="text-center text-muted-foreground">Aksjen ble ikke funnet</p>
          </div>
        </div>
      </div>
    );
  }

  const totalCost = shares * Number(stock.price);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake
          </Button>

          {/* Stock Header */}
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {stock.logo_url ? (
                  <img src={stock.logo_url} alt={stock.name} className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold">{stock.name}</h1>
                  <p className="text-lg text-muted-foreground">{stock.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pris per aksje</p>
                <p className="text-4xl font-bold">{Number(stock.price).toFixed(2)} NOK</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Sektor</p>
                <p className="font-semibold">{stock.sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tilgjengelige aksjer</p>
                <p className="font-semibold">{stock.available_shares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Totale aksjer</p>
                <p className="font-semibold">{stock.total_shares.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markedsverdi</p>
                <p className="font-semibold">{(Number(stock.price) * stock.total_shares).toLocaleString('nb-NO', { minimumFractionDigits: 0 })} NOK</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full md:w-auto touch-manipulation" 
              onClick={() => setShowBuyDialog(true)}
              disabled={!user || stock.available_shares === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Kjøp aksjer
            </Button>
          </Card>

          {/* Description */}
          {stock.description && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Om aksjen</h2>
              <p className="text-muted-foreground">{stock.description}</p>
            </Card>
          )}

          {/* Company Info */}
          {stock.companies && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Om bedriften</h2>
              </div>
              <h3 className="font-semibold text-lg mb-2">{stock.companies.name}</h3>
              {stock.companies.description && (
                <p className="text-muted-foreground mb-4">{stock.companies.description}</p>
              )}
              {stock.companies.website && (
                <a 
                  href={stock.companies.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Besøk nettside
                </a>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kjøp aksjer i {stock.name}</DialogTitle>
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
                max={stock.available_shares}
                value={shares}
                onChange={(e) => setShares(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                Maks: {stock.available_shares} aksjer
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pris per aksje:</span>
                <span className="font-medium">{Number(stock.price).toFixed(2)} NOK</span>
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
            <Button variant="outline" onClick={() => setShowBuyDialog(false)} disabled={purchasing}>
              Avbryt
            </Button>
            <Button onClick={handlePurchase} disabled={purchasing}>
              {purchasing ? 'Behandler...' : 'Bekreft kjøp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockDetail;
