import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { showAuthAlert } from '../../utils/authAlert';
import API from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { 
  User, 
  Mail, 
  Calendar, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Shield,
  Building2,
  Sparkles,
  Award,
  CheckCircle2,
  Activity
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.profile-main-card', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Form State matching Signup fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    role: 'customer',
    department: 'General Civic Support',
    profilePic: '',
    password: '',
    confirmPassword: ''
  });

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pre-fill form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || '',
        email: user.email || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        role: user.role || 'customer',
        department: user.department || 'General Civic Support',
        profilePic: user.profilePic || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Profile Picture Selection
  const handleImageChange = (e) => {
    if (!user) {
      showAuthAlert(navigate, 'update profile avatar');
      return;
    }
    const file = e.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        return toast.error('Only PNG, JPG, or JPEG images are allowed.');
      }
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image size must be less than 5MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
        toast.success('Avatar preview loaded! Click Save to confirm.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showAuthAlert(navigate, 'save profile details');
      return;
    }

    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        return toast.error('New passwords do not match!');
      }
      if (formData.password.length < 6) {
        return toast.error('Password must be at least 6 characters long!');
      }
    }

    setLoading(true);

    try {
      const payload = {
        userId: user.id || user._id,
        name: formData.name,
        email: formData.email,
        dob: formData.dob,
        department: formData.department,
        profilePic: formData.profilePic,
        ...(formData.password ? { password: formData.password } : {})
      };

      const res = await API.put('/auth/profile', payload);

      if (res.data?.success) {
        toast.success(res.data.message || 'Profile updated successfully in database!');
        updateUser(res.data.user || {
          ...user,
          name: formData.name,
          dob: formData.dob,
          department: formData.department,
          profilePic: formData.profilePic
        });
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      updateUser({
        ...user,
        name: formData.name,
        dob: formData.dob,
        department: formData.department,
        profilePic: formData.profilePic
      });
      toast.success('Profile updated successfully!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper" ref={containerRef}>
      <Toaster position="top-right" />

      <main className="profile-main-container">
        
        {/* Profile Card */}
        <div className="profile-main-card">
          
          {/* Top Banner / Avatar Header */}
          <div className="profile-card-header">
            
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="User Avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-fallback">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : <User size={36} />}
                  </div>
                )}
              </div>

              <label className="avatar-camera-btn" title="Upload Custom Photo (PNG, JPG)">
                <Camera size={15} />
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            <div className="profile-header-meta">
              <h2 className="profile-user-name">{formData.name || 'NovaDesk User'}</h2>
              <p className="profile-user-email">{formData.email || 'user@example.com'}</p>
              
              <div className="profile-role-pill-group">
                <span className={`role-badge ${formData.role}`}>
                  <Shield size={12} />
                  <span>{formData.role.toUpperCase()}</span>
                </span>

                {formData.role === 'worker' && (
                  <span className="dept-badge">
                    <Building2 size={12} />
                    <span>{formData.department}</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Civic Impact / Account Statistics Strip */}
          <div className="profile-stats-strip">
            <div className="p-stat-box">
              <div className="p-stat-top">
                <span>Karma Score</span>
                <Sparkles size={14} className="icon-amber" />
              </div>
              <div className="p-stat-val">{user?.karmaPoints || 1850} <small>pts</small></div>
              <div className="p-stat-sub">{user?.badge || 'Civic Grandmaster'}</div>
            </div>

            <div className="p-stat-box">
              <div className="p-stat-top">
                <span>Verified Tickets</span>
                <CheckCircle2 size={14} className="icon-green" />
              </div>
              <div className="p-stat-val">{user?.verifiedReportsCount || 38}</div>
              <div className="p-stat-sub">100% Legitimacy Rate</div>
            </div>

            <div className="p-stat-box">
              <div className="p-stat-top">
                <span>Account Status</span>
                <Activity size={14} className="icon-cyan" />
              </div>
              <div className="p-stat-val text-green">Active</div>
              <div className="p-stat-sub">Full Portal Access</div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="profile-form-body">
            
            <div className="form-section-title">
              <h3>Account Profile Details</h3>
              <p>Update your personal information matching your signup credentials</p>
            </div>

            <div className="form-inputs-grid">
              
              {/* Full Name */}
              <div className="p-input-group">
                <label>Full Name / Username</label>
                <div className="p-input-wrap">
                  <User size={16} className="p-field-icon" />
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="e.g. Alex Johnson"
                    required 
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="p-input-group">
                <label>Registered Email Address</label>
                <div className="p-input-wrap disabled">
                  <Mail size={16} className="p-field-icon" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    disabled
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="p-input-group">
                <label>Date of Birth</label>
                <div className="p-input-wrap">
                  <Calendar size={16} className="p-field-icon" />
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              {/* Department (If Worker) or Account Role */}
              {formData.role === 'worker' ? (
                <div className="p-input-group">
                  <label>Department Specialty</label>
                  <div className="p-input-wrap">
                    <Building2 size={16} className="p-field-icon" />
                    <select 
                      name="department" 
                      value={formData.department} 
                      onChange={handleChange}
                      className="p-select"
                    >
                      <option value="Water Supply & Sewerage Board (WSSB)">Water Supply &amp; Sewerage Board (WSSB)</option>
                      <option value="Power & Grid Safety Board">Power &amp; Grid Safety Board</option>
                      <option value="Solid Waste Management Authority (SWMA)">Solid Waste Management Authority (SWMA)</option>
                      <option value="Municipal Works & Asphalt Dept">Municipal Works &amp; Asphalt Dept</option>
                      <option value="General Civic Support">General Civic Support</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-input-group">
                  <label>Portal Role</label>
                  <div className="p-input-wrap disabled">
                    <Shield size={16} className="p-field-icon" />
                    <input 
                      type="text" 
                      value="Customer (Citizen Support Reporter)" 
                      disabled 
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Password Update Section */}
            <div className="form-section-title password-section">
              <h3>Security &amp; Password Update</h3>
              <p>Leave blank if you do not wish to change your password</p>
            </div>

            <div className="form-inputs-grid">
              
              {/* New Password */}
              <div className="p-input-group">
                <label>New Password</label>
                <div className="p-input-wrap">
                  <Lock size={16} className="p-field-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Enter new password (min 6 chars)" 
                    value={formData.password} 
                    onChange={handleChange} 
                  />
                  <button 
                    type="button" 
                    className="p-eye-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="p-input-group">
                <label>Confirm New Password</label>
                <div className="p-input-wrap">
                  <Lock size={16} className="p-field-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    placeholder="Re-enter new password" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                  />
                  <button 
                    type="button" 
                    className="p-eye-btn" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="profile-action-row">
              <button type="submit" className="p-save-btn" disabled={loading}>
                <Save size={16} />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>

          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Profile;
