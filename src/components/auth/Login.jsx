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
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="auth-container fade-in">
        <div className="auth-card glass-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">🅿️</span>
              <h1>Smart<span className="brand-highlight">Park</span></h1>
            </div>
            <p className="auth-subtitle">Welcome back! Sign in to your account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <input
                type="email"
                className="form-input"
                id="login-email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">🔒 Password</label>
              <input
                type="password"
                className="form-input"
                id="login-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  Signing in...
                </span>
              ) : (
                <>🚀 Sign In</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <span>🅿️</span>
              <span>Smart Parking</span>
            </div>
            <div className="feature-item">
              <span>📍</span>
              <span>Live Tracking</span>
            </div>
            <div className="feature-item">
              <span>💳</span>
              <span>Easy Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
