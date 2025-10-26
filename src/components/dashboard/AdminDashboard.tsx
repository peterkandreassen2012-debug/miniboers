import { useState, useEffect } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, TrendingUp, Plus, Building2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const stockSchema = z.object({
  name: z.string().trim().min(2, 'Navn må være minst 2 tegn').max(100, 'Navn kan ikke være mer enn 100 tegn'),
  symbol: z.string().trim().min(1, 'Symbol er påkrevd').max(10, 'Symbol kan ikke være mer enn 10 tegn').regex(/^[A-Z0-9]+$/, 'Symbol må kun inneholde store bokstaver og tall'),
  price: z.number().positive('Pris må være positiv').max(1000000, 'Pris kan ikke overstige 1,000,000'),
  total_shares: z.number().int('Antall aksjer må være et heltall').positive('Antall aksjer må være positivt').max(1000000000, 'Antall aksjer kan ikke overstige 1,000,000,000'),
  available_shares: z.number().int().positive().max(1000000000),
  description: z.string().trim().max(2000, 'Beskrivelse kan ikke være mer enn 2000 tegn').optional(),
  sector: z.string().trim().min(2, 'Sektor må være minst 2 tegn').max(50, 'Sektor kan ikke være mer enn 50 tegn'),
  company_id: z.string().uuid('Ugyldig selskap ID')
});

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

interface CompanyApplication {
  id: string;
  user_id: string;
  company_name: string;
  org_number?: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  sector: string;
  description: string;
  status: string;
  created_at: string;
  rejection_reason?: string;
  complaint_count?: number;
}

const AdminDashboard = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_stocks: 0, pending_requests: 0, total_investments: 0, pending_applications: 0 });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newStock, setNewStock] = useState({
    name: '',
    symbol: '',
    price: '',
    total_shares: '',
    description: '',
    sector: '',
    company_id: '',
  });
  const [newCompany, setNewCompany] = useState({
    name: '',
    sector: '',
    description: '',
    website: '',
    owner_email: '',
  });
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchApplications();
    fetchStats();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

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

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('company_applications')
        .select(`
          *,
          complaint_count:application_complaints(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include complaint count
      const transformedData = data?.map(app => ({
        ...app,
        complaint_count: app.complaint_count?.[0]?.count || 0
      })) || [];
      
      setApplications(transformedData);
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const [stocksRes, requestsRes, investmentsRes, applicationsRes] = await Promise.all([
        supabase.from('stocks').select('id', { count: 'exact', head: true }),
        supabase.from('stock_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('investments').select('id', { count: 'exact', head: true }),
        supabase.from('company_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        total_stocks: stocksRes.count || 0,
        pending_requests: requestsRes.count || 0,
        total_investments: investmentsRes.count || 0,
        pending_applications: applicationsRes.count || 0,
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

  const handleApproveApplication = async (application: CompanyApplication) => {
    try {
      // Create or update company
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', application.user_id)
        .single();

      if (existingCompany) {
        // Update existing company to approved
        const { error: updateError } = await supabase
          .from('companies')
          .update({
            approved: true,
            approved_at: new Date().toISOString(),
            approved_by: user!.id,
          })
          .eq('id', existingCompany.id);

        if (updateError) throw updateError;
      } else {
        // Create new company
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            owner_id: application.user_id,
            name: application.company_name,
            sector: application.sector,
            description: application.description,
            website: application.website,
            approved: true,
            approved_at: new Date().toISOString(),
            approved_by: user!.id,
          } as any);

        if (companyError) throw companyError;
      }

      // Update application status
      const { error: appError } = await supabase
        .from('company_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id,
        } as any)
        .eq('id', application.id);

      if (appError) throw appError;

      toast({
        title: 'Godkjent!',
        description: `${application.company_name} er nå godkjent.`,
      });

      fetchApplications();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication || !rejectionReason) return;

    try {
      const { error } = await supabase
        .from('company_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user!.id,
          rejection_reason: rejectionReason,
        } as any)
        .eq('id', selectedApplication);

      if (error) throw error;

      toast({
        title: 'Avvist',
        description: 'Søknaden er avvist.',
      });

      setRejectDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason('');
      fetchApplications();
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Feil',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreateStock = async () => {
    try {
      const price = parseFloat(newStock.price);
      const totalShares = parseInt(newStock.total_shares);

      // Validate input data with zod schema
      const validatedData = stockSchema.parse({
        name: newStock.name,
        symbol: newStock.symbol.toUpperCase(),
        price,
        total_shares: totalShares,
        available_shares: totalShares,
        description: newStock.description || undefined,
        sector: newStock.sector,
        company_id: newStock.company_id
      });

      // Verify company exists and is approved
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, approved')
        .eq('id', validatedData.company_id)
        .single();

      if (companyError || !company) {
        toast({
          title: 'Feil',
          description: 'Ugyldig selskap valgt.',
          variant: 'destructive',
        });
        return;
      }

      if (!company.approved) {
        toast({
          title: 'Feil',
          description: 'Selskapet må være godkjent før aksjer kan opprettes.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('stocks').insert({
        company_id: validatedData.company_id,
        name: validatedData.name,
        symbol: validatedData.symbol,
        price: validatedData.price,
        total_shares: validatedData.total_shares,
        available_shares: validatedData.available_shares,
        description: validatedData.description,
        sector: validatedData.sector,
      });

      if (error) throw error;

      toast({
        title: 'Suksess!',
        description: 'Aksjen er opprettet.',
      });

      setCreateDialogOpen(false);
      setNewStock({
        name: '',
        symbol: '',
        price: '',
        total_shares: '',
        description: '',
        sector: '',
        company_id: '',
      });
      fetchStats();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Valideringsfeil',
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
    }
  };

  const handleCreateCompany = async () => {
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newCompany.owner_email)
        .single();

      if (profileError || !profile) {
        toast({
          title: 'Feil',
          description: 'Fant ikke bruker med denne e-postadressen.',
          variant: 'destructive',
        });
        return;
      }

      // Create company
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          owner_id: profile.id,
          name: newCompany.name,
          sector: newCompany.sector,
          description: newCompany.description,
          website: newCompany.website,
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user!.id,
        } as any);

      if (companyError) throw companyError;

      // Assign company role to user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: 'company'
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        console.error('Role assignment error:', roleError);
      }

      toast({
        title: 'Suksess!',
        description: 'Bedriftsprofil opprettet.',
      });

      setCreateCompanyDialogOpen(false);
      setNewCompany({
        name: '',
        sector: '',
        description: '',
        website: '',
        owner_email: '',
      });
      fetchCompanies();
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.total_stocks}</CardTitle>
              <CardDescription>Totale aksjer</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.pending_requests}</CardTitle>
              <CardDescription>Ventende aksjeforespørsler</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.pending_applications}</CardTitle>
              <CardDescription>Ventende bedriftssøknader</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{stats.total_investments}</CardTitle>
              <CardDescription>Totale investeringer</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">
              <Building2 className="h-4 w-4 mr-2" />
              Bedriftssøknader
            </TabsTrigger>
            <TabsTrigger value="stocks">
              <TrendingUp className="h-4 w-4 mr-2" />
              Aksjeforespørsler
            </TabsTrigger>
          </TabsList>

          {/* Company Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {/* Create Company Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Opprett bedriftsprofil</CardTitle>
                    <CardDescription>Opprett en godkjent bedriftsprofil direkte</CardDescription>
                  </div>
                  <Dialog open={createCompanyDialogOpen} onOpenChange={setCreateCompanyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ny bedrift
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Opprett ny bedriftsprofil</DialogTitle>
                        <DialogDescription>
                          Opprett en godkjent bedriftsprofil for en eksisterende bruker
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>E-postadresse til eier</Label>
                          <Input
                            type="email"
                            value={newCompany.owner_email}
                            onChange={(e) => setNewCompany({ ...newCompany, owner_email: e.target.value })}
                            placeholder="eier@bedrift.no"
                          />
                          <p className="text-xs text-muted-foreground">
                            Brukeren må allerede være registrert i systemet
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Bedriftsnavn</Label>
                          <Input
                            value={newCompany.name}
                            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                            placeholder="MiniBørs AS"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Sektor</Label>
                          <Input
                            value={newCompany.sector}
                            onChange={(e) => setNewCompany({ ...newCompany, sector: e.target.value })}
                            placeholder="Teknologi, Finans, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nettside (valgfritt)</Label>
                          <Input
                            value={newCompany.website}
                            onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                            placeholder="https://bedrift.no"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Beskrivelse</Label>
                          <Textarea
                            value={newCompany.description}
                            onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                            placeholder="Beskriv bedriften..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleCreateCompany} className="w-full">
                          Opprett bedriftsprofil
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bedriftssøknader</CardTitle>
                <CardDescription>
                  Behandle søknader fra bedrifter om å bli godkjent på plattformen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Laster...</p>
                ) : applications.length === 0 ? (
                  <p className="text-muted-foreground">Ingen søknader ennå</p>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div
                        key={application.id}
                        className="p-4 border border-border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{application.company_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {application.sector} • Kontakt: {application.contact_person}
                            </p>
                            {application.org_number && (
                              <p className="text-sm text-muted-foreground">Org.nr: {application.org_number}</p>
                            )}
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
                            {application.status === 'pending' ? 'Venter' : application.status === 'approved' ? 'Godkjent' : 'Avvist'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm">{application.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>📧 {application.email}</span>
                            {application.phone && <span>📞 {application.phone}</span>}
                            {application.website && (
                              <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                🌐 Nettside
                              </a>
                            )}
                          </div>
                          {application.status === 'rejected' && application.complaint_count && application.complaint_count > 0 && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Klage mottatt</AlertTitle>
                              <AlertDescription>
                                Bedriften har sendt inn {application.complaint_count} klage{application.complaint_count > 1 ? 'r' : ''} på avslaget.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {application.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleApproveApplication(application)}
                              size="sm"
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Godkjenn
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedApplication(application.id);
                                setRejectDialogOpen(true);
                              }}
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
          </TabsContent>

          {/* Stock Requests Tab */}
          <TabsContent value="stocks" className="space-y-4">
            {/* Create Stock */}
            <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Opprett aksje</CardTitle>
                <CardDescription>Lag nye aksjer direkte som admin</CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ny aksje
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Opprett ny aksje</DialogTitle>
                    <DialogDescription>
                      Fyll ut informasjonen for den nye aksjen
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Selskapsnavn</Label>
                        <select
                          className="w-full p-2 border rounded-md"
                          value={newStock.company_id}
                          onChange={(e) => setNewStock({ ...newStock, company_id: e.target.value })}
                        >
                          <option value="">Velg selskap</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Aksjenavn</Label>
                        <Input
                          value={newStock.name}
                          onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
                          placeholder="f.eks. MiniBørs AS"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input
                          value={newStock.symbol}
                          onChange={(e) => setNewStock({ ...newStock, symbol: e.target.value })}
                          placeholder="f.eks. MINI"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sektor</Label>
                        <Input
                          value={newStock.sector}
                          onChange={(e) => setNewStock({ ...newStock, sector: e.target.value })}
                          placeholder="f.eks. Teknologi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pris per aksje (NOK)</Label>
                        <Input
                          type="number"
                          value={newStock.price}
                          onChange={(e) => setNewStock({ ...newStock, price: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Antall aksjer</Label>
                        <Input
                          type="number"
                          value={newStock.total_shares}
                          onChange={(e) => setNewStock({ ...newStock, total_shares: e.target.value })}
                          placeholder="1000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Beskrivelse</Label>
                      <Textarea
                        value={newStock.description}
                        onChange={(e) => setNewStock({ ...newStock, description: e.target.value })}
                        placeholder="Beskriv selskapet og aksjen..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleCreateStock} className="w-full">
                      Opprett aksje
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        </Card>

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
          </TabsContent>
        </Tabs>

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avvis bedriftssøknad</DialogTitle>
              <DialogDescription>
                Skriv en begrunnelse for hvorfor søknaden avvises
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Begrunnelse</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Beskriv hvorfor søknaden avvises..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectApplication}
                  disabled={!rejectionReason}
                  variant="destructive"
                  className="flex-1"
                >
                  Avvis søknad
                </Button>
                <Button
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setSelectedApplication(null);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
