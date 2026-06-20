import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './Admin.css';

const SlotManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parkingArea, setParkingArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // AI Auto-Detection State
  const [isAiDetecting, setIsAiDetecting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastDetectionStats, setLastDetectionStats] = useState(null);
  const modelRef = useRef(null);
  const cctvImgRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const slotsRef = useRef([]);

  useEffect(() => {
    fetchData();
    return () => stopAiDetection(); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/parking/${id}`);
      setParkingArea(res.data);
      setSlots(res.data.slots || []);
      // Auto-start continuous AI detection!
      if (!isAiDetecting && res.data?.cctvUrl) {
         startAiDetection(res.data.cctvUrl);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const freeSlot = async (slotId) => {
    setActionLoading(slotId);
    try {
      await axios.put(`/api/parking/${id}/slots/${slotId}/free`);
      await fetchData();
    } catch (error) {
      console.error('Failed to free slot:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSlotStatus = async (slotId, currentStatus) => {
    const newStatus = currentStatus === 'occupied' ? 'empty' : 'occupied';
    setActionLoading(slotId);
    try {
      await axios.put(`/api/parking/${id}/slots/${slotId}/status`, { status: newStatus });
      await fetchData();
    } catch (error) {
      console.error('Failed to update slot:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // --- AI Detection Logic ---
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const runDetection = async () => {
    if (!modelRef.current || !cctvImgRef.current) return;
    try {
      // Get image dimensions for scaling bounding boxes
      const imgWidth = cctvImgRef.current.width;
      const imgHeight = cctvImgRef.current.height;
      if (imgWidth === 0 || imgHeight === 0) return;

      const predictions = await modelRef.current.detect(cctvImgRef.current);
      
      // Allow ANY recognized object (person, bottle, cell phone, etc) to act as an obstacle
      // so the user can easily test it locally without needing a real car.
      const obstacles = predictions.filter(p => p.score > 0.35);
      setLastDetectionStats(`Detected ${obstacles.length} objects overlapping regions.`);

      // Since coords are drawn scaled to a max 800 width limit in SlotDrawer:
      const maxW = 800;
      const scaleFactor = maxW / imgWidth;

      const updates = [];

      // Check each slot against obstacle centers
      const currentSlots = slotsRef.current;
      for (const slot of currentSlots) {
        if (slot.status === 'reserved' || !slot.coordinates || slot.coordinates.length < 3) continue;

        let obstacleInSlot = false;
        
        for (const obs of obstacles) {
          // Bbox: [x, y, width, height]
          const centerX = (obs.bbox[0] + obs.bbox[2] / 2) * scaleFactor;
          const centerY = (obs.bbox[1] + obs.bbox[3] / 2) * scaleFactor;

          if (isPointInPolygon({ x: centerX, y: centerY }, slot.coordinates)) {
            obstacleInSlot = true;
            break;
          }
        }

        const predictedStatus = obstacleInSlot ? 'occupied' : 'empty';
        
        if (slot.status !== predictedStatus) {
          updates.push({ slotId: slot._id, status: predictedStatus });
        }
      }

      // Dispatch necessary updates to backend
      if (updates.length > 0) {
        for (const update of updates) {
          try {
            await axios.put(`/api/parking/${id}/slots/${update.slotId}/status`, { status: update.status });
          } catch (e) {
            console.error('Failed AI update for slot', update.slotId, e);
          }
        }
        await fetchData();
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  const startAiDetection = async (cctvUrl) => {
    if (isAiDetecting || !cctvUrl) return;
    setAiLoading(true);
    try {
      if (!modelRef.current) {
        modelRef.current = await cocoSsd.load();
      }
      setIsAiDetecting(true);
      runDetection();
      // Only set interval if we don't already have one
      if (!detectionIntervalRef.current) {
        detectionIntervalRef.current = setInterval(runDetection, 3000);
      }
    } catch (err) {
      console.error('Failed to load AI model:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const stopAiDetection = () => {
    setIsAiDetecting(false);
    setLastDetectionStats(null);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const toggleAiBtn = () => {
    if (isAiDetecting) stopAiDetection();
    else if (parkingArea?.cctvUrl) startAiDetection(parkingArea.cctvUrl);
  };

  if (loading) {
    return <div className="admin-loading"><p>Loading slots...</p></div>;
  }

  const emptySlots = slots.filter(s => s.status === 'empty');
  const occupiedSlots = slots.filter(s => s.status === 'occupied');
  const reservedSlots = slots.filter(s => s.status === 'reserved');

  return (
    <div className="slot-manager-page">
      <div className="container">
        <div className="sm-header fade-in">
          <button onClick={() => navigate('/admin')} className="pf-back">← Back</button>
          <h1 className="sm-title">Slot Manager</h1>
          <p className="sm-subtitle">{parkingArea?.name} — Monitor and manage individual parking slots.</p>
        </div>

        {/* Hidden CCTV feed for AI */}
        {parkingArea?.cctvUrl && (
          <img
            ref={cctvImgRef}
            src={`/api/parking/proxy-stream?url=${encodeURIComponent(parkingArea.cctvUrl)}`}
            crossOrigin="anonymous"
            alt="cctv feed"
            style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }}
          />
        )}

        {/* Stats */}
        <div className="stats-grid fade-in">
          <div className="stat-card">
            <div className="stat-icon">◯</div>
            <div className="stat-value">{emptySlots.length}</div>
            <div className="stat-label">Empty</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">●</div>
            <div className="stat-value">{occupiedSlots.length}</div>
            <div className="stat-label">Occupied</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">◧</div>
            <div className="stat-value">{reservedSlots.length}</div>
            <div className="stat-label">Reserved</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">▦</div>
            <div className="stat-value">{slots.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="manager-actions fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate(`/admin/parking/${id}/slots`)} className="btn btn-primary">
              Draw Slots
            </button>
            <button onClick={() => navigate(`/admin/parking/${id}/bookings`)} className="btn btn-outline">
              View Bookings
            </button>
          </div>
          
          {parkingArea?.cctvUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastDetectionStats && <span style={{ fontSize: '13px', color: 'var(--color-lead)' }}>{lastDetectionStats}</span>}
              <button 
                onClick={toggleAiBtn} 
                className={`btn ${isAiDetecting ? 'btn-danger' : 'btn-secondary'}`}
                disabled={aiLoading}
              >
                {aiLoading ? 'Loading AI…' : isAiDetecting ? 'Stop AI Detect' : 'Start AI Auto-Detect'}
              </button>
            </div>
          )}
        </div>

        {/* Slots Grid */}
        {slots.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">🎨</div>
            <h3>No Slots Created</h3>
            <p>Use the Slot Drawer to draw parking slot boundaries</p>
            <button onClick={() => navigate(`/admin/parking/${id}/slots`)} className="btn btn-primary">
              🎨 Draw Slots
            </button>
          </div>
        ) : (
          <div className="manager-slots-grid">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className={`manager-slot-card ${slot.status}`}
                style={{ background: 'var(--color-midnight-slate)', border: '1px solid rgba(112,112,125,0.2)', padding: '16px 20px', transition: 'background 0.15s ease' }}
              >
                <div className="msc-header">
                  <span className={`msc-status-indicator ${slot.status}`}></span>
                  <h3 className="msc-number">{slot.slotNumber}</h3>
                  <span className={`badge badge-${slot.status === 'empty' ? 'success' : slot.status === 'occupied' ? 'danger' : 'neutral'}`}>
                    {slot.status}
                  </span>
                </div>

                <div className="msc-actions">
                  {slot.status === 'reserved' && (
                    <button
                      onClick={() => freeSlot(slot._id)}
                      className="btn btn-secondary btn-sm"
                      disabled={actionLoading === slot._id}
                      id={`free-slot-${slot.slotNumber}`}
                    >
                      {actionLoading === slot._id ? '⏳' : '🔓'} Free Slot
                    </button>
                  )}
                  {slot.status !== 'reserved' && (
                    <button
                      onClick={() => toggleSlotStatus(slot._id, slot.status)}
                      className={`btn btn-sm ${slot.status === 'occupied' ? 'btn-secondary' : 'btn-danger'}`}
                      disabled={actionLoading === slot._id || isAiDetecting}
                    >
                      {actionLoading === slot._id ? '⏳' : slot.status === 'occupied' ? '✅ Mark Empty' : '🚗 Mark Occupied'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotManager;
