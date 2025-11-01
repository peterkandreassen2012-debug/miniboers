import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback started');
        
        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session:', session);
        console.log('Session error:', sessionError);
        
        if (session?.user) {
          console.log('User found:', session.user.id);
          
          // Wait for the trigger to create the user_roles entry
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Fetch user role with retry logic
          let roleData = null;
          let attempts = 0;
          const maxAttempts = 5;
          
          while (!roleData && attempts < maxAttempts) {
            const { data, error } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            console.log('Role fetch attempt', attempts + 1, ':', data, error);
            
            if (data) {
              roleData = data;
              break;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          // Redirect based on role
          if (roleData?.role === 'investor') {
            navigate('/portfolio');
          } else if (roleData?.role === 'company') {
            navigate('/dashboard');
          } else if (roleData?.role === 'admin') {
            navigate('/dashboard');
          } else {
            console.log('No role found, defaulting to portfolio');
            navigate('/portfolio');
          }
        } else {
          console.log('No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Logger inn...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
