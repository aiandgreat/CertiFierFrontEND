import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
import CertiLogo from '../../src/Images/CertiLogo.png';


const SCHOOL_EMAIL_DOMAIN = '@ua.edu.ph';
const API_BASE = 'http://127.0.0.1:8000';

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

  const handleGoogleSignup = () => {
    const returnTo = `${window.location.origin}/login`;
    const googleUrl = `${API_BASE}/api/auth/google/login/?return_to=${encodeURIComponent(returnTo)}&hd=ua.edu.ph`;
    window.location.href = googleUrl;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!isSchoolEmail(formData.email)) {
      setError('Only @ua.edu.ph email addresses are allowed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sending data that matches your Django view requirements
      await axios.post('http://127.0.0.1:8000/api/auth/register/', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'student' // Default role
      });

      setShowSuccess(true);

      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      // Capture the specific error message from Django
      const errorDetail = err.response?.data?.error || err.response?.data?.detail || "Registration failed.";
      setError(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* SUCCESS TOAST */}
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

      <button className="back-btn" onClick={() => navigate('/HomePage')}>Back</button>

      <div className="auth-split-wrapper">
        {/* LEFT SIDE: Info Section */}
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

        {/* RIGHT SIDE: Register Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Please fill in the details below to get started.</p>
            </div>

            {error && <div className="error-inline">{error}</div>}

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@ua.edu.ph"
                  value={formData.email}
                  onChange={handleChange}
                  pattern="^[A-Za-z0-9._%+-]+@ua\.edu\.ph$"
                  title="Use your school email ending with @ua.edu.ph"
                  required
                />
                <small className="input-hint">Registration is limited to UA school emails (@ua.edu.ph).</small>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading || showSuccess}>
                {loading ? "Creating Account..." : "Register Now"}
              </button>

              <div className="auth-divider"><span>OR</span></div>

              <button type="button" className="google-auth-btn" onClick={handleGoogleSignup} disabled={loading || showSuccess}>
                Continue with UA Google
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