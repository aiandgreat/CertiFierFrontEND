import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import JSZip from 'jszip';
import './AdminDashboard.css';
import CertiLogo from '../../src/Images/CertiLogo.png';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCerts: 0, totalUsers: 0, uploads: 0 });
  const [recentCerts, setRecentCerts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingCert, setEditingCert] = useState(null);
  const [editFormData, setEditFormData] = useState({ full_name: '', course: '', owner: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserFormData, setEditUserFormData] = useState({
    first_name: '', last_name: '', email: '', username: '', role: ''
  });

  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [toast, setToast] = useState({ show: false, message: '' });
  const [userSearch, setUserSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [issuanceSearch, setIssuanceSearch] = useState('');
  const [selectedCerts, setSelectedCerts] = useState(new Set());
  const [downloadingCerts, setDownloadingCerts] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = "https://certifierbackend.onrender.com";

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

  // ✅ SMART IMAGE HANDLER
  const getFullUrl = (path) => {
    if (!path) return "https://via.placeholder.com/200x140?text=No+Image";

    // Cloudinary or external
    if (path.startsWith('http')) return path;

    // Clean path
    const cleanPath = path.replace(/^\/+/, '');

    return `${API_BASE}/media/${cleanPath}`;
  };

  // ✅ IMAGE COMPONENT (WITH FALLBACK LOGIC)
  const TemplateImage = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(getFullUrl(src));
    const [triedAlt, setTriedAlt] = useState(false);

    const handleError = () => {
      if (!triedAlt) {
        const altPath = `${API_BASE}/${src}`;
        console.log("Retrying image:", altPath);
        setImgSrc(altPath);
        setTriedAlt(true);
      } else {
        console.log("Using placeholder fallback");
        setImgSrc("https://via.placeholder.com/200x140?text=No+Preview");
      }
    };

    return <img src={imgSrc} alt={alt} onError={handleError} />;
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleDelete = (id, type) => {
    let url = `${API_BASE}/api/${type === 'cert' ? 'certificates' : type + 's'}/${id}/`;

    setModal({
      show: true,
      title: 'Confirm Delete',
      message: `Are you sure you want to delete this ${type}?`,
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
          <span>✅</span>
          <p>{toast.message}</p>
        </div>
      )}

      <aside className="admin-sidebar">
        <img className='Logo' src={CertiLogo} alt="Logo" />
        <nav>
          <Link to="/AdminDashboard">Overview</Link>
          <Link to="/UploadTemplate">Templates</Link>
          <Link to="/CSVUpload">Generate</Link>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <h1>Dashboard</h1>

        {/* TEMPLATES */}
        <section>
          <h3>System Templates</h3>

          {templates.length === 0 ? (
            <p>No templates yet</p>
          ) : (
            <div className="templates-grid">
              {templates
                .filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                .map(template => (
                  <div key={template.id} className="template-card">

                    <div className="template-preview">
                      <TemplateImage
                        src={template.background}
                        alt={template.name}
                      />
                    </div>

                    <h4>{template.name}</h4>

                    <button onClick={() => handleDelete(template.id, 'template')}>
                      Delete
                    </button>

                  </div>
                ))}
            </div>
          )}
        </section>

      </main>

      {modal.show && (
        <div className="modal">
          <h2>{modal.title}</h2>
          <p>{modal.message}</p>
          <button onClick={() => setModal({ ...modal, show: false })}>Cancel</button>
          <button onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }) }}>
            Confirm
          </button>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;