import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowUp, Zap, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();

  // Smooth scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer-main">
      <div className="footer-container">
        
        {/* Left: Brand */}
        <Link to="/home" className="footer-brand" onClick={scrollToTop}>
          <div className="footer-logo-badge">
            <Zap size={15} />
          </div>
          <span className="footer-brand-text">HackathonApp</span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="footer-links">
          <Link to="/home" className="footer-link" onClick={scrollToTop}>Home</Link>
          <Link to="/about" className="footer-link" onClick={scrollToTop}>About</Link>
          <Link to="/profile" className="footer-link" onClick={scrollToTop}>Profile</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="footer-link" onClick={scrollToTop}>Admin</Link>
          )}
        </div>

        {/* Right: Back to Top Button */}
        <button 
          className="back-to-top-btn" 
          onClick={scrollToTop} 
          title="Scroll to Top"
        >
          <span>Back to Top</span>
          <ArrowUp size={15} />
        </button>

      </div>

      {/* Bottom Bar: Copyright & Portfolio */}
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Crafted by <b>Azka Azeem</b>
        </span>
        <div className="footer-social-icons">
          <a 
            href="https://portfolio-03-tan.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            Portfolio
          </a>
          <span>•</span>
          <a 
            href="https://www.linkedin.com/in/azkaazeem/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            LinkedIn
          </a>
          <span>•</span>
          <a 
            href="https://github.com/Azkaazeem" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-social-icon"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
