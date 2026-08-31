import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import Footer from '../../components/Footer/Footer';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Activity, 
  Zap, 
  Building2, 
  Users, 
  Sparkles,
  Flame,
  Filter,
  BarChart3,
  Globe2,
  Radio,
  Truck,
  ArrowUpRight
} from 'lucide-react';
import './Analytics.css';

gsap.registerPlugin(ScrollTrigger);

// 5 Metropolitan Districts Static Geo-Anchors (Coordinates and Zones)
const DISTRICT_INCIDENTS = [
  { 
    id: 'central', 
    district: 'District Central', 
    area: 'Nazimabad, Liaquatabad, Gulberg', 
    lat: '24.9180° N', 
    lng: '67.0315° E', 
    active: 0, 
    resolved: 0, 
    risk: 'Low', 
    color: '#00e5ff',
    units: 'Standing Fleet',
    avgTime: '0.0 hrs',
    topIssue: 'No active faults recorded'
  },
  { 
    id: 'south', 
    district: 'District South', 
    area: 'Clifton, Saddar, Defense Corridor', 
    lat: '24.8315° N', 
    lng: '67.0344° E', 
    active: 0, 
    resolved: 0, 
    risk: 'Low', 
    color: '#10b981',
    units: 'Standing Fleet',
    avgTime: '0.0 hrs',
    topIssue: 'No active faults recorded'
  },
  { 
    id: 'east', 
    district: 'District East', 
    area: 'Gulshan-e-Iqbal, Jamshed Town', 
    lat: '24.9012° N', 
    lng: '67.0855° E', 
    active: 0, 
    resolved: 0, 
    risk: 'Low', 
    color: '#f59e0b',
    units: 'Standing Fleet',
    avgTime: '0.0 hrs',
    topIssue: 'No active faults recorded'
  },
  { 
    id: 'korangi', 
    district: 'District Korangi', 
    area: 'Korangi Industrial Area, Landhi', 
    lat: '24.8150° N', 
    lng: '67.1420° E', 
    active: 0, 
    resolved: 0, 
    risk: 'Low', 
    color: '#ef4444',
    units: 'Standing Fleet',
    avgTime: '0.0 hrs',
    topIssue: 'No active faults recorded'
  },
  { 
    id: 'malir', 
    district: 'District Malir', 
    area: 'Malir Cantonment, Airport Axis', 
    lat: '24.8960° N', 
    lng: '67.2015° E', 
    active: 0, 
    resolved: 0, 
    risk: 'Low', 
    color: '#00e5ff',
    units: 'Standing Fleet',
    avgTime: '0.0 hrs',
    topIssue: 'No active faults recorded'
  }
];

// Clean Domain Distribution
const CATEGORY_DISTRIBUTION = [
  { name: 'Water & Sewerage', value: 0, color: '#00e5ff' },
  { name: 'Roads & Infrastructure', value: 0, color: '#3b82f6' },
  { name: 'Solid Waste & Sanitation', value: 0, color: '#10b981' },
  { name: 'Electrical & Fire Hazard', value: 0, color: '#f59e0b' }
];

const Analytics = () => {
  const [districtsList, setDistrictsList] = useState(DISTRICT_INCIDENTS);
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICT_INCIDENTS[0]);
  const [deptLeaderboard, setDeptLeaderboard] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    meanResolution: 0.00,
    medianResolution: 0.00,
    stdDev: 0.00,
    iqrSpread: 0.00,
    activeIncidents: 0,
    totalTickets: 0,
    resolvedCount: 0,
    resolutionTrends: [],
    categoryDist: CATEGORY_DISTRIBUTION
  });
  const [citizenChampions, setCitizenChampions] = useState([]);
  const containerRef = useRef(null);

  // Fetch 100% Real-Time Aggregated Calculations directly from MongoDB
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [gisRes, mathRes, deptRes, usersRes] = await Promise.allSettled([
          API.get('/complaints/telemetry/gis'),
          API.get('/complaints/telemetry/math'),
          API.get('/departments'),
          API.get('/admin/users')
        ]);

        if (gisRes.status === 'fulfilled' && gisRes.value.data?.districts && gisRes.value.data.districts.length > 0) {
          const dists = gisRes.value.data.districts;
          setDistrictsList(dists);
          setSelectedDistrict(dists[0]);
        }

        if (mathRes.status === 'fulfilled' && mathRes.value.data?.stats) {
          const st = mathRes.value.data.stats;
          setAnalyticsData(prev => ({
            ...prev,
            meanResolution: st.meanResolutionHours ?? 0,
            medianResolution: st.medianResolutionHours ?? 0,
            stdDev: st.stdDevHours ?? 0,
            iqrSpread: st.iqrSpreadHours ?? 0,
            activeIncidents: st.activeIncidents ?? 0,
            totalTickets: st.totalTicketsLogged ?? 0,
            resolvedCount: st.resolvedCount ?? 0,
            resolutionTrends: st.monthlyResolutionTrends || [],
            categoryDist: (st.categoryDistribution && st.categoryDistribution.length > 0) ? st.categoryDistribution : CATEGORY_DISTRIBUTION
          }));
        }

        if (deptRes.status === 'fulfilled' && deptRes.value.data?.departments && deptRes.value.data.departments.length > 0) {
          const mappedDepts = deptRes.value.data.departments.map((d, i) => ({
            rank: i + 1,
            name: d.name,
            onTimeRate: d.onTimeRate ?? 100,
            avgHours: d.avgHours ?? '0.0 hrs',
            score: d.score ?? 100
          }));
          setDeptLeaderboard(mappedDepts);
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.data?.users && usersRes.value.data.users.length > 0) {
          const mappedUsers = usersRes.value.data.users
            .filter(u => (u.role === 'customer' || u.role === 'user') && ((u.karmaPoints && u.karmaPoints > 0) || (u.verifiedReportsCount && u.verifiedReportsCount > 0)))
            .slice(0, 5)
            .map((u, i) => ({
              rank: i + 1,
              name: u.name,
              karma: u.karmaPoints || 0,
              reports: u.verifiedReportsCount || 0,
              badge: u.badge || 'Civic Reporter',
              avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            }));
          setCitizenChampions(mappedUsers);
        }
      } catch (err) {
        console.warn('API Telemetry live fetch error:', err);
      }
    };

    fetchLiveData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.analytics-hero h1', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
      gsap.from('.stat-metric-card', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
      });
      gsap.from('.gis-heatmap-section', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleInspectDistrict = (dist) => {
    setSelectedDistrict(dist);
    Swal.fire({
      title: `${dist.district} Telemetry`,
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Coverage Sector:</strong> ${dist.area}</p>
          <p><strong>GPS Coordinates:</strong> ${dist.lat}, ${dist.lng}</p>
          <p><strong>Active Unresolved Tickets:</strong> <span style="color: #ef4444; font-weight: bold;">${dist.active}</span></p>
          <p><strong>Total Resolved (30 Days):</strong> <span style="color: #10b981; font-weight: bold;">${dist.resolved}</span></p>
          <p><strong>Response Crew on Duty:</strong> ${dist.units}</p>
          <p><strong>Average Resolution Speed:</strong> <span style="color: #00e5ff; font-weight: bold;">${dist.avgTime}</span></p>
          <p><strong>Top Recurring Fault:</strong> ${dist.topIssue}</p>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Close Telemetry'
    });
  };

  return (
    <div className="analytics-page-wrapper" ref={containerRef}>
      <Toaster position="top-right" />

      <main className="analytics-main-container">
        
        {/* ================= 1. CLEAN HEADER ================= */}
        <section className="analytics-hero">
          <h1>
            Municipal Transparency &amp; <span className="cyan-gradient">GIS Telemetry Hub</span>
          </h1>
          <p className="analytics-subtitle">
            Live geospatial fault distribution, mathematical turnaround benchmarks, and municipal performance metrics across Karachi.
          </p>
        </section>

        {/* ================= 2. FOUR MATHEMATICAL KPI BENCHMARKS ================= */}
        <section className="stats-metric-strip">
          <div className="stat-metric-card">
            <div className="metric-header">
              <span>Mean Resolution (&mu;)</span>
              <Clock size={16} className="icon-cyan" />
            </div>
            <div className="metric-val">{analyticsData.meanResolution} <small>hrs</small></div>
            <div className="metric-sub">Average municipal turnaround time</div>
          </div>

          <div className="stat-metric-card">
            <div className="metric-header">
              <span>Median Turnaround</span>
              <Activity size={16} className="icon-green" />
            </div>
            <div className="metric-val">{analyticsData.medianResolution} <small>hrs</small></div>
            <div className="metric-sub">50th Percentile resolution speed</div>
          </div>

          <div className="stat-metric-card">
            <div className="metric-header">
              <span>Standard Dev (&sigma;)</span>
              <TrendingUp size={16} className="icon-amber" />
            </div>
            <div className="metric-val">{analyticsData.stdDev} <small>hrs</small></div>
            <div className="metric-sub">High operational consistency</div>
          </div>

          <div className="stat-metric-card">
            <div className="metric-header">
              <span>IQR Spread (Q3 - Q1)</span>
              <ShieldCheck size={16} className="icon-indigo" />
            </div>
            <div className="metric-val">{analyticsData.iqrSpread} <small>hrs</small></div>
            <div className="metric-sub">Outlier resilience &amp; SLA index</div>
          </div>
        </section>


        {/* ================= 3. GIS GEOSPATIAL RADAR & TELEMETRY ================= */}
        <section className="gis-heatmap-section">
          
          {/* Section Header */}
          <div className="section-title-row">
            <div>
              <h2>Live Municipal GIS Incident Heatmap</h2>
              <p>Real-time telemetry pins &amp; active fault clusters across Karachi metropolitan zones</p>
            </div>
            <span className="live-pulse-badge">
              <Radio size={12} className="pulse-icon" />
              <span>LIVE GIS RADAR</span>
            </span>
          </div>

          {/* District Quick Filter Selector Bar */}
          <div className="district-filter-tabs">
            {districtsList.map(dist => (
              <button 
                key={dist.id}
                type="button"
                className={`dist-tab-btn ${selectedDistrict?.id === dist.id ? 'active' : ''}`}
                onClick={() => setSelectedDistrict(dist)}
              >
                <span className="tab-indicator-dot" style={{ backgroundColor: dist.color }} />
                <span>{dist.district}</span>
              </button>
            ))}
          </div>

          {/* Radar Grid Layout */}
          <div className="gis-radar-container">
            
            {/* Left: Futuristic High-Tech Map Canvas */}
            <div className="gis-map-canvas">
              <div className="map-grid-overlay" />
              <div className="map-radar-circle circle-1" />
              <div className="map-radar-circle circle-2" />
              <div className="map-radar-circle circle-3" />
              <div className="radar-sweep-beam" />

              {/* District Geo-Pins */}
              {districtsList.map((dist, idx) => {
                const isSelected = selectedDistrict?.id === dist.id;
                // Pin layout coordinates on radar grid
                const positions = [
                  { top: '35%', left: '42%' }, // Central
                  { top: '65%', left: '30%' }, // South
                  { top: '38%', left: '60%' }, // East
                  { top: '72%', left: '68%' }, // Korangi
                  { top: '25%', left: '80%' }  // Malir
                ];
                const pos = positions[idx] || { top: '50%', left: '50%' };

                return (
                  <div 
                    key={dist.id}
                    className={`gis-pin-marker ${isSelected ? 'active-pin' : ''}`}
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedDistrict(dist)}
                    title={`${dist.district} - Click for Telemetry`}
                  >
                    <div className="pin-pulse" style={{ borderColor: dist.color }} />
                    <div className="pin-dot" style={{ background: dist.color }}>
                      <MapPin size={12} color="#ffffff" />
                    </div>
                    <span className="pin-label">{dist.district}</span>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected District Telemetry Inspector Card */}
            <div className="gis-sidebar">
              <div className="sidebar-header">
                <Globe2 size={16} className="icon-cyan" />
                <h3>Zone Telemetry Inspector</h3>
              </div>

              {selectedDistrict ? (
                <div className="selected-dist-card">
                  <div className="dist-name">{selectedDistrict.district}</div>
                  <div className="dist-area">{selectedDistrict.area}</div>
                  <div className="dist-coords">{selectedDistrict.lat}, {selectedDistrict.lng}</div>

                  <div className="dist-stats-grid">
                    <div className="dist-stat-box">
                      <span className="box-val text-red">{selectedDistrict.active}</span>
                      <span className="box-lbl">Active Tickets</span>
                    </div>
                    <div className="dist-stat-box">
                      <span className="box-val text-green">{selectedDistrict.resolved}</span>
                      <span className="box-lbl">Resolved (30d)</span>
                    </div>
                    <div className="dist-stat-box">
                      <span className="box-val text-cyan">{selectedDistrict.units}</span>
                      <span className="box-lbl">Field Fleet</span>
                    </div>
                    <div className="dist-stat-box">
                      <span className="box-val text-purple">{selectedDistrict.avgTime}</span>
                      <span className="box-lbl">Avg SLA Speed</span>
                    </div>
                  </div>

                  <div className="dist-detail-row">
                    <span>Top Issue:</span>
                    <strong>{selectedDistrict.topIssue}</strong>
                  </div>

                  <div className="risk-level-bar">
                    <span>Risk Level:</span>
                    <strong style={{ color: selectedDistrict.color }}>{selectedDistrict.risk} Priority</strong>
                  </div>

                  <button 
                    type="button" 
                    className="inspect-btn"
                    onClick={() => handleInspectDistrict(selectedDistrict)}
                  >
                    <span>Inspect Full Operations Telemetry</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              ) : (
                <div className="selected-dist-card">
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Select a district above to view telemetry.</p>
                </div>
              )}
            </div>

          </div>
        </section>


        {/* ================= 4. CHARTS ROW ================= */}
        <section className="charts-grid-row">
          
          {/* Monthly Speed Area Chart */}
          <div className="chart-card">
            <h3>Monthly Resolution Speed (Hours by Domain)</h3>
            <p className="chart-subtitle">Lower is faster (Demonstrating continuous AI optimization)</p>
            
            <div style={{ height: 260, width: '100%', marginTop: 14 }}>
              {analyticsData.resolutionTrends && analyticsData.resolutionTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.resolutionTrends}>
                    <defs>
                      <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorRoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="h" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                    <Area type="monotone" dataKey="Water & Drainage" stroke="#00e5ff" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Roads & Infra" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRoad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                  <Activity size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>No resolution history recorded yet.</p>
                  <span style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Turnaround trends will plot live as field orders are resolved.</span>
                </div>
              )}
            </div>
          </div>

          {/* Complaint Volume Breakdown Pie */}
          <div className="chart-card">
            <h3>Complaint Volume by Civic Domain</h3>
            <p className="chart-subtitle">Breakdown across {analyticsData.totalTickets} logged municipal tickets</p>
            
            <div style={{ height: 260, width: '100%', marginTop: 14 }}>
              {analyticsData.categoryDist && analyticsData.categoryDist.some(c => c.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analyticsData.categoryDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center' }}>
                  <BarChart3 size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>0 tickets logged in municipal database.</p>
                  <span style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Category distribution will graph as complaints are lodged.</span>
                </div>
              )}
            </div>
          </div>

        </section>


        {/* ================= 5. PERFORMANCE LEADERBOARDS ================= */}
        <section className="leaderboards-grid">
          
          {/* Department Leaderboard */}
          <div className="leaderboard-card">
            <div className="card-header-row">
              <div className="title-with-icon">
                <Building2 size={18} className="icon-cyan" />
                <h3>Municipal Department Performance</h3>
              </div>
              <span className="sub-badge">SLA Ranked</span>
            </div>

            <div className="table-responsive">
              {deptLeaderboard.length > 0 ? (
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>On-Time Rate</th>
                      <th>Avg Speed</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deptLeaderboard.map(dept => (
                      <tr key={dept.rank}>
                        <td className="dept-name-cell">
                          <span className="rank-badge">#{dept.rank}</span>
                          <span>{dept.name}</span>
                        </td>
                        <td className="text-green font-bold">{dept.onTimeRate}%</td>
                        <td>{dept.avgHours}</td>
                        <td>
                          <span className="score-pill">{dept.score}/100</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No department performance records logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Citizen Karma Champions */}
          <div className="leaderboard-card">
            <div className="card-header-row">
              <div className="title-with-icon">
                <Award size={18} className="icon-amber" />
                <h3>Citizen Karma Champions</h3>
              </div>
              <span className="sub-badge gold">Top Reporters</span>
            </div>

            <div className="karma-list">
              {citizenChampions.length > 0 ? (
                citizenChampions.map(cit => (
                  <div key={cit.rank} className="karma-item">
                    <div className="cit-rank">#{cit.rank}</div>
                    <img src={cit.avatar} alt={cit.name} className="cit-avatar" />
                    <div className="cit-info">
                      <div className="cit-name">{cit.name}</div>
                      <div className="cit-badge">{cit.badge}</div>
                    </div>
                    <div className="cit-karma">
                      <Sparkles size={14} className="icon-amber" />
                      <span>{cit.karma} pts</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No citizen karma points yet. Citizens will rank here as they submit verified reports.
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
