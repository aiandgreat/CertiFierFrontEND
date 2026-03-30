import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css'; 
import CertiLogo from '../../src/Images/CertiLogo.png';

const SCHOOL_EMAIL_DOMAIN = '@ua.edu.ph';
const API_BASE = 'http://127.0.0.1:8000';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const isSchoolEmail = (value) => value.trim().toLowerCase().endsWith(SCHOOL_EMAIL_DOMAIN);

  const redirectByRole = (role) => {
    if (role === 'admin') {
      navigate('/AdminDashboard');
      return;
    }
    navigate('/StudentDashboard');
  };

  const handleGoogleLogin = () => {
    const returnTo = `${window.location.origin}/login`;
    const googleUrl = `${API_BASE}/api/auth/google/login/?return_to=${encodeURIComponent(returnTo)}&hd=ua.edu.ph`;
    window.location.href = googleUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const role = params.get('role');
    const fullName = params.get('full_name');
    const authError = params.get('error');

    if (authError) {
      setError(authError);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    if (!access || !role) return;

    localStorage.setItem('token', access);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', fullName || 'User');
    setShowSuccessToast(true);

    // Remove sensitive query params from URL before redirect.
    window.history.replaceState({}, document.title, '/login');
    setTimeout(() => redirectByRole(role), 1200);
  }, [location.search, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowErrorToast(false);

    if (!isSchoolEmail(email)) {
      setError('Only @ua.edu.ph email addresses are allowed.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login/`, {
        email: email, 
        password: password
      });

      const { access, role, full_name } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', full_name);

      setShowSuccessToast(true);

      setTimeout(() => redirectByRole(role), 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Invalid email or password.";
      setError(errorMsg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* TOAST NOTIFICATIONS */}
      {showSuccessToast && (
        <div className="success-toast">
          <div className="toast-content">
            <div className="toast-text">
              <strong>Login Successful!</strong>
              <p>Welcome back, {localStorage.getItem('user_name') || 'User'}!</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      {showErrorToast && (
        <div className="error-toast">
          <div className="toast-content">
            <div className="toast-text">
              <strong>Login Failed</strong>
              <p>{error}</p>
            </div>
          </div>
          <div className="toast-progress-error"></div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/HomePage')}>Back</button>

      <div className="auth-split-wrapper">
        {/* LEFT SIDE: System Description */}
        <div className="auth-info-section">
          <div className="info-content">
            <div className='LogoLoginContainer'>
            <img className = 'LogoLogin' src={CertiLogo} alt="Certifier Logo" />
            </div>
            <p>The fastest and most secure way to manage your digital certificates and academic credentials.</p>
            <div className="info-graphic">
               <span>✓ Verified</span>
               <span>✓ Secure</span>
               <span>✓ Accessible</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Please enter your credentials to log in.</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@ua.edu.ph" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  pattern="^[A-Za-z0-9._%+-]+@ua\.edu\.ph$"
                  title="Use your school email ending with @ua.edu.ph"
                  required 
                />
                <small className="input-hint">Use your UA school email (@ua.edu.ph).</small>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading || showSuccessToast}>
                {loading ? "Authenticating..." : "Login"}
              </button>

              <div className="auth-divider"><span>OR</span></div>

              <button type="button" className="google-auth-btn" onClick={handleGoogleLogin} disabled={loading || showSuccessToast}>
                Continue with UA Google
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;