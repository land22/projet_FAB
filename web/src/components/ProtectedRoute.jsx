import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireResponsable = false, requireRole = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Chargement...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireResponsable && !user.is_responsable) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && !user.is_responsable && !user.roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}