import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ParkingCard from './ParkingCard';
import './User.css';

const UserDashboard = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchParkingAreas(); }, []);

  const fetchParkingAreas = async () => {
    try {
      const res = await axios.get('/api/parking');
      setParkingAreas(res.data);
    } catch (err) {
      console.error('Failed to fetch parking areas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = parkingAreas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase()) ||
    area.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSlots     = parkingAreas.reduce((a, p) => a + (p.totalSlots || 0), 0);
  const availableSlots = parkingAreas.reduce((a, p) => a + (p.availableSlots || 0), 0);

  if (loading) {
    return (
      <div className="user-loading">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Finding parking areas</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">

      {/* ── Full-Bleed Hero ─────────────────────────── */}
      <div className="user-hero">
        <img
          src="/parking-hero.png"
          alt="SmartPark — Find Your Perfect Spot"
          className="hero-img"
        />
        <div className="hero-overlay">
          <h1 className="hero-headline">
            Find Your Perfect<br />Parking Spot
          </h1>
          <p className="hero-sub">
            Browse available areas, check live slot status, and reserve instantly.
          </p>
          <div className="hero-search">
            <input
              type="text"
              className="hero-search-input"
              id="search-parking"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="hero-search-btn">Search</button>
          </div>
        </div>
      </div>

      {/* ── Stats Band ──────────────────────────────── */}
      <div className="user-stats-band">
        <div className="user-stats-inner">
          <div className="user-stat">
            <span className="us-value">{parkingAreas.length}</span>
            <span className="us-label">Parking Areas</span>
          </div>
          <div className="user-stat">
            <span className="us-value">{availableSlots}</span>
            <span className="us-label">Available Slots</span>
          </div>
          <div className="user-stat">
            <span className="us-value">{totalSlots}</span>
            <span className="us-label">Total Capacity</span>
          </div>
        </div>
      </div>

      {/* ── Parking Grid ────────────────────────────── */}
      <div className="user-content">
        <div className="section-header">
          <h2>
            {search
              ? `Results for "${search}"`
              : 'Available Parking Areas'}
          </h2>
          <span className="result-count">{filteredAreas.length} found</span>
        </div>

        {filteredAreas.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">P</div>
            <h3>No Parking Areas Found</h3>
            <p>
              {search
                ? 'Try a different search term.'
                : 'No parking areas are available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="user-grid">
            {filteredAreas.map((area, index) => (
              <ParkingCard
                key={area._id}
                area={area}
                onClick={() => navigate(`/parking/${area._id}`)}
                delay={index * 0.05}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
