import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCerts: 0, totalUsers: 0, uploads: 0 });
  const [recentCerts, setRecentCerts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // IMAGE PREVIEW MODAL STATE
  const [previewImage, setPreviewImage] = useState(null);

  const [editingCert, setEditingCert] = useState(null);
  const [editFormData, setEditFormData] = useState({ full_name: '', course: '' });
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });

  const token = localStorage.getItem('token');
  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [certs, users, uploads, tmpls] = await Promise.all([
        axios.get(`${API_BASE}/api/certificates/`, { headers }),
        axios.get(`${API_BASE}/api/users/`, { headers }),
        axios.get(`${API_BASE}/api/uploads/`, { headers }),
        axios.get(`${API_BASE}/api/templates/`, { headers })
      ]);

      setRecentCerts(certs.data);
      setTemplates(tmpls.data);
      setStats({
        totalCerts: certs.data.length,
        totalUsers: users.data.length,
        uploads: uploads.data.length
      });
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * IMPORTANT: Sa Django, ang FileField/ImageField ay nagbabalik ng path na 
   * kadalasang nagsisimula sa /media/. Kailangan natin itong dugtungan ng API_BASE.
   */
  const getFullUrl = (path) => {
    if (!path) return "";

    // Kung ang path ay full URL na mula sa Django (nagsisimula sa http), ibalik na agad
    if (path.startsWith('http')) return path;

    // Linisin ang path: tanggalin ang anumang leading slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Siguraduhin na ang API_BASE ay walang trailing slash
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

    const finalUrl = `${base}/${cleanPath}`;
    console.log("Checking Image URL:", finalUrl); // I-check mo ito sa console (F12)
    return finalUrl;
  };

  const handleDelete = (id, type) => {
    const url = type === 'cert'
      ? `${API_BASE}/api/certificates/${id}/`
      : `${API_BASE}/api/templates/${id}/`;

    setModal({
      show: true, type: 'confirm', title: 'Confirm Delete',
      message: 'Are you sure you want to delete this item?',
      onConfirm: async () => {
        try {
          await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
          fetchData();
          setModal({ ...modal, show: false });
        } catch (err) { console.error(err); }
      }
    });
  };

  if (loading) return <div className="loading-screen">Loading Portal...</div>;

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>CertiFier</h2>
        <nav className="admin-nav">
          <Link to="/AdminDashboard" className="admin-nav-link active">Overview</Link>
          <Link to="/UploadTemplate" className="admin-nav-link">Templates</Link>
          <Link to="/CSVUpload" className="admin-nav-link">Bulk Upload</Link>
          <Link to="/verify" className="admin-nav-link">Verify Tool</Link>
        </nav>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
      </aside>

      <main className="admin-main">
        <header>
          <h1>Administrator Dashboard</h1>
          <p>System metrics and issuance management.</p>
        </header>

        {/* STATS SECTION */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card"><h3>{stats.totalCerts}</h3><p>Certificates Issued</p></div>
          <div className="admin-stat-card"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          <div className="admin-stat-card"><h3>{stats.uploads}</h3><p>Bulk Uploads</p></div>
        </section>

        {/* ISSUANCES TABLE */}
        <section className="admin-table-container">
          <h3>Recent Issuances</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Full ID</th>
                  <th>Recipient</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCerts.map(cert => (
                  <tr key={cert.id}>
                    <td>#{cert.certificate_id?.toUpperCase()}</td>
                    <td>
                      {editingCert === cert.id ?
                        <input className="edit-input" value={editFormData.full_name} onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })} />
                        : <div style={{ fontWeight: '600' }}>{cert.full_name}</div>}
                    </td>
                    <td>
                      {editingCert === cert.id ?
                        <input className="edit-input" value={editFormData.course} onChange={e => setEditFormData({ ...editFormData, course: e.target.value })} />
                        : cert.course}
                    </td>
                    <td><span className={`badge ${cert.status?.toLowerCase()}`}>{cert.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        {editingCert === cert.id ? (
                          <>
                            <button className="save-btn" onClick={() => handleSaveEdit(cert.id)}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingCert(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="edit-btn" onClick={() => { setEditingCert(cert.id); setEditFormData({ full_name: cert.full_name, course: cert.course }) }}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(cert.id, 'cert')}>Delete</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TEMPLATES TABLE */}
        <section className="admin-table-container">
          <h3>All Templates</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Background</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(tmpl => (
                  <tr key={tmpl.id}>
                    <td style={{ fontWeight: '600' }}>{tmpl.name}</td>
                    <td>
                      <button
                        className="view-file-btn"
                        onClick={() => setPreviewImage(getFullUrl(tmpl.background_image))}
                      >
                        View Template
                      </button>
                    </td>
                    <td>{new Date(tmpl.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => navigate('/UploadTemplate')}>Manage</button>
                        <button className="delete-btn" onClick={() => handleDelete(tmpl.id, 'template')}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 1. IMAGE PREVIEW MODAL (The Fix) */}
      {previewImage && (
        <div className="preview-overlay" onClick={() => setPreviewImage(null)}>
          <div className="preview-card" onClick={e => e.stopPropagation()}>
            <button className="close-preview-x" onClick={() => setPreviewImage(null)}>&times;</button>
            <div className="preview-body">
              {/* Dito lilitaw ang image mula sa Django media folder */}
              <img src={previewImage} alt="Template Design" className="full-template-img" />
            </div>
            <div className="preview-info">Template Preview Mode</div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM MODAL */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#0D1282' }}>{modal.title}</h2>
            <p>{modal.message}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.5rem' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button className="cancel-btn" onClick={() => setModal({ ...modal, show: false })}>Cancel</button>
                  <button className="save-btn" style={{ background: '#D71313' }} onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }) }}>Delete</button>
                </>
              ) : <button className="edit-btn" style={{ width: '100px' }} onClick={() => setModal({ ...modal, show: false })}>OK</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;