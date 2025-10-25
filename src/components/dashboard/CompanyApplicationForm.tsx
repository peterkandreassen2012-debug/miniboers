import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const applicationSchema = z.object({
  company_name: z.string().min(2, 'Bedriftsnavn må være minst 2 tegn').max(100),
  org_number: z.string().optional(),
  contact_person: z.string().min(2, 'Kontaktperson må være minst 2 tegn').max(100),
  email: z.string().email('Ugyldig e-postadresse'),
  phone: z.string().optional(),
  website: z.string().url('Ugyldig URL').optional().or(z.literal('')),
  sector: z.string().min(2, 'Sektor må være minst 2 tegn').max(50),
  description: z.string().min(50, 'Beskrivelse må være minst 50 tegn').max(1000),
});

export const CompanyApplicationForm = ({ onApplicationSubmitted }: { onApplicationSubmitted: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    org_number: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    sector: '',
    description: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = applicationSchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase
        .from('company_applications')
        .insert({
          user_id: user!.id,
          ...validatedData,
        } as any);

      if (error) throw error;

      toast({
        title: 'Søknad sendt!',
        description: 'Din bedriftssøknad er sendt til admin for godkjenning.',
      });

      setFormData({
        company_name: '',
        org_number: '',
        contact_person: '',
        email: '',
        phone: '',
        website: '',
        sector: '',
        description: '',
      });

      onApplicationSubmitted();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Søk om å bli godkjent bedrift</CardTitle>
        <CardDescription>
          Fyll ut skjemaet for å søke om å bli en godkjent bedrift på Minibørs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Bedriftsnavn *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Min Bedrift AS"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org_number">Organisasjonsnummer</Label>
              <Input
                id="org_number"
                value={formData.org_number}
                onChange={(e) => setFormData({ ...formData, org_number: e.target.value })}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Kontaktperson *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Ola Nordmann"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="kontakt@minbedrift.no"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+47 123 45 678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Nettside</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://minbedrift.no"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sektor *</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              placeholder="f.eks. Teknologi, Finans, Eiendom"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse av bedriften *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beskriv bedriften, hva dere driver med, historikk, fremtidsplaner, etc. (minimum 50 tegn)"
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 tegn (minimum 50)
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Sender søknad...' : 'Send søknad'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
