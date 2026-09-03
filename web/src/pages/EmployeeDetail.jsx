import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getEmployee, getAvances, createAvance, deleteAvance,
  getMaladies, createMaladie, deleteMaladie, getSolde,
} from '../api/employees';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const now = new Date();

  const [employee, setEmployee] = useState(null);
  const [avances, setAvances] = useState([]);
  const [maladies, setMaladies] = useState([]);
  const [solde, setSolde] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [error, setError] = useState('');

  const [avanceForm, setAvanceForm] = useState({ montant: '', date: '' });
  const [maladieForm, setMaladieForm] = useState({ date_debut: '', nombre_jours: '', montant_depense: '' });
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [showMaladieForm, setShowMaladieForm] = useState(false);

  const loadAll = async () => {
    try {
      const [empRes, avRes, malRes, soldeRes] = await Promise.all([
        getEmployee(id),
        getAvances(id),
        getMaladies(id),
        getSolde(id, month, year),
      ]);
      setEmployee(empRes.data);
      setAvances(avRes.data);
      setMaladies(malRes.data);
      setSolde(soldeRes.data);
    } catch {
      setError("Impossible de charger la fiche de l'employé.");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, month, year]);

  const handleAvanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAvance({ employee: id, montant: avanceForm.montant, date: avanceForm.date });
      setAvanceForm({ montant: '', date: '' });
      setShowAvanceForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement de l'avance.");
    }
  };

  const handleMaladieSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaladie({
        employee: id,
        date_debut: maladieForm.date_debut,
        nombre_jours: maladieForm.nombre_jours,
        montant_depense: maladieForm.montant_depense,
      });
      setMaladieForm({ date_debut: '', nombre_jours: '', montant_depense: '' });
      setShowMaladieForm(false);
      loadAll();
    } catch {
      setError("Erreur lors de l'enregistrement de la maladie.");
    }
  };

  const handleDeleteAvance = async (avanceId) => {
    if (!confirm('Supprimer cette avance ?')) return;
    await deleteAvance(avanceId);
    loadAll();
  };

  const handleDeleteMaladie = async (maladieId) => {
    if (!confirm('Supprimer cet épisode de maladie ?')) return;
    await deleteMaladie(maladieId);
    loadAll();
  };

  if (!employee) {
    return (
      <Layout>
        {error ? <p className="error-text">{error}</p> : <p>Chargement...</p>}
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        onClick={() => navigate('/employees')}
        style={{ border: 'none', background: 'none', color: 'var(--forest-light)', cursor: 'pointer', fontSize: 13, marginBottom: 12, padding: 0 }}
      >
        ← Retour au personnel
      </button>

      <h1 style={{ color: 'var(--forest)', fontSize: 26, margin: '0 0 4px' }}>
        {employee.first_name} {employee.last_name}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>{employee.poste}</p>

      {error && <p className="error-text">{error}</p>}

      {/* Sélecteur mois/année + solde */}
      <div style={{
        background: 'var(--forest)', color: 'white', borderRadius: 12, padding: 24,
        marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Solde — {MONTHS[month - 1]} {year}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginTop: 4 }}>
            {solde ? `${Number(solde.solde).toLocaleString('fr-FR')} FCFA` : '—'}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Colonne Avances */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: 'var(--forest)', margin: 0 }}>Avances</h3>
            <button
              className="btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
              onClick={() => setShowAvanceForm(!showAvanceForm)}
            >
              {showAvanceForm ? 'Annuler' : '+ Ajouter'}
            </button>
          </div>

          {showAvanceForm && (
            <form onSubmit={handleAvanceSubmit} style={{ background: 'white', borderRadius: 10, padding: 16, marginBottom: 14, boxShadow: '0 2px 10px rgba(27,67,50,0.06)' }}>
              <label>Montant</label>
              <input type="number" step="0.01" value={avanceForm.montant} onChange={(e) => setAvanceForm({ ...avanceForm, montant: e.target.value })} required />
              <label style={{ display: 'block', marginTop: 10 }}>Date</label>
              <input type="date" value={avanceForm.date} onChange={(e) => setAvanceForm({ ...avanceForm, date: e.target.value })} required />
              <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>Enregistrer</button>
            </form>
          )}

          {avances.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucune avance enregistrée.</p>
          ) : (
            avances.map((av) => (
              <div key={av.id} style={{
                background: 'white', borderRadius: 10, padding: '12px 16px', marginBottom: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(27,67,50,0.05)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{Number(av.montant).toLocaleString('fr-FR')} FCFA</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{av.date}</div>
                </div>
                <button onClick={() => handleDeleteAvance(av.id)} style={{ border: 'none', background: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 13 }}>
                  Supprimer
                </button>
              </div>
            ))
          )}
        </section>

        {/* Colonne Maladies */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ color: 'var(--forest)', margin: 0 }}>Maladies</h3>
            <button
              className="btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
              onClick={() => setShowMaladieForm(!showMaladieForm)}
            >
              {showMaladieForm ? 'Annuler' : '+ Ajouter'}
            </button>
          </div>

          {showMaladieForm && (
            <form onSubmit={handleMaladieSubmit} style={{ background: 'white', borderRadius: 10, padding: 16, marginBottom: 14, boxShadow: '0 2px 10px rgba(27,67,50,0.06)' }}>
              <label>Date de début</label>
              <input type="date" value={maladieForm.date_debut} onChange={(e) => setMaladieForm({ ...maladieForm, date_debut: e.target.value })} required />
              <label style={{ display: 'block', marginTop: 10 }}>Nombre de jours</label>
              <input type="number" value={maladieForm.nombre_jours} onChange={(e) => setMaladieForm({ ...maladieForm, nombre_jours: e.target.value })} required />
              <label style={{ display: 'block', marginTop: 10 }}>Montant dépensé</label>
              <input type="number" step="0.01" value={maladieForm.montant_depense} onChange={(e) => setMaladieForm({ ...maladieForm, montant_depense: e.target.value })} required />
              <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>Enregistrer</button>
            </form>
          )}

          {maladies.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Aucun épisode enregistré.</p>
          ) : (
            maladies.map((mal) => (
              <div key={mal.id} style={{
                background: 'white', borderRadius: 10, padding: '12px 16px', marginBottom: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(27,67,50,0.05)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{mal.nombre_jours} jour(s) — {Number(mal.montant_depense).toLocaleString('fr-FR')} FCFA</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>À partir du {mal.date_debut}</div>
                </div>
                <button onClick={() => handleDeleteMaladie(mal.id)} style={{ border: 'none', background: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 13 }}>
                  Supprimer
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}