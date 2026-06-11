import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const ParkingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    cctvUrl: '',
    pricePerHour: 50,
    image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchParkingArea();
    }
  }, [id]);

  const fetchParkingArea = async () => {
    try {
      const res = await axios.get(`/api/parking/${id}`);
      setFormData({
        name: res.data.name,
        address: res.data.location?.address || '',
        lat: res.data.location?.lat || '',
        lng: res.data.location?.lng || '',
        cctvUrl: res.data.cctvUrl || '',
        pricePerHour: res.data.pricePerHour || 50,
        image: res.data.image || ''
      });
    } catch (err) {
      setError('Failed to load parking area');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
          setGettingLocation(false);
        },
        (err) => {
          setError('Failed to get location. Please enter manually.');
          setGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        location: {
          address: formData.address,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        cctvUrl: formData.cctvUrl,
        pricePerHour: parseFloat(formData.pricePerHour),
        image: formData.image
      };

      if (isEdit) {
        await axios.put(`/api/parking/${id}`, payload);
      } else {
        await axios.post('/api/parking', payload);
      }

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save parking area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parking-form-page">
      <div className="container">
        <div className="form-card glass-card fade-in">
          <div className="form-header">
            <button onClick={() => navigate('/admin')} className="back-btn">
              ← Back
            </button>
            <h1>{isEdit ? '✏️ Edit Parking Area' : '➕ New Parking Area'}</h1>
            <p>{isEdit ? 'Update your parking area details' : 'Set up a new parking area for your facility'}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} id="parking-form">
            <div className="form-section">
              <h3 className="section-title">📋 Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label">Parking Name</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  id="parking-name"
                  placeholder="e.g., City Center Parking"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price per Hour (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  name="pricePerHour"
                  id="parking-price"
                  placeholder="50"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">📍 Location Details</h3>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  name="address"
                  id="parking-address"
                  placeholder="Full address of parking area"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    name="lat"
                    id="parking-lat"
                    placeholder="18.5204"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    name="lng"
                    id="parking-lng"
                    placeholder="73.8567"
                    value={formData.lng}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? '📡 Getting location...' : '📍 Use Current Location'}
              </button>
            </div>

            <div className="form-section">
              <h3 className="section-title">📹 CCTV Configuration</h3>
              
              <div className="form-group">
                <label className="form-label">CCTV Stream / Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  name="cctvUrl"
                  id="parking-cctv"
                  placeholder="https://example.com/cctv-feed.jpg"
                  value={formData.cctvUrl}
                  onChange={handleChange}
                />
                <small className="form-hint">Enter a URL for CCTV feed image or video stream. Slot boundaries will be drawn over this.</small>
              </div>

              <div className="form-group">
                <label className="form-label">Parking Area Image URL (optional)</label>
                <input
                  type="url"
                  className="form-input"
                  name="image"
                  id="parking-image"
                  placeholder="https://example.com/parking.jpg"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" id="save-parking-btn" disabled={loading}>
                {loading ? '💾 Saving...' : isEdit ? '💾 Update Parking Area' : '🚀 Create Parking Area'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParkingForm;
