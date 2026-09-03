import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClients } from '../api/sales';
import { getApprovisionnement, createRevente, deleteRevente } from '../api/supply';

const EMPTY_FORM = { client: '', quantite: '', avaries: '0', prix_vente: '', date: '' };

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ApprovisionnementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadAll = async () => {
    try {
      const [lotRes, clientsRes] = await Promise.all([getApprovisionnement(id), getClients()]);
      setLot(lotRes.data);
      setClients(clientsRes.data);
    } catch {
      setError('Impossible de charger ce lot.');
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createRevente({ ...form, approvisionnement: id });
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.quantite?.[0] || "Erreur lors de l'enregistrement de la revente.");
    }
  };

  const handleDelete = async (reventeId) => {
    if (!confirm('Supprimer cette revente ?')) return;
    try {
      await deleteRevente(reventeId);
      loadAll();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  if (!lot) {
    return (
      <Layout>
        {error ? <p className="error-text">{error}</p> : <p>Chargement...</p>}
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate('/approvisionnement')}
        style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontSize: 13, marginBottom: 12, padding: 0 }}
      >
        ← Retour à l'approvisionnement
      </button>

      <h1 style={{ color: 'var(--forest)', fontSize: 26, margin: '0 0 4px' }}>{lot.produit_nom}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        Lot du {lot.date} — {lot.quantite} unités achetées à {fcfa(lot.prix_achat)}/unité
      </p>

      {error && <p className="error-text">{error}</p>}

      {/* Bandeau résumé du lot */}
      <div style={{
        background: 'var(--forest)', color: 'white', borderRadius: 12, padding: 24,
        marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 32,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quantité restante</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>{lot.quantite_restante}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Montant d'achat</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>{fcfa(lot.montant_achat)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Montant de vente</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>{fcfa(lot.montant_vente_total)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bénéfice total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginTop: 4 }}>{fcfa(lot.benefice_total)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: 'var(--forest)', margin: 0 }}>Reventes</h3>
        <button
          className="btn-secondary"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
          onClick={() => setShowForm(!showForm)}
          disabled={lot.quantite_restante <= 0}
        >
          {showForm ? 'Annuler' : '+ Nouvelle revente'}
        </button>
      </div>

      {lot.quantite_restante <= 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: -6, marginBottom: 14 }}>
          Lot entièrement réparti — plus de quantité disponible.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '100%', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label>Bayam-sellam</label>
              <select name="client" value={form.client} onChange={handleChange} required
                style={{ width: '100%', padding: 11, borderRadius: 10, border: '1.5px solid #dfe6e9', marginTop: 6 }}>
                <option value="">— choisir —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Quantité (max {lot.quantite_restante})</label>
              <input type="number" step="0.01" name="quantite" value={form.quantite} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <label>Avaries</label>
              <input type="number" step="0.01" name="avaries" value={form.avaries} onChange={handleChange} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Prix de vente</label>
              <input type="number" step="0.01" name="prix_vente" value={form.prix_vente} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Enregistrer</button>
        </form>
      )}

      {lot.reventes.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucune revente enregistrée pour ce lot.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Bayam-sellam</th>
                <th style={{ padding: 12, fontSize: 13 }}>Quantité</th>
                <th style={{ padding: 12, fontSize: 13 }}>Avaries</th>
                <th style={{ padding: 12, fontSize: 13 }}>Prix de vente</th>
                <th style={{ padding: 12, fontSize: 13 }}>Montant de vente</th>
                <th style={{ padding: 12, fontSize: 13 }}>Bénéfice</th>
                <th style={{ padding: 12, fontSize: 13 }}>Date</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {lot.reventes.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.client_nom}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.quantite}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.avaries}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r.prix_vente)}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r.montant_vente)}</td>
                  <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: r.benefice >= 0 ? 'var(--green-dark)' : '#c62828' }}>
                    {fcfa(r.benefice)}
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.date}</td>
                  <td style={{ padding: 12, fontSize: 13, textAlign: 'right' }}>
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
