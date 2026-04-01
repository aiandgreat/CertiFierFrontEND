import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
import CertiLogo from '../../src/Images/CertiLogo.png';

const SCHOOL_EMAIL_DOMAIN = '@ua.edu.ph';
const API_BASE = 'https://certifierbackend.onrender.com';

const getOAuthParams = () => {
  const normal = new URLSearchParams(window.location.search);
  if (normal.get('access')) return normal;

  const hash = window.location.hash || '';
  const qIndex = hash.indexOf('?');
  if (qIndex >= 0) return new URLSearchParams(hash.slice(qIndex + 1));

  return new URLSearchParams();
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isSchoolEmail = (value) => value.trim().toLowerCase().endsWith(SCHOOL_EMAIL_DOMAIN);

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/AdminDashboard');
    else navigate('/StudentDashboard');
  };

  const handleGoogleSignup = () => {
    const returnTo = `${window.location.origin}/login`;
    const googleUrl = `${API_BASE}/api/auth/google/login/?return_to=${encodeURIComponent(returnTo)}&hd=ua.edu.ph`;
    window.location.href = googleUrl;
  };

  // Handle OAuth redirect
  useEffect(() => {
    const params = getOAuthParams();
    const access = params.get('access');
    const role = params.get('role');
    const fullName = params.get('full_name');
    const authError = params.get('error');

    if (authError) {
      setError(authError);
      return;
    }

    if (!access || !role) return;

    localStorage.setItem('token', access);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', fullName || 'User');

    window.history.replaceState({}, document.title, '/register');
    redirectByRole(role);
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (!isSchoolEmail(formData.email)) {
      setError('Only @ua.edu.ph email addresses are allowed.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/register/`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'student'
      });

      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorDetail = err.response?.data?.error || err.response?.data?.detail || "Registration failed.";
      setError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showSuccess && (
        <div className="success-toast">
          <div className="toast-content">
            <div className="toast-text">
              <strong>Account Created!</strong>
              <p>Redirecting to login page...</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/')}>Back</button>

      <div className="auth-split-wrapper">
        <div className="auth-info-section register-theme">
          <div className="info-content">
            <div className='LogoLoginContainer'>
              <img className='LogoLogin' src={CertiLogo} alt="Certifier Logo" />
            </div>
            <h1>Join Us Today</h1>
            <p>Start organizing your certificates and credentials in one secure location.</p>
            <div className="info-graphic">
              <span>✓ Free Account</span>
              <span>✓ EdDSA</span>
              <span>✓ Data Privacy</span>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Please fill in the details below to get started.</p>
            </div>

            {error && <div className="error-inline">{error}</div>}

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
              </div>

              <input name="email" type="email" placeholder="name@ua.edu.ph" value={formData.email} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />

              <button type="submit" disabled={loading || showSuccess}>
                {loading ? "Creating Account..." : "Register Now"}
              </button>

              <div className="auth-divider"><span>OR</span></div>

              <button type="button" className="google-auth-btn" onClick={handleGoogleSignup} disabled={loading || showSuccess}>
                Sign up with Google
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;