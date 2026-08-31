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
  MessageSquare
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
    citizen_name: user?.name || 'Citizen User',
    citizen_contact: '0300-1234567',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Complaints Vault State
  const [complaints, setComplaints] = useState([
    {
      id: '101',
      ticketId: 'TKT-8942',
      title: 'Main water pipeline burst with heavy street flooding',
      description: 'Major underground pipeline fracture causing 400L/min water loss and street flooding across residential avenue.',
      category: 'Water & Drainage',
      priority: 'Critical',
      status: 'In Progress',
      assigned_department: 'Water Supply & Sewerage Board (WSSB)',
      location: 'Central District',
      date: '30 Aug 2026'
    },
    {
      id: '102',
      ticketId: 'TKT-8939',
      title: 'Deep road sinkhole damaging passing vehicles',
      description: 'Severe 4-foot deep asphalt sinkhole creating dangerous traffic hazard for passing school buses and cars.',
      category: 'Roads & Infrastructure',
      priority: 'High',
      status: 'Pending',
      assigned_department: 'Municipal Works Department',
      location: 'District South (Clifton)',
      date: '30 Aug 2026'
    },
    {
      id: '103',
      ticketId: 'TKT-8931',
      title: 'Solid waste dumpster overflowing onto main sidewalk',
      description: 'Municipal trash bin overflowing for 5 consecutive days creating severe odor and environmental sanitation hazard.',
      category: 'Solid Waste & Sanitation',
      priority: 'Medium',
      status: 'Resolved',
      assigned_department: 'Solid Waste Management Authority (SWMA)',
      location: 'District East (Gulshan)',
      date: '28 Aug 2026'
    },
    {
      id: '104',
      ticketId: 'TKT-8925',
      title: 'Exposed live 220V power wire sparking during rain',
      description: 'Hanging high-voltage wire sparking near public street light pole. Urgent hazard intervention required.',
      category: 'Electrical & Fire Hazard',
      priority: 'Critical',
      status: 'Resolved',
      assigned_department: 'Power & Grid Safety Board',
      location: 'Korangi Industrial Area',
      date: '27 Aug 2026'
    },
    {
      id: '105',
      ticketId: 'TKT-8919',
      title: 'Sewerage line blockage causing backflow into homes',
      description: 'Underground sewerage line clogged with silt, leading to foul backflow into residential ground floors.',
      category: 'Water & Drainage',
      priority: 'High',
      status: 'In Progress',
      assigned_department: 'Water Supply & Sewerage Board (WSSB)',
      location: 'Malir Metropolitan Zone',
      date: '26 Aug 2026'
    },
    {
      id: '106',
      ticketId: 'TKT-8912',
      title: 'Street light transformer smoking and voltage fluctuation',
      description: 'Transformer unit smoking on Pole 14 causing heavy voltage dips across Sector 5.',
      category: 'Electrical & Fire Hazard',
      priority: 'High',
      status: 'Resolved',
      assigned_department: 'Power & Grid Safety Board',
      location: 'Central District',
      date: '25 Aug 2026'
    }
  ]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [activeChatTicket, setActiveChatTicket] = useState(null);

  // Fetch Database Complaints
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const res = await API.get('/complaints');
        const data = res.data?.data || res.data?.complaints || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(c => ({
            id: c.ticketId || c._id || (Math.floor(100 + Math.random() * 900)).toString(),
            ticketId: c.ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
            title: c.title,
            description: c.description || 'Civic infrastructure maintenance report.',
            category: c.category || 'General Civic',
            priority: c.priority || 'Medium',
            status: c.status === 'Open' ? 'Pending' : c.status || 'Pending',
            assigned_department: c.department || c.assigned_department || 'Municipal Works',
            location: c.location || 'Central District',
            date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          }));
          setComplaints(formatted);
        }
      } catch (e) {
        console.warn('API fallback load:', e);
      }
    };
    loadComplaints();
  }, []);

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

  // Handle 1 Image File Upload (PNG, JPG, JPEG only)
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only PNG, JPEG, and JPG image formats are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image_url: reader.result,
        image_name: file.name
      }));
      toast.success(`Photo "${file.name}" attached successfully!`);
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
    const newId = (Math.floor(100 + Math.random() * 900)).toString();
    const newTkt = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

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

    const newRecord = {
      id: newId,
      ticketId: newTkt,
      title: formData.title,
      description: formData.description,
      category,
      priority,
      status: 'Pending',
      assigned_department: dept,
      location: formData.location,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    try {
      await API.post('/complaints', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category,
        priority,
        department: dept,
        citizenName: formData.citizen_name,
        citizenContact: formData.citizen_contact
      });
    } catch (err) {
      console.warn('API post error:', err);
    }

    setComplaints(prev => [newRecord, ...prev]);

    Swal.fire({
      icon: 'success',
      title: 'Complaint Registered in Vault!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Ticket ID:</strong> #${newId} (${newTkt})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Assigned Dept:</strong> ${dept}</p>
          <p><strong>Status:</strong> <span style="color: #00e5ff; font-weight: bold;">Pending Dispatch</span></p>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Added to your live complaint history list on the right.</p>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Great!'
    });

    setFormData({
      title: '',
      description: '',
      location: 'Central District',
      citizen_name: user?.name || 'Citizen User',
      citizen_contact: '0300-1234567',
      image_url: ''
    });
    setIsSubmitting(false);
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
            
            {/* Header with KPI Counts */}
            <div className="history-top-header">
              <div>
                <h2>Citizen Complaint History</h2>
                <p>Real-time audit log of all registered municipal tickets</p>
              </div>
              <div className="history-counter-badge">
                <span>{filteredComplaints.length} of {complaints.length} Total</span>
              </div>
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
              {filteredComplaints.length === 0 ? (
                <div className="no-complaints-box">
                  <AlertCircle size={36} className="empty-icon" />
                  <h4>No Complaints Match Your Search</h4>
                  <p>Try adjusting your search keyword or switching status filter tabs.</p>
                  <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }}>
                    Reset All Filters
                  </button>
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

      </main>

      <Footer />
    </div>
  );
};

export default MyComplaints;
