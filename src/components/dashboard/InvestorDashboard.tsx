import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  available_shares: number;
  sector: string;
  description: string;
  logo_url: string;
}

interface Investment {
  id: string;
  shares: number;
  price_per_share: number;
  total_amount: number;
  created_at: string;
  stocks: {
    name: string;
    symbol: string;
  };
}

const InvestorDashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStocks();
    fetchInvestments();
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
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          stocks (
            name,
            symbol
          )
        `)
        .eq('investor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleInvest = async () => {
    if (!selectedStock || !shares || !user) return;

    const numShares = parseInt(shares);
    if (numShares <= 0 || numShares > selectedStock.available_shares) {
      toast({
        title: 'Ugyldig antall',
        description: 'Sjekk antall aksjer du ønsker å kjøpe.',
        variant: 'destructive',
      });
      return;
    }

    setInvesting(true);
    try {
      const totalAmount = numShares * selectedStock.price;

      // Create investment
      const { error: investError } = await supabase
        .from('investments')
        .insert({
          investor_id: user.id,
          stock_id: selectedStock.id,
          shares: numShares,
          price_per_share: selectedStock.price,
          total_amount: totalAmount,
        });

      if (investError) throw investError;

      // Update available shares
      const { error: updateError } = await supabase
        .from('stocks')
        .update({
          available_shares: selectedStock.available_shares - numShares,
        })
        .eq('id', selectedStock.id);

      if (updateError) throw updateError;

      toast({
        title: 'Investering vellykket!',
        description: `Du har kjøpt ${numShares} aksjer i ${selectedStock.name}.`,
      });

      setShares('');
      setSelectedStock(null);
      fetchStocks();
      fetchInvestments();
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setInvesting(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  return (
    <DashboardLayout title="Investor Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{investments.length}</CardTitle>
              <CardDescription>Mine investeringer</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{totalInvested.toLocaleString()} NOK</CardTitle>
              <CardDescription>Totalt investert</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stocks.length}</CardTitle>
              <CardDescription>Tilgjengelige aksjer</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* My Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Mine investeringer</CardTitle>
            <CardDescription>Oversikt over dine aksjeeierandeler</CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <p className="text-muted-foreground">Du har ingen investeringer ennå</p>
            ) : (
              <div className="space-y-3">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="p-4 border border-border rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{investment.stocks.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {investment.shares} aksjer • {investment.price_per_share} NOK per aksje
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{Number(investment.total_amount).toLocaleString()} NOK</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(investment.created_at).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Stocks */}
        <Card>
          <CardHeader>
            <CardTitle>Tilgjengelige aksjer</CardTitle>
            <CardDescription>Invester i lovende bedrifter</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Laster...</p>
            ) : stocks.length === 0 ? (
              <p className="text-muted-foreground">Ingen tilgjengelige aksjer for øyeblikket</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{stock.name}</h3>
                      <p className="text-sm text-muted-foreground">{stock.sector}</p>
                    </div>
                    <p className="text-sm line-clamp-2">{stock.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-2xl font-bold">{stock.price} NOK</p>
                        <p className="text-xs text-muted-foreground">
                          {stock.available_shares.toLocaleString()} aksjer tilgjengelig
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedStock(stock)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Invester
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invester i {selectedStock?.name}</DialogTitle>
                            <DialogDescription>
                              Hvor mange aksjer ønsker du å kjøpe?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Antall aksjer</Label>
                              <Input
                                type="number"
                                min="1"
                                max={selectedStock?.available_shares}
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                placeholder="Antall"
                              />
                              <p className="text-xs text-muted-foreground">
                                Maksimalt {selectedStock?.available_shares} aksjer tilgjengelig
                              </p>
                            </div>
                            {shares && selectedStock && (
                              <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Totalt beløp</p>
                                <p className="text-2xl font-bold">
                                  {(parseInt(shares) * selectedStock.price).toLocaleString()} NOK
                                </p>
                              </div>
                            )}
                            <Button onClick={handleInvest} disabled={investing || !shares} className="w-full">
                              {investing ? 'Behandler...' : 'Bekreft investering'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard;
