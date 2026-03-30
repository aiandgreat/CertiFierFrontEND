import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowErrorToast(false);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        email: email, 
        password: password
      });

      const { access, role, full_name } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', full_name);

      setShowSuccessToast(true);

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/StudentDashboard'); 
        }
      }, 2000);

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
            <h1>CertiFier</h1>
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
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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