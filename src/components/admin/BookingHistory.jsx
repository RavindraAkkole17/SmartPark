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

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [pr, br] = await Promise.all([
        axios.get(`/api/parking/${id}`),
        axios.get(`/api/booking/parking/${id}`)
      ]);
      setParkingArea(pr.data);
      setBookings(br.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const revenue = bookings.reduce((s, b) => s + (b.amount || 0), 0);

  const statusBadge = (s) => {
    if (s === 'confirmed') return 'badge-success';
    if (s === 'completed') return 'badge-neutral';
    return 'badge-danger';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader-spinner"><div className="spinner-ring"></div><div className="spinner-ring"></div></div>
        <p>Loading bookings…</p>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
      <div className="container">

        <div className="bh-header fade-in">
          <button onClick={() => navigate('/admin')} className="pf-back">← Back</button>
          <h1 className="bh-title">Booking History</h1>
          <p className="bh-subtitle">{parkingArea?.name}</p>
        </div>

        {/* Summary */}
        <div className="bh-summary fade-in">
          <div className="bh-summary-item">
            <span className="bh-summary-value">{bookings.length}</span>
            <span className="bh-summary-label">Total Bookings</span>
          </div>
          <div className="bh-summary-item">
            <span className="bh-summary-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="bh-summary-label">Active</span>
          </div>
          <div className="bh-summary-item">
            <span className="bh-summary-value">{bookings.filter(b => b.status === 'completed').length}</span>
            <span className="bh-summary-label">Completed</span>
          </div>
          <div className="bh-summary-item">
            <span className="bh-summary-value">₹{revenue}</span>
            <span className="bh-summary-label">Revenue</span>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }} className="fade-in">
          {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${bookings.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📭</div>
            <h3>No Bookings Found</h3>
            <p>No bookings match the selected filter.</p>
          </div>
        ) : (
          <div className="bh-table-wrapper fade-in">
            <table className="data-table" id="bookings-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Slot</th>
                  <th>Date</th>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--color-starlight)', fontWeight: 500 }}>{booking.userId?.name || 'N/A'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-lead)' }}>{booking.userId?.email || ''}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{booking.slotId?.slotNumber || 'N/A'}</span></td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td style={{ color: 'var(--color-starlight)', fontWeight: 500 }}>₹{booking.amount}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-lead)', fontFamily: 'monospace' }}>{booking.paymentId || '—'}</td>
                    <td><span className={`badge ${statusBadge(booking.status)}`}>{booking.status}</span></td>
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
