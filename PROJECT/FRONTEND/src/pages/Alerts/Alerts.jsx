import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { showAuthAlert } from '../../utils/authAlert';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  AlertTriangle, 
  Radio, 
  Bell, 
  PhoneCall, 
  Droplet, 
  Zap, 
  ShieldAlert, 
  Car, 
  Send, 
  Clock, 
  MapPin, 
  Phone,
  Info
} from 'lucide-react';
import './Alerts.css';

gsap.registerPlugin(ScrollTrigger);

const ACTIVE_ADVISORIES = [
  {
    id: 'ADV-401',
    title: 'Heavy Rainfall & Urban Flash Flood Advisory',
    category: 'Weather & Safety',
    severity: 'High',
    affectedAreas: 'District South, Clifton, Korangi Creek, Nazimabad',
    time: 'Valid until 11:59 PM Tonight',
    desc: 'Municipal dewatering pumps activated across 34 low-lying intersections. Citizens are advised to avoid unnecessary travel and stay clear of electric poles.'
  },
  {
    id: 'ADV-398',
    title: 'Main Water Conduit Maintenance (6-Hour Planned Outage)',
    category: 'Water Supply',
    severity: 'Medium',
    affectedAreas: 'Gulshan-e-Iqbal Block 4 to 10, University Road',
    time: 'Tomorrow, 06:00 AM - 12:00 PM',
    desc: 'Pipeline tie-in work for new 48-inch high-pressure feeder. Reserve water storage is recommended.'
  },
  {
    id: 'ADV-395',
    title: 'Shahrah-e-Faisal Flyover Asphalt Resurfacing',
    category: 'Traffic & Roads',
    severity: 'Low',
    affectedAreas: 'Airport to Baloch Colony Section',
    time: 'Night Shift: 11:00 PM - 05:00 AM',
    desc: 'Lane 1 & 2 closed for micro-milling and high-grade asphalt overlay. Use Korangi Road alternate.'
  }
];

const EMERGENCY_HELPLINES = [
  { name: 'Water & Sewerage Emergency (WSSB)', number: '1334', icon: Droplet, color: '#00e5ff' },
  { name: 'Electric Fault Emergency Line', number: '118', icon: Zap, color: '#f59e0b' },
  { name: 'Rescue & Paramedic Services', number: '1122', icon: ShieldAlert, color: '#ef4444' },
  { name: 'Traffic Police Helpline', number: '915', icon: Car, color: '#3b82f6' }
];

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Districts');
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.alerts-hero h1', { opacity: 0, y: 22, duration: 0.6, ease: 'power3.out' });
      gsap.from('.alerts-subtitle', { opacity: 0, y: 16, duration: 0.6, delay: 0.1, ease: 'power2.out' });

      gsap.from('.advisory-card', {
        scrollTrigger: {
          trigger: '.advisories-feed-section',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 28,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.subscription-card, .helplines-card', {
        scrollTrigger: {
          trigger: '.two-col-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 30,
        duration: 0.65,
        stagger: 0.15,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!user) {
      showAuthAlert(navigate, 'subscribe to real-time SMS emergency broadcasts');
      return;
    }
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Subscribed to Civic Alerts!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Mobile Number:</strong> ${phoneNumber}</p>
          <p><strong>Subscription Radius:</strong> ${selectedArea}</p>
          <p style="margin-top: 8px; color: #10b981; font-weight: bold;">Free SMS broadcast active.</p>
          <p style="color: #64748b; font-size: 12px;">You will receive real-time municipal emergency notifications and scheduled water/power advisories.</p>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Great!'
    });

    setPhoneNumber('');
  };

  return (
    <div className="alerts-page-wrapper" ref={containerRef}>
      <Toaster position="top-right" />

      <main className="alerts-main-container">
        {/* Hero Section */}
        <section className="alerts-hero">
          <h1>
            Public Advisories <span className="cyan-gradient">&amp; Emergency Alerts</span>
          </h1>
          <p className="alerts-subtitle">
            Stay informed with real-time municipal announcements, weather flash flood alerts, scheduled infrastructure repairs, and direct emergency helplines.
          </p>
        </section>

        {/* Live Advisories Feed */}
        <section className="advisories-feed-section">
          <div className="feed-header">
            <h2>Active Public Advisories ({ACTIVE_ADVISORIES.length})</h2>
            <span className="live-indicator">● LIVE DISPATCH</span>
          </div>

          <div className="advisories-grid">
            {ACTIVE_ADVISORIES.map(adv => (
              <div key={adv.id} className={`advisory-card ${adv.severity.toLowerCase()}`}>
                <div className="card-top-row">
                  <span className="adv-category">{adv.category}</span>
                  <span className={`severity-tag ${adv.severity.toLowerCase()}`}>
                    {adv.severity} Severity
                  </span>
                </div>

                <h3>{adv.title}</h3>
                <p className="adv-desc">{adv.desc}</p>

                <div className="adv-meta">
                  <div className="meta-block">
                    <MapPin size={14} />
                    <span><strong>Areas:</strong> {adv.affectedAreas}</span>
                  </div>
                  <div className="meta-block">
                    <Clock size={14} />
                    <span><strong>Timeline:</strong> {adv.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SMS Subscription & Helplines Grid */}
        <section className="two-col-grid">
          {/* SMS Broadcast Subscription */}
          <div className="subscription-card">
            <div className="sub-card-header">
              <Bell size={20} className="text-cyan-400" />
              <h3>Get Real-Time SMS Emergency Broadcasts</h3>
            </div>
            <p className="sub-card-desc">
              Subscribe to automated municipal notifications for your neighborhood. Zero spam, 100% free government civic service.
            </p>

            <form onSubmit={handleSubscribe} className="sub-form">
              <div className="form-inputs-row">
                <input 
                  type="tel" 
                  placeholder="0300-1234567" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="sub-input"
                  required
                />
                <select 
                  value={selectedArea} 
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="sub-select"
                >
                  <option value="All Districts">All Districts (Citywide)</option>
                  <option value="District South (Clifton/Saddar)">District South</option>
                  <option value="District East (Gulshan/Jamshed)">District East</option>
                  <option value="District Central (Nazimabad)">District Central</option>
                  <option value="District Korangi">District Korangi</option>
                  <option value="District Malir">District Malir</option>
                </select>
                <button type="submit" className="sub-submit-btn">
                  <Send size={15} />
                  <span>Subscribe</span>
                </button>
              </div>
            </form>
          </div>

          {/* Emergency Helplines Card */}
          <div className="helplines-card">
            <div className="sub-card-header">
              <PhoneCall size={20} className="text-cyan-400" />
              <h3>Direct 24/7 Emergency Helplines</h3>
            </div>
            <p className="sub-card-desc">
              Direct toll-free citizen connections to emergency municipal dispatch units.
            </p>

            <div className="helplines-list">
              {EMERGENCY_HELPLINES.map((hl, i) => {
                const IconComponent = hl.icon;
                return (
                  <a key={i} href={`tel:${hl.number}`} className="helpline-item">
                    <div className="hl-info">
                      <IconComponent size={18} style={{ color: hl.color }} />
                      <span className="hl-name">{hl.name}</span>
                    </div>
                    <span className="hl-number">
                      <Phone size={13} className="mr-1 inline" />
                      {hl.number}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Alerts;
