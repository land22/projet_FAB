import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const canManageEmployees = user.is_superuser || user.is_responsable || user.roles.includes('chef_du_personnel');

  return (
    <Layout>
      <h1 style={{ color: 'var(--forest)', fontSize: 26, margin: '0 0 6px' }}>
        Bienvenue, {user.username}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        Voici un aperçu de votre espace de gestion.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 4px 14px rgba(27,67,50,0.07)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Statut</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 6 }}>
            {user.is_superuser ? 'Super admin' : user.is_responsable ? 'Responsable' : 'Employé'}
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 4px 14px rgba(27,67,50,0.07)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rôles</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 6 }}>
            {user.roles.length > 0 ? user.roles.join(', ') : 'Aucun'}
          </div>
        </div>

        {canManageEmployees && (
          <Link to="/employees" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--forest)', color: 'white', borderRadius: 12, padding: 20,
              boxShadow: '0 4px 14px rgba(27,67,50,0.15)', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Module</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 6 }}>
                🌿 Gérer le personnel →
              </div>
            </div>
          </Link>
        )}
      </div>
    </Layout>
  );
}