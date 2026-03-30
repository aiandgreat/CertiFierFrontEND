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
  
  // States para sa Toast Notifications
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowErrorToast(false); // Reset error toast

    try {
      // TANDAAN: 'username' ang key na kailangan ng Django SimpleJWT 
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        email: email, 
        password: password
      });

      const { access, role, full_name } = response.data;

      // 1. I-save ang credentials
      localStorage.setItem('token', access);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', full_name);

      // 2. Ipakita ang Success Toast
      setShowSuccessToast(true);

      // 3. Role-Based Redirection pagkatapos ng maikling delay
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/StudentDashboard'); 
        }
      }, 2000);

    } catch (err) {
      console.error("Login error details:", err.response?.data);
      
      const errorMsg = err.response?.data?.detail || "Invalid email or password.";
      setError(errorMsg);
      
      // Ipakita ang Error Toast
      setShowErrorToast(true);
      
      // Kusang mawawala ang error toast pagkatapos ng 4 na segundo
      setTimeout(() => setShowErrorToast(false), 4000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* SUCCESS TOAST (Upper Right) */}
      {showSuccessToast && (
        <div className="success-toast">
          <div className="toast-content">
            <span className="toast-icon"></span>
            <div className="toast-text">
              <strong>Login Successful!</strong>
              <p>Welcome back, {localStorage.getItem('user_name') || 'User'}!</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      {/* ERROR TOAST (Upper Right) */}
      {showErrorToast && (
        <div className="error-toast">
          <div className="toast-content">
            <span className="toast-icon"></span>
            <div className="toast-text">
              <strong>Login Failed</strong>
              <p>{error}</p>
            </div>
          </div>
          <div className="toast-progress-error"></div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/HomePage')}>
        Back
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to manage your certificates</p>
        </div>

        {/* Form area */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="enter your email" 
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
  );
};

export default LoginPage;