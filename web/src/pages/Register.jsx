import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/auth/register/', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      const firstError = data ? Object.values(data)[0] : null;
      setError(
        Array.isArray(firstError) ? firstError[0] : "Erreur lors de l'inscription. Vérifie les champs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card">
        <h2 style={{ color: 'var(--green-dark)', marginTop: 0 }}>Créer un compte</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          Compte employé standard — les rôles sont attribués par le Responsable.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Nom d'utilisateur</label>
            <input name="username" value={form.username} onChange={handleChange} required />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label>Prénom</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Nom</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Mot de passe</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
          </div>

          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">Compte créé ! Redirection vers la connexion...</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13 }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--green-main)' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}