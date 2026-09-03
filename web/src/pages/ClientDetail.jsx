import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  getClient, getLivraisons, createLivraison, updateLivraison,
  getSpeculations, createSpeculation, createVersement, deleteVersement,
} from '../api/sales';

const EMPTY_LIVRAISON = { speculation: '', quantite: '', prix_unitaire: '', remise: '0', date: '' };

function fcfa(n) {
  return `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState(null);
  const [livraisons, setLivraisons] = useState([]);
  const [speculations, setSpeculations] = useState([]);
  const [error, setError] = useState('');

  const [showLivraisonForm, setShowLivraisonForm] = useState(false);
  const [livraisonForm, setLivraisonForm] = useState(EMPTY_LIVRAISON);
  const [showNewSpeculation, setShowNewSpeculation] = useState(false);
  const [newSpeculationName, setNewSpeculationName] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ prix_unitaire: '', remise: '' });

  const [versementFor, setVersementFor] = useState(null);
  const [versementForm, setVersementForm] = useState({ montant: '', date: '' });

  const loadAll = async () => {
    try {
      const [clientRes, livraisonsRes, speculationsRes] = await Promise.all([
        getClient(id),
        getLivraisons({ client: id }),
        getSpeculations(),
      ]);
      setClient(clientRes.data);
      setLivraisons(livraisonsRes.data);
      setSpeculations(speculationsRes.data);
    } catch {
      setError('Impossible de charger la fiche de ce client.');
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLivraisonSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createLivraison({ ...livraisonForm, client: id });
      setLivraisonForm(EMPTY_LIVRAISON);
      setShowLivraisonForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement de la livraison.");
    }
  };

  const handleNewSpeculation = async (e) => {
    e.preventDefault();
    if (!newSpeculationName.trim()) return;
    try {
      const res = await createSpeculation({ nom: newSpeculationName.trim() });
      setSpeculations([...speculations, res.data]);
      setLivraisonForm({ ...livraisonForm, speculation: res.data.id });
      setNewSpeculationName('');
      setShowNewSpeculation(false);
    } catch {
      setError("Erreur lors de la création de la spéculation.");
    }
  };

  const openEditForm = (livraison) => {
    setEditingId(livraison.id);
    setEditForm({ prix_unitaire: livraison.prix_unitaire, remise: livraison.remise });
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateLivraison(editingId, editForm);
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.prix_unitaire?.[0] || "Erreur lors de la modification.");
    }
  };

  const handleVersementSubmit = async (e, livraisonId) => {
    e.preventDefault();
    setError('');
    try {
      await createVersement({ ...versementForm, livraison: livraisonId });
      setVersementForm({ montant: '', date: '' });
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement du versement.");
    }
  };

  const handleDeleteVersement = async (versementId) => {
    if (!confirm('Supprimer ce versement ?')) return;
    try {
      await deleteVersement(versementId);
      loadAll();
    } catch {
      setError('Erreur lors de la suppression du versement.');
    }
  };

  if (!client) {
    return (
      <Layout>
        {error ? <p className="error-text">{error}</p> : <p>Chargement...</p>}
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate('/clients')}
        style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontSize: 13, marginBottom: 12, padding: 0 }}
      >
        ← Retour aux ventes
      </button>

      <h1 style={{ color: 'var(--forest)', fontSize: 26, margin: '0 0 4px' }}>{client.nom}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        {client.telephone || '—'} {client.adresse ? `· ${client.adresse}` : ''}
      </p>

      {error && <p className="error-text">{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: 'var(--forest)', margin: 0 }}>Livraisons</h3>
        <button
          className="btn-secondary"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
          onClick={() => setShowLivraisonForm(!showLivraisonForm)}
        >
          {showLivraisonForm ? 'Annuler' : '+ Nouvelle livraison'}
        </button>
      </div>

      {showLivraisonForm && (
        <form onSubmit={handleLivraisonSubmit} className="card" style={{ maxWidth: '100%', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label>Spéculation</label>
              <select
                value={livraisonForm.speculation}
                onChange={(e) => setLivraisonForm({ ...livraisonForm, speculation: e.target.value })}
                required
                style={{ width: '100%', padding: 11, borderRadius: 10, border: '1.5px solid #dfe6e9', marginTop: 6 }}
              >
                <option value="">— choisir —</option>
                {speculations.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setShowNewSpeculation(!showNewSpeculation)}
                style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontSize: 12, marginTop: 4, padding: 0 }}
              >
                {showNewSpeculation ? 'Annuler' : '+ Nouvelle spéculation'}
              </button>
              {showNewSpeculation && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input
                    value={newSpeculationName}
                    onChange={(e) => setNewSpeculationName(e.target.value)}
                    placeholder="Ex: aubergine"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-primary" style={{ width: 'auto', padding: '8px 14px' }} onClick={handleNewSpeculation}>
                    Ajouter
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Quantité</label>
              <input type="number" step="0.01" value={livraisonForm.quantite} onChange={(e) => setLivraisonForm({ ...livraisonForm, quantite: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Prix unitaire</label>
              <input type="number" step="0.01" value={livraisonForm.prix_unitaire} onChange={(e) => setLivraisonForm({ ...livraisonForm, prix_unitaire: e.target.value })} required />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Remise</label>
              <input type="number" step="0.01" value={livraisonForm.remise} onChange={(e) => setLivraisonForm({ ...livraisonForm, remise: e.target.value })} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label>Date</label>
              <input type="date" value={livraisonForm.date} onChange={(e) => setLivraisonForm({ ...livraisonForm, date: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Enregistrer</button>
        </form>
      )}

      {livraisons.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucune livraison enregistrée pour ce client.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Articles</th>
                <th style={{ padding: 12, fontSize: 13 }}>Prix unitaire</th>
                <th style={{ padding: 12, fontSize: 13 }}>Quantité</th>
                <th style={{ padding: 12, fontSize: 13 }}>Crédit</th>
                <th style={{ padding: 12, fontSize: 13 }}>Versement</th>
                <th style={{ padding: 12, fontSize: 13 }}>Remise</th>
                <th style={{ padding: 12, fontSize: 13 }}>Date</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {livraisons.map((l) => (
                <Fragment key={l.id}>
                  <tr style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 12, fontSize: 14 }}>{l.speculation_nom}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {editingId === l.id && (user.is_superuser || user.is_responsable) ? (
                        <input
                          type="number" step="0.01"
                          value={editForm.prix_unitaire}
                          onChange={(e) => setEditForm({ ...editForm, prix_unitaire: e.target.value })}
                          style={{ width: 90, padding: 6 }}
                        />
                      ) : fcfa(l.prix_unitaire)}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>{l.quantite}</td>
                    <td style={{ padding: 12, fontSize: 14, fontWeight: 600, color: l.credit > 0 ? '#c62828' : 'var(--green-dark)' }}>
                      {fcfa(l.credit)}
                    </td>
                    <td
                      style={{ padding: 12, fontSize: 14, cursor: 'pointer', color: 'var(--forest-light)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                      onClick={() => setVersementFor(versementFor === l.id ? null : l.id)}
                      title="Voir le détail des versements"
                    >
                      {fcfa(l.total_verse)}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      {editingId === l.id ? (
                        <input
                          type="number" step="0.01"
                          value={editForm.remise}
                          onChange={(e) => setEditForm({ ...editForm, remise: e.target.value })}
                          style={{ width: 80, padding: 6 }}
                        />
                      ) : fcfa(l.remise)}
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>{l.date}</td>
                    <td style={{ padding: 12, fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {editingId === l.id ? (
                        <>
                          <button onClick={handleEditSubmit} style={{ marginRight: 8, border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontWeight: 600 }}>
                            Enregistrer
                          </button>
                          <button onClick={() => setEditingId(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Annuler
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setVersementFor(versementFor === l.id ? null : l.id)} style={{ marginRight: 8, border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontWeight: 600 }}>
                            Versements
                          </button>
                          <button onClick={() => openEditForm(l)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                            {(user.is_superuser || user.is_responsable) ? 'Modifier' : 'Remise'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {versementFor === l.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0 12px 14px', background: '#fafafa' }}>
                        {l.versements.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: 13, paddingTop: 10, margin: 0 }}>
                            Aucun versement enregistré pour cette livraison.
                          </p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                            <thead>
                              <tr style={{ textAlign: 'left' }}>
                                <th style={{ padding: '4px 8px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '4px 8px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Montant versé</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {l.versements.map((v) => (
                                <tr key={v.id} style={{ borderTop: '1px solid #eee' }}>
                                  <td style={{ padding: '6px 8px', fontSize: 13 }}>{v.date}</td>
                                  <td style={{ padding: '6px 8px', fontSize: 13 }}>{fcfa(v.montant)}</td>
                                  <td style={{ padding: '6px 8px', fontSize: 13, textAlign: 'right' }}>
                                    <button onClick={() => handleDeleteVersement(v.id)} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontSize: 12 }}>
                                      Supprimer
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <form onSubmit={(e) => handleVersementSubmit(e, l.id)} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', paddingTop: 12 }}>
                          <div>
                            <label>Montant versé</label>
                            <input
                              type="number" step="0.01"
                              value={versementForm.montant}
                              onChange={(e) => setVersementForm({ ...versementForm, montant: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label>Date</label>
                            <input
                              type="date"
                              value={versementForm.date}
                              onChange={(e) => setVersementForm({ ...versementForm, date: e.target.value })}
                              required
                            />
                          </div>
                          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 18px' }}>Enregistrer</button>
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
