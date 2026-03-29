import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false); // Success Notification State

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/register/', {
        email: formData.email,
        username: formData.email, // Gamitin ang email as username
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: 'student'
      });

      // Ipakita ang Success Toast
      setShowToast(true);

      // Awtomatikong mag-navigate sa login pagkatapos ng 3 segundo
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.detail || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* SUCCESS TOAST (Upper Right) */}
      {showToast && (
        <div className="success-toast">
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <div className="toast-text">
              <strong>Success!</strong>
              <p>Account created. Redirecting...</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join CertiFier today</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          {error && <div className="error-message-box">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Juan" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Dela Cruz" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan@example.com" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;