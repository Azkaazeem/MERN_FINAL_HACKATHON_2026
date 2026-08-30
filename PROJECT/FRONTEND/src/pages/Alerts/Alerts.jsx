import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  PhoneCall, 
  Calendar, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  Zap, 
  Car, 
  Sparkles,
  Info
} from 'lucide-react';
import './Alerts.css';

const ACTIVE_ADVISORIES = [
  {
    id: 'ADV-401',
    title: '⚠️ Heavy Rainfall & Urban Flash Flood Advisory',
    category: 'Weather & Safety',
    severity: 'High',
    affectedAreas: 'District South, Clifton, Korangi Creek, Nazimabad',
    time: 'Valid until 11:59 PM Tonight',
    desc: 'Municipal dewatering pumps activated across 34 low-lying intersections. Citizens are advised to avoid unnecessary travel and stay clear of electric poles.'
  },
  {
    id: 'ADV-398',
    title: '💧 Main Water Conduit Maintenance (6-Hour Planned Outage)',
    category: 'Water Supply',
    severity: 'Medium',
    affectedAreas: 'Gulshan-e-Iqbal Block 4 to 10, University Road',
    time: 'Tomorrow, 06:00 AM - 12:00 PM',
    desc: 'Pipeline tie-in work for new 48-inch high-pressure feeder. Reserve water storage is recommended.'
  },
  {
    id: 'ADV-395',
    title: '🛣️ Shahrah-e-Faisal Flyover Asphalt Resurfacing',
    category: 'Traffic & Roads',
    severity: 'Low',
    affectedAreas: 'Airport to Baloch Colony Section',
    time: 'Night Shift: 11:00 PM - 05:00 AM',
    desc: 'Lane 1 & 2 closed for micro-milling and high-grade asphalt overlay. Use Korangi Road alternate.'
  }
];

const EMERGENCY_HELPLINES = [
  { name: 'Water & Sewerage Emergency (WSSB)', number: '1334', icon: Droplet, color: '#06b6d4' },
  { name: 'Electric Fault Emergency Line', number: '118', icon: Zap, color: '#f59e0b' },
  { name: 'Rescue & Paramedic Services', number: '1122', icon: ShieldAlert, color: '#ef4444' },
  { name: 'Traffic Police Helpline', number: '915', icon: Car, color: '#3b82f6' }
];

const Alerts = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Districts');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '🔔 Subscribed to Civic Alerts!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Mobile Number:</strong> ${phoneNumber}</p>
          <p><strong>Subscription Radius:</strong> ${selectedArea}</p>
          <p style="margin-top: 8px; color: #10b981; font-weight: bold;">✅ Free SMS broadcast active.</p>
          <p style="color: #64748b; font-size: 12px;">You will receive real-time municipal emergency notifications and scheduled water/power advisories.</p>
        </div>
      `,
      confirmButtonColor: '#06b6d4',
      confirmButtonText: 'Great!'
    });

    setPhoneNumber('');
  };

  return (
    <div className="alerts-page-wrapper">
      <Toaster position="top-right" />
      <Navbar />

      <main className="alerts-main-container">
        {/* Hero Section */}
        <section className="alerts-hero">
          <div className="alerts-badge">
            <Radio size={16} className="text-red-500 animate-pulse" />
            <span>24/7 Municipal Broadcast &amp; Emergency Hub</span>
          </div>
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
            <h2>📢 Active Public Advisories ({ACTIVE_ADVISORIES.length})</h2>
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
              <div className="form-group-sub">
                <label>Select Your District:</label>
                <select 
                  value={selectedArea} 
                  onChange={e => setSelectedArea(e.target.value)}
                  className="sub-select"
                >
                  <option value="All Districts">All Karachi Districts (Citywide)</option>
                  <option value="District South (Clifton/Saddar)">District South (Clifton/Saddar)</option>
                  <option value="District East (Gulshan/University)">District East (Gulshan/University)</option>
                  <option value="District Central (Nazimabad/FB Area)">District Central (Nazimabad/FB Area)</option>
                  <option value="District Korangi (Industrial/Creek)">District Korangi (Industrial/Creek)</option>
                  <option value="District Malir (Airport/Model Colony)">District Malir (Airport/Model Colony)</option>
                </select>
              </div>

              <div className="form-group-sub">
                <label>Mobile Number (For SMS Alerts):</label>
                <input 
                  type="tel" 
                  placeholder="0300-1234567" 
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="sub-input"
                  required
                />
              </div>

              <button type="submit" className="sub-btn">
                <Send size={15} />
                <span>Activate Free SMS Alerts</span>
              </button>
            </form>
          </div>

          {/* Emergency Helplines Directory */}
          <div className="helplines-card">
            <div className="sub-card-header">
              <PhoneCall size={20} className="text-red-400" />
              <h3>Direct Municipal Emergency Helplines</h3>
            </div>
            <p className="sub-card-desc">
              Direct hotlines with 24/7 dedicated dispatch response operators.
            </p>

            <div className="helplines-list">
              {EMERGENCY_HELPLINES.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div key={i} className="helpline-item">
                    <div className="hl-icon-wrap" style={{ background: `${h.color}18`, color: h.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="hl-info">
                      <div className="hl-name">{h.name}</div>
                      <div className="hl-sub">Toll-Free Government Hotline</div>
                    </div>
                    <a href={`tel:${h.number}`} className="hl-number-btn" style={{ borderColor: h.color, color: h.color }}>
                      📞 {h.number}
                    </a>
                  </div>
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
