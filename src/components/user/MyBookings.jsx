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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/booking/my');
      setBookings(res.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openNavigation = (location) => {
    if (location?.lat && location?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
    }
  };

  if (loading) {
    return <div className="user-loading"><p>Loading your bookings...</p></div>;
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header fade-in">
          <h1>🎫 My Bookings</h1>
          <p>View your booking history and tickets</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">🎫</div>
            <h3>No Bookings Yet</h3>
            <p>Browse parking areas and book your first slot</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              🅿️ Find Parking
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking, index) => (
              <div key={booking._id} className="booking-card glass-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bc-main">
                  <div className="bc-left">
                    <div className="bc-slot-badge">
                      {booking.slotId?.slotNumber || 'N/A'}
                    </div>
                    <div className="bc-info">
                      <h3>{booking.parkingAreaId?.name || 'Parking Area'}</h3>
                      <p className="bc-location">📍 {booking.parkingAreaId?.location?.address || 'N/A'}</p>
                      <p className="bc-date">📅 {formatDate(booking.bookingDate)}</p>
                    </div>
                  </div>
                  
                  <div className="bc-right">
                    <div className="bc-amount">₹{booking.amount}</div>
                    <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : booking.status === 'completed' ? 'neutral' : 'danger'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="bc-actions">
                  <button onClick={() => setSelectedBooking(booking)} className="btn btn-primary btn-sm">
                    🎫 View Ticket
                  </button>
                  <button onClick={() => openNavigation(booking.parkingAreaId?.location)} className="btn btn-secondary btn-sm">
                    🧭 Navigate
                  </button>
                  <button onClick={() => navigate(`/parking/${booking.parkingAreaId?._id}`)} className="btn btn-outline btn-sm">
                    👁️ View Parking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBooking && (
          <Ticket
            booking={selectedBooking}
            parkingArea={selectedBooking.parkingAreaId}
            slot={selectedBooking.slotId}
            onClose={() => setSelectedBooking(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MyBookings;
