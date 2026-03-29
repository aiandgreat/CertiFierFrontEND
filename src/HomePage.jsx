import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from './assets/hero.png';

const HomePage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Secure Login",
      desc: "Manage your issued certificates and view your profile.",
      path: "/login",
      icon: "🔑",
      color: "#3b82f6"
    },
    {
      title: "New Account",
      desc: "Join the network to start issuing digital credentials.",
      path: "/register",
      icon: "📝",
      color: "#10b981"
    },
    {
      title: "Public Verification",
      desc: "No account needed. Check if a certificate is authentic.",
      path: "/verify",
      icon: "🛡️",
      color: "#8b5cf6"
    }
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <img src={heroImg} alt="Hero" className="hero-logo" />
        <h1>Certifier Digital Ledger</h1>
        <p>The trusted standard for document authenticity.</p>
      </section>

      <div className="card-grid">
        {cards.map((card) => (
          <div 
            key={card.title} 
            className="choice-card" 
            onClick={() => navigate(card.path)}
          >
            <div className="icon-circle" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <span className="arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;