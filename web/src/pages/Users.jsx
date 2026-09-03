import { useState, useEffect, Fragment } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getUsers, getRoles, changeUserRole } from '../api/accounts';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ is_responsable: false, roles: [] });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch {
      setError('Impossible de charger la liste des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openEditForm = (u) => {
    setEditingId(u.id);
    setEditForm({ is_responsable: u.is_responsable, roles: [...u.roles] });
    setError('');
  };

  const toggleRole = (roleValue) => {
    setEditForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleValue)
        ? prev.roles.filter((r) => r !== roleValue)
        : [...prev.roles, roleValue],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = currentUser.is_superuser
        ? editForm
        : { roles: editForm.roles };
      await changeUserRole(editingId, payload);
      setEditingId(null);
      loadAll();
    } catch {
      setError("Erreur lors de la mise à jour des droits.");
    }
  };

  // Le super user peut tout modifier. Le Responsable peut modifier les rôles
  // de n'importe qui sauf ceux d'un autre Responsable (il peut modifier les siens).
  const canEdit = (u) => currentUser.is_superuser || u.id === currentUser.id || !u.is_responsable;

  return (
    <Layout>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'var(--green-dark)', margin: 0 }}>Utilisateurs</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 14 }}>
          {currentUser.is_superuser
            ? 'Attribution du statut Responsable et des rôles Gérant / Chef du personnel.'
            : 'Attribution des rôles Gérant / Chef du personnel. Le statut Responsable est réservé au super administrateur.'}
        </p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Chargement...</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucun utilisateur enregistré.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Utilisateur</th>
                <th style={{ padding: 12, fontSize: 13 }}>Email</th>
                <th style={{ padding: 12, fontSize: 13 }}>Statut</th>
                <th style={{ padding: 12, fontSize: 13 }}>Rôles</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u.id}>
                  <tr style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {u.username}
                      {u.is_superuser && (
                        <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 12, fontSize: 11, background: '#fff3cd', color: '#8a6d00' }}>
                          Super admin
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>{u.email || '—'}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {u.is_responsable ? (
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: '#e8f5e9', color: 'var(--green-dark)' }}>
                          Responsable
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {u.roles.length > 0 ? u.roles.join(', ') : '—'}
                    </td>
                    <td style={{ padding: 12, fontSize: 13, textAlign: 'right' }}>
                      {canEdit(u) ? (
                        <button onClick={() => openEditForm(u)} style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontWeight: 600 }}>
                          Modifier les droits
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Réservé au super admin</span>
                      )}
                    </td>
                  </tr>
                  {editingId === u.id && (
                    <tr>
                      <td colSpan={5} style={{ padding: '0 12px 16px', background: '#fafafa' }}>
                        <form onSubmit={handleSubmit} style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 400, opacity: currentUser.is_superuser ? 1 : 0.5 }}>
                            <input
                              type="checkbox"
                              checked={editForm.is_responsable}
                              onChange={(e) => setEditForm({ ...editForm, is_responsable: e.target.checked })}
                              disabled={!currentUser.is_superuser}
                              style={{ width: 'auto' }}
                            />
                            Responsable (accès complet)
                            {!currentUser.is_superuser && (
                              <span style={{ fontSize: 12 }}>— réservé au super admin</span>
                            )}
                          </label>
                          <div>
                            <div style={{ marginBottom: 6 }}>Rôles</div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                              {roles.map((r) => (
                                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400 }}>
                                  <input
                                    type="checkbox"
                                    checked={editForm.roles.includes(r.value)}
                                    onChange={() => toggleRole(r.value)}
                                    style={{ width: 'auto' }}
                                  />
                                  {r.label}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 18px' }}>Enregistrer</button>
                            <button type="button" className="btn-secondary" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setEditingId(null)}>Annuler</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
