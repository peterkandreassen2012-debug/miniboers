import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, TrendingUp } from 'lucide-react';

interface StockRequest {
  id: string;
  name: string;
  symbol: string;
  price: number;
  total_shares: number;
  description: string;
  sector: string;
  status: string;
  created_at: string;
  company_id: string;
  companies: {
    name: string;
  };
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_stocks: 0, pending_requests: 0, total_investments: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_requests')
        .select(`
          *,
          companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const fetchStats = async () => {
    try {
      const [stocksRes, requestsRes, investmentsRes] = await Promise.all([
        supabase.from('stocks').select('id', { count: 'exact', head: true }),
        supabase.from('stock_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('investments').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        total_stocks: stocksRes.count || 0,
        pending_requests: requestsRes.count || 0,
        total_investments: investmentsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (request: StockRequest) => {
    try {
      // Create stock from request
      const { error: stockError } = await supabase
        .from('stocks')
        .insert({
          company_id: request.company_id,
          name: request.name,
          symbol: request.symbol,
          price: request.price,
          total_shares: request.total_shares,
          available_shares: request.total_shares,
          description: request.description,
          sector: request.sector,
        });

      if (stockError) throw stockError;

      // Update request status
      const { error: updateError } = await supabase
        .from('stock_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: 'Godkjent!',
        description: `${request.name} er nå tilgjengelig for investering.`,
      });

      fetchRequests();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('stock_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Avvist',
        description: 'Forespørselen er avvist.',
      });

      fetchRequests();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.total_stocks}</CardTitle>
              <CardDescription>Totale aksjer</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.pending_requests}</CardTitle>
              <CardDescription>Ventende forespørsler</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.total_investments}</CardTitle>
              <CardDescription>Totale investeringer</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Aksjeforespørsler</CardTitle>
            <CardDescription>
              Behandle forespørsler fra bedrifter om å legge ut aksjer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Laster...</p>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground">Ingen forespørsler ennå</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.companies.name} • {request.sector}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'pending'
                            ? 'secondary'
                            : request.status === 'approved'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {request.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                        {request.status === 'pending' ? 'Venter' : request.status === 'approved' ? 'Godkjent' : 'Avvist'}
                      </Badge>
                    </div>

                    <p className="text-sm">{request.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{request.price} NOK</span>
                      </div>
                      <div className="text-muted-foreground">
                        {request.total_shares.toLocaleString()} aksjer
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(request)}
                          size="sm"
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Godkjenn
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Avvis
                        </Button>
                      </div>
                    )}
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

export default AdminDashboard;
