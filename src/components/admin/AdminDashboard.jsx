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

  useEffect(() => {
    fetchParkingAreas();
  }, []);

  const fetchParkingAreas = async () => {
    try {
      const res = await axios.get('/api/parking/my');
      setParkingAreas(res.data);
      
      // Calculate stats
      const totalSlots = res.data.reduce((acc, area) => acc + area.totalSlots, 0);
      const occupiedSlots = res.data.reduce((acc, area) => acc + (area.occupiedSlots || 0), 0);
      const reservedSlots = res.data.reduce((acc, area) => acc + (area.reservedSlots || 0), 0);
      
      // Fetch all bookings for revenue
      let totalBookings = 0;
      let totalRevenue = 0;
      for (const area of res.data) {
        try {
          const bookingRes = await axios.get(`/api/booking/parking/${area._id}`);
          totalBookings += bookingRes.data.length;
          totalRevenue += bookingRes.data.reduce((acc, b) => acc + (b.amount || 0), 0);
        } catch (e) {
          // ignore
        }
      }
      
      setStats({ totalSlots, totalBookings, totalRevenue, occupiedSlots: occupiedSlots + reservedSlots });
    } catch (error) {
      console.error('Failed to fetch parking areas:', error);
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
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header fade-in">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="highlight">{user?.name}</span> 👋
            </h1>
            <p className="dashboard-subtitle">Manage your parking areas and monitor bookings</p>
          </div>
          <Link to="/admin/parking/new" className="btn btn-primary" id="add-parking-btn">
            ➕ Add Parking Area
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)' }}>🅿️</div>
            <div className="stat-value">{parkingAreas.length}</div>
            <div className="stat-label">Parking Areas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 206, 201, 0.15)' }}>🚗</div>
            <div className="stat-value">{stats.totalSlots}</div>
            <div className="stat-label">Total Slots</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(253, 121, 168, 0.15)' }}>🎫</div>
            <div className="stat-value">{stats.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 184, 148, 0.15)' }}>💰</div>
            <div className="stat-value">₹{stats.totalRevenue}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        {/* Parking Areas List */}
        <div className="section-header">
          <h2>Your Parking Areas</h2>
        </div>

        {parkingAreas.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">🏗️</div>
            <h3>No Parking Areas Yet</h3>
            <p>Create your first parking area to start managing slots and bookings</p>
            <Link to="/admin/parking/new" className="btn btn-primary">
              ➕ Create Parking Area
            </Link>
          </div>
        ) : (
          <div className="parking-grid">
            {parkingAreas.map((area, index) => (
              <div
                key={area._id}
                className="admin-parking-card glass-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="apc-header">
                  <div className="apc-icon">🏢</div>
                  <div className="apc-info">
                    <h3>{area.name}</h3>
                    <p className="apc-location">📍 {area.location?.address || 'No address'}</p>
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

                <div className="apc-price">
                  <span>₹{area.pricePerHour}/hr</span>
                </div>

                <div className="apc-actions">
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/manage`)}
                    className="btn btn-primary btn-sm"
                  >
                    🎨 Manage Slots
                  </button>
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/bookings`)}
                    className="btn btn-secondary btn-sm"
                  >
                    📋 Bookings
                  </button>
                  <button
                    onClick={() => navigate(`/admin/parking/${area._id}/edit`)}
                    className="btn btn-outline btn-sm"
                  >
                    ✏️ Edit
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
