import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCerts: 0, totalUsers: 0, uploads: 0 });
  const [recentCerts, setRecentCerts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // States para sa Editing
  const [editingCert, setEditingCert] = useState(null);
  const [editFormData, setEditFormData] = useState({ full_name: '', course: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFormData, setEditUserFormData] = useState({ 
    first_name: '', last_name: '', email: '', username: '', role: '' 
  });

  // UI States
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [userSearch, setUserSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const role = localStorage.getItem('user_role');
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [certs, userRes, uploads, tmpls] = await Promise.all([
        axios.get(`${API_BASE}/api/certificates/`, { headers }),
        axios.get(`${API_BASE}/api/users/`, { headers }),
        axios.get(`${API_BASE}/api/uploads/`, { headers }),
        axios.get(`${API_BASE}/api/templates/`, { headers })
      ]);

      setRecentCerts(certs.data);
      setTemplates(tmpls.data);
      setUsers(userRes.data);
      setStats({
        totalCerts: certs.data.length,
        totalUsers: userRes.data.length,
        uploads: uploads.data.length
      });
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/200x140?text=No+Image";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE}/${cleanPath}`;
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleSaveEdit = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_BASE}/api/certificates/${id}/`, editFormData, { headers });
      setEditingCert(null);
      showToast('Certificate updated successfully!');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSaveUserEdit = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Pinadala ang data na walang password field
      await axios.patch(`${API_BASE}/api/users/${id}/`, editUserFormData, { headers });
      setEditingUser(null);
      showToast('User updated successfully!');
      fetchData();
    } catch (err) { alert("Error updating user."); }
  };

  const handleDelete = (id, type) => {
    let url = `${API_BASE}/api/${type === 'cert' ? 'certificates' : type + 's'}/${id}/`;
    
    setModal({
      show: true,
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          await axios.delete(url, { headers });
          showToast(`${type.toUpperCase()} deleted!`);
          fetchData();
        } catch (err) { console.error(err); }
      }
    });
  };

  if (loading) return <div className="loading-screen">Loading Portal...</div>;

  return (
    <div className="admin-container">
      {toast.show && (
        <div className="delete-success-toast">
          <span className="toast-icon">✅</span>
          <p>{toast.message}</p>
        </div>
      )}

      <aside className="admin-sidebar">
        <h2>CertiFier</h2>
        <nav className="admin-nav">
          <Link to="/AdminDashboard" className="admin-nav-link active">Overview</Link>
          <Link to="/UploadTemplate" className="admin-nav-link">Templates</Link>
          <Link to="/CSVUpload" className="admin-nav-link">Generate Certificate</Link>
          <Link to="/verify" className="admin-nav-link">Verify Tool</Link>
        </nav>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
      </aside>

      <main className="admin-main">
        <header>
          <h1>Administrator Dashboard</h1>
          <p>Manage users, certificates, and system templates.</p>
        </header>

        <section className="admin-stats-grid">
          <div className="admin-stat-card"><h3>{stats.totalCerts}</h3><p>Certificates Issued</p></div>
          <div className="admin-stat-card"><h3>{stats.totalUsers}</h3><p>Registered Users</p></div>
          <div className="admin-stat-card"><h3>{stats.uploads}</h3><p>Bulk Uploads</p></div>
        </section>

        <section className="admin-table-container">
          <div className="table-header">
            <h3>Registered Users</h3>
            <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="table-search-input" />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>First Name</th><th>Last Name</th><th>Email</th><th>Role</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => (u.first_name + ' ' + u.last_name).toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                  <tr key={user.id}>
                    <td>{editingUser === user.id ? <input className="edit-input" value={editUserFormData.first_name} onChange={e => setEditUserFormData({...editUserFormData, first_name: e.target.value})} /> : user.first_name}</td>
                    <td>{editingUser === user.id ? <input className="edit-input" value={editUserFormData.last_name} onChange={e => setEditUserFormData({...editUserFormData, last_name: e.target.value})} /> : user.last_name}</td>
                    <td>{editingUser === user.id ? <input className="edit-input" value={editUserFormData.email} onChange={e => setEditUserFormData({...editUserFormData, email: e.target.value})} /> : user.email}</td>
                    <td><span className={`badge ${user.role === 'admin' ? 'invalid' : 'valid'}`}>{user.role?.toUpperCase()}</span></td>
                    <td>
                      <div className="action-buttons">
                        {editingUser === user.id ? (
                          <><button className="save-btn" onClick={() => handleSaveUserEdit(user.id)}>Save</button><button className="cancel-btn" onClick={() => setEditingUser(null)}>Cancel</button></>
                        ) : (
                          <><button className="edit-btn" onClick={() => { setEditingUser(user.id); setEditUserFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email, username: user.username, role: user.role }); }}>Edit</button>
                          {user.role !== 'admin' && <button className="delete-btn" onClick={() => handleDelete(user.id, 'user')}>Delete</button>}</>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-table-container">
          <div className="table-header">
            <h3>System Templates</h3>
            <input type="text" placeholder="Search templates..." value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} className="table-search-input" />
          </div>
          {templates.length === 0 ? (
            <p className="no-data">No templates uploaded yet.</p>
          ) : (
            <div className="templates-grid">
              {templates.filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase())).map(template => (
                <div key={template.id} className="template-card">
                  <div className="template-preview">
                    <img src={getFullUrl(template.background)} alt={template.name} onError={(e) => e.target.src = "https://via.placeholder.com/200x140?text=Error+Loading"} />
                  </div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <button className="delete-btn-sm" onClick={() => handleDelete(template.id, 'template')}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-table-container">
          <div className="table-header"><h3>Recent Issuances</h3></div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr><th>Full ID</th><th>Recipient</th><th>Course</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {recentCerts.map(cert => (
                  <tr key={cert.id}>
                    <td>#{cert.certificate_id?.toUpperCase()}</td>
                    <td>{editingCert === cert.id ? <input className="edit-input" value={editFormData.full_name} onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })} /> : cert.full_name}</td>
                    <td>{editingCert === cert.id ? <input className="edit-input" value={editFormData.course} onChange={e => setEditFormData({ ...editFormData, course: e.target.value })} /> : cert.course}</td>
                    <td>
                      <div className="action-buttons">
                        {editingCert === cert.id ? (
                          <><button className="save-btn" onClick={() => handleSaveEdit(cert.id)}>Save</button><button className="cancel-btn" onClick={() => setEditingCert(null)}>Cancel</button></>
                        ) : (
                          <><button className="edit-btn" onClick={() => { setEditingCert(cert.id); setEditFormData({ full_name: cert.full_name, course: cert.course }) }}>Edit</button><button className="delete-btn" onClick={() => handleDelete(cert.id, 'cert')}>Delete</button></>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modal.title}</h2>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModal({ ...modal, show: false })}>Cancel</button>
              <button className="save-btn" style={{ background: '#D71313' }} onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }) }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;