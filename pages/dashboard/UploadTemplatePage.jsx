import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Idinagdag ito
import axios from 'axios';
import './UploadTemplatePage.css';

const PLACEHOLDER_OPTIONS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'course', label: 'Course' },
  { key: 'issued_by', label: 'Issued By' },
  { key: 'date_issued', label: 'Date Issued' }
];

const DEFAULT_MARKER_STYLE = {
  fontSize: 24,
  color: '#111111',
  align: 'center'
};

const UploadTemplatePage = () => {
  const navigate = useNavigate(); // Idinagdag ito
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [markers, setMarkers] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activePlaceholderKey, setActivePlaceholderKey] = useState('full_name');
  const [draggingMarkerId, setDraggingMarkerId] = useState(null);
  const [placeholderStyles, setPlaceholderStyles] = useState(() => {
    return PLACEHOLDER_OPTIONS.reduce((acc, option) => {
      acc[option.key] = { ...DEFAULT_MARKER_STYLE };
      return acc;
    }, {});
  });

  const fileInputRef = useRef(null);
  const suppressNextImageClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getPlaceholderMeta = (key) => {
    return PLACEHOLDER_OPTIONS.find((option) => option.key === key) || PLACEHOLDER_OPTIONS[0];
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const nextPreviewUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(nextPreviewUrl);
    }
  };

  const addOrUpdateMarker = (key, xPct = 50, yPct = 50) => {
    const placeholder = getPlaceholderMeta(key);
    const style = placeholderStyles[key] || DEFAULT_MARKER_STYLE;
    setMarkers((prev) => {
      const existing = prev.find((marker) => marker.key === placeholder.key);
      const nextMarker = {
        id: existing?.id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        key: placeholder.key,
        label: placeholder.label,
        xPct: Number(xPct.toFixed(2)),
        yPct: Number(yPct.toFixed(2)),
        fontSize: style.fontSize,
        color: style.color,
        align: style.align
      };
      if (!existing) {
        return prev.concat(nextMarker);
      }
      return prev.map((marker) => marker.key !== placeholder.key ? marker : nextMarker);
    });
  };

  const onImageClick = (e) => {
    if (suppressNextImageClickRef.current) {
      suppressNextImageClickRef.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    addOrUpdateMarker(activePlaceholderKey, xPct, yPct);
  };

  const handleMarkerPointerDown = (e, markerId) => {
    e.preventDefault();
    e.stopPropagation();
    suppressNextImageClickRef.current = true;
    setDraggingMarkerId(markerId);
  };

  const handleCanvasPointerMove = (e) => {
    if (!draggingMarkerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedXPct = Math.max(0, Math.min(100, xPct));
    const clampedYPct = Math.max(0, Math.min(100, yPct));
    setMarkers((prev) => prev.map((marker) => {
      if (marker.id !== draggingMarkerId) return marker;
      return {
        ...marker,
        xPct: Number(clampedXPct.toFixed(2)),
        yPct: Number(clampedYPct.toFixed(2))
      };
    }));
  };

  const handleCanvasPointerUp = () => {
    setDraggingMarkerId(null);
  };

  const removeMarker = (markerId) => {
    setMarkers((prev) => prev.filter((marker) => marker.id !== markerId));
  };

  const handleStyleChange = (field, value) => {
    setPlaceholderStyles((prev) => {
      const nextStyle = {
        ...(prev[activePlaceholderKey] || DEFAULT_MARKER_STYLE),
        [field]: value
      };
      const nextStyles = { ...prev, [activePlaceholderKey]: nextStyle };
      setMarkers((currentMarkers) => currentMarkers.map((marker) => {
        if (marker.key !== activePlaceholderKey) return marker;
        return { ...marker, ...nextStyle };
      }));
      return nextStyles;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !templateName) {
      setMessage({ type: 'error', text: 'Please provide both name and file.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('name', templateName);
    formData.append('background', file);
    formData.append('placeholders', JSON.stringify({ version: 1, markers }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:8000/api/templates/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: 'Template uploaded successfully!' });
        setFile(null);
        setTemplateName('');
        setMarkers([]);
        setPlaceholderStyles(PLACEHOLDER_OPTIONS.reduce((acc, option) => {
          acc[option.key] = { ...DEFAULT_MARKER_STYLE };
          return acc;
        }, {}));
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      const serverErr = error.response?.data;
      const errorText = serverErr ? Object.keys(serverErr).map(k => `${k.toUpperCase()}: ${Array.isArray(serverErr[k]) ? serverErr[k].join(', ') : serverErr[k]}`).join(' | ') : 'Upload failed.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Back Button Idinagdag dito */}
      <button className="back-btn" onClick={() => navigate(-1)}>
         Back
      </button>

      {message.text && (
        <div className={message.type === 'success' ? 'success-toast' : 'error-toast'}>
          <div className="toast-content">
            <span className="toast-icon">{message.type === 'success' ? '✅' : '❌'}</span>
            <div className="toast-text">
              <strong>{message.type === 'success' ? 'Success' : 'Error'}</strong>
              <p>{message.text}</p>
            </div>
          </div>
        </div>
      )}
      <div className="upload-card">
        <div className="upload-header">
          <h1>Upload Template</h1>
          <p>Fill in the details to register your certificate design.</p>
        </div>
        <form className="upload-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label>Template Name</label>
            <input
              type="text"
              placeholder="e.g. Graduation 2026"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
          </div>
          <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              hidden
            />
            <div className="drop-zone-label">
              <span className="upload-icon">📄</span>
              {file ? <strong>{file.name}</strong> : "Click to upload Background Image"}
            </div>
          </div>
          {previewUrl && (
            <div className="template-editor">
              <div className="placeholder-toolbar">
                {PLACEHOLDER_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={activePlaceholderKey === option.key ? 'tool-chip active' : 'tool-chip'}
                    onClick={() => setActivePlaceholderKey(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="editor-hint">
                Selected: <strong>{getPlaceholderMeta(activePlaceholderKey).label}</strong>.
              </p>
              <div className="marker-controls">
                <label>
                  Font Size
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={placeholderStyles[activePlaceholderKey]?.fontSize || 24}
                    onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                  />
                  <span>{placeholderStyles[activePlaceholderKey]?.fontSize || 24}px</span>
                </label>
                <label>
                  Color
                  <input
                    type="color"
                    value={placeholderStyles[activePlaceholderKey]?.color || '#111111'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                  />
                </label>
                <label>
                  Align
                  <select
                    value={placeholderStyles[activePlaceholderKey]?.align || 'center'}
                    onChange={(e) => handleStyleChange('align', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
              <div
                className="template-preview"
                onClick={onImageClick}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerUp}
              >
                <img src={previewUrl} alt="Template preview" draggable={false} />
                {markers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    className="template-marker"
                    style={{
                      left: `${marker.xPct}%`,
                      top: `${marker.yPct}%`,
                      fontSize: `${marker.fontSize}px`,
                      color: marker.color,
                      textAlign: marker.align,
                      justifyContent: marker.align === 'left' ? 'flex-start' : marker.align === 'right' ? 'flex-end' : 'center'
                    }}
                    onPointerDown={(e) => handleMarkerPointerDown(e, marker.id)}
                  >
                    {`{{${marker.key}}}`}
                  </button>
                ))}
              </div>
              <div className="marker-list">
                {markers.length === 0 ? (
                  <p className="marker-empty">No markers yet.</p>
                ) : (
                  markers.map((marker) => (
                    <div key={marker.id} className="marker-row">
                      <span>{marker.label}</span>
                      <span>{marker.xPct}%, {marker.yPct}%</span>
                      <button type="button" onClick={() => removeMarker(marker.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Confirm Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadTemplatePage;