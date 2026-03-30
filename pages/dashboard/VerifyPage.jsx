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
        <div className="glass-body">
            {/* Background shapes for the glass effect */}
            <div className="bg-shape circle-1"></div>
            <div className="bg-shape circle-2"></div>

            <div className="glass-container">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    Back
                </button>

                <div className="verify-card">
                    <h1>Certificate Verification</h1>
                    <p className="subtitle">Enter your ID to authenticate official credentials</p>

                    <form onSubmit={handleVerify} className="verify-form">
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="e.g. CERT-2024-001"
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                            />
                            <button type="submit" className="verify-submit-btn" disabled={loading}>
                                {loading ? 'Checking...' : 'Verify Now'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="result-box invalid">
                            <div className="status-icon">⚠️</div>
                            <div>
                                <h3>Verification Failed</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    {result && result.status === 'VALID' && (
                        <div className="result-box valid">
                            <div className="status-icon">✅</div>
                            <div className="cert-info">
                                <h3>Verified Successfully</h3>
                                <div className="cert-grid">
                                    <div className="grid-item"><span>Name</span><p>{result.full_name}</p></div>
                                    <div className="grid-item"><span>Course</span><p>{result.course}</p></div>
                                    <div className="grid-item"><span>Issued By</span><p>{result.issued_by}</p></div>
                                    <div className="grid-item"><span>Date</span><p>{result.date_issued}</p></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;