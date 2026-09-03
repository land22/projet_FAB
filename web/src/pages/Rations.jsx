import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getRations, createRation, updateRation, deleteRation, getRationTotal } from '../api/rations';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const EMPTY_FORM = { date: '', montant: '', description: '' };

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function Rations() {
  const now = new Date();

  const [rations, setRations] = useState([]);
  const [total, setTotal] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rationsRes, totalRes] = await Promise.all([
        getRations(month, year),
        getRationTotal(month, year),
      ]);
      setRations(rationsRes.data);
      setTotal(totalRes.data.total);
    } catch {
      setError('Impossible de charger le journal de ration alimentaire.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (ration) => {
    setForm({ date: ration.date, montant: ration.montant, description: ration.description || '' });
    setEditingId(ration.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateRation(editingId, form);
      } else {
        await createRation(form);
      }
      setShowForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifie les champs.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    try {
      await deleteRation(id);
      loadAll();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--green-dark)', margin: 0 }}>Ration alimentaire du personnel</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={openCreateForm}>
          + Ajouter une dépense
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Sélecteur mois/année + total */}
      <div style={{
        background: 'var(--forest)', color: 'white', borderRadius: 12, padding: 24,
        marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total dépensé — {MONTHS[month - 1]} {year}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4 }}>
            {total !== null ? fcfa(total) : '—'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 'auto', margin: 0 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 'auto', margin: 0 }}>
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ maxWidth: '100%', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--green-dark)' }}>
            {editingId ? 'Modifier la dépense' : 'Nouvelle dépense'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Montant</label>
                <input type="number" step="0.01" name="montant" value={form.montant} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label>Description (facultative)</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="Ex: riz + huile — semaine 2" />
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
      ) : rations.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucune dépense de ration enregistrée pour cette période.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Date</th>
                <th style={{ padding: 12, fontSize: 13 }}>Montant</th>
                <th style={{ padding: 12, fontSize: 13 }}>Description</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {rations.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.date}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r.montant)}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.description || '—'}</td>
                  <td style={{ padding: 12, fontSize: 13, textAlign: 'right' }}>
                    <button onClick={() => openEditForm(r)} style={{ marginRight: 8, border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontWeight: 600 }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(r.id)} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
