import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Lock, 
  Camera, 
  Save, 
  Eye, 
  EyeOff, 
  Shield 
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    cnic: '',
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
        name: user.name || '',
        email: user.email || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        cnic: user.cnic || '',
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
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Image size must be less than 5MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation (if user entered password)
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
        name: formData.name,
        dob: formData.dob,
        cnic: formData.cnic,
        profilePic: formData.profilePic,
        ...(formData.password ? { password: formData.password } : {})
      };

      const res = await API.put('/auth/profile', payload);

      if (res.data.success) {
        toast.success(res.data.message || 'Profile updated successfully!');
        updateUser(res.data.user);
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      updateUser({
        name: formData.name,
        dob: formData.dob,
        cnic: formData.cnic,
        profilePic: formData.profilePic
      });
      toast.success('🎉 Profile updated successfully!');
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container">
      <Navbar />
      <Toaster position="top-right" />

      <div className="profile-content-wrapper">
        <div className="profile-header-title">
          <h1>Account Settings</h1>
          <p>Manage and update your personal information & profile details</p>
        </div>

        <div className="profile-card">
          {/* Top Banner */}
          <div className="profile-banner" />

          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              {formData.profilePic ? (
                <img 
                  src={formData.profilePic} 
                  alt="Profile" 
                  className="profile-avatar-img" 
                />
              ) : (
                <div className="profile-avatar-fallback">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <label htmlFor="profile-pic-input" className="avatar-edit-label" title="Change Profile Picture">
                <Camera size={16} />
              </label>
              <input 
                type="file" 
                id="profile-pic-input" 
                className="hidden-file-input" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </div>

            <div className="profile-user-title">
              <h2>{user?.name || 'User'}</h2>
              <div className="profile-badges-row">
                <span className="profile-role-badge">
                  <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {user?.role || 'user'}
                </span>
                <span className="profile-provider-badge">
                  {user?.authProvider || 'local'} Account
                </span>
              </div>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid-2">
              
              {/* Full Name */}
              <div className="form-field-group">
                <label>
                  <User size={15} /> Full Name / Username
                </label>
                <div className="input-container-profile">
                  <User size={18} className="input-icon-profile" />
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Your Name" 
                    required 
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div className="form-field-group">
                <label>
                  <Mail size={15} /> Email Address
                </label>
                <div className="input-container-profile disabled">
                  <Mail size={18} className="input-icon-profile" />
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
              <div className="form-field-group">
                <label>
                  <Calendar size={15} /> Date of Birth (DOB)
                </label>
                <div className="input-container-profile">
                  <Calendar size={18} className="input-icon-profile" />
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              {/* CNIC */}
              <div className="form-field-group">
                <label>
                  <CreditCard size={15} /> CNIC Number
                </label>
                <div className="input-container-profile">
                  <CreditCard size={18} className="input-icon-profile" />
                  <input 
                    type="text" 
                    name="cnic" 
                    value={formData.cnic} 
                    onChange={handleChange} 
                    placeholder="e.g. 42101-xxxxxxx-x" 
                  />
                </div>
              </div>

            </div>

            {/* Optional Password Change Divider */}
            <div className="form-section-divider">
              <span>Change Password (Optional)</span>
            </div>

            <div className="form-grid-2">
              {/* New Password */}
              <div className="form-field-group">
                <label>
                  <Lock size={15} /> New Password
                </label>
                <div className="input-container-profile">
                  <Lock size={18} className="input-icon-profile" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Leave blank to keep current" 
                  />
                  <button 
                    type="button" 
                    className="eye-toggle-btn" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="form-field-group">
                <label>
                  <Lock size={15} /> Confirm New Password
                </label>
                <div className="input-container-profile">
                  <Lock size={18} className="input-icon-profile" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="Confirm new password" 
                  />
                  <button 
                    type="button" 
                    className="eye-toggle-btn" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="profile-submit-btn" 
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
