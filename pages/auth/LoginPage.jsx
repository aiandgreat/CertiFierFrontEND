import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    if (role === 'admin') navigate('/AdminDashboard');
    else navigate('/StudentDashboard');
  };

  const handleGoogleLogin = () => {
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
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    if (!access || !role) return;

    localStorage.setItem('token', access);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', fullName || 'User');

    window.history.replaceState({}, document.title, '/login');
    redirectByRole(role);
  }, [location.search]);

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
      const response = await axios.post(`${API_BASE}/api/auth/login/`, { email, password });
      const { access, role, full_name } = response.data;

      localStorage.setItem('token', access);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', full_name);

      setShowSuccessToast(true);
      setTimeout(() => redirectByRole(role), 1500);
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

      <button className="back-btn" onClick={() => navigate('/')}>Back</button>

      <div className="auth-split-wrapper">
        <div className="auth-info-section">
          <div className="info-content">
            <div className='LogoLoginContainer'>
              <img className='LogoLogin' src={CertiLogo} alt="Certifier Logo" />
            </div>
            <p>The fastest and most secure way to manage your digital certificates and academic credentials.</p>
            <div className="info-graphic">
              <span>✓ Verified</span>
              <span>✓ Secure</span>
              <span>✓ Accessible</span>
            </div>
          </div>
        </div>

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
                  pattern="^[A-Za-z0-9._%+\-]+@ua\.edu\.ph$"
                  title="Use your school email ending with @ua.edu.ph"
                  required
                />
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
                Sign in with Google
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