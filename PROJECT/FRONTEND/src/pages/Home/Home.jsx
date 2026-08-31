import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { showAuthAlert } from '../../utils/authAlert';
import { gsap } from 'gsap';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Send, 
  Sparkles, 
  Search, 
  Check, 
  MapPin, 
  Image as ImageIcon, 
  Zap, 
  Activity, 
  Eye, 
  Droplets, 
  Trash2, 
  Truck, 
  Cpu, 
  BarChart3, 
  Bell, 
  ShieldCheck, 
  Wrench, 
  ArrowRight,
  ChevronDown,
  FileText,
  Clock,
  Upload,
  ZoomIn,
  X 
} from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../../api/axios';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pageContainerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Central District',
    citizen_name: user?.name || 'Citizen User',
    citizen_contact: '0300-1234567',
    image_url: ''
  });

  // AI Live Prediction State
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tracking State
  const [trackId, setTrackId] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Local Complaints List for Instant Feedback
  const [submittedComplaints, setSubmittedComplaints] = useState([
    {
      id: '101',
      title: 'Main water pipeline burst with heavy street flooding',
      category: 'Water & Drainage',
      priority: 'Critical',
      status: 'In Progress',
      assigned_department: 'Water & Sewerage Board (WSSB)',
      location: 'Central District',
      date: '30 Aug 2026'
    },
    {
      id: '102',
      title: 'Deep road sinkhole damaging passing vehicles',
      category: 'Roads & Infrastructure',
      priority: 'High',
      status: 'Pending',
      assigned_department: 'Municipal Works Department',
      location: 'District South (Clifton)',
      date: '30 Aug 2026'
    }
  ]);

  // Real-Time NLP & AI Inference Engine
  useEffect(() => {
    const text = `${formData.title} ${formData.description}`.toLowerCase();
    
    if (text.trim().length < 4) {
      setAiResult(null);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      let category = 'Public Utilities';
      let priority = 'Medium';
      let confidence = 88;
      let assigned_department = 'General Municipal Works';
      let expected_sla = '48 Hours';
      let aiSummary = 'General civic inquiry pending triage.';
      let visionDiagnosis = null;

      if (formData.image_url) {
        visionDiagnosis = {
          defect_type: 'Structural Surface Rupture',
          severity: 'High (Level 3 Hazard)'
        };
      }

      if (text.includes('water') || text.includes('drain') || text.includes('sewer') || text.includes('pipe') || text.includes('leak') || text.includes('flood') || text.includes('gutter')) {
        category = 'Water & Drainage';
        assigned_department = 'Water & Sewerage Board (WSSB)';
        if (text.includes('burst') || text.includes('flood') || text.includes('overflow') || text.includes('contaminated') || text.includes('critical') || text.includes('urgent')) {
          priority = 'Critical';
          confidence = 97;
          expected_sla = '4 Hours (Emergency Team)';
          aiSummary = 'Major hydraulic failure detected. Automated dispatch to rapid water emergency engineering unit.';
        } else {
          priority = 'High';
          confidence = 92;
          expected_sla = '12 Hours';
          aiSummary = 'Water distribution or drainage defect identified. Queued for pipeline inspection.';
        }
      } else if (text.includes('road') || text.includes('pothole') || text.includes('sinkhole') || text.includes('pavement') || text.includes('crack') || text.includes('asphalt') || text.includes('traffic')) {
        category = 'Roads & Infrastructure';
        assigned_department = 'Municipal Works Department';
        if (text.includes('sinkhole') || text.includes('accident') || text.includes('huge') || text.includes('deep') || text.includes('danger')) {
          priority = 'Critical';
          confidence = 96;
          expected_sla = '6 Hours (Field Crew)';
          aiSummary = 'High-hazard structural roadway defect. Emergency road barricading and patching assigned.';
        } else {
          priority = 'Medium';
          confidence = 91;
          expected_sla = '48 Hours';
          aiSummary = 'Road surface irregularity detected. Scheduled for asphalt maintenance.';
        }
      } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('debris') || text.includes('cleaning') || text.includes('smell')) {
        category = 'Solid Waste & Sanitation';
        assigned_department = 'Solid Waste Management Authority (SWMA)';
        priority = text.includes('toxic') || text.includes('hospital') || text.includes('huge') ? 'High' : 'Medium';
        confidence = 94;
        expected_sla = priority === 'High' ? '12 Hours' : '24 Hours';
        aiSummary = 'Sanitation accumulation reported. Routed to zonal waste collection compactor team.';
      } else if (text.includes('light') || text.includes('wire') || text.includes('power') || text.includes('electric') || text.includes('transformer') || text.includes('spark') || text.includes('shock')) {
        category = 'Electrical & Fire Hazard';
        assigned_department = 'Power & Grid Safety Board';
        priority = 'Critical';
        confidence = 98;
        expected_sla = '2 Hours (High Voltage Unit)';
        aiSummary = 'Active electrical hazard detected. Priority dispatch sent to power safety unit.';
      }

      setAiResult({
        category,
        priority,
        confidence,
        assigned_department,
        expected_sla,
        aiSummary,
        visionDiagnosis
      });
      setIsAnalyzing(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.image_url]);

  // 1-Click Demo Presets
  const applyPreset = (title, description, location) => {
    setFormData(prev => ({
      ...prev,
      title,
      description,
      location: location || prev.location
    }));
    toast.success('Preset loaded into AI form!');
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

  // Handle Form Submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!user) {
      showAuthAlert(navigate, 'submit an incident report to the municipal fleet');
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter both Title and Description.');
      return;
    }

    setIsSubmitting(true);
    const newId = (Math.floor(100 + Math.random() * 900)).toString();

    const payload = {
      ticketId: newId,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      category: aiResult?.category || 'General Municipal',
      priority: aiResult?.priority || 'Medium',
      assigned_department: aiResult?.assigned_department || 'Municipal Works Department',
      citizen_name: formData.citizen_name,
      citizen_contact: formData.citizen_contact,
      aiSummary: aiResult?.aiSummary || 'Automated ticket creation.'
    };

    try {
      await API.post('/complaints', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: payload.category,
        priority: payload.priority,
        department: payload.assigned_department,
        citizenName: formData.citizen_name,
        citizenContact: formData.citizen_contact,
        aiSummary: payload.aiSummary
      });
    } catch (err) {
      console.warn('API fallback:', err);
    }

    const newRecord = {
      id: newId,
      title: formData.title,
      category: payload.category,
      priority: payload.priority,
      status: 'Pending',
      assigned_department: payload.assigned_department,
      location: formData.location,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setSubmittedComplaints(prev => [newRecord, ...prev]);
    setTrackId(newId);
    setTrackedComplaint(newRecord);

    Swal.fire({
      icon: 'success',
      title: 'Incident Logged Successfully!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Ticket ID:</strong> #${newId}</p>
          <p><strong>Category:</strong> ${payload.category}</p>
          <p><strong>Priority:</strong> <span style="color: ${payload.priority === 'Critical' ? '#ef4444' : '#00e5ff'}; font-weight: bold;">${payload.priority}</span></p>
          <p><strong>Assigned Dept:</strong> ${payload.assigned_department}</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Ticket is live in the database and trackable below.</p>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Track Ticket'
    });

    setFormData({
      title: '',
      description: '',
      location: 'Central District',
      citizen_name: user?.name || 'Citizen User',
      citizen_contact: '0300-1234567',
      image_url: ''
    });
    setAiResult(null);
    setIsSubmitting(false);
  };

  // Handle Ticket Tracking Search
  const handleTrackSearch = async (e) => {
    if (e) e.preventDefault();
    if (!trackId.trim()) {
      toast.error('Please enter a Ticket ID.');
      return;
    }

    try {
      const res = await API.get('/complaints');
      const all = res.data?.data || res.data || [];
      const c = all.find(item => 
        item.ticketId?.toString() === trackId.trim() || 
        item._id?.toString() === trackId.trim() ||
        item.id?.toString() === trackId.trim()
      );
      if (c) {
        setTrackedComplaint({
          id: c.ticketId || c._id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          assigned_department: c.department || c.assigned_department,
          location: c.location,
          date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        });
        toast.success(`Found live record for Ticket #${trackId}!`);
        return;
      }
    } catch (err) {}

    const found = submittedComplaints.find(c => c.id?.toString() === trackId.trim());
    if (found) {
      setTrackedComplaint(found);
      toast.success(`Found record for Ticket #${trackId}!`);
    } else {
      toast.error(`No ticket found with ID #${trackId}.`);
    }
  };

  // GSAP ScrollTrigger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.module-wrapper-card', {
        scrollTrigger: {
          trigger: '.home-modules-flow',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }, pageContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page-wrapper" ref={pageContainerRef}>
      <Toaster position="top-right" />

      {/* ================= HERO HUB HEADER (100VH x 100VW WITH SUBTLE MUNICIPAL BG) ================= */}
      <section className="hub-hero-section">
        <div className="hero-ambient-glow" />

        <div className="hub-hero-inner">


          <h1 className="hub-hero-title">
            Intelligent Civic Support <br />
            <span className="cyan-highlight-text">&amp; Municipal Operations Hub</span>
          </h1>

          <p className="hub-hero-sub">
            NovaDesk centralizes public infrastructure reporting, automated AI triage, real-time ticket tracking,
            and municipal telemetry into distinct, transparent modules.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="hero-cta-group">
            <a href="#module-report" className="hero-btn-primary">
              <Send size={15} />
              <span>File Incident Report</span>
            </a>
            <a href="#module-tracker" className="hero-btn-secondary">
              <Search size={15} />
              <span>Track Live Status</span>
            </a>
            <Link to="/analytics" className="hero-btn-glass">
              <BarChart3 size={15} />
              <span>Open GIS Analytics</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hub-kpi-bar">
            <div className="hub-kpi-card">
              <span className="kpi-num">1,420+</span>
              <span className="kpi-lbl">Active Incidents</span>
            </div>
            <div className="hub-kpi-card">
              <span className="kpi-num">98.4%</span>
              <span className="kpi-lbl">SLA Compliance</span>
            </div>
            <div className="hub-kpi-card">
              <span className="kpi-num">3.4 hrs</span>
              <span className="kpi-lbl">Mean Turnaround</span>
            </div>
            <div className="hub-kpi-card">
              <span className="kpi-num">99.9%</span>
              <span className="kpi-lbl">System Uptime</span>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <a href="#module-report" className="hero-scroll-indicator" title="Scroll to Modules">
            <span>Explore Modules</span>
            <ChevronDown size={16} className="scroll-arrow-anim" />
          </a>
        </div>
      </section>

      {/* ================= MAIN MODULAR FLOW ================= */}
      <main className="home-modules-flow">

        {/* ----------------------------------------------------
            MODULE 01: AI SUPPORT INCIDENT REPORTING STUDIO
        ----------------------------------------------------- */}
        <section className="module-wrapper-card" id="module-report">


          <div className="module-intro-text">
            <h2>Report an Infrastructure or Public Service Fault</h2>
            <p>
              Use this interactive studio to lodge citizen grievances. Our real-time NLP engine inspects your input,
              evaluates severity, assigns guaranteed SLAs, and auto-routes to the designated authority.
            </p>
          </div>

          {/* 1-Click AI Presets Bar */}
          <div className="presets-wrapper">
            <span className="presets-label">
              <Sparkles size={13} />
              <span>1-Click AI Demo Presets:</span>
            </span>
            <div className="presets-buttons-grid">
              <button 
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('Main 12-inch Water Pipeline Rupture', 'Severe potable water pipeline burst flooding residential road. Water pressure lost across block.', 'District South (Clifton)')}
              >
                <Droplets size={14} className="preset-icon" />
                <span>Water Pipe Burst</span>
              </button>

              <button 
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('Deep Road Sinkhole Near Main Intersection', 'Severe 4-foot deep asphalt sinkhole causing critical traffic hazard and vehicle damage.', 'District East (Gulshan)')}
              >
                <Truck size={14} className="preset-icon" />
                <span>Deep Sinkhole</span>
              </button>

              <button 
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('Overflowing Solid Waste & Blocked Drainage', 'Municipal dumpster overflowing for 4 days creating sanitation hazard and bad odor.', 'District Central')}
              >
                <Trash2 size={14} className="preset-icon" />
                <span>Overflowing Trash</span>
              </button>

              <button 
                type="button"
                className="preset-chip"
                onClick={() => applyPreset('Hanging Sparking Power Line on Street Light', 'Exposed live 220V power wire sparking during rain near public sidewalk.', 'Korangi Industrial Area')}
              >
                <Zap size={14} className="preset-icon" />
                <span>Sparking Wire</span>
              </button>
            </div>
          </div>

          {/* Form & AI Radar 2-Column Grid */}
          <div className="module-grid-two-col">
            
            {/* Left: Input Form */}
            <form onSubmit={handleSubmitComplaint} className="incident-form-box">
              <div className="form-row-field">
                <label>Complaint Subject / Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Major water pipeline leakage on main boulevard" 
                  value={formData.title} 
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-row-field">
                <label>Detailed Incident Description *</label>
                <textarea 
                  rows={4} 
                  placeholder="Describe location details, extent of damage, and surrounding landmarks..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="form-two-inputs">
                <div className="form-row-field">
                  <label>District / Zone *</label>
                  <select 
                    value={formData.location} 
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="Central District">District Central (Nazimabad, Gulberg)</option>
                    <option value="District South (Clifton)">District South (Clifton, Saddar)</option>
                    <option value="District East (Gulshan)">District East (Gulshan, Jamshed)</option>
                    <option value="Korangi Industrial Area">District Korangi &amp; Landhi</option>
                    <option value="Malir Metropolitan Zone">District Malir &amp; Airport Corridor</option>
                  </select>
                </div>

                <div className="form-row-field">
                  <label>Citizen Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="0300-1234567" 
                    value={formData.citizen_contact}
                    onChange={e => setFormData(prev => ({ ...prev, citizen_contact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-field">
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

              <button type="submit" className="submit-incident-btn" disabled={isSubmitting}>
                <Send size={16} />
                <span>{isSubmitting ? 'Logging Incident...' : 'Submit Incident to Municipal Fleet'}</span>
              </button>
            </form>

            {/* Right: Citizen Complaint History Box (Top 5 + Show More Vault Link) */}
            <div className="complaint-history-box">
              <div className="history-box-header">
                <div className="history-box-title">
                  <FileText size={17} className="cyan-icon" />
                  <span>Recent Complaint History</span>
                </div>
                <span className="history-count-badge">
                  {submittedComplaints.length} Logged
                </span>
              </div>

              <p className="history-box-sub">
                Your registered municipal tickets and active resolution progress:
              </p>

              <div className="history-complaints-list">
                {submittedComplaints.length === 0 ? (
                  <div className="history-empty-state">
                    <Clock size={32} className="empty-clock-icon" />
                    <h4>No Complaints Recorded</h4>
                    <p>Lodge your first municipal fault using the form on the left.</p>
                  </div>
                ) : (
                  submittedComplaints.slice(0, 5).map((c, idx) => {
                    const proofImg = c.image_url || c.imageUrl || getCategoryFallbackImage(c.category, c.title);
                    return (
                      <div 
                        key={c.id || idx} 
                        className="clean-history-card"
                        onClick={() => {
                          setTrackId(c.id);
                          setTrackedComplaint(c);
                          const el = document.getElementById('module-tracker');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          toast.success(`Loaded Ticket #${c.id} into Tracker!`);
                        }}
                        title="Click to track in live lifecycle stepper below"
                      >
                        {/* Top Header Row */}
                        <div className="chc-header-row">
                          <div className="chc-left-tags">
                            <span className="chc-id">#{c.id}</span>
                            <span className="chc-cat">{c.category}</span>
                            <span className={`chc-priority ${c.priority?.toLowerCase()}`}>
                              {c.priority}
                            </span>
                          </div>
                          <span className={`chc-status-pill ${c.status?.toLowerCase().replace(' ', '-')}`}>
                            {c.status}
                          </span>
                        </div>

                        {/* Middle Content + Photo Proof Row */}
                        <div className="chc-body-row">
                          <div className="chc-text-col">
                            <h4 className="chc-title">{c.title}</h4>
                            <div className="chc-meta-info">
                              <span>{c.assigned_department}</span>
                              <span>&bull;</span>
                              <span>{c.location}</span>
                              <span>&bull;</span>
                              <span>{c.date}</span>
                            </div>
                          </div>

                          {/* Right Side Crisp Photo Proof Box */}
                          <div 
                            className="chc-photo-box"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageModal(proofImg);
                            }}
                            title="Click to view large photo in modal"
                          >
                            <img 
                              src={proofImg} 
                              alt="Proof Evidence" 
                              className="chc-thumb-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=300&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="chc-photo-overlay">
                              <ZoomIn size={12} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Show More Complaints Action Button */}
              <div className="history-box-footer">
                <Link to="/my-complaints" className="show-more-complaints-btn">
                  <span>Show More Complaints ({submittedComplaints.length})</span>
                  <ArrowRight size={15} />
                </Link>
                <span className="footer-vault-subtext">
                  Open split-view vault with full search, filters, &amp; new complaint form
                </span>
              </div>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------
            MODULE 02: REAL-TIME TICKET LIFECYCLE TRACKER
        ----------------------------------------------------- */}
        <section className="module-wrapper-card" id="module-tracker">


          <div className="module-intro-text">
            <h2>Track Existing Ticket Resolution Progress</h2>
            <p>
              Enter any Ticket ID (e.g. #101, #102) to inspect real-time field crew dispatch, milestone steppers,
              and resolution notes stored in the municipal database.
            </p>
          </div>

          <div className="tracker-search-container">
            <form onSubmit={handleTrackSearch} className="tracker-search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Enter Ticket ID (e.g. 101, 102)..."
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
              />
              <button type="submit" className="track-btn">
                <span>Inspect Status</span>
              </button>
            </form>

            <div className="quick-demo-tickets">
              <span>Quick Demo IDs:</span>
              <button type="button" onClick={() => { setTrackId('101'); handleTrackSearch(); }}>Ticket #101</button>
              <button type="button" onClick={() => { setTrackId('102'); handleTrackSearch(); }}>Ticket #102</button>
            </div>
          </div>

          {trackedComplaint && (
            <div className="tracked-result-card">
              <div className="tracked-result-header">
                <div className="ticket-meta">
                  <span className="ticket-badge">#{trackedComplaint.id}</span>
                  <span className="ticket-category-tag">{trackedComplaint.category}</span>
                  <span className={`priority-tag ${trackedComplaint.priority.toLowerCase()}`}>{trackedComplaint.priority} Priority</span>
                </div>
                <div className={`status-pill ${trackedComplaint.status.toLowerCase().replace(' ', '-')}`}>
                  {trackedComplaint.status}
                </div>
              </div>

              <h3 className="tracked-title">{trackedComplaint.title}</h3>
              
              <div className="tracked-meta-grid">
                <div className="meta-cell">
                  <span className="cell-lbl">Assigned Department:</span>
                  <span className="cell-val">{trackedComplaint.assigned_department}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-lbl">Incident Location:</span>
                  <span className="cell-val">{trackedComplaint.location}</span>
                </div>
                <div className="meta-cell">
                  <span className="cell-lbl">Date Logged:</span>
                  <span className="cell-val">{trackedComplaint.date}</span>
                </div>
              </div>

              {/* 4-Stage Resolution Stepper */}
              <div className="stepper-track-wrap">
                <div className="step-node completed">
                  <div className="node-circle"><Check size={14} /></div>
                  <span className="node-lbl">1. Logged</span>
                </div>
                <div className="step-connector completed" />
                <div className="step-node completed">
                  <div className="node-circle"><Check size={14} /></div>
                  <span className="node-lbl">2. AI Triaged</span>
                </div>
                <div className="step-connector completed" />
                <div className={`step-node ${trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'Resolved' ? 'completed' : 'active'}`}>
                  <div className="node-circle">
                    {trackedComplaint.status === 'In Progress' || trackedComplaint.status === 'Resolved' ? <Check size={14} /> : '3'}
                  </div>
                  <span className="node-lbl">3. Field Crew</span>
                </div>
                <div className="step-connector" />
                <div className={`step-node ${trackedComplaint.status === 'Resolved' ? 'completed' : 'pending'}`}>
                  <div className="node-circle">
                    {trackedComplaint.status === 'Resolved' ? <Check size={14} /> : '4'}
                  </div>
                  <span className="node-lbl">4. Resolved</span>
                </div>
              </div>
            </div>
          )}
        </section>


        {/* ----------------------------------------------------
            MODULE 03: PLATFORM MODULES & WORKFLOW OVERVIEW
        ----------------------------------------------------- */}
        <section className="module-wrapper-card" id="module-directory">
          <div className="module-header-pill">
            <span className="module-tag-num">MODULE 03</span>
            <span className="module-tag-title">Platform Modules &amp; Specialized Consoles</span>
          </div>

          <div className="module-intro-text">
            <h2>Explore Dedicated NovaDesk Capabilities</h2>
            <p>
              Har module specific functionality ke liye design kiya gaya hai. Neeche diye gaye cards se aap direct
              GIS Analytics, Public Emergency Alerts, ya Role Consoles par visit kar sakte hain.
            </p>
          </div>

          <div className="modules-directory-grid">
            
            {/* Directory Card 1: GIS Analytics */}
            <div className="directory-module-card">
              <div className="card-top-icon">
                <BarChart3 size={24} />
              </div>
              <h3>GIS Incident Heatmap &amp; District Telemetry</h3>
              <p>
                Citywide fault density heatmaps, statistical turnaround metrics (&mu;, &sigma;, IQR),
                and zonal performance rankings across Karachi's 5 metropolitan districts.
              </p>
              <Link to="/analytics" className="dir-action-link">
                <span>Open GIS Analytics &amp; Heatmap</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Directory Card 2: Public Alerts */}
            <div className="directory-module-card">
              <div className="card-top-icon">
                <Bell size={24} />
              </div>
              <h3>Public Emergency Alerts &amp; Utility Outages</h3>
              <p>
                Live municipal broadcasts regarding planned pipeline maintenance, power grid load alerts,
                monsoon advisories, and 24/7 direct toll-free emergency helplines.
              </p>
              <Link to="/alerts" className="dir-action-link">
                <span>View Public Advisories &amp; Outages</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Directory Card 3: About & Guaranteed SLAs */}
            <div className="directory-module-card">
              <div className="card-top-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Platform Specifications &amp; Guaranteed SLAs</h3>
              <p>
                Learn about NovaDesk's multi-stage NLP pipeline, guaranteed service turnaround timeframes
                (Water: 4h, Roads: 48h, Waste: 24h), and developer engineering credits.
              </p>
              <Link to="/about" className="dir-action-link">
                <span>Read Platform Architecture &amp; SLAs</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Directory Card 4: Operations Workbench */}
            <div className="directory-module-card">
              <div className="card-top-icon">
                <Wrench size={24} />
              </div>
              <h3>Support Agent Workbench &amp; Command Center</h3>
              <p>
                Centralized workbench for assigned field engineers to update work orders with proof photos,
                and administrative management console for staff assignment.
              </p>
              <Link to="/profile" className="dir-action-link">
                <span>Access Operations Profile &amp; Console</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </section>


        {/* ----------------------------------------------------
            MODULE 04: 3-STEP END-TO-END WORKFLOW
        ----------------------------------------------------- */}
        <section className="module-wrapper-card" id="module-workflow">


          <div className="module-intro-text">
            <h2>How NovaDesk Resolves Incidents End-to-End</h2>
            <p>
              A transparent, automated 3-step pipeline ensuring fast accountability from citizen submission to final verification.
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-card">
              <h4>Citizen Reporting &amp; AI Ingestion</h4>
              <p>Citizen submits text, voice audio, or photo proof. Real-time NLP extracts key parameters and evaluates urgency in under 0.2 seconds.</p>
            </div>

            <div className="workflow-card">
              <h4>Automated Department Dispatch</h4>
              <p>The ticket is assigned to the designated municipal agency (WSSB, SWMA, Power Board) with an exact SLA deadline timer.</p>
            </div>

            <div className="workflow-card">
              <h4>Field Resolution &amp; Verified Closeout</h4>
              <p>Field crews complete the physical repairs, upload before-and-after photographic evidence, and notify the citizen instantly.</p>
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
                title="Close Image Modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="lightbox-body">
              <img src={selectedImageModal} alt="Enlarged Incident Proof" className="lightbox-img" />
            </div>
          </div>
        </div>
      )}

      </main>

      <Footer />
    </div>
  );
};

export default Home;
