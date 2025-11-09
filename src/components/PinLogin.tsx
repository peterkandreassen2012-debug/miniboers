import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PinLogin = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const hashPin = async (pin: string, userId: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePinComplete = async (value: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error('Ingen bruker funnet');
        navigate('/auth');
        return;
      }

      const pinHash = await hashPin(value, session.user.id);
      
      const { data, error } = await supabase
        .from('user_pins')
        .select('pin_hash')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        toast.error('Kunne ikke verifisere PIN');
        setPin('');
        setLoading(false);
        return;
      }

      if (data.pin_hash === pinHash) {
        toast.success('Velkommen tilbake!');
        navigate('/portfolio');
      } else {
        toast.error('Feil PIN-kode');
        setPin('');
      }
    } catch (error) {
      console.error('PIN login error:', error);
      toast.error('Innlogging feilet');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePassword = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Skriv inn PIN-kode</CardTitle>
          <CardDescription>
            Bruk din 6-sifret PIN for å logge inn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={setPin}
              onComplete={handlePinComplete}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={handleUsePassword}
            disabled={loading}
          >
            Bruk passord istedenfor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
