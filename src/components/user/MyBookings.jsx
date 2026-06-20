import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Ticket from './Ticket';
import './User.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/booking/my');
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const openNavigation = (location) => {
    if (location?.lat && location?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
    }
  };

  const statusBadge = (s) => {
    if (s === 'confirmed') return 'badge-success';
    if (s === 'completed') return 'badge-neutral';
    return 'badge-danger';
  };

  if (loading) {
    return (
      <div className="user-loading">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading your bookings</p>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      {/* Carbon strip */}
      <div className="mb-header-strip">
        <div className="mb-header-inner">
          <h1 className="mb-title">My Bookings</h1>
          <p className="mb-subtitle">Your parking reservation history</p>
        </div>
      </div>

      <div className="mb-content">
        {bookings.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">—</div>
            <h3>No Bookings Yet</h3>
            <p>Browse parking areas and book your first spot.</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Find Parking →
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking, index) => (
              <div
                key={booking._id}
                className="booking-card fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="booking-info">
                  <div className="booking-location">
                    {booking.parkingAreaId?.name || 'Parking Area'}
                  </div>
                  <div className="booking-slot">
                    Slot {booking.slotId?.slotNumber || 'N/A'}
                    {booking.parkingAreaId?.location?.address
                      ? ` · ${booking.parkingAreaId.location.address}`
                      : ''}
                  </div>
                  <div className="booking-meta">
                    <span>{formatDate(booking.bookingDate)}</span>
                    {booking.startTime && (
                      <span>{booking.startTime} – {booking.endTime}</span>
                    )}
                    <span className={`badge ${statusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="booking-right">
                  <div className="booking-amount">₹{booking.amount}</div>
                  <div className="booking-actions">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="btn btn-primary btn-sm"
                    >
                      Ticket
                    </button>
                    <button
                      onClick={() => openNavigation(booking.parkingAreaId?.location)}
                      className="btn btn-secondary btn-sm"
                    >
                      Navigate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Parking Ticket</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <Ticket
              booking={selectedBooking}
              parkingArea={selectedBooking.parkingAreaId}
              slot={selectedBooking.slotId}
              onClose={() => setSelectedBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
