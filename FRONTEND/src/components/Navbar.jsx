import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { 
  Home, 
  Info, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  Zap 
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- SweetAlert Logout Confirmation ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out of your account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4b2b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      color: '#333333',
      customClass: {
        confirmButton: 'sweet-confirm-btn',
        cancelButton: 'sweet-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
      }
    });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        
        {/* Left: Brand Logo */}
        <Link to="/home" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-badge">
            <Zap size={18} />
          </div>
          <span className="logo-text">HackathonApp</span>
        </Link>

        {/* Center/Right: Desktop Navigation Links */}
        <nav className="navbar-menu">
          <NavLink 
            to="/home" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>

          <NavLink 
            to="/about" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            About
          </NavLink>

          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Profile
          </NavLink>

          {/* Conditional Admin Link (Only for Admin users) */}
          {user?.role === 'admin' && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Admin <span className="admin-badge-nav">Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Right: Desktop User Profile & Logout */}
        <div className="navbar-actions">
          <Link to="/profile" className="user-profile-pill" title="View Profile">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-fallback">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span className="user-name-text">{user?.name || 'User'}</span>
          </Link>

          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile View: Right side has Logout + Hamburger Menu */}
        <div className="mobile-controls">
          <button className="mobile-logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={15} />
            <span>Logout</span>
          </button>

          <button 
            className="hamburger-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          {/* User Info Bar */}
          <div className="mobile-user-card">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-fallback">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="mobile-user-details">
              <span className="mobile-user-name">{user?.name || 'User'}</span>
              <span className="mobile-user-role">{user?.role || 'User'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mobile-nav-links">
            <NavLink 
              to="/home" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Home size={18} />
              <span>Home</span>
            </NavLink>

            <NavLink 
              to="/about" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Info size={18} />
              <span>About</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <UserIcon size={18} />
              <span>Profile</span>
            </NavLink>

            {user?.role === 'admin' && (
              <>
                <div style={{ margin: '8px 0 4px', padding: '0 4px', fontSize: '11px', fontWeight: '700', color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Admin Controls
                </div>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Shield size={18} />
                  <span>Admin Dashboard</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;