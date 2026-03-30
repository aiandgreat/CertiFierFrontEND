import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyPage.css';

const VerifyPage = () => {
    const navigate = useNavigate();
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!certId.trim()) {
            setError("Please enter a Certificate ID.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        const formattedId = certId.trim().toUpperCase();

        try {
            const response = await axios.get(`http://localhost:8000/api/verify/${formattedId}/`);
            setResult(response.data);
            if (response.data.status !== 'VALID') {
                setError(response.data.status || "Invalid certificate.");
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Certificate "${formattedId}" not found.`);
            } else {
                setError("Connection error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

            <div className="auth-split-wrapper glass-effect">
                {/* LEFT SIDE: Input & Title */}
                <div className="auth-info-section verify-left">
                    <div className="info-content">
                        <h1>Certificate Verification</h1>
                        <p>Authenticate official credentials by entering the unique Certificate ID below.</p>
                        
                        <form onSubmit={handleVerify} className="verify-form-inline">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="verify-input"
                                    placeholder="e.g. CERT-2024-001"
                                    value={certId}
                                    onChange={(e) => setCertId(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="auth-submit verify-btn" disabled={loading}>
                                {loading ? 'Checking...' : 'Verify Now'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT SIDE: Results Display */}
                <div className="auth-form-section verify-right">
                    <div className="auth-card">
                        {!result && !error && (
                            <div className="empty-state">
                                <div className="search-icon-placeholder">🔍</div>
                                <p>Waiting for verification...</p>
                                <span>Results will appear here once verified.</span>
                            </div>
                        )}

                        {error && (
                            <div className="result-box invalid">
                                <div className="status-icon">⚠️</div>
                                <div className="cert-info">
                                    <h3>Verification Failed</h3>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {result && result.status === 'VALID' && (
                            <div className="result-box valid">
                                <div className="status-header">
                                    <span className="status-icon">✅</span>
                                    <h3>Verified Successfully</h3>
                                </div>
                                <div className="cert-grid">
                                    <div className="grid-item">
                                        <span>Full Name</span>
                                        <p>{result.full_name}</p>
                                    </div>
                                    <div className="grid-item">
                                        <span>Course/Event</span>
                                        <p>{result.course}</p>
                                    </div>
                                    <div className="grid-item">
                                        <span>Issued By</span>
                                        <p>{result.issued_by}</p>
                                    </div>
                                    <div className="grid-item">
                                        <span>Date Issued</span>
                                        <p>{result.date_issued}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;