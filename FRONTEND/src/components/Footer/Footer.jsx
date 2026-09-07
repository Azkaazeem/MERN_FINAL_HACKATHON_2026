import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowUp, 
  Globe,
  Sparkles,
  ShieldCheck,
  Activity,
  Zap
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer-compact-wrap">
      {/* Glowing Cyber Accent Top Line */}
      <div className="footer-glow-line" />

      <div className="footer-compact-container">
        
        {/* Main Content Row */}
        <div className="footer-main-row">
          
          {/* Left: Brand Identity & Tag */}
          <div className="footer-brand-group">
            <Link to="/home" className="footer-brand-badge" onClick={scrollToTop}>
              <div className="footer-logo-ring">
                <img src={logoImg} alt="NovaDesk Logo" className="footer-logo-img" />
              </div>
              <div className="footer-brand-texts">
                <span className="footer-brand-title">NovaDesk</span>
                <span className="footer-brand-sub">AI Support Engine</span>
              </div>
            </Link>
          </div>

          {/* Center: Sleek Interactive Navigation Bar */}
          <nav className="footer-nav-bar">
            <Link to="/home" className="footer-nav-btn" onClick={scrollToTop}>
              <span>Home</span>
            </Link>
            <Link to="/about" className="footer-nav-btn" onClick={scrollToTop}>
              <span>About</span>
            </Link>
            <Link to="/profile" className="footer-nav-btn" onClick={scrollToTop}>
              <span>Profile</span>
            </Link>
            <Link to="/analytics" className="footer-nav-btn" onClick={scrollToTop}>
              <span>Analytics</span>
            </Link>
            <Link to="/my-complaints" className="footer-nav-btn" onClick={scrollToTop}>
              <span>Complaints Vault</span>
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="footer-nav-btn admin-btn" onClick={scrollToTop}>
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right: Social Hub & Top Button */}
          <div className="footer-actions-group">
            <a 
              href="https://portfolio-03-tan.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-card"
              title="Azka Azeem Portfolio"
            >
              <Globe size={14} className="social-icon" />
              <span>Portfolio</span>
            </a>

            <a 
              href="https://www.linkedin.com/in/azkaazeem/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-card"
              title="LinkedIn Profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            <a 
              href="https://github.com/Azkaazeem" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social-card"
              title="GitHub Profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="social-icon">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
              </svg>
              <span>GitHub</span>
            </a>

            <button 
              className="footer-top-btn" 
              onClick={scrollToTop} 
              title="Scroll to top of page"
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <ArrowUp size={14} className="top-arrow-icon" />
            </button>
          </div>

        </div>

        {/* Bottom Status & Copyright Strip */}
        <div className="footer-sub-strip">
          <div className="footer-credits">
            <span>© {new Date().getFullYear()} <strong>NovaDesk</strong></span>
            <span className="bullet-sep">•</span>
            <span>Crafted with precision by <strong>Azka Azeem</strong></span>
          </div>

          <div className="footer-status-tag">
            <span className="pulse-dot-ring">
              <span className="pulse-dot-core" />
            </span>
            <span>All Systems Operational • 99.9% Uptime</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
