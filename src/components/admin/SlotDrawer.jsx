import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

const SlotDrawer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [parkingArea, setParkingArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [slotNumber, setSlotNumber] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  useEffect(() => {
    fetchParkingArea();
  }, [id]);

  const fetchParkingArea = async () => {
    try {
      const res = await axios.get(`/api/parking/${id}`);
      setParkingArea(res.data);
      setSlots(res.data.slots || []);

      // Load CCTV image as background
      if (res.data.cctvUrl) {
        const img = new Image();
        img.onload = () => {
          setBgImage(img);
          // Fit canvas to image aspect ratio within container
          const maxW = 800;
          const ratio = img.height / img.width;
          setCanvasSize({ width: maxW, height: Math.round(maxW * ratio) });
        };
        img.onerror = () => {
          // Use placeholder if image fails
          setBgImage(null);
        };
        img.src = res.data.cctvUrl;
      }
    } catch (err) {
      setError('Failed to load parking area');
    } finally {
      setLoading(false);
    }
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Grid pattern background
      ctx.fillStyle = '#1e1e2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(112, 112, 125, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
    }

    // Draw existing slots
    slots.forEach((slot) => {
      if (slot.coordinates && slot.coordinates.length > 0) {
        const color = slot.status === 'occupied' ? '#f87171' :
                      slot.status === 'reserved' ? '#70707d' : '#4ade80';
        
        ctx.beginPath();
        ctx.moveTo(slot.coordinates[0].x, slot.coordinates[0].y);
        slot.coordinates.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        
        ctx.fillStyle = color + '40';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw slot label
        const centerX = slot.coordinates.reduce((s, p) => s + p.x, 0) / slot.coordinates.length;
        const centerY = slot.coordinates.reduce((s, p) => s + p.y, 0) / slot.coordinates.length;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Background for label
        const metrics = ctx.measureText(slot.slotNumber);
        ctx.fillStyle = color + 'CC';
        ctx.fillRect(centerX - metrics.width / 2 - 6, centerY - 10, metrics.width + 12, 20);
        ctx.borderRadius = 4;
        
        ctx.fillStyle = 'white';
        ctx.fillText(slot.slotNumber, centerX, centerY);
      }
    });

    // Draw current points being placed
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      currentPoints.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);

        // Draw point markers
        ctx.fillStyle = '#5266eb';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      if (currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = '#5266eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [slots, currentPoints, bgImage]);

  useEffect(() => {
    let animationFrameId;
    const render = () => {
      drawCanvas();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [drawCanvas]);

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  const startDrawing = () => {
    if (!slotNumber.trim()) {
      setError('Please enter a slot number first');
      return;
    }
    setIsDrawing(true);
    setCurrentPoints([]);
    setError('');
    setSuccess('');
  };

  const finishSlot = () => {
    if (currentPoints.length < 3) {
      setError('A slot needs at least 3 points to form a polygon');
      return;
    }

    const newSlot = {
      slotNumber: slotNumber.trim(),
      coordinates: currentPoints,
      status: 'empty'
    };

    setSlots([...slots, newSlot]);
    setCurrentPoints([]);
    setIsDrawing(false);
    setSlotNumber('');
    setSuccess(`Slot "${newSlot.slotNumber}" created! Click Save to persist.`);
  };

  const cancelDrawing = () => {
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const saveSlots = async () => {
    setSaving(true);
    setError('');
    try {
      const slotsData = slots.map(s => ({
        slotNumber: s.slotNumber,
        coordinates: s.coordinates
      }));

      await axios.post(`/api/parking/${id}/slots`, { slots: slotsData });
      setSuccess('All slots saved successfully! ✅');
      fetchParkingArea(); // Refresh data
    } catch (err) {
      setError('Failed to save slots: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading"><p>Loading slot drawer...</p></div>;
  }

  return (
    <div className="slot-drawer-page">
      <div className="container">
        <div className="sd-header fade-in">
          <button onClick={() => navigate('/admin')} className="pf-back">← Back</button>
          <h1 className="sd-title">Slot Drawer</h1>
          <p className="sd-subtitle">{parkingArea?.name} — Draw polygon boundaries for each parking slot on the CCTV feed.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="drawer-layout">
          {/* Canvas Area */}
          <div className="canvas-section glass-card" ref={containerRef}>
            <div className="canvas-toolbar">
              <div className="toolbar-left">
                <input
                  type="text"
                  className="form-input slot-input"
                  placeholder="Slot # (e.g., A1)"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  disabled={isDrawing}
                  id="slot-number-input"
                />
                {!isDrawing ? (
                  <button onClick={startDrawing} className="btn btn-primary btn-sm" id="start-drawing-btn">
                    Start Drawing
                  </button>
                ) : (
                  <>
                    <button onClick={finishSlot} className="btn btn-secondary btn-sm" disabled={currentPoints.length < 3}>
                      Finish Slot ({currentPoints.length} pts)
                    </button>
                    <button onClick={cancelDrawing} className="btn btn-outline btn-sm">
                      Cancel
                    </button>
                  </>
                )}
              </div>
              <button onClick={saveSlots} className="btn btn-primary" disabled={saving || slots.length === 0} id="save-slots-btn">
                {saving ? 'Saving…' : `Save Slots (${slots.length})`}
              </button>
            </div>

            {isDrawing && (
              <div className="drawing-hint">
                🖱️ Click on the canvas to place points for slot <strong>{slotNumber}</strong>. 
                Place at least 3 points to form a polygon, then click "Finish Slot".
              </div>
            )}

            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onClick={handleCanvasClick}
                className={`drawing-canvas ${isDrawing ? 'drawing-mode' : ''}`}
                id="slot-canvas"
              />
            </div>

            <div className="slot-legend" style={{ marginTop: '12px' }}>
              <div className="legend-item"><span className="legend-dot empty"></span><span>Empty</span></div>
              <div className="legend-item"><span className="legend-dot occupied"></span><span>Occupied</span></div>
              <div className="legend-item"><span className="legend-dot reserved"></span><span>Reserved</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--color-mercury-blue)' }}></span><span>Drawing</span></div>
            </div>
          </div>

          {/* Slots List */}
          <div className="slots-panel" style={{ background: 'var(--color-midnight-slate)', border: '1px solid rgba(112,112,125,0.2)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-silver)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Slots ({slots.length})</h3>
            {slots.length === 0 ? (
              <p className="slots-empty">No slots drawn yet. Use the canvas to draw slot boundaries.</p>
            ) : (
              <div className="slots-list">
                {slots.map((slot, index) => (
                  <div key={index} className="slot-item">
                    <div className="slot-item-info">
                      <span className={`slot-status-dot ${slot.status}`}></span>
                      <span className="slot-item-number">{slot.slotNumber}</span>
                      <span className="slot-item-points">{slot.coordinates?.length} pts</span>
                    </div>
                    <button onClick={() => removeSlot(index)} className="slot-remove-btn" title="Remove slot">
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotDrawer;
