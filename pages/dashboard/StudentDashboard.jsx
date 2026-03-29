import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [myCerts, setMyCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userDisplayName = localStorage.getItem('user_name') || 'Student';

  useEffect(() => {
    const fetchMyCerts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/my-certificates/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyCerts(res.data);
      } catch (err) {
        console.error("Student fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCerts();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar student-side">
        <h2>CertiFier</h2>
        <nav>
          <button className="nav-item active">My Certificates</button>
          <button className="nav-item" onClick={() => navigate('/verify')}>Verify Certificate</button>
        </nav>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
      </aside>

      <main className="main-content">
        <header>
          <h1>Welcome back, {userDisplayName}!</h1>
          <p>View and download your earned digital certificates below.</p>
        </header>

        {loading ? <p>Loading your certificates...</p> : (
          <div className="cert-card-grid">
            {myCerts.length > 0 ? myCerts.map(cert => (
              <div className="student-cert-card" key={cert.id}>
                <div className="cert-header">
                  <span className="cert-badge">Official</span>
                  <h3>{cert.title || cert.course}</h3>
                </div>
                <div className="cert-body">
                  <p><strong>ID:</strong> {cert.certificate_id}</p>
                  <p><strong>Issued:</strong> {new Date(cert.date_issued).toLocaleDateString()}</p>
                </div>
                <div className="cert-footer">
                  <button className="btn-preview" onClick={() => window.open(`http://127.0.0.1:8000/api/certificates/${cert.id}/preview/`, '_blank')}>Preview</button>
                  <a href={`http://127.0.0.1:8000/api/certificates/${cert.id}/download/`} className="btn-download">Download PDF</a>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <p>No certificates issued to your account yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;