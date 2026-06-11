import './User.css';

const ParkingCard = ({ area, onClick, delay = 0 }) => {
  const availabilityPercentage = area.totalSlots > 0
    ? Math.round((area.availableSlots / area.totalSlots) * 100)
    : 0;

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 60) return 'high';
    if (availabilityPercentage > 20) return 'medium';
    return 'low';
  };

  return (
    <div
      className="parking-card glass-card fade-in"
      onClick={onClick}
      style={{ animationDelay: `${delay}s`, cursor: 'pointer' }}
      id={`parking-card-${area._id}`}
    >
      {/* Card Header Image */}
      <div className="pc-image">
        {area.image || area.cctvUrl ? (
          <img src={area.image || area.cctvUrl} alt={area.name} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : null}
        <div className="pc-image-overlay">
          <span className="pc-price-tag">₹{area.pricePerHour}/hr</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="pc-body">
        <h3 className="pc-name">{area.name}</h3>
        <p className="pc-location">
          📍 {area.location?.address || 'Location not specified'}
        </p>

        {/* Availability Bar */}
        <div className="pc-availability">
          <div className="pc-avail-header">
            <span className="pc-avail-label">Availability</span>
            <span className={`pc-avail-value ${getAvailabilityColor()}`}>
              {area.availableSlots || 0} / {area.totalSlots || 0}
            </span>
          </div>
          <div className="pc-avail-bar">
            <div
              className={`pc-avail-fill ${getAvailabilityColor()}`}
              style={{ width: `${availabilityPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Slot Status */}
        <div className="pc-slots-row">
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--success)' }}></span>
            <span>{area.availableSlots || 0} Empty</span>
          </div>
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--danger)' }}></span>
            <span>{area.occupiedSlots || 0} Occupied</span>
          </div>
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--text-muted)' }}></span>
            <span>{area.reservedSlots || 0} Reserved</span>
          </div>
        </div>

        {/* CTA */}
        <button className="btn btn-primary pc-btn">
          🅿️ View Slots & Book
        </button>
      </div>
    </div>
  );
};

export default ParkingCard;
