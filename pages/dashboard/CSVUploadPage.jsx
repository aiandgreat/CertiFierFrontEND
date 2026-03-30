import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CSVUploadPage.css';

const CSVUploadPage = () => {
  const navigate = useNavigate();
  const [csvFile, setCsvFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/templates/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTemplates(response.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setMessage({ type: 'error', text: 'Failed to load templates.' });
      }
    };

    fetchTemplates();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith('.csv')) {
        setCsvFile(selectedFile);
      } else {
        setMessage({ type: 'error', text: 'Please select a valid CSV file.' });
      }
    }
  };

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csvFile || !selectedTemplate) {
      setMessage({ type: 'error', text: 'Please select both a CSV file and a template.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('csv_file', csvFile);
    formData.append('template', selectedTemplate);

    try {
      const token = localStorage.getItem('token');

      const createResponse = await axios.post(
        'http://127.0.0.1:8000/api/uploads/create/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const uploadId = createResponse.data.id;

      await axios.post(
        `http://127.0.0.1:8000/api/uploads/${uploadId}/process/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'CSV uploaded and processed successfully!' });

      setCsvFile(null);
      setSelectedTemplate('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error.response?.data);

      const serverErr = error.response?.data;
      const errorText = serverErr
        ? Object.keys(serverErr)
            .map(k =>
              `${k.toUpperCase()}: ${
                Array.isArray(serverErr[k])
                  ? serverErr[k].join(', ')
                  : serverErr[k]
              }`
            )
            .join(' | ')
        : 'Upload failed.';

      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setSelectedTemplate('');
    setMessage({ type: '', text: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-page-container">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        Back
      </button>

      {message.text && (
        <div className={message.type === 'success' ? 'success-toast' : 'error-toast'}>
          <div className="toast-content">
            <span className="toast-icon">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            <div className="toast-text">
              <strong>{message.type === 'success' ? 'Success' : 'Error'}</strong>
              <p>{message.text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="upload-card">
        <div className="upload-header">
          <h1>Upload CSV</h1>
          <p>Upload a CSV file and select a template to generate certificates in bulk.</p>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Template</label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              required
            >
              <option value="">Choose a template...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              hidden
            />

            <div className="drop-zone-label">
              <span className="upload-icon">📄</span>
              {csvFile ? (
                <strong>{csvFile.name}</strong>
              ) : (
                "Click to upload CSV File"
              )}
            </div>
          </div>

          <div className="upload-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload CSV'}
            </button>
            <button type="button" className="btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CSVUploadPage;