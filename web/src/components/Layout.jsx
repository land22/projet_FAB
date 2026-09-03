import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Tableau de bord', icon: '⌂', roleRequired: null },
  { path: '/users', label: 'Utilisateurs', icon: '🔑', superuserOrResponsableOnly: true },
  { path: '/employees', label: 'Personnel', icon: '🌿', roleRequired: 'chef_du_personnel' },
  { path: '/clients', label: 'Ventes', icon: '🍅', roleRequired: 'gerant' },
  { path: '/rations', label: 'Ration alimentaire', icon: '🍚', roleRequired: 'chef_du_personnel' },
  { path: '/approvisionnement', label: 'Approvisionnement', icon: '🥔', roleRequired: 'gerant' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (user.is_superuser) return true;
    if (item.superuserOrResponsableOnly) return user.is_responsable;
    return !item.roleRequired || user.is_responsable || user.roles.includes(item.roleRequired);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 230, background: 'var(--forest)', color: 'white',
        display: 'flex', flexDirection: 'column', padding: '28px 0', flexShrink: 0,
      }}>
        <div style={{ padding: '0 24px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🌾</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>
              Ferme FAB
            </div>
            <div style={{ fontSize: 10, opacity: 0.65, letterSpacing: '0.04em' }}>SARL</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {visibleItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 24px', color: active ? 'white' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 500,
                  borderLeft: active ? '3px solid var(--wheat)' : '3px solid transparent',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0 24px', marginTop: 20 }}>
          <div style={{
            fontSize: 12, opacity: 0.6, marginBottom: 10, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}>
            {user.username} · {user.is_superuser ? 'Super admin' : user.is_responsable ? 'Responsable' : (user.roles[0] || 'Employé')}
          </div>
          <button
            onClick={logout}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.25)',
              color: 'white', padding: '8px 14px', borderRadius: 8, fontSize: 13,
              cursor: 'pointer', width: '100%',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  );
}
