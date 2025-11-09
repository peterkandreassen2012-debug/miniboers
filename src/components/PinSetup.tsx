import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PinSetupProps {
  userId: string;
  onComplete: () => void;
}

export const PinSetup = ({ userId, onComplete }: PinSetupProps) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [loading, setLoading] = useState(false);

  const hashPin = async (pin: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePinComplete = async (value: string) => {
    if (step === 'enter') {
      setPin(value);
      setStep('confirm');
    } else {
      setConfirmPin(value);
      
      if (value !== pin) {
        toast.error('PIN-kodene er ikke like');
        setConfirmPin('');
        return;
      }

      setLoading(true);
      try {
        const pinHash = await hashPin(value);
        const { error } = await supabase
          .from('user_pins')
          .insert({ user_id: userId, pin_hash: pinHash });

        if (error) throw error;

        toast.success('PIN-kode opprettet');
        onComplete();
      } catch (error) {
        console.error('PIN setup error:', error);
        toast.error('Kunne ikke opprette PIN-kode');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Opprett PIN-kode</DialogTitle>
          <DialogDescription>
            {step === 'enter' 
              ? 'Opprett en 6-sifret PIN-kode for rask innlogging'
              : 'Bekreft PIN-koden din'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <InputOTP
            maxLength={6}
            value={step === 'enter' ? pin : confirmPin}
            onChange={step === 'enter' ? setPin : setConfirmPin}
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

          {step === 'confirm' && (
            <Button
              variant="ghost"
              onClick={() => {
                setStep('enter');
                setPin('');
                setConfirmPin('');
              }}
              disabled={loading}
            >
              Tilbake
            </Button>
          )}

          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
