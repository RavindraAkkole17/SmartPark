import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSlots: 0, totalBookings: 0, totalRevenue: 0, occupiedSlots: 0 });

  useEffect(() => { fetchParkingAreas(); }, []);

  const fetchParkingAreas = async () => {
    try {
      const res = await axios.get('/api/parking/my');
      setParkingAreas(res.data);

      const totalSlots    = res.data.reduce((a, p) => a + p.totalSlots, 0);
      const occupiedSlots = res.data.reduce((a, p) => a + (p.occupiedSlots || 0) + (p.reservedSlots || 0), 0);

      let totalBookings = 0, totalRevenue = 0;
      for (const area of res.data) {
        try {
          const br = await axios.get(`/api/booking/parking/${area._id}`);
          totalBookings += br.data.length;
          totalRevenue  += br.data.reduce((a, b) => a + (b.amount || 0), 0);
        } catch {}
      }

      setStats({ totalSlots, totalBookings, totalRevenue, occupiedSlots });
    } catch (err) {
      console.error('Failed to fetch parking areas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading dashboard</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* Carbon strip header */}
      <div className="dashboard-strip">
        <div className="dashboard-strip-inner">
          <div>
            <h1 className="dashboard-title">{user?.name}</h1>
            <p className="dashboard-subtitle">Admin Dashboard · Parking Management</p>
          </div>
          <Link to="/admin/parking/new" className="btn btn-secondary" id="add-parking-btn">
            + Add Parking Area
          </Link>
        </div>
      </div>

      <div className="dashboard-content">

        {/* Stats grid (Fog) */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-value">{parkingAreas.length}</div>
            <div className="stat-label">Parking Areas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalSlots}</div>
            <div className="stat-label">Total Slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalBookings}</div>
            <div className="stat-label">Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{stats.totalRevenue}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        {/* Section header */}
        <div className="section-header">
          <h2>Your Parking Areas</h2>
          <span className="result-count">{parkingAreas.length} areas</span>
        </div>

        {parkingAreas.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">P</div>
            <h3>No Parking Areas</h3>
            <p>Create your first parking area to start managing slots and bookings.</p>
            <Link to="/admin/parking/new" className="btn btn-primary">
              Add Parking Area →
            </Link>
          </div>
        ) : (
          <div className="parking-grid">
            {parkingAreas.map((area, index) => (
              <div
                key={area._id}
                className="admin-parking-card fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="apc-header">
                  <div className="apc-info">
                    <h3>{area.name}</h3>
                    <p className="apc-location">
                      {area.location?.address || 'No address provided'}
                    </p>
                  </div>
                </div>

                <div className="apc-stats">
                  <div className="apc-stat">
                    <span className="apc-stat-value">{area.totalSlots}</span>
                    <span className="apc-stat-label">Total</span>
                  </div>
                  <div className="apc-stat">
                    <span className="apc-stat-value available">{area.availableSlots || 0}</span>
                    <span className="apc-stat-label">Available</span>
                  </div>
                  <div className="apc-stat">
                    <span className="apc-stat-value occupied">{area.occupiedSlots || 0}</span>
                    <span className="apc-stat-label">Occupied</span>
                  </div>
                  <div className="apc-stat">
                    <span className="apc-stat-value reserved">{area.reservedSlots || 0}</span>
                    <span className="apc-stat-label">Reserved</span>
                  </div>
                </div>

                <div className="apc-price">₹{area.pricePerHour} per hour</div>

                <div className="apc-actions">
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/manage`)}
                    className="btn btn-primary btn-sm"
                  >
                    Manage Slots
                  </button>
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/bookings`)}
                    className="btn btn-secondary btn-sm"
                  >
                    Bookings
                  </button>
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/edit`)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
