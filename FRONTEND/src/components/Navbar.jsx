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
      title: 'Confirm Logout',
      text: 'Are you sure you want to sign out from NovaDesk?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
      cancelButtonText: 'Stay',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          text: 'You have been safely signed out.',
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

  const userRole = (user?.role || '').toLowerCase().trim();
  const isAdmin = userRole === 'admin' || userRole === 'administrator';
  const isWorker = userRole === 'worker' || userRole === 'agent';

  const homeLink = isAdmin ? '/admin' : isWorker ? '/worker' : '/home';

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
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}

          {/* Worker Navigation Tab */}
          {isWorker && (
            <NavLink to="/worker" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Worker
            </NavLink>
          )}

          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            GIS Analytics
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
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="profile-dropdown-card">
              {user ? (
                <>
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-avatar">
                      {user?.profilePic ? (
                        <img src={user.profilePic} alt="Avatar" />
                      ) : (
                        <div className="avatar-letter">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="dropdown-user-details">
                      <h4 className="dropdown-user-name">{user?.name || 'Citizen User'}</h4>
                      <p className="dropdown-user-email">{user?.email || 'citizen@novadesk.com'}</p>
                      <span className={`dropdown-role-badge badge-${user?.role || 'customer'}`}>
                        {(user?.role || 'Customer').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-menu-list">
                    <Link to="/profile" className="dropdown-item" onClick={closeAllMenus}>
                      <UserIcon size={15} />
                      <span>My Profile & Settings</span>
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item" onClick={closeAllMenus}>
                        <Shield size={15} />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    {isWorker && (
                      <Link to="/worker" className="dropdown-item" onClick={closeAllMenus}>
                        <Wrench size={15} />
                        <span>Worker Operations</span>
                      </Link>
                    )}

                    <Link to="/my-complaints" className="dropdown-item" onClick={closeAllMenus}>
                      <FileText size={15} />
                      <span>My Complaints Vault</span>
                    </Link>

                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="dropdown-guest-box">
                  <p className="guest-prompt">Sign in to report incidents, track issues, and access your profile.</p>
                  <Link to="/login" className="dropdown-auth-btn login-btn" onClick={closeAllMenus}>
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" className="dropdown-auth-btn register-btn" onClick={closeAllMenus}>
                    <UserPlus size={15} />
                    <span>Create Account</span>
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Full-width Responsive Mobile & Tablet Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeAllMenus}>
          <div className="mobile-drawer-content" ref={mobileMenuRef} onClick={(e) => e.stopPropagation()}>
            
            <div className="mobile-drawer-header">
              <div className="mobile-brand">
                <img src={logoImg} alt="NovaDesk" className="mobile-logo-img" />
                <span className="mobile-brand-title">NovaDesk</span>
              </div>
              <button className="mobile-drawer-close" onClick={closeAllMenus} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            {/* Mobile User Profile Section */}
            {user ? (
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Avatar" />
                  ) : (
                    <div className="avatar-letter">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="mobile-user-meta">
                  <span className="mobile-user-name">{user?.name || 'Citizen User'}</span>
                  <span className="mobile-user-email">{user?.email}</span>
                  <span className={`mobile-role-pill pill-${user?.role || 'customer'}`}>
                    {(user?.role || 'Customer').toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mobile-guest-card">
                <p>Welcome to NovaDesk Civic Portal</p>
                <div className="mobile-guest-actions">
                  <Link to="/login" className="mobile-btn-primary" onClick={closeAllMenus}>
                    Sign In
                  </Link>
                  <Link to="/register" className="mobile-btn-secondary" onClick={closeAllMenus}>
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Links in Mobile Drawer */}
            <div className="mobile-nav-list">
              <NavLink to="/home" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                <Home size={17} />
                <span>Customer Portal</span>
              </NavLink>

              <NavLink to="/my-complaints" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                <FileText size={17} />
                <span>My Complaints</span>
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                  <Shield size={17} />
                  <span>Admin Console</span>
                </NavLink>
              )}

              {isWorker && (
                <NavLink to="/worker" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                  <Wrench size={17} />
                  <span>Worker Operations</span>
                </NavLink>
              )}

              <NavLink to="/analytics" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                <BarChart3 size={17} />
                <span>GIS Analytics</span>
              </NavLink>

              <NavLink to="/about" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                <Info size={17} />
                <span>About</span>
              </NavLink>

              {user && (
                <NavLink to="/profile" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`} onClick={closeAllMenus}>
                  <UserIcon size={17} />
                  <span>Profile & Settings</span>
                </NavLink>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mobile-drawer-footer">
              <button className="mobile-theme-btn" onClick={toggleTheme}>
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              {user && (
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogOut size={17} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;