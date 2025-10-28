import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          // Redirect based on role
          if (roleData?.role === 'investor') {
            navigate('/portfolio');
          } else if (roleData?.role === 'company') {
            navigate('/dashboard');
          } else if (roleData?.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/portfolio');
          }
        } else {
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
