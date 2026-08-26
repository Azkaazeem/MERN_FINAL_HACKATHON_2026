import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Lock, Calendar, CreditCard, Camera } from 'lucide-react';
import './Authentication.css';

const Authentication = ({ defaultIsSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const containerRef = useRef(null);
  
  // To handle initial load if user visits /register directly
  useEffect(() => {
    if (defaultIsSignUp) {
      togglePanel(true, 0); // 0 duration so it snaps instantly on load
    } else {
      togglePanel(false, 0);
    }
  }, [defaultIsSignUp]);

  const togglePanel = (toSignUp, duration = 0.6) => {
    setIsSignUp(toSignUp);
    const q = gsap.utils.selector(containerRef);
    
    if (toSignUp) {
      // Move to Sign Up (Right side)
      gsap.to(q('.sign-in-container'), { x: '100%', opacity: 0, zIndex: 1, duration: duration, ease: "power2.inOut" });
      gsap.to(q('.sign-up-container'), { x: '100%', opacity: 1, zIndex: 5, duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-container'), { x: '-100%', duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay'), { x: '50%', duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-left'), { x: 0, duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-right'), { x: '20%', duration: duration, ease: "power2.inOut" });
    } else {
      // Move to Sign In (Left side)
      gsap.to(q('.sign-in-container'), { x: '0%', opacity: 1, zIndex: 5, duration: duration, ease: "power2.inOut" });
      gsap.to(q('.sign-up-container'), { x: '0%', opacity: 0, zIndex: 1, duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-container'), { x: '0%', duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay'), { x: '0%', duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-left'), { x: '-20%', duration: duration, ease: "power2.inOut" });
      gsap.to(q('.overlay-right'), { x: '0%', duration: duration, ease: "power2.inOut" });
    }
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    toast.success('Successfully signed in!');
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    toast.success('Account created successfully!');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast('Redirecting to forgot password...', { icon: '🔑' });
  };

  return (
    <div className="auth-body">
      <Toaster position="top-right" />
      <div className="auth-container" ref={containerRef}>
        
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUp}>
            <h2>Create Account</h2>
            
            <div className="profile-pic-wrapper">
              <label htmlFor="profile-upload" className="profile-pic-label" title="Upload Profile Picture">
                <Camera size={24} />
              </label>
              <input type="file" id="profile-upload" className="hidden-input" accept="image/*" />
            </div>

            <div className="input-group">
              <User size={18} />
              <input type="text" placeholder="Username" required />
            </div>
            <div className="input-group">
              <Mail size={18} />
              <input type="email" placeholder="Email" required />
            </div>
            <div className="input-group">
              <Calendar size={18} />
              <input type="number" placeholder="Age" required />
            </div>
            <div className="input-group">
              <CreditCard size={18} />
              <input type="text" placeholder="CNIC" required />
            </div>
            <div className="input-group">
              <Lock size={18} />
              <input type="password" placeholder="Password" required />
            </div>
            <div className="input-group">
              <Lock size={18} />
              <input type="password" placeholder="Confirm Password" required />
            </div>

            <button className="submit-btn" type="submit">Sign Up</button>
            
            <div className="social-container">
              <p style={{margin: '5px 0'}}>Or sign up with</p>
              <div className="social-icons">
                <button type="button" className="social-btn">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" style={{width: '20px', height: '20px'}} />
                </button>
                <button type="button" className="social-btn">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" style={{width: '20px', height: '20px'}} />
                </button>
              </div>
            </div>
            
            {/* Mobile Toggle */}
            <p className="mobile-toggle" onClick={() => {
              window.history.pushState({}, '', '/login');
              togglePanel(false);
            }}>
              Already have an account? <b>Sign In</b>
            </p>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            
            <div className="social-container">
              <p style={{margin: '5px 0'}}>Use your account</p>
              <div className="social-icons">
                <button type="button" className="social-btn">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg" alt="Google" style={{width: '20px', height: '20px'}} />
                </button>
                <button type="button" className="social-btn">
                  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" alt="GitHub" style={{width: '20px', height: '20px'}} />
                </button>
              </div>
            </div>

            <p>or use your email</p>

            <div className="input-group">
              <Mail size={18} />
              <input type="email" placeholder="Email" required />
            </div>
            <div className="input-group">
              <Lock size={18} />
              <input type="password" placeholder="Password" required />
            </div>
            
            <a href="#" className="forgot-password" onClick={handleForgotPassword}>
              Forgot your password?
            </a>

            <button className="submit-btn" type="submit">Sign In</button>

            {/* Mobile Toggle */}
            <p className="mobile-toggle" onClick={() => {
              window.history.pushState({}, '', '/register');
              togglePanel(true);
            }}>
              Don't have an account? <b>Sign Up</b>
            </p>
          </form>
        </div>

        {/* Sliding Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Overlay - Shown when Sign Up form is active */}
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected with us please login with your personal info</p>
              {/* NOTE: We update the URL without page reload using window.history, or we just slide it. Since it's one page, sliding is enough, but to sync with routes, we can just slide. */}
              <button className="ghost-btn" onClick={() => {
                window.history.pushState({}, '', '/login');
                togglePanel(false);
              }}>Sign In</button>
            </div>
            {/* Right Overlay - Shown when Sign In form is active */}
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
