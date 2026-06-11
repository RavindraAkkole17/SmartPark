import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Common.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <span className="brand-icon">🅿️</span>
          <span className="brand-text">Smart<span className="brand-highlight">Park</span></span>
        </Link>

        <div className="navbar-links">
          {isAdmin ? (
            <>
              <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
              <Link to="/admin/parking/new" className={`nav-link ${location.pathname === '/admin/parking/new' ? 'active' : ''}`}>
                <span className="nav-icon">➕</span>
                Add Parking
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <span className="nav-icon">🏠</span>
                Dashboard
              </Link>
              <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                <span className="nav-icon">🎫</span>
                My Bookings
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${isAdmin ? 'role-admin' : 'role-user'}`}>
                {isAdmin ? '👑 Admin' : '👤 User'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" id="logout-btn" title="Logout">
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
