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

        {/* Brand */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
          <div className="brand-mark">
            <span className="brand-mark-inner">SP</span>
          </div>
          <div className="brand-name">
            <span className="brand-wordmark">SmartPark</span>
            <span className="brand-tagline">Smart Parking Solutions</span>
          </div>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {isAdmin ? (
            <>
              <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/admin/parking/new" className={`nav-link ${location.pathname === '/admin/parking/new' ? 'active' : ''}`}>
                Add Parking
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Find Parking
              </Link>
              <Link to="/my-bookings" className={`nav-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                My Bookings
              </Link>
            </>
          )}
        </div>

        {/* User */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${isAdmin ? 'role-admin' : ''}`}>
                {isAdmin ? 'Administrator' : 'Member'}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" id="logout-btn">
            Sign out
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
