import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface Investment {
  id: string;
  shares: number;
  price_per_share: number;
  total_amount: number;
  created_at: string;
  stock_id: string;
  stocks: {
    name: string;
    symbol: string;
    price: number;
    sector: string;
    logo_url: string;
  };
}

interface PublicPortfolio {
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
  investments: Investment[];
  total_value: number;
  total_gain: number;
}

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [publicPortfolios, setPublicPortfolios] = useState<PublicPortfolio[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyPortfolio();
      fetchPublicPortfolios();
    }
  }, [user]);

  const fetchMyPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          stocks (
            name,
            symbol,
            price,
            sector,
            logo_url
          )
        `)
        .eq('investor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          investor_id,
          shares,
          price_per_share,
          total_amount,
          created_at,
          stock_id,
          stocks (
            name,
            symbol,
            price,
            sector,
            logo_url
          )
        `)
        .neq('investor_id', user?.id);

      if (error) throw error;

      // Group by investor
      const grouped = data?.reduce((acc: any, inv: any) => {
        if (!acc[inv.investor_id]) {
          acc[inv.investor_id] = {
            user_id: inv.investor_id,
            investments: [],
            total_value: 0,
            total_gain: 0
          };
        }
        acc[inv.investor_id].investments.push(inv);
        const currentValue = inv.shares * inv.stocks.price;
        acc[inv.investor_id].total_value += currentValue;
        acc[inv.investor_id].total_gain += (currentValue - inv.total_amount);
        return acc;
      }, {});

      // Fetch profiles
      const userIds = Object.keys(grouped || {});
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const portfolios = Object.values(grouped || {}).map((portfolio: any) => ({
        ...portfolio,
        profiles: profiles?.find((p: any) => p.id === portfolio.user_id) || {}
      }));

      setPublicPortfolios(portfolios);
    } catch (error) {
      console.error('Error fetching public portfolios:', error);
    }
  };

  const calculateTotals = () => {
    let totalValue = 0;
    let totalInvested = 0;

    investments.forEach(inv => {
      const currentValue = inv.shares * Number(inv.stocks.price);
      totalValue += currentValue;
      totalInvested += Number(inv.total_amount);
    });

    const totalGain = totalValue - totalInvested;
    const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, totalGain, gainPercent };
  };

  const { totalValue, totalInvested, totalGain, gainPercent } = calculateTotals();

  const filteredPortfolios = publicPortfolios.filter(p =>
    p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="my-portfolio" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="my-portfolio">Min portefølje</TabsTrigger>
              <TabsTrigger value="explore">Utforsk andre</TabsTrigger>
            </TabsList>

            <TabsContent value="my-portfolio" className="space-y-6">
              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Total verdi</p>
                  <p className="text-3xl font-bold">{totalValue.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} NOK</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Investert</p>
                  <p className="text-3xl font-bold">{totalInvested.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} NOK</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">Gevinst/Tap</p>
                  <p className={`text-3xl font-bold flex items-center gap-2 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGain >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                    {totalGain.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} NOK
                  </p>
                  <p className={`text-sm mt-1 ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                  </p>
                </Card>
              </div>

              {/* Holdings List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Mine beholdninger</h2>
                {loading ? (
                  <p className="text-muted-foreground">Laster...</p>
                ) : investments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Du har ingen investeringer ennå</p>
                  </Card>
                ) : (
                  investments.map(inv => {
                    const currentValue = inv.shares * Number(inv.stocks.price);
                    const gain = currentValue - Number(inv.total_amount);
                    const gainPercent = (gain / Number(inv.total_amount)) * 100;

                    return (
                      <Card 
                        key={inv.id} 
                        className="p-6 hover:shadow-lg transition-all cursor-pointer touch-manipulation"
                        onClick={() => navigate(`/aksje/${inv.stock_id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {inv.stocks.logo_url ? (
                              <img src={inv.stocks.logo_url} alt={inv.stocks.name} className="h-12 w-12 rounded-lg object-cover" />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{inv.stocks.name}</h3>
                              <p className="text-sm text-muted-foreground">{inv.stocks.symbol} • {inv.shares} aksjer</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{currentValue.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} NOK</p>
                            <p className={`text-sm flex items-center gap-1 justify-end ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {gain >= 0 ? '+' : ''}{gain.toFixed(2)} NOK ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="explore" className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Søk etter investor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                {filteredPortfolios.map(portfolio => (
                  <Card key={portfolio.user_id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{portfolio.profiles?.full_name || 'Anonym'}</h3>
                        <p className="text-sm text-muted-foreground">{portfolio.investments.length} investeringer</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{portfolio.total_value.toLocaleString('nb-NO', { minimumFractionDigits: 2 })} NOK</p>
                        <p className={`text-sm ${portfolio.total_gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {portfolio.total_gain >= 0 ? '+' : ''}{portfolio.total_gain.toFixed(2)} NOK
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {portfolio.investments.map((inv: any) => (
                        <div 
                          key={inv.stock_id} 
                          className="text-sm p-2 bg-muted rounded cursor-pointer hover:bg-muted/80 touch-manipulation"
                          onClick={() => navigate(`/aksje/${inv.stock_id}`)}
                        >
                          <p className="font-medium">{inv.stocks.symbol}</p>
                          <p className="text-xs text-muted-foreground">{inv.shares} aksjer</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
