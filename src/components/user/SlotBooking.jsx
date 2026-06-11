import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Ticket from './Ticket';
import './User.css';

const SlotBooking = ({ slot, parkingArea, onClose, onComplete }) => {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [step, setStep] = useState('date'); // 'date' | 'payment' | 'success'

  const today = new Date().toISOString().split('T')[0];

  const handlePayment = async () => {
    if (!bookingDate) {
      setError('Please select a booking date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Razorpay order
      const orderRes = await axios.post('/api/payment/create-order', {
        amount: parkingArea.pricePerHour,
        receipt: `rcpt_${Date.now()}_${slot._id.substring(18)}`
      });

      const order = orderRes.data;

      // Get Razorpay key
      const keyRes = await axios.get('/api/payment/key');

      // Initialize Razorpay checkout
      const options = {
        key: keyRes.data.key,
        amount: order.amount,
        currency: order.currency,
        name: 'SmartPark',
        description: `Booking for Slot ${slot.slotNumber} at ${parkingArea.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Create booking
              const bookingRes = await axios.post('/api/booking', {
                parkingAreaId: parkingArea._id,
                slotId: slot._id,
                bookingDate,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: parkingArea.pricePerHour
              });

              setBooking(bookingRes.data);
              setStep('success');
            }
          } catch (err) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#6C5CE7'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (showTicket && booking) {
    return <Ticket booking={booking} parkingArea={parkingArea} slot={slot} onClose={() => { setShowTicket(false); onComplete(); }} />;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
        {step === 'success' ? (
          <div className="booking-success fade-in">
            <div className="success-icon">🎉</div>
            <h2>Booking Confirmed!</h2>
            <p>Your parking slot has been reserved successfully</p>
            
            <div className="booking-summary glass-card">
              <div className="summary-row">
                <span>Parking Area</span>
                <strong>{parkingArea.name}</strong>
              </div>
              <div className="summary-row">
                <span>Slot Number</span>
                <strong>{slot.slotNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Booking Date</span>
                <strong>{new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div className="summary-row">
                <span>Amount Paid</span>
                <strong className="amount-green">₹{parkingArea.pricePerHour}</strong>
              </div>
            </div>

            <div className="success-actions">
              <button onClick={() => setShowTicket(true)} className="btn btn-primary btn-lg">
                🎫 View Ticket
              </button>
              <button onClick={onComplete} className="btn btn-outline">
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>🅿️ Book Slot {slot.slotNumber}</h2>
              <button onClick={onClose} className="modal-close">✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="booking-details">
              <div className="bd-card glass-card">
                <div className="bd-row">
                  <span className="bd-label">🏢 Parking Area</span>
                  <span className="bd-value">{parkingArea.name}</span>
                </div>
                <div className="bd-row">
                  <span className="bd-label">📍 Location</span>
                  <span className="bd-value">{parkingArea.location?.address}</span>
                </div>
                <div className="bd-row">
                  <span className="bd-label">🅿️ Slot Number</span>
                  <span className="bd-value highlight">{slot.slotNumber}</span>
                </div>
                <div className="bd-row">
                  <span className="bd-label">💰 Price</span>
                  <span className="bd-value price">₹{parkingArea.pricePerHour}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📅 Select Booking Date</label>
                <input
                  type="date"
                  className="form-input"
                  id="booking-date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={today}
                  required
                />
              </div>

              <button
                onClick={handlePayment}
                className="btn btn-primary btn-lg booking-pay-btn"
                id="pay-now-btn"
                disabled={loading || !bookingDate}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Processing...
                  </span>
                ) : (
                  <>💳 Pay ₹{parkingArea.pricePerHour} & Book</>
                )}
              </button>

              <p className="payment-note">
                🔒 Secured by Razorpay. You will be redirected to the payment gateway.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SlotBooking;
