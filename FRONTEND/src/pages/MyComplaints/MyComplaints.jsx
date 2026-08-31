import React, { useState, useEffect, useRef } from 'react';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { showAuthAlert } from '../../utils/authAlert';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { 
  Search, 
  Send, 
  Sparkles, 
  Check, 
  Clock, 
  MapPin, 
  Building2, 
  Image as ImageIcon, 
  Filter, 
  Droplets, 
  Trash2, 
  Truck, 
  Zap, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  Upload,
  ZoomIn,
  X,
  MessageSquare,
  User,
  Globe,
  Star,
  Award,
  ShieldCheck
} from 'lucide-react';
import TicketChatModal from '../../components/TicketChat/TicketChatModal';
import API from '../../api/axios';
import './MyComplaints.css';

const MyComplaints = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Central District',
    citizen_name: user?.name || '',
    citizen_contact: user?.phone || '0300-1234567',
    image_url: '',
    image_name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Complaints State (Loaded from MongoDB)
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [complaintsScope, setComplaintsScope] = useState('my'); // 'my' or 'all'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [activeChatTicket, setActiveChatTicket] = useState(null);

  // Rate Worker Modal State
  const [ratingModalTicket, setRatingModalTicket] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleOpenRatingModal = (ticket) => {
    setRatingModalTicket(ticket);
    const saved = localStorage.getItem(`ticket_rating_${ticket.id || ticket.ticketId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedStars(parsed.stars || 5);
        setFeedbackComment(parsed.comment || '');
      } catch (e) {
        setSelectedStars(5);
        setFeedbackComment('');
      }
    } else {
      setSelectedStars(5);
      setFeedbackComment('');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingModalTicket) return;
    setIsSubmittingRating(true);

    try {
      const ticketId = ratingModalTicket.id || ratingModalTicket.ticketId;
      localStorage.setItem(`ticket_rating_${ticketId}`, JSON.stringify({
        stars: selectedStars,
        comment: feedbackComment,
        ratedAt: new Date().toISOString()
      }));

      setComplaints(prev => prev.map(c => {
        if (c.id === ratingModalTicket.id || c.ticketId === ratingModalTicket.ticketId) {
          return { ...c, userRating: selectedStars, userComment: feedbackComment };
        }
        return c;
      }));

      Swal.fire({
        icon: 'success',
        title: 'Rating Submitted Successfully',
        text: `Thank you! You rated ${selectedStars} Stars for this municipal service.`,
        confirmButtonColor: '#00e5ff',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
      });

      setRatingModalTicket(null);
      setFeedbackComment('');
    } catch (err) {
      toast.error('Failed to save rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Sync user info into form
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizen_name: user.name || prev.citizen_name,
        citizen_contact: user.phone || prev.citizen_contact || '0300-1234567'
      }));
    }
  }, [user]);

  // Fetch Database Complaints (Strictly filtered by logged in user or citywide)
  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      let res;
      if (complaintsScope === 'my') {
        if (user?.email) {
          res = await API.get('/complaints/my', { params: { email: user.email } });
        } else {
          res = await API.get('/complaints/my');
        }
      } else {
        res = await API.get('/complaints');
      }

      const data = res.data?.complaints || res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        const formatted = data.map(c => ({
          id: c.ticketId || c._id,
          ticketId: c.ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
          title: c.title,
          description: c.description || 'Civic infrastructure maintenance report.',
          category: c.category || 'General Civic',
          priority: c.priority || 'Medium',
          status: c.status === 'Open' ? 'Pending' : (c.status || 'Pending'),
          assigned_department: c.department || c.assigned_department || 'Municipal Works',
          location: c.location || 'Central District',
          date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          image_url: c.imageUrl || c.image_url || ''
        }));
        setComplaints(formatted);
      } else {
        setComplaints([]);
      }
    } catch (e) {
      console.warn('API fallback load:', e);
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [user, complaintsScope]);

  // GSAP Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.vault-split-container', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Apply Presets
  const applyPreset = (title, description, location) => {
    setFormData(prev => ({
      ...prev,
      title,
      description,
      location: location || prev.location
    }));
    toast.success('Preset loaded into form!');
  };

  // Category Fallback Image Helper
  const getCategoryFallbackImage = (category = '', title = '') => {
    const t = `${title} ${category}`.toLowerCase();
    if (t.includes('water') || t.includes('drain') || t.includes('pipe') || t.includes('sewer') || t.includes('leak')) {
      return 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=600&auto=format&fit=crop&q=80';
    }
    if (t.includes('road') || t.includes('pothole') || t.includes('sinkhole') || t.includes('asphalt') || t.includes('traffic')) {
      return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';
    }
    if (t.includes('garbage') || t.includes('trash') || t.includes('waste') || t.includes('sanitation')) {
      return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80';
    }
    if (t.includes('electric') || t.includes('wire') || t.includes('power') || t.includes('spark') || t.includes('hazard')) {
      return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80';
  };

  // Handle 1 Image File Upload (PNG, JPG, JPEG, WEBP) -> Uploads to Cloudinary
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPEG, and JPG image formats are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.');
      return;
    }

    // Immediate preview
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      image_url: previewUrl,
      image_name: file.name
    }));

    // Upload to Cloudinary API
    const uploadToast = toast.loading('Uploading photo evidence to Cloudinary...');
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await API.post('/upload/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.imageUrl) {
        setFormData(prev => ({
          ...prev,
          image_url: res.data.imageUrl,
          image_name: file.name
        }));
        toast.success('Photo saved to Cloudinary!', { id: uploadToast });
        return;
      }
    } catch (err) {
      console.warn('Cloudinary upload fallback to Base64:', err);
    }

    // Fallback: Read as Base64 (backend uploads to Cloudinary on submit)
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image_url: reader.result,
        image_name: file.name
      }));
      toast.success(`Photo attached successfully!`, { id: uploadToast });
    };
    reader.readAsDataURL(file);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showAuthAlert(navigate, 'submit an incident report');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter both Title and Description.');
      return;
    }

    setIsSubmitting(true);

    let category = 'General Civic';
    let dept = 'Municipal Works Department';
    let priority = 'Medium';

    const text = `${formData.title} ${formData.description}`.toLowerCase();
    if (text.includes('water') || text.includes('drain') || text.includes('sewer') || text.includes('pipe') || text.includes('leak')) {
      category = 'Water & Drainage';
      dept = 'Water Supply & Sewerage Board (WSSB)';
      priority = text.includes('burst') || text.includes('flood') ? 'Critical' : 'High';
    } else if (text.includes('road') || text.includes('pothole') || text.includes('sinkhole') || text.includes('asphalt')) {
      category = 'Roads & Infrastructure';
      dept = 'Municipal Works Department';
      priority = text.includes('sinkhole') || text.includes('danger') ? 'Critical' : 'Medium';
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
      category = 'Solid Waste & Sanitation';
      dept = 'Solid Waste Management Authority (SWMA)';
      priority = 'Medium';
    } else if (text.includes('wire') || text.includes('light') || text.includes('electric') || text.includes('power')) {
      category = 'Electrical & Fire Hazard';
      dept = 'Power & Grid Safety Board';
      priority = 'Critical';
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category,
        priority,
        department: dept,
        citizenName: formData.citizen_name || user?.name || 'Citizen User',
        citizenEmail: (user?.email || '').toLowerCase().trim(),
        citizenContact: formData.citizen_contact || user?.phone || '0300-1234567',
        imageUrl: formData.image_url || ''
      };

      const res = await API.post('/complaints', payload);
      const saved = res.data?.complaint;

      const newRecord = {
        id: saved?.ticketId || saved?._id || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        ticketId: saved?.ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        title: saved?.title || formData.title,
        description: saved?.description || formData.description,
        category: saved?.category || category,
        priority: saved?.priority || priority,
        status: saved?.status === 'Open' ? 'Pending' : (saved?.status || 'Pending'),
        assigned_department: saved?.department || dept,
        location: saved?.location || formData.location,
        date: new Date(saved?.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        image_url: saved?.imageUrl || formData.image_url || ''
      };

      setComplaints(prev => [newRecord, ...prev]);

      Swal.fire({
        icon: 'success',
        title: 'Complaint Registered in Vault!',
        html: `
          <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
            <p><strong>Ticket ID:</strong> ${newRecord.ticketId}</p>
            <p><strong>Category:</strong> ${newRecord.category}</p>
            <p><strong>Assigned Dept:</strong> ${newRecord.assigned_department}</p>
            <p><strong>Status:</strong> <span style="color: #00e5ff; font-weight: bold;">Pending Dispatch</span></p>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Saved to Municipal Database and added to your live complaints vault.</p>
          </div>
        `,
        confirmButtonColor: '#00e5ff',
        confirmButtonText: 'Great!'
      });

      setFormData({
        title: '',
        description: '',
        location: 'Central District',
        citizen_name: user?.name || '',
        citizen_contact: user?.phone || '0300-1234567',
        image_url: '',
        image_name: ''
      });
    } catch (err) {
      console.warn('API post error:', err);
      toast.error('Failed to submit complaint. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inspect Complaint Modal
  const inspectComplaint = (c) => {
    Swal.fire({
      title: `Ticket #${c.id} Details`,
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Official Ticket:</strong> ${c.ticketId || ('#' + c.id)}</p>
          <p><strong>Subject:</strong> ${c.title}</p>
          <p><strong>Description:</strong> ${c.description}</p>
          <p><strong>Category:</strong> ${c.category}</p>
          <p><strong>Priority:</strong> <span style="color: ${c.priority === 'Critical' ? '#ef4444' : '#00e5ff'}; font-weight: bold;">${c.priority}</span></p>
          <p><strong>Status:</strong> <span style="color: ${c.status === 'Resolved' ? '#10b981' : '#f59e0b'}; font-weight: bold;">${c.status}</span></p>
          <p><strong>Assigned Authority:</strong> ${c.assigned_department}</p>
          <p><strong>Zone / District:</strong> ${c.location}</p>
          <p><strong>Date Logged:</strong> ${c.date}</p>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Close'
    });
  };

  // Filtered Complaints List
  const filteredComplaints = complaints.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.id?.toString().includes(q) ||
      c.ticketId?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.assigned_department?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;

    return matchQuery && matchStatus && matchCategory;
  });

  return (
    <div className="vault-page-wrapper" ref={containerRef}>
      <Toaster position="top-right" />

      {/* Header Banner */}
      <div className="vault-header-section">
        <div className="vault-header-inner">
          <Link to="/home" className="vault-back-link">
            <ArrowLeft size={16} />
            <span>Back to Home Hub</span>
          </Link>
          <h1>Citizen Incident Vault &amp; Complaint Management</h1>
          <p>
            Lodge new civic faults on the left, and search &amp; inspect your complete history of complaints on the right with real-time filters.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <main className="vault-split-container">
        
        {/* ================= LEFT COLUMN: INCIDENT FORM ================= */}
        <section className="vault-form-column">
          <div className="vault-panel-card">
            <div className="panel-header">
              <FileText size={18} className="panel-icon" />
              <div>
                <h2>Lodge New Incident</h2>
                <p>Submit infrastructure fault for automated routing</p>
              </div>
            </div>

            {/* 1-Click Demo Presets */}
            <div className="vault-presets-box">
              <span className="presets-title">
                <Sparkles size={13} />
                <span>1-Click Presets:</span>
              </span>
              <div className="presets-flex">
                <button 
                  type="button" 
                  onClick={() => applyPreset('Main 12-inch Water Pipeline Rupture', 'Severe potable water pipeline burst flooding residential road.', 'District South (Clifton)')}
                >
                  <Droplets size={13} /> Water Leak
                </button>
                <button 
                  type="button" 
                  onClick={() => applyPreset('Deep Road Sinkhole Near Main Intersection', 'Severe 4-foot deep asphalt sinkhole causing critical hazard.', 'District East (Gulshan)')}
                >
                  <Truck size={13} /> Sinkhole
                </button>
                <button 
                  type="button" 
                  onClick={() => applyPreset('Overflowing Solid Waste & Blocked Drainage', 'Municipal dumpster overflowing creating sanitation hazard.', 'Central District')}
                >
                  <Trash2 size={13} /> Trash Overflow
                </button>
                <button 
                  type="button" 
                  onClick={() => applyPreset('Hanging Sparking Power Line on Street Light', 'Exposed live 220V power wire sparking during rain.', 'Korangi Industrial Area')}
                >
                  <Zap size={13} /> Sparking Wire
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="vault-form">
              <div className="v-form-field">
                <label>Complaint Subject / Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Major water pipeline leakage on main road" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="v-form-field">
                <label>Detailed Incident Description *</label>
                <textarea 
                  rows={4}
                  placeholder="Describe damage extent, exact street address, and landmarks..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="v-two-col">
                <div className="v-form-field">
                  <label>District / Zone *</label>
                  <select 
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="Central District">District Central (Nazimabad)</option>
                    <option value="District South (Clifton)">District South (Clifton/Saddar)</option>
                    <option value="District East (Gulshan)">District East (Gulshan)</option>
                    <option value="Korangi Industrial Area">District Korangi &amp; Landhi</option>
                    <option value="Malir Metropolitan Zone">District Malir Corridor</option>
                  </select>
                </div>

                <div className="v-form-field">
                  <label>Citizen Contact</label>
                  <input 
                    type="text" 
                    placeholder="0300-1234567" 
                    value={formData.citizen_contact}
                    onChange={e => setFormData(prev => ({ ...prev, citizen_contact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="v-form-field">
                <label>Photo Proof Attachment (PNG, JPG, JPEG only)</label>
                {formData.image_url ? (
                  <div className="file-preview-card">
                    <img src={formData.image_url} alt="Attached Preview" className="file-preview-thumb" />
                    <div className="file-preview-info">
                      <span className="file-name-text">{formData.image_name || 'attached_photo.jpg'}</span>
                      <span className="file-status-text">Ready to submit with ticket</span>
                    </div>
                    <button 
                      type="button" 
                      className="remove-file-btn" 
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '', image_name: '' }))}
                      title="Remove attached photo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="file-upload-dropzone">
                    <Upload size={18} className="upload-icon" />
                    <div className="upload-text-group">
                      <span className="upload-main-text">Click to choose image file</span>
                      <span className="upload-sub-text">PNG, JPG or JPEG (Max 1 file, up to 5MB)</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg"
                      multiple={false}
                      onChange={handleImageFileChange}
                      className="hidden-file-input"
                    />
                  </label>
                )}
              </div>

              <button type="submit" className="v-submit-btn" disabled={isSubmitting}>
                <Send size={15} />
                <span>{isSubmitting ? 'Registering Ticket...' : 'Submit Incident to Municipal Fleet'}</span>
              </button>
            </form>
          </div>
        </section>


        {/* ================= RIGHT COLUMN: COMPLETE COMPLAINT HISTORY ================= */}
        <section className="vault-history-column">
          <div className="vault-panel-card">
            
            {/* Header with KPI Counts & Scope Switcher */}
            <div className="history-top-header">
              <div>
                <h2>{complaintsScope === 'my' ? 'My Incident Vault' : 'All Municipal Incidents'}</h2>
                <p>
                  {complaintsScope === 'my' 
                    ? (user ? `Tracking complaints lodged by ${user.name || user.email}` : 'Log in to manage and track your lodged complaints') 
                    : 'Citywide live municipal complaints across all districts'}
                </p>
              </div>
              <div className="history-counter-badge">
                <span>{filteredComplaints.length} of {complaints.length} Total</span>
              </div>
            </div>

            {/* Scope Switcher: My Complaints vs All City Tickets */}
            <div className="vault-scope-tabs" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button 
                type="button" 
                className={`filter-pill ${complaintsScope === 'my' ? 'active' : ''}`}
                onClick={() => setComplaintsScope('my')}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <User size={15} />
                <span>My Lodged Complaints {user?.email ? `(${complaintsScope === 'my' ? complaints.length : ''})` : ''}</span>
              </button>
              <button 
                type="button" 
                className={`filter-pill ${complaintsScope === 'all' ? 'active' : ''}`}
                onClick={() => setComplaintsScope('all')}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <Globe size={15} />
                <span>All City Tickets</span>
              </button>
            </div>

            {/* Live Real-Time Search Bar */}
            <div className="vault-search-row">
              <div className="vault-search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by Ticket ID, keyword, category, district, department..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search-btn" onClick={() => setSearchQuery('')}>
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Category Dropdown */}
            <div className="vault-filters-bar">
              <div className="status-filter-pills">
                {['All', 'Pending', 'In Progress', 'Resolved'].map(st => (
                  <button 
                    key={st} 
                    type="button" 
                    className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select 
                className="category-dropdown-filter"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Water & Drainage">Water &amp; Drainage</option>
                <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                <option value="Solid Waste & Sanitation">Solid Waste &amp; Sanitation</option>
                <option value="Electrical & Fire Hazard">Electrical Hazard</option>
              </select>
            </div>

            {/* Complaints List Container */}
            <div className="vault-complaints-list">
              {isLoading ? (
                <div className="no-complaints-box">
                  <Clock size={36} className="empty-icon" />
                  <h4>Loading Incident Vault...</h4>
                  <p>Fetching real-time records from MongoDB database.</p>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="no-complaints-box">
                  <AlertCircle size={36} className="empty-icon" />
                  {complaints.length === 0 ? (
                    complaintsScope === 'my' ? (
                      <>
                        <h4>No Personal Complaints Registered Yet</h4>
                        <p>{user ? 'You have not submitted any complaints yet. Use the form on the left to lodge your first incident!' : 'Please log in to view your personal complaints history, or switch to "All City Tickets" above.'}</p>
                      </>
                    ) : (
                      <>
                        <h4>No Municipal Tickets in Database</h4>
                        <p>No complaints have been logged in the system yet.</p>
                      </>
                    )
                  ) : (
                    <>
                      <h4>No Complaints Match Your Search</h4>
                      <p>Try adjusting your search keyword or switching status filter tabs.</p>
                      <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }}>
                        Reset All Filters
                      </button>
                    </>
                  )}
                </div>
              ) : (
                filteredComplaints.map(c => {
                  const proofImg = c.image_url || c.imageUrl || getCategoryFallbackImage(c.category, c.title);
                  return (
                    <div key={c.id} className="clean-vault-card" onClick={() => inspectComplaint(c)}>
                      {/* Top Header Row */}
                      <div className="cvc-header-row">
                        <div className="cvc-id-group">
                          <span className="cvc-id">#{c.id}</span>
                          <span className="cvc-ticket-code">{c.ticketId}</span>
                          <span className={`cvc-priority ${c.priority?.toLowerCase()}`}>
                            {c.priority}
                          </span>
                        </div>
                        <div className="cvc-header-actions">
                          <button 
                            type="button" 
                            className="cvc-chat-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveChatTicket(c);
                            }}
                            title="Open live chat with assigned field officer"
                          >
                            <MessageSquare size={13} />
                            <span>Live Chat</span>
                          </button>

                          {c.status === 'Resolved' && (
                            <button
                              type="button"
                              className="cvc-rate-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRatingModal(c);
                              }}
                              title="Rate this completed service"
                            >
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                              <span>{c.userRating ? `Rated (${c.userRating}★)` : 'Rate Worker'}</span>
                            </button>
                          )}

                          <span className={`cvc-status-pill ${c.status?.toLowerCase().replace(' ', '-')}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>

                      {/* Middle Body: Text + Right-Side Photo Proof */}
                      <div className="cvc-body-row">
                        <div className="cvc-text-col">
                          <h3 className="cvc-title">{c.title}</h3>
                          <p className="cvc-desc">{c.description}</p>
                          
                          <div className="cvc-meta-grid">
                            <div className="cvc-meta-item">
                              <Building2 size={13} />
                              <span>{c.assigned_department}</span>
                            </div>
                            <div className="cvc-meta-item">
                              <MapPin size={13} />
                              <span>{c.location}</span>
                            </div>
                            <div className="cvc-meta-item">
                              <Calendar size={13} />
                              <span>{c.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Photo Proof Box */}
                        <div 
                          className="cvc-photo-box"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageModal(proofImg);
                          }}
                          title="Click to view large photo evidence in modal"
                        >
                          <img 
                            src={proofImg} 
                            alt="Proof Evidence" 
                            className="cvc-thumb-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=300&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="cvc-photo-overlay">
                            <ZoomIn size={14} />
                            <span>View</span>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated In-Ticket Chat Action Bar */}
                      <div className="cvc-chat-cta-bar">
                        <button 
                          type="button" 
                          className="prominent-ticket-chat-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveChatTicket(c);
                          }}
                          title="Open live chat with assigned field officer"
                        >
                          <div className="ptc-left">
                            <MessageSquare size={15} className="chat-btn-icon" />
                            <span className="ptc-main-text">Open Ticket Conversation</span>
                            <span className="ptc-officer-text">&bull; {c.assigned_department}</span>
                          </div>
                          <div className="ptc-right">
                            <span className="ptc-pulse-online">● Officer Connected</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>
                      </div>

                      {/* Bottom: Progress Stepper */}
                      <div className="cvc-mini-stepper">
                        <div className="m-step done">
                          <div className="m-dot"><Check size={10} /></div>
                          <span>Logged</span>
                        </div>
                        <div className="m-line done" />
                        <div className="m-step done">
                          <div className="m-dot"><Check size={10} /></div>
                          <span>Triaged</span>
                        </div>
                        <div className="m-line" />
                        <div className={`m-step ${c.status === 'In Progress' || c.status === 'Resolved' ? 'done' : ''}`}>
                          <div className="m-dot">
                            {c.status === 'In Progress' || c.status === 'Resolved' ? <Check size={10} /> : '3'}
                          </div>
                          <span>Field Crew</span>
                        </div>
                        <div className="m-line" />
                        <div className={`m-step ${c.status === 'Resolved' ? 'done' : ''}`}>
                          <div className="m-dot">
                            {c.status === 'Resolved' ? <Check size={10} /> : '4'}
                          </div>
                          <span>Resolved</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </section>

      {/* ================= IMAGE PREVIEW LIGHTBOX MODAL ================= */}
      {selectedImageModal && (
        <div className="image-lightbox-modal" onClick={() => setSelectedImageModal(null)}>
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title">
                <ImageIcon size={16} className="cyan-icon" />
                <span>Incident Photographic Evidence</span>
              </div>
              <button 
                className="lightbox-close-btn" 
                onClick={() => setSelectedImageModal(null)}
                title="Close Image Preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-body">
              <img src={selectedImageModal} alt="Enlarged incident proof" className="lightbox-img" />
            </div>
          </div>
        </div>
      )}

      {/* ================= IN-TICKET LIVE CHAT MODAL ================= */}
      <TicketChatModal 
        ticket={activeChatTicket}
        isOpen={!!activeChatTicket}
        onClose={() => setActiveChatTicket(null)}
        userRole="customer"
      />

      {/* ================= SERVICE RATING MODAL (Lucide Stars, No Text Emojis) ================= */}
      {ratingModalTicket && (
        <div className="rating-lightbox-modal" onClick={() => setRatingModalTicket(null)}>
          <div className="rating-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="rating-dialog-header">
              <div className="rating-header-left">
                <Award size={18} className="cyan-icon" />
                <span>Rate Service Quality</span>
              </div>
              <button 
                type="button"
                className="rating-close-btn" 
                onClick={() => setRatingModalTicket(null)}
                title="Close Rating"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="rating-dialog-body">
              <div className="rating-ticket-summary">
                <p className="rts-title">{ratingModalTicket.title}</p>
                <p className="rts-dept"><Building2 size={13} /> {ratingModalTicket.assigned_department}</p>
              </div>

              <div className="rating-stars-picker-wrap">
                <label className="rating-stars-label">Select Star Rating:</label>
                <div className="interactive-stars-row">
                  {[1, 2, 3, 4, 5].map((starNum) => {
                    const isFilled = starNum <= (hoveredStars || selectedStars);
                    return (
                      <button
                        type="button"
                        key={starNum}
                        className={`star-pill-btn ${isFilled ? 'filled' : ''}`}
                        onMouseEnter={() => setHoveredStars(starNum)}
                        onMouseLeave={() => setHoveredStars(0)}
                        onClick={() => setSelectedStars(starNum)}
                        title={`${starNum} Stars`}
                      >
                        <Star 
                          size={28} 
                          fill={isFilled ? '#f59e0b' : 'none'} 
                          color={isFilled ? '#f59e0b' : '#94a3b8'} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="stars-count-caption">
                  {selectedStars === 5 ? 'Excellent & Fast Service' : 
                   selectedStars === 4 ? 'Good Quality Service' : 
                   selectedStars === 3 ? 'Average Service' : 
                   selectedStars === 2 ? 'Needs Improvement' : 'Unsatisfactory'}
                </span>
              </div>

              <div className="rating-textarea-wrap">
                <label htmlFor="rating-comment">Citizen Feedback (Optional):</label>
                <textarea
                  id="rating-comment"
                  rows="3"
                  placeholder="Share your thoughts about how the issue was handled..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>

              <div className="rating-actions-footer">
                <button 
                  type="button" 
                  className="rating-cancel-btn" 
                  onClick={() => setRatingModalTicket(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="rating-submit-btn" 
                  disabled={isSubmittingRating}
                >
                  <ShieldCheck size={16} />
                  <span>Submit Rating</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>

      <Footer />
    </div>
  );
};

export default MyComplaints;
