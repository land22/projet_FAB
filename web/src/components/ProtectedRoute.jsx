import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children, requireResponsable = false, requireRole = null,
  requireSuperuser = false, requireSuperuserOrResponsable = false,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Chargement...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperuser && !user.is_superuser) {
    return <Navigate to="/" replace />;
  }

  if (requireSuperuserOrResponsable && !(user.is_superuser || user.is_responsable)) {
    return <Navigate to="/" replace />;
  }

  if (requireResponsable && !user.is_superuser && !user.is_responsable) {
    return <Navigate to="/" replace />;
  }

  if (requireRole && !user.is_superuser && !user.is_responsable && !user.roles.includes(requireRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}