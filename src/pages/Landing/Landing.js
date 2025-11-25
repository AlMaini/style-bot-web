import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Landing.css";

function Landing() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && token) {
      navigate("/dashboard");
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="landing-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">Style-Bot</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="btn-primary nav-btn">Sign Up</Link>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Redefine Your <span className="text-gradient">Style</span>
          </h1>
          <p className="hero-subtitle">
            Experience the future of fashion with our AI-powered virtual fitting room.
            Luxury, precision, and elegance in every try-on.
          </p>
          <div className="hero-cta">
            <Link to="/signup">
              <button className="btn-primary large">Start Your Journey</button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary large">Sign In</button>
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          {/* Placeholder for a high-fashion abstract visual or 3D element */}
          <div className="abstract-circle"></div>
          <div className="abstract-circle-2"></div>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <h3>AI Precision</h3>
          <p>State-of-the-art algorithms ensure a perfect virtual fit.</p>
        </div>
        <div className="feature-card">
          <h3>Luxury Collection</h3>
          <p>Access an exclusive library of high-end fashion items.</p>
        </div>
        <div className="feature-card">
          <h3>Instant Style</h3>
          <p>Visualize your look in seconds with our rapid processing.</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
