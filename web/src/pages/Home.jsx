import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-center">
      <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}
        >
          🌾
        </div>
        <h1 style={{ color: 'var(--green-dark)', marginBottom: 4, fontSize: 24 }}>
          Ferme Agricole FAB
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
          Production, transformation & développement
        </p>

        <Link to="/login">
          <button className="btn-primary" style={{ marginBottom: 12 }}>
            Se connecter
          </button>
        </Link>
        <Link to="/register">
          <button className="btn-secondary">Créer un compte</button>
        </Link>
      </div>
    </div>
  );
}