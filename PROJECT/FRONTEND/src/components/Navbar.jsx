import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Info, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Wrench,
  BarChart3,
  Bell,
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import logoImg from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('civic_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-hamburger-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    Swal.fire({
      title: 'Log Out of NovaDesk?',
      text: 'You will need to sign in again to access your portal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00e5ff',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Cancel',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
        });
        navigate('/login');
      }
    });
  };

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('civic_theme', next);
    setIsDark(!isDark);
  };

  const closeAllMenus = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const homeLink = user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/home';

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Left: Brand Logo */}
        <Link to={homeLink} className="navbar-logo" onClick={closeAllMenus}>
          <img src={logoImg} alt="NovaDesk Logo" className="navbar-logo-img" />
          <span className="logo-text">NovaDesk</span>
        </Link>

        {/* Center: Desktop Navigation Links (Accessible by all users / anonymous) */}
        <nav className="navbar-menu">
          <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Customer Portal
          </NavLink>

          <NavLink to="/my-complaints" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            My Complaints
          </NavLink>

          {/* Admin Navigation Tab (Only for Admin, with clean text) */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}

          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            GIS Analytics
          </NavLink>

          <NavLink to="/alerts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Public Alerts
          </NavLink>

          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
        </nav>

        {/* Right Section: Desktop & Mobile Controls */}
        <div className="navbar-right-section" ref={dropdownRef}>
          
          {/* Desktop Direct Theme Toggle Button */}
          <button className="desktop-theme-toggle" onClick={toggleTheme} title="Toggle Theme" aria-label="Theme Toggle">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Profile Trigger Button (Visible on both Desktop & Mobile Right Side) */}
          <button 
            className="navbar-profile-trigger" 
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setMobileMenuOpen(false);
            }}
            aria-label="User Profile Menu"
          >
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-fallback">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </div>
            )}
            {user && (
              <div className="desktop-user-label">
                <span className="user-name-text">{user?.name || 'User'}</span>
                <span className="user-role-text">{user?.role || 'Customer'}</span>
              </div>
            )}
            <ChevronDown size={14} className={`dropdown-arrow ${profileDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {/* Universal Hamburger Menu Button (Accessible on ALL screen sizes) */}
          <button 
            className="navbar-hamburger-btn" 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setProfileDropdownOpen(false);
            }}
            title="Open Full Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Profile Popover Menu */}
          {profileDropdownOpen && (
            <div className="profile-dropdown-menu">
              
              {/* User Header Info in Dropdown */}
              {user ? (
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-wrap">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Avatar" className="user-avatar-img large" />
                    ) : (
                      <div className="user-avatar-fallback large">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={18} />}
                      </div>
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <h4 className="dropdown-user-name">{user?.name || 'User'}</h4>
                    <span className="dropdown-user-email">{user?.email || 'user@example.com'}</span>
                    <span className="dropdown-role-badge">{user?.role || 'Customer'}</span>
                  </div>
                </div>
              ) : (
                <div className="dropdown-user-header">
                  <div className="dropdown-user-info">
                    <h4 className="dropdown-user-name">Welcome Guest</h4>
                    <span className="dropdown-user-email">Sign in to track your support tickets</span>
                  </div>
                </div>
              )}

              <div className="dropdown-divider" />

              {/* My Complaints Vault Link */}
              <NavLink to="/my-complaints" className="dropdown-item" onClick={closeAllMenus}>
                <FileText size={16} /> <span>My Complaints Vault</span>
              </NavLink>

              {/* Profile Link (if authenticated) */}
              {user && (
                <NavLink to="/profile" className="dropdown-item" onClick={closeAllMenus}>
                  <UserIcon size={16} /> <span>My Profile</span>
                </NavLink>
              )}

              {/* Theme Toggle Item */}
              <button className="dropdown-item theme-option-item" onClick={toggleTheme}>
                <div className="dropdown-item-left">
                  {isDark ? <Sun size={16} className="icon-cyan" /> : <Moon size={16} className="icon-cyan" />}
                  <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
                </div>
                <span className="theme-status-pill">{isDark ? 'Dark' : 'Light'}</span>
              </button>

              <div className="dropdown-divider" />

              {/* Auth Action: Logout or Sign In / Up */}
              {user ? (
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              ) : (
                <div className="dropdown-auth-actions">
                  <NavLink to="/login" className="dropdown-btn-signin" onClick={closeAllMenus}>
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </NavLink>
                  <NavLink to="/register" className="dropdown-btn-signup" onClick={closeAllMenus}>
                    <UserPlus size={15} />
                    <span>Sign Up</span>
                  </NavLink>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* ================= UNIVERSAL SLIDE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeAllMenus}>
          <div className="mobile-drawer-content" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="drawer-header-top">
              <div className="drawer-brand-header">
                <img src={logoImg} alt="NovaDesk Logo" className="drawer-logo-img" />
                <div className="drawer-brand-info">
                  <span className="drawer-brand-name">NovaDesk</span>
                  <span className="drawer-brand-tagline">AI Support Desk</span>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={closeAllMenus} title="Close Menu">
                <X size={18} />
              </button>
            </div>

            {/* Top Navigation Links Module */}
            <div className="mobile-nav-links-module">
              <span className="drawer-section-heading">Platform Modules</span>
              <NavLink to="/home" className="mobile-nav-item" onClick={closeAllMenus}>
                <Home size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">Customer Portal</span>
                  <span className="link-desc">AI Incident Logging &amp; Tracking</span>
                </div>
              </NavLink>

              <NavLink to="/my-complaints" className="mobile-nav-item" onClick={closeAllMenus}>
                <FileText size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">My Complaints Vault</span>
                  <span className="link-desc">Split Form &amp; Searchable History</span>
                </div>
              </NavLink>

              <NavLink to="/analytics" className="mobile-nav-item" onClick={closeAllMenus}>
                <BarChart3 size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">GIS Analytics &amp; Heatmap</span>
                  <span className="link-desc">District Telemetry &amp; Resolution Metrics</span>
                </div>
              </NavLink>

              <NavLink to="/alerts" className="mobile-nav-item" onClick={closeAllMenus}>
                <Bell size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">Public Advisories &amp; Alerts</span>
                  <span className="link-desc">Emergency Outages &amp; Broadcasts</span>
                </div>
              </NavLink>

              <NavLink to="/about" className="mobile-nav-item" onClick={closeAllMenus}>
                <Info size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">About &amp; Guaranteed SLAs</span>
                  <span className="link-desc">Platform Specs &amp; Architecture</span>
                </div>
              </NavLink>

              <NavLink to="/profile" className="mobile-nav-item" onClick={closeAllMenus}>
                <UserIcon size={18} />
                <div className="drawer-link-meta">
                  <span className="link-title">User Account &amp; Profile</span>
                  <span className="link-desc">Manage Security &amp; Preferences</span>
                </div>
              </NavLink>

              {user?.role === 'admin' && (
                <NavLink to="/admin" className="mobile-nav-item admin-highlight" onClick={closeAllMenus}>
                  <Shield size={18} />
                  <div className="drawer-link-meta">
                    <span className="link-title">Admin Command Console</span>
                    <span className="link-desc">Staff Management &amp; Triage</span>
                  </div>
                </NavLink>
              )}
            </div>

            {/* HORIZONTAL LINE DIVIDER */}
            <hr className="drawer-horizontal-divider" />

            {/* Bottom Rightbar & Account Controls Module */}
            <div className="mobile-rightbar-module">
              <span className="drawer-section-heading">Account &amp; Appearance</span>
              
              {/* User Greeting Box */}
              <div className="mobile-user-card">
                <div className="mobile-avatar">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Avatar" className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-fallback">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                    </div>
                  )}
                </div>
                <div className="mobile-user-details">
                  <h4 className="mobile-user-name">{user ? user.name : 'Guest User'}</h4>
                  <span className="mobile-user-role">{user ? user.role.toUpperCase() : 'Public Guest Mode'}</span>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <button className="mobile-action-btn theme-switch" onClick={toggleTheme}>
                <div className="btn-left">
                  {isDark ? <Sun size={17} className="icon-cyan" /> : <Moon size={17} className="icon-cyan" />}
                  <span>Theme Appearance</span>
                </div>
                <span className="pill-state">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              {/* Auth Button */}
              {user ? (
                <button className="mobile-action-btn logout" onClick={handleLogout}>
                  <LogOut size={17} />
                  <span>Log Out of NovaDesk</span>
                </button>
              ) : (
                <div className="mobile-auth-grid">
                  <NavLink to="/login" className="mobile-auth-btn signin" onClick={closeAllMenus}>
                    <LogIn size={16} /> <span>Sign In</span>
                  </NavLink>
                  <NavLink to="/register" className="mobile-auth-btn signup" onClick={closeAllMenus}>
                    <UserPlus size={16} /> <span>Sign Up</span>
                  </NavLink>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;