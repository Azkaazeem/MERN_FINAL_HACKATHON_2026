import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Home, 
  Info, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  Zap,
  Sun,
  Moon,
  Wrench,
  BarChart3,
  Bell
} from 'lucide-react';
import Swal from 'sweetalert2';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('civic_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Log Out of CivicAI?',
      text: 'You will need to sign in again to access your portal.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#06b6d4',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Log Out',
      cancelButtonText: 'Cancel',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#1e293b'
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
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#1e293b'
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
    toast.success(`${next === 'dark' ? '🌙 Dark' : '☀️ Light'} mode enabled!`);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const homeLink = user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/home';

  return (
    <header className="navbar-header">
      <div className="navbar-container">

        {/* Left: Brand Logo */}
        <Link to={homeLink} className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-badge">
            <Zap size={18} />
          </div>
          <span className="logo-text">CivicAI</span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="navbar-menu">
          <NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Customer Portal
          </NavLink>

          {/* Worker Navigation Tab (Worker & Admin) */}
          {(user?.role === 'worker' || user?.role === 'admin') && (
            <NavLink to="/worker" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Worker Console <span className="worker-badge-nav">Field Ops</span>
            </NavLink>
          )}

          {/* Admin Navigation Tab (Admin only) */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin <span className="admin-badge-nav">Admin</span>
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
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Profile
          </NavLink>
        </nav>

        {/* Right: Theme Toggle + Profile + Logout */}
        <div className="navbar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/profile" className="user-profile-pill" title="View Profile">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Avatar" className="user-avatar-img" />
            ) : (
              <div className="user-avatar-fallback">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span className="user-name-text">{user?.name || 'User'}</span>
              <span style={{ fontSize: '10px', color: 'var(--primary-color)', fontWeight: '700', textTransform: 'capitalize' }}>{user?.role || 'Customer'}</span>
            </div>
          </Link>

          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="mobile-controls">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
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
              <span className="mobile-user-role">{user?.role || 'Customer'}</span>
            </div>
          </div>

          <div className="mobile-nav-links">
            <NavLink to="/home" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <Home size={18} /><span>Customer Portal</span>
            </NavLink>

            {(user?.role === 'worker' || user?.role === 'admin') && (
              <NavLink to="/worker" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Wrench size={18} /><span>Worker Field Console</span>
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Shield size={18} /><span>Admin Dashboard</span>
              </NavLink>
            )}

            <NavLink to="/analytics" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <BarChart3 size={18} /><span>GIS Analytics</span>
            </NavLink>

            <NavLink to="/alerts" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <Bell size={18} /><span>Public Alerts</span>
            </NavLink>

            <NavLink to="/about" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <Info size={18} /><span>About</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
              <UserIcon size={18} /><span>Profile</span>
            </NavLink>
            
            <button className="mobile-nav-link logout-mobile" onClick={handleLogout}>
              <LogOut size={18} /><span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;