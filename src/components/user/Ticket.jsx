import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './User.css';

const Ticket = ({ booking, parkingArea, slot, onClose }) => {
  const ticketRef = useRef(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const qrData = JSON.stringify({
    bookingId: booking._id,
    slot: slot?.slotNumber || booking.slotId?.slotNumber,
    parking: parkingArea?.name || booking.parkingAreaId?.name,
    date: booking.bookingDate,
    user: booking.userId?.name,
    paymentId: booking.paymentId
  });

  const handlePrint = () => {
    const printContent = ticketRef.current;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>SmartPark Ticket</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 20px; background: white; color: #333; }
            .ticket-print { text-align: center; max-width: 350px; margin: 0 auto; border: 2px dashed #6C5CE7; padding: 24px; border-radius: 12px; }
            h1 { font-size: 24px; color: #6C5CE7; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { color: #666; }
            .detail-value { font-weight: 600; }
            .qr-section { margin: 20px 0; }
            .ticket-id { font-family: monospace; font-size: 12px; color: #999; margin-top: 16px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎫 Booking Ticket</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="ticket-card" ref={ticketRef} id="booking-ticket">
          <div className="ticket-header">
            <span className="ticket-logo">🅿️</span>
            <h1 className="ticket-brand">SmartPark</h1>
            <p className="ticket-tagline">Parking Confirmation</p>
          </div>

          <div className="ticket-divider">
            <div className="divider-circle left"></div>
            <div className="divider-line"></div>
            <div className="divider-circle right"></div>
          </div>

          <div className="ticket-details">
            <div className="detail-row">
              <span className="detail-label">🏢 Parking Area</span>
              <span className="detail-value">{parkingArea?.name || booking.parkingAreaId?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📍 Location</span>
              <span className="detail-value">{parkingArea?.location?.address || booking.parkingAreaId?.location?.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🅿️ Slot Number</span>
              <span className="detail-value slot-highlight">{slot?.slotNumber || booking.slotId?.slotNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📅 Booking Date</span>
              <span className="detail-value">{formatDate(booking.bookingDate)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">👤 Booked By</span>
              <span className="detail-value">{booking.userId?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📧 Email</span>
              <span className="detail-value">{booking.userId?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">💰 Amount Paid</span>
              <span className="detail-value amount-green">₹{booking.amount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">💳 Payment ID</span>
              <span className="detail-value payment-mono">{booking.paymentId || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📊 Status</span>
              <span className="detail-value">
                <span className="badge badge-success">{booking.status}</span>
              </span>
            </div>
          </div>

          <div className="ticket-divider">
            <div className="divider-circle left"></div>
            <div className="divider-line"></div>
            <div className="divider-circle right"></div>
          </div>

          <div className="ticket-qr">
            <QRCodeSVG
              value={qrData}
              size={160}
              bgColor="transparent"
              fgColor="#6C5CE7"
              level="M"
              includeMargin={false}
            />
            <p className="qr-label">Scan this QR at the parking entrance</p>
          </div>

          <div className="ticket-footer">
            <p className="ticket-id">Booking ID: {booking._id}</p>
            <p className="ticket-timestamp">Booked on: {formatDate(booking.createdAt)}</p>
          </div>
        </div>

        <div className="ticket-actions">
          <button onClick={handlePrint} className="btn btn-primary" id="print-ticket-btn">
            🖨️ Print Ticket
          </button>
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
