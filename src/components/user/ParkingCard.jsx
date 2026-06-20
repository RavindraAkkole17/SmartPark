import { useState, useEffect } from 'react';
import './User.css';

const ParkingCard = ({ area, onClick, delay = 0 }) => {
  const total     = area.totalSlots || 0;
  const available = area.availableSlots || 0;
  const pct       = total > 0 ? Math.round((available / total) * 100) : 0;
  const level     = pct > 60 ? 'high' : pct > 20 ? 'medium' : 'low';

  const [hasError, setHasError] = useState(false);

  // Helper to extract actual image URL from Google Images search/redirect links
  const cleanImageUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('imgurl=')) {
        const match = url.match(/imgurl=([^&]+)/);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      }
      const parsed = new URL(url);
      if (parsed.hostname.includes('google.') && parsed.pathname.includes('/imgres')) {
        const imgurl = parsed.searchParams.get('imgurl');
        if (imgurl) return imgurl;
      }
    } catch (e) {
      // ignore
    }
    return url;
  };

  const rawUrl = area.image || area.cctvUrl;
  const imageUrl = cleanImageUrl(rawUrl);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  return (
    <div
      className="parking-card fade-in"
      onClick={onClick}
      style={{ animationDelay: `${delay}s`, cursor: 'pointer' }}
      id={`parking-card-${area._id}`}
    >
      {/* Image */}
      <div className="pc-image">
        {(imageUrl && !hasError) ? (
          <img
            src={imageUrl}
            alt={area.name}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="pc-no-image">P</div>
        )}
        <span className="pc-price-tag">₹{area.pricePerHour}/hr</span>
      </div>

      {/* Body */}
      <div className="pc-body">
        <h3 className="pc-name">{area.name}</h3>
        <p className="pc-location">{area.location?.address || 'Location not specified'}</p>

        {/* Availability bar */}
        <div className="pc-availability">
          <div className="pc-avail-header">
            <span className="pc-avail-label">Availability</span>
            <span className="pc-avail-value">{available}/{total}</span>
          </div>
          <div className="pc-avail-bar">
            <div className={`pc-avail-fill ${level}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Slot counts */}
        <div className="pc-slots-row">
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--slot-empty)' }}></span>
            <span>{available} Free</span>
          </div>
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--slot-occupied)' }}></span>
            <span>{area.occupiedSlots || 0} Taken</span>
          </div>
          <div className="pc-slot-indicator">
            <span className="indicator-dot" style={{ background: 'var(--slot-reserved)' }}></span>
            <span>{area.reservedSlots || 0} Reserved</span>
          </div>
        </div>

        <button className="btn btn-primary btn-sm pc-btn">
          View &amp; Book →
        </button>
      </div>
    </div>
  );
};

export default ParkingCard;
