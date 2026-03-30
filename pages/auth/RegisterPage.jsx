import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';

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
            <h1>Join Us Today</h1>
            <p>Start organizing your certificates and credentials in one secure location.</p>
            <div className="info-graphic">
               <span>✓ Free Account</span>
               <span>✓ Cloud Storage</span>
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
                  placeholder="name@email.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
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