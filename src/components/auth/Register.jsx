import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            <p className="auth-subtitle">Create your account to get started</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div className="form-group">
              <label className="form-label">👤 Full Name</label>
              <input
                type="text"
                className="form-input"
                id="register-name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📧 Email Address</label>
              <input
                type="email"
                className="form-input"
                id="register-email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🔒 Password</label>
                <input
                  type="password"
                  className="form-input"
                  id="register-password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">🔒 Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  id="register-confirm-password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">📱 Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  id="register-phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">🎭 Register As</label>
                <select
                  className="form-input"
                  id="register-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">🚗 User (Car Owner)</option>
                  <option value="admin">🏢 Admin (Parking Owner)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-btn"
              id="register-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner"></span>
                  Creating account...
                </span>
              ) : (
                <>🚀 Create Account</>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
