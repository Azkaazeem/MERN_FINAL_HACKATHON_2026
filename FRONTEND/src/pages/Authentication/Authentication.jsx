import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  CreditCard, 
  Camera, 
  Eye, 
  EyeOff,
  Shield
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Authentication.css';

const Authentication = ({ defaultIsSignUp = false }) => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // --- Password Visibility States ---
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // --- Form States (By default Role is 'user') ---
  const [loginData, setLoginData] = useState({
    email: 'admin@gmail.com',
    password: 'admin123@',
    role: 'user'
  });

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    dob: '',
    cnic: '',
    password: '',
    confirmPassword: '',
    profilePic: ''
  });

  // --- Helper: Redirect Based on User Role & Login Selection ---
  const handleAuthSuccess = (userData, token, selectedRole = 'user') => {
    login(userData, token);
    if (selectedRole === 'admin' && userData.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/home', { replace: true });
    }
  };

  // --- Auto-redirect if already logged in ---
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);

  // --- Initial Route Check (/login or /register) ---
  useEffect(() => {
    if (defaultIsSignUp) {
      togglePanel(true, 0); // instant snap without animation on direct link
    } else {
      togglePanel(false, 0);
    }
  }, [defaultIsSignUp]);

  // --- GitHub OAuth Callback Handler ---
  const githubCodeProcessed = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code && !githubCodeProcessed.current) {
      githubCodeProcessed.current = true;
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      const exchangeGithubCode = async () => {
        setLoading(true);
        try {
          const res = await API.post('/auth/github', { code });
          if (res.data.success) {
            toast.success(res.data.message || 'GitHub login successful!');
            handleAuthSuccess(res.data.user, res.data.token, 'user');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'GitHub Authentication failed');
        } finally {
          setLoading(false);
        }
      };

      exchangeGithubCode();
    }
  }, [login, navigate]);

  // --- GSAP Panel Toggle Logic ---
  const togglePanel = (toSignUp, duration = 0.6) => {
    setIsSignUp(toSignUp);
    const q = gsap.utils.selector(containerRef);

    if (toSignUp) {
      // Slide to Sign Up (Right side)
      gsap.to(q('.sign-in-container'), { x: '100%', opacity: 0, zIndex: 1, duration, ease: "power2.inOut" });
      gsap.to(q('.sign-up-container'), { x: '100%', opacity: 1, zIndex: 5, duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-container'), { x: '-100%', duration, ease: "power2.inOut" });
      gsap.to(q('.overlay'), { x: '50%', duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-left'), { x: 0, duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-right'), { x: '20%', duration, ease: "power2.inOut" });
    } else {
      // Slide to Sign In (Left side)
      gsap.to(q('.sign-in-container'), { x: '0%', opacity: 1, zIndex: 5, duration, ease: "power2.inOut" });
      gsap.to(q('.sign-up-container'), { x: '0%', opacity: 0, zIndex: 1, duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-container'), { x: '0%', duration, ease: "power2.inOut" });
      gsap.to(q('.overlay'), { x: '0%', duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-left'), { x: '-20%', duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-right'), { x: '0%', duration, ease: "power2.inOut" });
    }
  };

  // --- Input Change Handlers ---
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  // --- Profile Picture Preview & Base64 Converter ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image size must be less than 5MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupData({ ...signupData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
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
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // --- Local Sign Up Handler ---
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validations
    if (signupData.password !== signupData.confirmPassword) {
      return toast.error('Passwords do not match!');
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
        cnic: signupData.cnic,
        profilePic: signupData.profilePic
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Account created successfully!');
        handleAuthSuccess(res.data.user, res.data.token, 'user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Google OAuth Handler ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await API.post('/auth/google', {
          accessToken: tokenResponse.access_token
        });
        if (res.data.success) {
          toast.success(res.data.message || 'Google login successful!');
          handleAuthSuccess(res.data.user, res.data.token, 'user');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login popup was closed or cancelled');
    }
  });

  // --- GitHub OAuth Handler ---
  const handleGithubLogin = () => {
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      return toast.error('GitHub Client ID is missing in .env');
    }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user:email`;
  };

  // --- Forgot Password Placeholder ---
  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast('Forgot password logic triggered', { icon: '🔑' });
  };

  return (
    <div className="auth-body">
      <Toaster position="top-right" />
      <div className="auth-container" ref={containerRef}>
        
        {/* ===================== SIGN UP FORM ===================== */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h2>Create Account</h2>
            
            {/* Profile Picture Upload Circle */}
            <div className="profile-pic-wrapper">
              <label htmlFor="profile-upload" className="profile-pic-label" title="Upload Profile Picture">
                {signupData.profilePic ? (
                  <img src={signupData.profilePic} alt="Profile" className="profile-preview-img" />
                ) : (
                  <Camera size={22} />
                )}
              </label>
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden-input" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>

            {/* Username */}
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={signupData.username} 
                onChange={handleSignupChange} 
                required 
              />
            </div>

            {/* Email */}
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={signupData.email} 
                onChange={handleSignupChange} 
                required 
              />
            </div>

            {/* Date of Birth (DOB) */}
            <div className="input-group">
              <Calendar size={18} className="input-icon" />
              <input 
                type="date" 
                name="dob" 
                placeholder="Date of Birth" 
                value={signupData.dob} 
                onChange={handleSignupChange} 
                required 
              />
            </div>

            {/* CNIC */}
            <div className="input-group">
              <CreditCard size={18} className="input-icon" />
              <input 
                type="text" 
                name="cnic" 
                placeholder="CNIC (e.g. 42101-xxxxxxx-x)" 
                value={signupData.cnic} 
                onChange={handleSignupChange} 
                required 
              />
            </div>

            {/* Password with Eye Toggle */}
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showSignupPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={signupData.password} 
                onChange={handleSignupChange} 
                required 
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowSignupPassword(!showSignupPassword)}
                tabIndex="-1"
              >
                {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password with Eye Toggle */}
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showSignupConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={signupData.confirmPassword} 
                onChange={handleSignupChange} 
                required 
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                tabIndex="-1"
              >
                {showSignupConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
            
            {/* Social OAuth Buttons */}
            <div className="social-container">
              <p style={{ margin: '4px 0', fontSize: '12px' }}>Or connect with</p>
              <div className="social-icons">
                <button 
                  type="button" 
                  className="social-btn" 
                  title="Continue with Google"
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                >
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                </button>
                <button 
                  type="button" 
                  className="social-btn" 
                  title="Continue with GitHub"
                  onClick={handleGithubLogin}
                  disabled={loading}
                >
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <p className="mobile-toggle" onClick={() => {
              window.history.pushState({}, '', '/login');
              togglePanel(false);
            }}>
              Already have an account? <b>Sign In</b>
            </p>
          </form>
        </div>

        {/* ===================== SIGN IN FORM ===================== */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            
            {/* Social OAuth Buttons */}
            <div className="social-container">
              <p style={{ margin: '4px 0', fontSize: '12px' }}>Use your account</p>
              <div className="social-icons">
                <button 
                  type="button" 
                  className="social-btn" 
                  title="Continue with Google"
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                >
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                </button>
                <button 
                  type="button" 
                  className="social-btn" 
                  title="Continue with GitHub"
                  onClick={handleGithubLogin}
                  disabled={loading}
                >
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" style={{ width: '18px', height: '18px' }} />
                </button>
              </div>
            </div>

            <p style={{ margin: '6px 0', fontSize: '12px' }}>or use your email</p>

            {/* Email */}
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={loginData.email} 
                onChange={handleLoginChange} 
                required 
              />
            </div>

            {/* Password with Eye Toggle */}
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type={showLoginPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={loginData.password} 
                onChange={handleLoginChange} 
                required 
              />
              <button 
                type="button" 
                className="eye-btn" 
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                tabIndex="-1"
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Role Dropdown (By Default 'User') */}
            <div className="input-group">
              <Shield size={18} className="input-icon" />
              <select 
                name="role" 
                value={loginData.role} 
                onChange={handleLoginChange}
                className="role-select"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>
              Forgot your password?
            </a>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Mobile View Toggle */}
            <p className="mobile-toggle" onClick={() => {
              window.history.pushState({}, '', '/register');
              togglePanel(true);
            }}>
              Don't have an account? <b>Sign Up</b>
            </p>
          </form>
        </div>

        {/* ===================== SLIDING OVERLAY ===================== */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Overlay - Shown when Sign Up is active */}
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost-btn" onClick={() => {
                window.history.pushState({}, '', '/login');
                togglePanel(false);
              }}>Sign In</button>
            </div>

            {/* Right Overlay - Shown when Sign In is active */}
            <div className="overlay-panel overlay-right">
              <h2>Hello, Friend!</h2>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost-btn" onClick={() => {
                window.history.pushState({}, '', '/register');
                togglePanel(true);
              }}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Authentication;
