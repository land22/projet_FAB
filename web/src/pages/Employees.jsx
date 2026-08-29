import { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../api/employees';
import Layout from '../components/Layout';

const EMPTY_FORM = {
  first_name: '', last_name: '', poste: '', telephone: '',
  adresse: '', date_embauche: '', salaire: '', statut: 'actif',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      setError("Impossible de charger la liste des employés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (emp) => {
    setForm({
      first_name: emp.first_name, last_name: emp.last_name, poste: emp.poste,
      telephone: emp.telephone || '', adresse: emp.adresse || '',
      date_embauche: emp.date_embauche, salaire: emp.salaire, statut: emp.statut,
    });
    setEditingId(emp.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateEmployee(editingId, form);
      } else {
        await createEmployee(form);
      }
      setShowForm(false);
      loadEmployees();
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifie les champs.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet employé ?')) return;
    try {
      await deleteEmployee(id);
      loadEmployees();
    } catch {
      setError('Erreur lors de la suppression.');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: 'var(--green-dark)', margin: '6px 0 0' }}>Gestion du personnel</h2>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={openCreateForm}>
          + Ajouter un employé
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {showForm && (
        <div className="card" style={{ maxWidth: '100%', marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, color: 'var(--green-dark)' }}>
            {editingId ? "Modifier l'employé" : 'Nouvel employé'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Prénom</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Nom</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label>Poste</label>
              <input name="poste" value={form.poste} onChange={handleChange} required />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Adresse</label>
                <input name="adresse" value={form.adresse} onChange={handleChange} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label>Date d'embauche</label>
                <input type="date" name="date_embauche" value={form.date_embauche} onChange={handleChange} required />
              </div>
              <div style={{ flex: 1 }}>
                <label>Salaire</label>
                <input type="number" step="0.01" name="salaire" value={form.salaire} onChange={handleChange} required />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label>Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange} style={{ width: '100%', padding: 11, borderRadius: 10, border: '1.5px solid #dfe6e9', marginTop: 6 }}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary">
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : employees.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Aucun employé enregistré pour le moment.</p>
      ) : (
        <div className="card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--green-soft)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13 }}>Nom</th>
                <th style={{ padding: 12, fontSize: 13 }}>Poste</th>
                <th style={{ padding: 12, fontSize: 13 }}>Téléphone</th>
                <th style={{ padding: 12, fontSize: 13 }}>Statut</th>
                <th style={{ padding: 12, fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 12, fontSize: 14 }}>{emp.first_name} {emp.last_name}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{emp.poste}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>{emp.telephone || '—'}</td>
                  <td style={{ padding: 12, fontSize: 14 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12,
                      background: emp.statut === 'actif' ? '#e8f5e9' : '#ffebee',
                      color: emp.statut === 'actif' ? 'var(--green-dark)' : '#c62828',
                    }}>
                      {emp.statut === 'actif' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, textAlign: 'right' }}>
                    <button onClick={() => openEditForm(emp)} style={{ marginRight: 8, border: 'none', background: 'none', color: 'var(--green-main)', cursor: 'pointer', fontWeight: 600 }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(emp.id)} style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div></Layout>
  );
}