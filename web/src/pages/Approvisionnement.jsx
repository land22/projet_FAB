import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getProduitsApprovisionnement, createProduitApprovisionnement,
  getApprovisionnements, createApprovisionnement, getApprovisionnementsResume,
} from '../api/supply';

const EMPTY_FORM = { produit: '', quantite: '', prix_achat: '', date: '' };

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function Approvisionnement() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [resume, setResume] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [showNewProduit, setShowNewProduit] = useState(false);
  const [newProduitName, setNewProduitName] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [lotsRes, resumeRes, produitsRes] = await Promise.all([
        getApprovisionnements(),
        getApprovisionnementsResume(),
        getProduitsApprovisionnement(),
      ]);
      setLots(lotsRes.data);
      setResume(resumeRes.data);
      setProduits(produitsRes.data);
    } catch {
      setError("Impossible de charger les données d'approvisionnement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createApprovisionnement(form);
      setShowForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifie les champs.");
    }
  };

  const handleNewProduit = async (e) => {
    e.preventDefault();
    if (!newProduitName.trim()) return;
    try {
      const res = await createProduitApprovisionnement({ nom: newProduitName.trim() });
      setProduits([...produits, res.data]);
      setForm({ ...form, produit: res.data.id });
      setNewProduitName('');
      setShowNewProduit(false);
    } catch {
      setError('Erreur lors de la création du produit.');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ color: 'var(--green-dark)', margin: 0 }}>Approvisionnement</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={openCreateForm}>
          + Nouveau lot
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Résumé par produit */}
      {resume && resume.par_produit.length > 0 && (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Produit</th>
                <th style={{ padding: 12, fontSize: 13 }}>Montant d'achat</th>
                <th style={{ padding: 12, fontSize: 13 }}>Montant de vente</th>
                <th style={{ padding: 12, fontSize: 13 }}>Avaries</th>
                <th style={{ padding: 12, fontSize: 13 }}>Bénéfice</th>
              </tr>
            </thead>
            <tbody>
              {resume.par_produit.map((r) => (
                <tr key={r.produit} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.produit_nom}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r.montant_achat)}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(r.montant_vente)}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{r.avaries}</td>
                  <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: r.benefice >= 0 ? 'var(--green-dark)' : '#c62828' }}>
                    {fcfa(r.benefice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--green-soft)', fontWeight: 700, background: '#fafafa' }}>
                <td style={{ padding: 12, fontSize: 14 }}>Total</td>
                <td style={{ padding: 12, fontSize: 14 }}>{fcfa(resume.totaux.montant_achat)}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{fcfa(resume.totaux.montant_vente)}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{resume.totaux.avaries}</td>
                <td style={{ padding: 12, fontSize: 14, color: resume.totaux.benefice >= 0 ? 'var(--green-dark)' : '#c62828' }}>
                  {fcfa(resume.totaux.benefice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '100%', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--green-dark)' }}>Nouveau lot d'approvisionnement</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label>Produit</label>
              <select name="produit" value={form.produit} onChange={handleChange} required
                style={{ width: '100%', padding: 11, borderRadius: 10, border: '1.5px solid #dfe6e9', marginTop: 6 }}>
                <option value="">— choisir —</option>
                {produits.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowNewProduit(!showNewProduit)}
                style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: 0 }}
              >
                {showNewProduit ? 'Annuler' : '+ Nouveau produit'}
              </button>
              {showNewProduit && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input value={newProduitName} onChange={(e) => setNewProduitName(e.target.value)} placeholder="Ex: pomme de terre" style={{ flex: 1 }} />
                  <button type="button" className="btn-primary" style={{ width: 'auto', padding: '8px 14px' }} onClick={handleNewProduit}>
                    Ajouter
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Quantité achetée</label>
              <input type="number" step="0.01" name="quantite" value={form.quantite} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Prix d'achat (unitaire)</label>
              <input type="number" step="0.01" name="prix_achat" value={form.prix_achat} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primary">Créer</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : lots.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucun lot d'approvisionnement enregistré pour le moment.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Produit</th>
                <th style={{ padding: 12, fontSize: 13 }}>Quantité achetée</th>
                <th style={{ padding: 12, fontSize: 13 }}>Prix d'achat</th>
                <th style={{ padding: 12, fontSize: 13 }}>Quantité restante</th>
                <th style={{ padding: 12, fontSize: 13 }}>Bénéfice total</th>
                <th style={{ padding: 12, fontSize: 13 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr
                  key={lot.id}
                  style={{ borderTop: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => navigate(`/approvisionnement/${lot.id}`)}
                >
                  <td style={{ padding: 12, fontSize: 14 }}>{lot.produit_nom}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{lot.quantite}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{fcfa(lot.prix_achat)}</td>
                  <td style={{ padding: 12, fontSize: 14, fontWeight: lot.quantite_restante > 0 ? 600 : 400 }}>
                    {lot.quantite_restante}
                  </td>
                  <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: lot.benefice_total >= 0 ? 'var(--green-dark)' : '#c62828' }}>
                    {fcfa(lot.benefice_total)}
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>{lot.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
