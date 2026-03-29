import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css'; // Updated CSS import

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCerts: 0, totalUsers: 0, uploads: 0 });
  const [recentCerts, setRecentCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('user_role');

      if (!token || role !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        const [certsRes, usersRes, uploadsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/certificates/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/users/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8000/api/uploads/', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setRecentCerts(certsRes.data.slice(0, 5));
        setStats({
          totalCerts: certsRes.data.length,
          totalUsers: usersRes.data.length,
          uploads: uploadsRes.data.length
        });
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) return <div className="admin-main">Loading Dashboard...</div>;

  return (
    <div className="admin-container"> {/* Matches AdminDashboard.css */}
      <aside className="admin-sidebar">
        <h2>CertiFier <span>Admin</span></h2>
        <nav className="admin-nav">
          <Link to="/admin-dashboard" className="admin-nav-link active">Overview</Link>
          <Link to="/templates" className="admin-nav-link">Templates</Link>
          <Link to="/bulk-upload" className="admin-nav-link">Bulk Upload CSV</Link>
          <Link to="/verify" className="admin-nav-link">Verify Tool</Link>
        </nav>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header>
          <h1>Administrator Portal</h1>
          <p>Manage system-wide certificates and issuance.</p>
        </header>

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>{stats.totalCerts}</h3>
            <p>Total Certificates Issued</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Registered Users</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.uploads}</h3>
            <p>Bulk Batches</p>
          </div>
        </section>

        <section className="admin-table-container">
          <h3>Recent Issuances</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCerts.map(cert => (
                <tr key={cert.id}>
                  <td>{cert.certificate_id}</td>
                  <td>{cert.full_name}</td>
                  <td>{cert.course}</td>
                  <td>
                    <span className={`badge ${cert.status.toLowerCase()}`}>
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section> {/* Added missing closing tag */}
      </main> {/* Properly placed closing tag */}
    </div>
  );
};

export default AdminDashboard;