import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireProfile = false, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <p className="text-lg text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.is_banned) {
    return <Navigate to="/login?reason=banned" replace />;
  }

  if (requireProfile && (!profile || !profile.profile_completed)) {
    return <Navigate to="/completar-perfil" replace />;
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
