import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      navigate(userData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Hero Panel */}
      <div className="auth-hero">
        <img
          src="/parking-hero.png"
          alt="SmartPark — Precision Parking"
          className="auth-hero-img"
        />
        <div className="auth-hero-overlay">
          <h2 className="auth-hero-headline">
            Precision Parking<br />for the Modern City
          </h2>
          <p className="auth-hero-sub">
            Reserve, manage, and navigate to your spot — instantly.
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-panel fade-in">
        <div className="auth-header">
          <div className="auth-logo-row">
            <div className="auth-logo-mark">SP</div>
            <span className="auth-logo-text">SmartPark</span>
          </div>
          <h1 className="auth-heading">Sign in</h1>
          <p className="auth-subtitle">Enter your credentials to access your account.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-input"
              id="login-email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              id="login-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-btn"
            id="login-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span>
                Signing in
              </span>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            No account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <strong>Live Slots</strong>
            <span>Real-time availability</span>
          </div>
          <div className="feature-item">
            <strong>Instant Book</strong>
            <span>Reserve in seconds</span>
          </div>
          <div className="feature-item">
            <strong>Navigate</strong>
            <span>Guided to your spot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
