import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const ParkingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '', address: '', lat: '', lng: '', cctvUrl: '', pricePerHour: 50, image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => { if (isEdit) fetchParkingArea(); }, [id]);

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
    } catch { setError('Failed to load parking area'); }
  };

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

  const handleChange = (e) => {
    let { name, value } = e.target;
    if ((name === 'image' || name === 'cctvUrl') && value) {
      if (value.includes('imgurl=') || (value.includes('google.') && value.includes('/imgres'))) {
        value = cleanImageUrl(value);
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
          setGettingLocation(false);
        },
        () => { setError('Failed to get location. Please enter manually.'); setGettingLocation(false); }
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
        location: { address: formData.address, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
        cctvUrl: formData.cctvUrl,
        pricePerHour: parseFloat(formData.pricePerHour),
        image: formData.image
      };
      if (isEdit) await axios.put(`/api/parking/${id}`, payload);
      else await axios.post('/api/parking', payload);
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
        <div className="pf-header fade-in">
          <button onClick={() => navigate('/admin')} className="pf-back">← Back</button>
          <h1 className="pf-title">{isEdit ? 'Edit Parking Area' : 'New Parking Area'}</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} id="parking-form" className="pf-body">
          {/* Basic Info */}
          <div className="pf-section fade-in">
            <div className="pf-section-title">Basic Information</div>

            <div className="form-group">
              <label className="form-label">Parking name</label>
              <input type="text" className="form-input" name="name" id="parking-name"
                placeholder="e.g., City Center Parking" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price per hour (₹)</label>
              <input type="number" className="form-input" name="pricePerHour" id="parking-price"
                placeholder="50" value={formData.pricePerHour} onChange={handleChange} required min="1" />
            </div>
          </div>

          {/* Location */}
          <div className="pf-section fade-in">
            <div className="pf-section-title">Location</div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input type="text" className="form-input" name="address" id="parking-address"
                placeholder="Full address of parking area" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" name="lat" id="parking-lat"
                  placeholder="18.5204" value={formData.lat} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" name="lng" id="parking-lng"
                  placeholder="73.8567" value={formData.lng} onChange={handleChange} required />
              </div>
            </div>

            <button type="button" className="btn btn-outline btn-sm" onClick={getCurrentLocation} disabled={gettingLocation}>
              {gettingLocation ? 'Getting location…' : 'Use current location'}
            </button>
          </div>

          {/* CCTV */}
          <div className="pf-section fade-in">
            <div className="pf-section-title">CCTV & Media</div>

            <div className="form-group">
              <label className="form-label">CCTV stream / image URL</label>
              <input type="url" className="form-input" name="cctvUrl" id="parking-cctv"
                placeholder="https://example.com/cctv-feed.jpg" value={formData.cctvUrl} onChange={handleChange} />
              <small style={{ fontSize: '12px', color: 'var(--color-lead)', marginTop: '8px', display: 'block' }}>
                Enter a URL for a CCTV feed image or video stream. Slot boundaries will be drawn over this.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Parking area image URL (optional)</label>
              <input type="url" className="form-input" name="image" id="parking-image"
                placeholder="https://example.com/parking.jpg" value={formData.image} onChange={handleChange} />
              {formData.image && (
                <div className="admin-image-preview">
                  <img
                    src={formData.image}
                    alt="Parking Area Preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pf-actions fade-in">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" id="save-parking-btn" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Parking Area' : 'Create Parking Area'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParkingForm;
