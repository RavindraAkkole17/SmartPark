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

  useEffect(() => {
    fetchParkingAreas();
  }, []);

  const fetchParkingAreas = async () => {
    try {
      const res = await axios.get('/api/parking');
      setParkingAreas(res.data);
    } catch (error) {
      console.error('Failed to fetch parking areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = parkingAreas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase()) ||
    area.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="user-loading">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Finding parking areas near you...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="container">
        {/* Hero Section */}
        <div className="user-hero fade-in">
          <div className="hero-content">
            <h1 className="hero-title">
              Find & Book <span className="hero-highlight">Parking</span> Instantly
            </h1>
            <p className="hero-subtitle">
              Browse available parking areas, view live slot status, and pre-book your spot
            </p>
          </div>
          
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              id="search-parking"
              placeholder="Search by parking name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="user-stats fade-in">
          <div className="user-stat">
            <span className="us-value">{parkingAreas.length}</span>
            <span className="us-label">Parking Areas</span>
          </div>
          <div className="user-stat">
            <span className="us-value">{parkingAreas.reduce((acc, a) => acc + (a.availableSlots || 0), 0)}</span>
            <span className="us-label">Available Slots</span>
          </div>
          <div className="user-stat">
            <span className="us-value">{parkingAreas.reduce((acc, a) => acc + (a.totalSlots || 0), 0)}</span>
            <span className="us-label">Total Slots</span>
          </div>
        </div>

        {/* Parking Areas Grid */}
        <div className="section-header fade-in">
          <h2>Available Parking Areas</h2>
          <span className="result-count">{filteredAreas.length} found</span>
        </div>

        {filteredAreas.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">🅿️</div>
            <h3>No Parking Areas Found</h3>
            <p>{search ? 'Try a different search term' : 'No parking areas are available at the moment'}</p>
          </div>
        ) : (
          <div className="user-parking-grid">
            {filteredAreas.map((area, index) => (
              <ParkingCard
                key={area._id}
                area={area}
                onClick={() => navigate(`/parking/${area._id}`)}
                delay={index * 0.1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
