import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const BookingHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [parkingArea, setParkingArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [parkingRes, bookingRes] = await Promise.all([
        axios.get(`/api/parking/${id}`),
        axios.get(`/api/booking/parking/${id}`)
      ]);
      setParkingArea(parkingRes.data);
      setBookings(bookingRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="admin-loading"><p>Loading bookings...</p></div>;
  }

  return (
    <div className="booking-history-page">
      <div className="container">
        <div className="drawer-header fade-in">
          <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
          <h1>📋 Booking History - {parkingArea?.name}</h1>
          <p>View and manage all bookings for this parking area</p>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(108, 92, 231, 0.15)' }}>📊</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 184, 148, 0.15)' }}>✅</div>
            <div className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(99, 110, 114, 0.15)' }}>🏁</div>
            <div className="stat-value">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(0, 184, 148, 0.15)' }}>💰</div>
            <div className="stat-value">₹{bookings.reduce((sum, b) => sum + (b.amount || 0), 0)}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar glass-card fade-in">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({bookings.length})
          </button>
          <button className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>
            ✅ Confirmed
          </button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
            🏁 Completed
          </button>
          <button className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter('cancelled')}>
            ❌ Cancelled
          </button>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📭</div>
            <h3>No Bookings Found</h3>
            <p>No bookings match the selected filter</p>
          </div>
        ) : (
          <div className="table-container glass-card fade-in">
            <table className="data-table" id="bookings-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Slot</th>
                  <th>Booking Date</th>
                  <th>Amount</th>
                  <th>Payment ID</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-cell-name">{booking.userId?.name || 'N/A'}</span>
                        <span className="user-cell-email">{booking.userId?.email || ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{booking.slotId?.slotNumber || 'N/A'}</span>
                    </td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td className="amount-cell">₹{booking.amount}</td>
                    <td className="payment-id">{booking.paymentId || '—'}</td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'neutral' : 'danger'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{formatDate(booking.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
