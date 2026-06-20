import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      navigate(result.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Your Parking,<br />Your Way
          </h2>
          <p className="auth-hero-sub">
            Join thousands managing parking effortlessly with SmartPark.
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
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-subtitle">Fill in your details to get started.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input type="text" className="form-input" id="register-name" name="name"
              placeholder="Your full name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" className="form-input" id="register-email" name="email"
              placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" id="register-password" name="password"
                placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-input" id="register-confirm-password" name="confirmPassword"
                placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input type="tel" className="form-input" id="register-phone" name="phone"
                placeholder="Your phone number" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Account type</label>
              <select className="form-input" id="register-role" name="role"
                value={formData.role} onChange={handleChange}>
                <option value="user">Car Owner</option>
                <option value="admin">Parking Owner</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-btn"
            id="register-submit" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner"></span>
                Creating account
              </span>
            ) : 'Create account'}
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
  );
};

export default Register;
