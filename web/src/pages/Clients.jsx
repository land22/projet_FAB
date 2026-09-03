import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getClients, getClientsResume, createClient, updateClient, deleteClient } from '../api/sales';

const EMPTY_FORM = { nom: '', telephone: '', adresse: '' };

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function Clients() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [clientsRes, resumeRes] = await Promise.all([getClients(), getClientsResume()]);
      setClients(clientsRes.data);
      setResume(resumeRes.data);
    } catch {
      setError('Impossible de charger la liste des bayam-sellam.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const resumeByClient = Object.fromEntries((resume?.clients || []).map((r) => [r.client, r]));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (client) => {
    setForm({ nom: client.nom, telephone: client.telephone || '', adresse: client.adresse || '' });
    setEditingId(client.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateClient(editingId, form);
      } else {
        await createClient(form);
      }
      setShowForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifie les champs.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette bayam-sellam ?')) return;
    try {
      await deleteClient(id);
      loadAll();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--green-dark)', margin: 0 }}>Gestion des ventes</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={openCreateForm}>
          + Ajouter une bayam-sellam
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <div className="card" style={{ maxWidth: '100%', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--green-dark)' }}>
            {editingId ? 'Modifier la bayam-sellam' : 'Nouvelle bayam-sellam'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label>Nom</label>
              <input name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <label>Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Adresse</label>
                <input name="adresse" value={form.adresse} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">{editingId ? 'Enregistrer' : 'Créer'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : clients.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucune bayam-sellam enregistrée pour le moment.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Nom du client</th>
                <th style={{ padding: 12, fontSize: 13 }}>Crédit (solde restant dû)</th>
                <th style={{ padding: 12, fontSize: 13 }}>Versement du jour</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const r = resumeByClient[client.id];
                return (
                  <tr
                    key={client.id}
                    style={{ borderTop: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <td style={{ padding: 12, fontSize: 14 }}>{client.nom}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r?.credit)}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r?.versement_du_jour)}</td>
                    <td style={{ padding: 12, fontSize: 13, textAlign: 'right' }}>
                      <button onClick={(e) => { e.stopPropagation(); openEditForm(client); }} style={{ marginRight: 8, border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontWeight: 600 }}>
                        Modifier
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--green-soft)', fontWeight: 700, background: '#fafafa' }}>
                <td style={{ padding: 12, fontSize: 14 }}>Total (calcul automatique)</td>
                <td style={{ padding: 12, fontSize: 14 }}>{fcfa(resume?.credit_total)}</td>
                <td style={{ padding: 12, fontSize: 14 }}>
                  {(user.is_superuser || user.is_responsable) ? fcfa(resume?.total_versements) : (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>Accès limité</span>
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Layout>
  );
}
