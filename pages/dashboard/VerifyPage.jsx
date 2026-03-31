import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyPage.css';
import CertiLogo from '../../src/Images/CertiLogo.png';

const VerifyPage = () => {
    const navigate = useNavigate();
    const [certId, setCertId] = useState('');
    const [result, setResult] = useState(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cleanup function para burahin ang Blob URL sa memory kapag inalis ang component
    useEffect(() => {
        return () => {
            if (pdfBlobUrl) {
                window.URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [pdfBlobUrl]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!certId.trim()) {
            setError("Please enter a Certificate ID.");
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        
        // Burahin ang lumang blob URL bago ang bagong request
        if (pdfBlobUrl) {
            window.URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
        }

        const formattedId = certId.trim().toUpperCase();

        try {
            // 1. API Call para i-verify ang certificate details
            const response = await axios.get(`https://certifierbackend.onrender.com/api/verify/${formattedId}/`);
            
            if (response.data.status === 'VALID') {
                setResult(response.data);

                // 2. Fetch PDF as Blob para ma-bypass ang X-Frame-Options
                if (response.data.file_url) {
                    try {
                        const pdfRes = await axios.get(response.data.file_url, {
                            responseType: 'blob'
                        });
                        const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        setPdfBlobUrl(url);
                    } catch (pdfErr) {
                        console.error("PDF Preview Error:", pdfErr);
                        // Optional: Tuloy pa rin kahit walang preview
                    }
                }
            } else {
                setError(response.data.status || "Invalid certificate.");
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Certificate "${formattedId}" not found.`);
            } else {
                setError("Connection error. Please check your backend.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="auth-split-wrapper glass-effect">
                {/* LEFT SIDE: Form & Input */}
                <div className="verify-left">
                    <div className="info-content">
                        <div className='Logo-Container'>
                            <img className='Logo' src={CertiLogo} alt="Logo" />
                            <h1>Certificate Verification</h1>
                        </div>
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
                            <button type="submit" className="verify-btn" disabled={loading}>
                                {loading ? 'Checking Database...' : 'Verify Now'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT SIDE: Results & Preview */}
                <div className="verify-right">
                    <div className="result-container">
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
                                <h3>Verification Failed</h3>
                                <p>{error}</p>
                            </div>
                        )}

                        {result && result.status === 'VALID' && (
                            <div className="result-box valid">
                                <div className="status-header">
                                    <span className="status-icon">✅</span>
                                    <div>
                                        <h3>Verified Successfully</h3>
                                        <small>{result.certificate_id}</small>
                                    </div>
                                </div>

                                {/* PDF PREVIEW SECTION */}
                                <div className="pdf-preview-wrapper">
                                    {pdfBlobUrl ? (
                                        <iframe
                                            src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                            title="Certificate PDF"
                                            className="pdf-iframe"
                                        ></iframe>
                                    ) : (
                                        <div className="pdf-loader">
                                            {loading ? "Fetching Document..." : "Generating Preview..."}
                                        </div>
                                    )}
                                    <a href={result.file_url} target="_blank" rel="noreferrer" className="fullscreen-link">
                                        Download / View Original PDF ↗
                                    </a>
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