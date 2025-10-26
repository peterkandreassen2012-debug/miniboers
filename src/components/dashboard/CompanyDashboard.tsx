import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { CompanyApplicationForm } from './CompanyApplicationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Clock, Check, X, AlertCircle } from 'lucide-react';
import { z } from 'zod';

interface Company {
  id: string;
  name: string;
  description: string;
  sector: string;
  approved: boolean;
}

interface CompanyApplication {
  id: string;
  company_name: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
}

interface StockRequest {
  id: string;
  name: string;
  symbol: string;
  price: number;
  total_shares: number;
  status: string;
  created_at: string;
}

const stockRequestSchema = z.object({
  name: z.string().min(2, 'Navn må være minst 2 tegn').max(100),
  symbol: z.string().min(2, 'Symbol må være minst 2 tegn').max(10),
  price: z.number().positive('Pris må være positiv'),
  total_shares: z.number().int().positive('Antall aksjer må være positivt'),
  description: z.string().min(10, 'Beskrivelse må være minst 10 tegn').max(500),
  sector: z.string().min(2, 'Sektor må være minst 2 tegn').max(50),
});

const CompanyDashboard = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [application, setApplication] = useState<CompanyApplication | null>(null);
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    price: '',
    total_shares: '',
    description: '',
    sector: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompany();
    fetchApplication();
    fetchRequests();
  }, []);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCompany(data);
    } catch (error: any) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('company_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setApplication(data);
    } catch (error: any) {
      console.error('Error fetching application:', error);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;
    
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!companyData) return;

      const { data, error } = await supabase
        .from('stock_requests')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async () => {
    if (!company) {
      toast({
        title: 'Ingen bedrift',
        description: 'Du må opprette en bedriftsprofil først.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const validatedData = stockRequestSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
        total_shares: parseInt(formData.total_shares),
      });

      setSubmitting(true);

      const { error } = await supabase
        .from('stock_requests')
        .insert({
          company_id: company.id,
          name: validatedData.name,
          symbol: validatedData.symbol,
          price: validatedData.price,
          total_shares: validatedData.total_shares,
          description: validatedData.description,
          sector: validatedData.sector,
        });

      if (error) throw error;

      toast({
        title: 'Forespørsel sendt!',
        description: 'Din forespørsel er sendt til admin for godkjenning.',
      });

      setFormData({
        name: '',
        symbol: '',
        price: '',
        total_shares: '',
        description: '',
        sector: '',
      });

      fetchRequests();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Ugyldig input',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Feil',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Bedrift Dashboard">
        <p>Laster...</p>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout title="Bedrift Dashboard">
        <div className="space-y-6">
          {application ? (
            <Card>
              <CardHeader>
                <CardTitle>Din bedriftssøknad</CardTitle>
                <CardDescription>
                  Status på søknaden din
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{application.company_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Sendt {new Date(application.created_at).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        application.status === 'pending'
                          ? 'secondary'
                          : application.status === 'approved'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {application.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {application.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                      {application.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                      {application.status === 'pending' ? 'Venter på godkjenning' : application.status === 'approved' ? 'Godkjent' : 'Avvist'}
                    </Badge>
                  </div>
                  {application.status === 'rejected' && application.rejection_reason && (
                    <div className="space-y-3">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Avslag</AlertTitle>
                        <AlertDescription>{application.rejection_reason}</AlertDescription>
                      </Alert>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('application_complaints')
                              .insert({
                                application_id: application.id,
                                user_id: user!.id,
                                message: `Klage på avvist søknad: ${application.company_name}`
                              });

                            if (error) throw error;

                            toast({
                              title: 'Klage sendt',
                              description: 'Din klage er sendt til administrator for behandling.',
                            });
                          } catch (error: any) {
                            toast({
                              title: 'Feil',
                              description: error.message,
                              variant: 'destructive',
                            });
                          }
                        }}
                      >
                        Klage på avslag
                      </Button>
                    </div>
                  )}
                  {application.status === 'pending' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Venter på godkjenning</AlertTitle>
                      <AlertDescription>
                        Din søknad er under behandling. Du vil få beskjed når en administrator har behandlet søknaden.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <CompanyApplicationForm onApplicationSubmitted={fetchApplication} />
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Bedrift Dashboard">
      <div className="space-y-8">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>{company.sector}</CardDescription>
              </div>
              <Badge variant={company.approved ? 'default' : 'secondary'}>
                {company.approved ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Godkjent
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Venter på godkjenning
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{company.description}</p>
          </CardContent>
        </Card>

        {!company.approved && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Bedriften er ikke godkjent ennå</AlertTitle>
            <AlertDescription>
              Du kan ikke legge til aksjer før bedriften din er godkjent av en administrator.
            </AlertDescription>
          </Alert>
        )}

        {/* New Request Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto" disabled={!company.approved}>
              <Plus className="h-4 w-4 mr-2" />
              Legg til aksje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send aksjeforespørsel</DialogTitle>
              <DialogDescription>
                Fyll ut informasjon om aksjen du ønsker å liste. Admin vil behandle forespørselen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Aksjenavn</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Min Bedrift AS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Aksjekode</Label>
                  <Input
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="MINE"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pris per aksje (NOK)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Antall aksjer</Label>
                  <Input
                    type="number"
                    value={formData.total_shares}
                    onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sektor</Label>
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Teknologi, Finans, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Beskrivelse</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beskriv bedriften og aksjen..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitRequest} disabled={submitting} className="w-full">
                {submitting ? 'Sender...' : 'Send forespørsel'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Mine forespørsler</CardTitle>
            <CardDescription>Status på dine aksjeforespørsler</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-muted-foreground">Ingen forespørsler ennå</p>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-border rounded-lg flex items-start justify-between"
                  >
                    <div>
                      <h3 className="font-semibold">{request.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.symbol} • {request.price} NOK • {request.total_shares.toLocaleString()} aksjer
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.created_at).toLocaleDateString('no-NO')}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
