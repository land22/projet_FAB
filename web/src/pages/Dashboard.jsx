import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page-center">
      <div className="card" style={{ maxWidth: 480 }}>
        <h2 style={{ color: 'var(--green-dark)', marginTop: 0 }}>
          Bienvenue, {user.username} 👋
        </h2>
        <div style={{ background: 'var(--green-soft)', borderRadius: 10, padding: 16, margin: '16px 0' }}>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>Statut :</strong> {user.is_responsable ? 'Responsable' : 'Employé'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>Rôles :</strong> {user.roles.length > 0 ? user.roles.join(', ') : 'Aucun (simple employé)'}
          </p>
        </div>
        <button onClick={logout} className="btn-secondary">Se déconnecter</button>
      </div>
    </div>
  );
}