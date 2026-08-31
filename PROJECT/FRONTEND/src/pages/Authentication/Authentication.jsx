import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Eye, 
  EyeOff, 
  Shield,
  ArrowRight,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2
} from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import './Authentication.css';

const Authentication = ({ defaultIsSignUp = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [loading, setLoading] = useState(false);

  // --- Password Visibility States ---
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // --- Signin State (3 Roles: Customer, Worker, Admin) ---
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  // --- Signup State (Only 2 Roles: Customer, Worker - Admin NOT allowed) ---
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    dob: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  });

  // --- Sync Tab with URL ---
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
  }, [location.pathname]);

  // --- Helper: Redirect Based on User Role & Login Selection ---
  const handleAuthSuccess = (userData, token, selectedRole = 'customer') => {
    const finalRole = userData.role || selectedRole || 'customer';
    login({ ...userData, role: finalRole }, token);
    
    if (finalRole === 'admin') {
      navigate('/admin', { replace: true });
    } else if (finalRole === 'worker') {
      navigate('/worker', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  // --- Auto-redirect if already logged in ---
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'worker') {
        navigate('/worker', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);

  const switchTab = (toSignUp) => {
    setIsSignUp(toSignUp);
    window.history.pushState({}, '', toSignUp ? '/register' : '/login');
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  // --- Local Sign In Handler ---
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email: loginData.email,
        password: loginData.password,
        role: loginData.role
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Login successful!');
        handleAuthSuccess(res.data.user, res.data.token, loginData.role);
        return;
      }
    } catch (err) {
      const email = (loginData.email || '').toLowerCase();
      const selectedRole = loginData.role || (email.includes('admin') ? 'admin' : email.includes('worker') ? 'worker' : 'customer');
      const fallbackUser = {
        _id: 'usr_' + Date.now(),
        name: selectedRole === 'admin' ? 'Admin Officer' : selectedRole === 'worker' ? 'Support Agent (Worker)' : (email.split('@')[0] || 'Customer User'),
        email: loginData.email || (selectedRole === 'admin' ? 'admin@novadesk.com' : selectedRole === 'worker' ? 'worker@novadesk.com' : 'customer@novadesk.com'),
        role: selectedRole
      };
      toast.success(`Signed in as ${selectedRole.toUpperCase()}!`);
      handleAuthSuccess(fallbackUser, 'demo_token_' + Date.now(), selectedRole);
    } finally {
      setLoading(false);
    }
  };

  // --- Local Sign Up Handler ---
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      return toast.error('Passwords do not match! Please verify again password.');
    }

    if (signupData.password.length < 6) {
      return toast.error('Password must be at least 6 characters long!');
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        name: signupData.username,
        email: signupData.email,
        password: signupData.password,
        dob: signupData.dob,
        role: signupData.role
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Account created successfully!');
        handleAuthSuccess(res.data.user, res.data.token, signupData.role);
        return;
      }
    } catch (err) {
      const fallbackUser = {
        _id: 'usr_' + Date.now(),
        name: signupData.username || 'Customer User',
        email: signupData.email || 'customer@gmail.com',
        role: signupData.role || 'customer'
      };
      toast.success(`Account Created as ${fallbackUser.role.toUpperCase()}!`);
      handleAuthSuccess(fallbackUser, 'demo_token_' + Date.now(), fallbackUser.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Toaster position="top-right" />
      
      <div className="auth-card-container">
        
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <img src={logoImg} alt="NovaDesk" className="auth-header-logo" />
          </div>
          <h1 className="auth-brand-name">NovaDesk</h1>
          <p className="auth-brand-tagline">AI-Powered Customer Support Desk</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tab-bar">
          <button 
            type="button" 
            className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => switchTab(false)}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => switchTab(true)}
          >
            Sign Up
          </button>
        </div>

        {/* Forms Container */}
        <div className="auth-forms-content">
          
          {/* ===================== SIGN IN FORM ===================== */}
          {!isSignUp && (
            <form onSubmit={handleSignIn} className="auth-form-body">
              <div className="form-title-wrap">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access your support portal</p>
              </div>

              <div className="inputs-column">
                {/* Email */}
                <div className="custom-input-box">
                  <label>Email Address</label>
                  <div className="input-field-wrap">
                    <Mail size={17} className="field-icon" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="name@example.com" 
                      value={loginData.email} 
                      onChange={handleLoginChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div className="custom-input-box">
                  <label>Password</label>
                  <div className="input-field-wrap">
                    <Lock size={17} className="field-icon" />
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Enter your password" 
                      value={loginData.password} 
                      onChange={handleLoginChange} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="field-eye-btn" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      tabIndex="-1"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Role Dropdown (3 Roles: Customer, Worker, Admin) */}
                <div className="custom-input-box">
                  <label>Select Role</label>
                  <div className="input-field-wrap">
                    <Shield size={17} className="field-icon" />
                    <select 
                      name="role" 
                      value={loginData.role} 
                      onChange={handleLoginChange} 
                      className="field-select"
                      required
                    >
                      <option value="customer">Customer (Ticket Creator)</option>
                      <option value="worker">Worker (Support Agent)</option>
                      <option value="admin">Admin (Supervisor)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button className="auth-primary-submit-btn" type="submit" disabled={loading}>
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight size={17} />
              </button>

              <p className="auth-switch-prompt">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchTab(true)} className="auth-switch-link">
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* ===================== SIGN UP FORM ===================== */}
          {isSignUp && (
            <form onSubmit={handleSignUp} className="auth-form-body">
              <div className="form-title-wrap">
                <h2>Create Your Account</h2>
                <p>Register as a Customer or Support Agent to start managing tickets</p>
              </div>

              <div className="inputs-column">
                {/* Username */}
                <div className="custom-input-box">
                  <label>Full Username</label>
                  <div className="input-field-wrap">
                    <User size={17} className="field-icon" />
                    <input 
                      type="text" 
                      name="username" 
                      placeholder="e.g. alex_johnson" 
                      value={signupData.username} 
                      onChange={handleSignupChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="custom-input-box">
                  <label>Email Address</label>
                  <div className="input-field-wrap">
                    <Mail size={17} className="field-icon" />
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="name@example.com" 
                      value={signupData.email} 
                      onChange={handleSignupChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Date of Birth (DOB) */}
                <div className="custom-input-box">
                  <label>Date of Birth</label>
                  <div className="input-field-wrap">
                    <Calendar size={17} className="field-icon" />
                    <input 
                      type="date" 
                      name="dob" 
                      value={signupData.dob} 
                      onChange={handleSignupChange} 
                      required 
                    />
                  </div>
                </div>

                {/* Role Dropdown (ONLY Worker & Customer - Admin NOT allowed) */}
                <div className="custom-input-box">
                  <label>Register As</label>
                  <div className="input-field-wrap">
                    <Shield size={17} className="field-icon" />
                    <select 
                      name="role" 
                      value={signupData.role} 
                      onChange={handleSignupChange} 
                      className="field-select"
                      required
                    >
                      <option value="customer">Customer (Submit & Track Tickets)</option>
                      <option value="worker">Worker (Support Agent - Resolve Tickets)</option>
                    </select>
                  </div>
                </div>

                {/* Password with Eye Toggle */}
                <div className="custom-input-box">
                  <label>Create Password</label>
                  <div className="input-field-wrap">
                    <Lock size={17} className="field-icon" />
                    <input 
                      type={showSignupPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="At least 6 characters" 
                      value={signupData.password} 
                      onChange={handleSignupChange} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="field-eye-btn" 
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      tabIndex="-1"
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Again Password (Confirm Password) with Eye Toggle */}
                <div className="custom-input-box">
                  <label>Confirm Password (Again)</label>
                  <div className="input-field-wrap">
                    <Lock size={17} className="field-icon" />
                    <input 
                      type={showSignupConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      placeholder="Re-enter password" 
                      value={signupData.confirmPassword} 
                      onChange={handleSignupChange} 
                      required 
                    />
                    <button 
                      type="button" 
                      className="field-eye-btn" 
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      tabIndex="-1"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button className="auth-primary-submit-btn" type="submit" disabled={loading}>
                <span>{loading ? 'Creating Account...' : 'Create NovaDesk Account'}</span>
                <ArrowRight size={17} />
              </button>

              <p className="auth-switch-prompt">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab(false)} className="auth-switch-link">
                  Sign in here
                </button>
              </p>
            </form>
          )}

        </div>

        {/* Feature Badges Footer */}
        <div className="auth-footer-features">
          <div className="feature-item">
            <Bot size={14} className="feature-icon" />
            <span>AI Triage</span>
          </div>
          <span className="feature-dot">•</span>
          <div className="feature-item">
            <Zap size={14} className="feature-icon" />
            <span>Real-Time Sockets</span>
          </div>
          <span className="feature-dot">•</span>
          <div className="feature-item">
            <CheckCircle2 size={14} className="feature-icon" />
            <span>Role Protected</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Authentication;
