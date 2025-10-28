import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import InvestorDashboard from '@/components/dashboard/InvestorDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && role === 'investor') {
      // Investors should see the stocks page instead of dashboard
      navigate('/aksjer');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  return (
    <>
      {role === 'admin' && <AdminDashboard />}
      {role === 'investor' && <InvestorDashboard />}
      {role === 'company' && <CompanyDashboard />}
    </>
  );
};

export default Dashboard;
