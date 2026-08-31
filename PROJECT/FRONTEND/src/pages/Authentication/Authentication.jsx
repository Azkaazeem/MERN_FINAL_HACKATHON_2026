import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, User, Eye, EyeOff } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Authentication.css';

const Authentication = ({ defaultIsSignUp = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // --- Signin State (Roles: Customer, Worker, Admin) ---
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });

  // --- Signup State (Roles: Customer, Worker) ---
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    dob: '',
    role: 'customer',
    department: 'General Civic Support',
    profilePic: '',
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

  // --- Avatar Profile Picture Upload ---
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      return toast.error('Only PNG, JPG, or JPEG images are allowed.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size must be less than 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSignupData(prev => ({ ...prev, profilePic: reader.result }));
      toast.success('Avatar uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // --- STRICT Database Sign In Handler ---
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password,
        role: loginData.role
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Login successful!');
        handleAuthSuccess(res.data.user, res.data.token, res.data.user.role || loginData.role);
      } else {
        toast.error(res.data?.message || 'Login failed.');
      }
    } catch (err) {
      if (!err.response || err.message === 'Network Error') {
        toast.error('Cannot connect to backend server! Please make sure backend is running on port 5000.');
      } else {
        toast.error(err.response.data?.message || 'Invalid email or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- STRICT Database Sign Up Handler ---
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    if (signupData.password.length < 6) {
      return toast.error('Password must be at least 6 characters long!');
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/register', {
        name: signupData.username.trim(),
        email: signupData.email.trim().toLowerCase(),
        password: signupData.password,
        dob: signupData.dob,
        role: signupData.role,
        department: signupData.department,
        profilePic: signupData.profilePic
      });

      if (res.data?.success) {
        toast.success('Account created successfully!');
        handleAuthSuccess(res.data.user, res.data.token, res.data.user.role || signupData.role);
      } else {
        toast.error(res.data?.message || 'Failed to create account.');
      }
    } catch (err) {
      if (!err.response || err.message === 'Network Error') {
        toast.error('Cannot connect to backend server! Please make sure backend is running on port 5000.');
      } else {
        toast.error(err.response.data?.message || 'Registration failed. Email might already exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-clean-wrapper">
      <Toaster position="top-right" />

      {/* Main Sliding Container */}
      <div className={`clean-auth-container ${isSignUp ? 'right-panel-active' : ''}`} id="container">
        
        {/* ================= 1. SIGN IN FORM (LEFT) ================= */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn} className="clean-form">
            
            <h1>Sign in</h1>

            <div className="inputs-wrapper">
              <select 
                name="role" 
                value={loginData.role} 
                onChange={handleLoginChange} 
                className="clean-input clean-select"
                required
              >
                <option value="customer">Role: Customer (Citizen)</option>
                <option value="worker">Role: Worker (Field Agent)</option>
                <option value="admin">Role: Administrator</option>
              </select>

              <input 
                type="email" 
                name="email" 
                placeholder="admin@gmail.com" 
                value={loginData.email} 
                onChange={handleLoginChange} 
                className="clean-input"
                required 
              />

              <div className="clean-password-wrap">
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="admin123@" 
                  value={loginData.password} 
                  onChange={handleLoginChange} 
                  className="clean-input"
                  required 
                />
                <button 
                  type="button" 
                  className="clean-eye-btn" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="clean-solid-btn" type="submit" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            {/* Mobile / Tablet switch */}
            <div className="mobile-switch-box">
              <span>Don't have an account?</span>
              <button type="button" onClick={() => switchTab(true)} className="mobile-toggle-btn">
                Sign Up
              </button>
            </div>

          </form>
        </div>

        {/* ================= 2. SIGN UP FORM (RIGHT) ================= */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp} className="clean-form signup-form">
            
            <h1>Create Account</h1>

            {/* Clickable Circle Avatar (Enlarged) */}
            <div className="clean-avatar-circle-wrapper">
              <label className="clean-avatar-circle" title="Click to upload avatar">
                {signupData.profilePic ? (
                  <img src={signupData.profilePic} alt="Avatar" className="clean-avatar-img" />
                ) : (
                  <div className="clean-avatar-placeholder">
                    <User size={34} color="#94a3b8" />
                    <Camera size={14} className="clean-camera-badge" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleAvatarUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            {/* Single Column Inputs: 1 input per row */}
            <div className="inputs-wrapper">
              <input 
                type="text" 
                name="username" 
                placeholder="Name" 
                value={signupData.username} 
                onChange={handleSignupChange} 
                className="clean-input"
                required 
              />

              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={signupData.email} 
                onChange={handleSignupChange} 
                className="clean-input"
                required 
              />

              <input 
                type="date" 
                name="dob" 
                placeholder="Date of Birth"
                value={signupData.dob} 
                onChange={handleSignupChange} 
                className="clean-input"
                required 
              />

              <select 
                name="role" 
                value={signupData.role} 
                onChange={handleSignupChange} 
                className="clean-input clean-select"
                required
              >
                <option value="customer">Customer (Citizen)</option>
                <option value="worker">Worker (Field Support)</option>
              </select>

              {signupData.role === 'worker' && (
                <select 
                  name="department" 
                  value={signupData.department} 
                  onChange={handleSignupChange} 
                  className="clean-input clean-select full-col"
                  required
                >
                  <option value="Water Supply & Sewerage Board (WSSB)">Water Supply & Sewerage Board</option>
                  <option value="Power & Grid Safety Board">Power & Grid Safety Board</option>
                  <option value="Solid Waste Management Authority (SWMA)">Solid Waste Management Authority</option>
                  <option value="Municipal Works & Asphalt Dept">Municipal Works & Asphalt Dept</option>
                  <option value="General Civic Support">General Civic Support</option>
                </select>
              )}

              <div className="clean-password-wrap">
                <input 
                  type={showSignupPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="Password" 
                  value={signupData.password} 
                  onChange={handleSignupChange} 
                  className="clean-input"
                  required 
                />
                <button 
                  type="button" 
                  className="clean-eye-btn" 
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="clean-password-wrap">
                <input 
                  type={showSignupConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  placeholder="Confirm Password" 
                  value={signupData.confirmPassword} 
                  onChange={handleSignupChange} 
                  className="clean-input"
                  required 
                />
                <button 
                  type="button" 
                  className="clean-eye-btn" 
                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="clean-solid-btn" type="submit" disabled={loading}>
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>

            {/* Mobile / Tablet switch */}
            <div className="mobile-switch-box">
              <span>Already have an account?</span>
              <button type="button" onClick={() => switchTab(false)} className="mobile-toggle-btn">
                Sign In
              </button>
            </div>

          </form>
        </div>

        {/* ================= 3. SOLID CYAN SLIDING OVERLAY CONTAINER ================= */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* Left Overlay Panel (Shows when in Sign Up mode) */}
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button type="button" className="clean-ghost-btn" onClick={() => switchTab(false)}>
                SIGN IN
              </button>
            </div>

            {/* Right Overlay Panel (Shows when in Sign In mode) */}
            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button type="button" className="clean-ghost-btn" onClick={() => switchTab(true)}>
                SIGN UP
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Authentication;
