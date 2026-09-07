import React, { useState, useEffect } from 'react';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  HardHat, 
  Activity, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ShieldCheck,
  Shield,
  User,
  Lock,
  RefreshCw,
  MapPin,
  Sparkles,
  Building2,
  Filter,
  Check,
  Eye,
  Send,
  Bell,
  Trash2,
  Star,
  CheckCheck,
  Calendar,
  Layers,
  Phone,
  Mail,
  Zap,
  Radio
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import './Admin.css';

// Default Field Crew Fallback
const DEFAULT_FIELD_WORKERS = [
  { id: 'W-101', name: 'Officer Tariq Mehmood', email: 'tariq@karachicivic.gov.pk', department: 'Water Supply & Sewerage Board (WSSB)', sector: 'District South', rating: 4.9, reviewsCount: 14, activeTasks: 2, status: 'On Duty' },
  { id: 'W-102', name: 'Crew Lead Farhan Ali', email: 'farhan@karachicivic.gov.pk', department: 'Power Distribution & Energy Corp', sector: 'District Central', rating: 4.8, reviewsCount: 19, activeTasks: 1, status: 'On Duty' },
  { id: 'W-103', name: 'Supervisor Usman Ghani', email: 'usman@karachicivic.gov.pk', department: 'Municipal Works & Engineering Dept', sector: 'District East', rating: 4.7, reviewsCount: 11, activeTasks: 3, status: 'On Duty' },
  { id: 'W-104', name: 'Team Lead Rashid Minhas', email: 'rashid@karachicivic.gov.pk', department: 'Solid Waste Management Authority (SWMA)', sector: 'District Korangi', rating: 5.0, reviewsCount: 8, activeTasks: 0, status: 'Available' }
];

// Daily Incident Volume Trend
const INCIDENT_TREND = [
  { time: '06:00', complaints: 4, resolved: 3 },
  { time: '09:00', complaints: 14, resolved: 10 },
  { time: '12:00', complaints: 28, resolved: 22 },
  { time: '15:00', complaints: 24, resolved: 21 },
  { time: '18:00', complaints: 18, resolved: 16 },
  { time: '21:00', complaints: 9, resolved: 9 }
];

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Users State
  const [dbUsers, setDbUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Workers State
  const [dbWorkers, setDbWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);

  // Admin Notifications & Audit Log State
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifFilter, setNotifFilter] = useState('All');

  // Backend Stats State
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 });

  // 1. Fetch Real Complaints & Stats from Database
  const fetchDbComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const [resComplaints, resStats] = await Promise.all([
        API.get('/complaints'),
        API.get('/complaints/stats').catch(() => ({ data: { success: false } }))
      ]);

      if (resComplaints.data?.success) {
        const mapped = (resComplaints.data.complaints || []).map(c => ({
          id: c.ticketId || c._id,
          _id: c._id,
          title: c.title,
          citizenName: c.citizenName || 'Citizen Reporter',
          citizenEmail: c.citizenEmail || '',
          citizenContact: c.citizenContact || 'N/A',
          category: c.category || 'General Civic',
          priority: c.priority || 'Medium',
          status: c.status || 'Open',
          department: c.department || 'Municipal Works & Engineering Dept',
          location: c.location || 'Central District',
          assignedWorker: c.assignedWorker || c.assignedWorkerName || 'Unassigned',
          aiSummary: c.aiSummary || 'Standard municipal telemetry report',
          resolutionNotes: c.resolutionNotes || '',
          resolutionProofUrl: c.resolutionProofUrl || '',
          rating: c.rating || c.userRating || 0,
          review: c.review || c.userComment || '',
          date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
        setComplaints(mapped);
      }

      if (resStats.data?.success) {
        setStats(resStats.data.stats);
      }
    } catch (err) {
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // 2. Fetch Real Users from MongoDB
  const fetchDbUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data?.success) {
        setDbUsers(res.data.users || []);
      }
    } catch (err) {
      setDbUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // 3. Fetch Real Workers from MongoDB
  const fetchDbWorkers = async () => {
    setWorkersLoading(true);
    try {
      const res = await API.get('/complaints/workers');
      if (res.data?.success && res.data.workers && res.data.workers.length > 0) {
        setDbWorkers(res.data.workers);
      } else {
        setDbWorkers(DEFAULT_FIELD_WORKERS);
      }
    } catch (err) {
      setDbWorkers(DEFAULT_FIELD_WORKERS);
    } finally {
      setWorkersLoading(false);
    }
  };

  // 4. Fetch Real Admin Notifications from MongoDB
  const fetchAdminNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await API.get('/notifications', { params: { role: 'admin' } });
      if (res.data?.success) {
        setAdminNotifications(res.data.notifications || []);
      }
    } catch (err) {
      setAdminNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchDbComplaints();
    fetchDbUsers();
    fetchDbWorkers();
    fetchAdminNotifications();

    const interval = setInterval(() => {
      fetchAdminNotifications();
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Dynamic Real-Time Calculations (Guaranteed accurate live DB values)
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed').length;
  const openCount = complaints.filter(c => c.status === 'Open' || !c.status).length;
  const unreadNotifCount = adminNotifications.filter(n => !n.isRead).length;

  // Handle Role Change (with Master Admin Protection)
  const handleRoleChange = (targetUser, newRole) => {
    const isTargetSuper = 
      targetUser.email?.toLowerCase() === 'amin@gmail.com' ||
      targetUser.email?.toLowerCase() === 'admin@gmail.com' ||
      targetUser.name?.toLowerCase() === 'admin' ||
      targetUser.role === 'administrator';

    if (isTargetSuper) {
      return Swal.fire({
        icon: 'warning',
        title: 'Master Admin Protected',
        text: 'This primary master administrator is protected and cannot be changed.',
        confirmButtonColor: '#00e5ff'
      });
    }

    Swal.fire({
      title: `Change Role to ${newRole.toUpperCase()}?`,
      text: `Update ${targetUser.name}'s system role to ${newRole.toUpperCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00e5ff',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, Make ${newRole.toUpperCase()}`
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
          setDbUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
          fetchDbWorkers();
          Swal.fire('Updated!', `${targetUser.name} is now ${newRole.toUpperCase()}.`, 'success');
        } catch (e) {
          toast.error('Failed to change role');
        }
      }
    });
  };

  // Handle Complaint Status Change
  const handleStatusChange = (complaintId, newStatus) => {
    Swal.fire({
      title: `Mark as ${newStatus}?`,
      text: `Update status for Ticket ${complaintId} to ${newStatus}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#00e5ff',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Update'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.put(`/complaints/${complaintId}/status`, { status: newStatus });
          setComplaints(prev => prev.map(c => (c.id === complaintId || c._id === complaintId) ? { ...c, status: newStatus } : c));
          fetchDbComplaints();
          fetchAdminNotifications();
          toast.success(`Ticket ${complaintId} updated to ${newStatus}!`);
        } catch (e) {
          toast.error('Failed to update ticket status');
        }
      }
    });
  };

  // Inspect Complaint Details Modal
  const handleInspectComplaint = (c) => {
    Swal.fire({
      title: `<span style="color: #00e5ff; font-family: monospace;">#${c.id}</span> Details`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.7; color: #cbd5e1;">
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Title:</strong> ${c.title}</p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Citizen:</strong> ${c.citizenName} (${c.citizenContact || c.citizenEmail || 'N/A'})</p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Category:</strong> ${c.category}</p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Priority:</strong> <span style="color: ${c.priority === 'Critical' ? '#ef4444' : c.priority === 'High' ? '#f59e0b' : '#00e5ff'}; font-weight: 800;">${c.priority}</span></p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Department:</strong> ${c.department}</p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Location:</strong> ${c.location}</p>
          <p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Assigned Officer:</strong> <span style="color: #10b981; font-weight: 700;">${c.assignedWorker}</span></p>
          ${c.rating > 0 ? `<p style="margin: 0 0 6px;"><strong style="color: #f8fafc;">Citizen Rating:</strong> <span style="color: #f59e0b; font-weight: bold;">⭐ ${c.rating}/5</span> - "${c.review || 'Completed'}"</p>` : ''}
          ${c.resolutionNotes ? `<div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 12px; border-radius: 8px; margin-top: 10px; font-size: 12px; color: #a7f3d0;"><strong>Resolution Notes:</strong> ${c.resolutionNotes}</div>` : ''}
          <div style="background: rgba(0, 229, 255, 0.08); border: 1px solid rgba(0, 229, 255, 0.2); padding: 8px 12px; border-radius: 8px; margin-top: 10px; font-size: 12px; color: #bae6fd;">
            <strong>AI Radar Diagnosis:</strong><br/>${c.aiSummary}
          </div>
        </div>
      `,
      background: '#090e1a',
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Close Details'
    });
  };

  // Notification Actions
  const handleMarkNotifRead = async (notifId) => {
    try {
      await API.put(`/notifications/${notifId}/read`);
      setAdminNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const handleDeleteNotif = async (notifId) => {
    try {
      await API.delete(`/notifications/${notifId}`);
      setAdminNotifications(prev => prev.filter(n => n._id !== notifId));
      toast.success('Notification removed');
    } catch (e) {}
  };

  const handleClearAllNotifs = async () => {
    try {
      await API.delete('/notifications/clear-all', { data: { role: 'admin' } });
      setAdminNotifications([]);
      toast.success('All admin notifications cleared');
    } catch (e) {}
  };

  // Filters
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) || 
      c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.assignedWorker.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredUsers = dbUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredNotifications = adminNotifications.filter(n => {
    if (notifFilter === 'All') return true;
    if (notifFilter === 'Tickets') return n.type === 'ticket_created' || n.type === 'ticket_assigned' || n.type === 'worker_assigned';
    if (notifFilter === 'Resolutions') return n.type === 'ticket_resolved' || n.type === 'status_updated';
    if (notifFilter === 'Ratings') return n.type === 'new_review';
    if (notifFilter === 'Deletions') return n.type === 'ticket_deleted';
    return true;
  });

  return (
    <div className="admin-layout-container">
      <Toaster position="top-right" />

      <div className="admin-main-body">
        {/* ================= REDESIGNED GLASSMORPHIC CYBER SIDEBAR ================= */}
        <aside className="admin-sidebar">
          <div className="sidebar-top-group">
            <div className="sidebar-brand-header">
              <div className="brand-beacon-indicator">
                <span className="beacon-ping"></span>
                <span className="beacon-dot"></span>
              </div>
              <div className="brand-text-block">
                <h3>NOVADESK ADMIN</h3>
                <span>MUNICIPAL COMMAND</span>
              </div>
            </div>

            <div className="sidebar-section-title">CONTROL MATRIX</div>
            
            <nav className="sidebar-nav-list">
              <button 
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <div className="nav-icon-wrap">
                  <LayoutDashboard size={17} />
                </div>
                <span className="nav-item-title">Operations Overview</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                <div className="nav-icon-wrap">
                  <ClipboardList size={17} />
                </div>
                <span className="nav-item-title">Civic Complaints</span>
                <span className="nav-badge-pill">{totalCount}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <div className="nav-icon-wrap">
                  <Users size={17} />
                </div>
                <span className="nav-item-title">User &amp; Role Access</span>
                <span className="nav-badge-pill">{dbUsers.length}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
                onClick={() => setActiveTab('workers')}
              >
                <div className="nav-icon-wrap">
                  <HardHat size={17} />
                </div>
                <span className="nav-item-title">Field Worker Fleet</span>
                <span className="nav-badge-pill">{dbWorkers.length > 0 ? dbWorkers.length : DEFAULT_FIELD_WORKERS.length}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <div className="nav-icon-wrap">
                  <Bell size={17} />
                </div>
                <span className="nav-item-title">System Audit Log</span>
                {unreadNotifCount > 0 ? (
                  <span className="nav-badge-pill alert">{unreadNotifCount}</span>
                ) : (
                  <span className="nav-badge-pill">{adminNotifications.length}</span>
                )}
              </button>
            </nav>
          </div>

          <div className="sidebar-footer-info">
            <div className="system-pill">
              <div className="live-dot-green"></div>
              <div className="pill-text-wrap">
                <span className="engine-status">AI Dispatch Engine v2.6</span>
                <span className="cluster-status">Central Cluster Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN DASHBOARD BODY ================= */}
        <main className="admin-content-area">

          {/* ================= TAB 1: OPERATIONS OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <div className="header-tag-pill">
                    <Radio size={12} className="animate-pulse text-cyan-400" />
                    <span>REAL-TIME MUNICIPAL TELEMETRY</span>
                  </div>
                  <h2>Municipal Operations Command Center</h2>
                  <p>Comprehensive live telemetry, fault analytics, and automated crew dispatch streams.</p>
                </div>

                <div className="pane-header-actions">
                  <button className="cyber-action-btn" onClick={fetchDbComplaints}>
                    <RefreshCw size={14} className={complaintsLoading ? 'animate-spin' : ''} />
                    <span>Sync Live Data</span>
                  </button>
                </div>
              </div>

              {/* 4 DYNAMIC REAL-TIME KPI METRIC CARDS */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <span className="kpi-label">Total Logged Tickets</span>
                    <div className="kpi-icon-pill cyan">
                      <ClipboardList size={18} />
                    </div>
                  </div>
                  <span className="kpi-value">{totalCount}</span>
                  <span className="kpi-sub">Across 5 Municipal Sectors</span>
                </div>

                <div className="kpi-card critical-border">
                  <div className="kpi-card-header">
                    <span className="kpi-label">Critical Emergencies</span>
                    <div className="kpi-icon-pill red">
                      <AlertTriangle size={18} />
                    </div>
                  </div>
                  <span className="kpi-value text-red">{criticalCount}</span>
                  <span className="kpi-sub">Immediate Dispatch Active</span>
                </div>

                <div className="kpi-card in-progress-border">
                  <div className="kpi-card-header">
                    <span className="kpi-label">In Progress Work Orders</span>
                    <div className="kpi-icon-pill amber">
                      <Clock size={18} />
                    </div>
                  </div>
                  <span className="kpi-value text-amber">{inProgressCount}</span>
                  <span className="kpi-sub">Field Crews Actively Deployed</span>
                </div>

                <div className="kpi-card resolved-border">
                  <div className="kpi-card-header">
                    <span className="kpi-label">Resolved Tickets</span>
                    <div className="kpi-icon-pill green">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <span className="kpi-value text-green">{resolvedCount}</span>
                  <span className="kpi-sub">Quality Verified &amp; Closed</span>
                </div>
              </div>

              {/* Incident Velocity Trend Chart */}
              <div className="chart-wrapper-card">
                <div className="card-top-bar">
                  <div>
                    <h3>Real-time Incident &amp; Resolution Velocity</h3>
                    <p className="card-subtitle">Telemetry tracking incident inflow vs field resolution rate across 24h operational cycle</p>
                  </div>
                  <div className="chart-legend-wrap">
                    <span className="legend-dot cyan"></span> Incoming Incidents
                    <span className="legend-dot green ml-3"></span> Completed Orders
                  </div>
                </div>
                <div style={{ height: 260, width: '100%', marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={INCIDENT_TREND}>
                      <defs>
                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          borderColor: 'rgba(0, 229, 255, 0.4)', 
                          borderRadius: 8, 
                          color: '#ffffff',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
                        }} 
                      />
                      <Area type="monotone" dataKey="complaints" stroke="#00bcd4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two Column Section: Active Complaints & Live Notification Audit Stream */}
              <div className="overview-dual-grid">
                {/* Left: Active Complaints Table */}
                <div className="table-wrapper-card">
                  <div className="table-title-row">
                    <div>
                      <h3>Active Emergency Incidents ({complaints.length})</h3>
                      <p className="card-subtitle">Real-time status of civic infrastructure tickets</p>
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('complaints')}>View All Complaints →</button>
                  </div>

                  {complaints.length === 0 ? (
                    <div className="empty-state-wrap">
                      <ClipboardList size={36} className="text-muted" />
                      <p className="empty-title">No complaints registered in database yet.</p>
                      <p className="empty-sub">Submit a ticket from Customer Portal to see it appear live here!</p>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Title &amp; Sector</th>
                          <th>Priority</th>
                          <th>Assigned Crew</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.slice(0, 5).map(c => (
                          <tr key={c.id}>
                            <td className="font-mono font-bold text-cyan">{c.id}</td>
                            <td>
                              <div className="title-location-cell">
                                <span className="complaint-title-text" onClick={() => handleInspectComplaint(c)}>{c.title}</span>
                                <span className="location-sub"><MapPin size={11} /> {c.location}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`priority-tag-mini ${c.priority?.toLowerCase()}`}>
                                {c.priority}
                              </span>
                            </td>
                            <td>
                              <span className="crew-assigned-text">{c.assignedWorker}</span>
                            </td>
                            <td>
                              <span className={`status-tag-mini ${c.status?.toLowerCase().replace(' ', '-')}`}>
                                {c.status}
                              </span>
                            </td>
                            <td>
                              <button className="action-link-btn" onClick={() => handleInspectComplaint(c)}>
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Right: Live System Activity Stream */}
                <div className="table-wrapper-card activity-stream-card">
                  <div className="table-title-row">
                    <div>
                      <h3>Live System Activity Stream</h3>
                      <p className="card-subtitle">Real-time dispatch, resolution &amp; rating logs</p>
                    </div>
                    <button className="view-all-btn" onClick={() => setActiveTab('notifications')}>All Logs ({adminNotifications.length}) →</button>
                  </div>

                  <div className="activity-stream-list">
                    {adminNotifications.length === 0 ? (
                      <div className="empty-stream-wrap">
                        <Activity size={32} className="text-muted" />
                        <span>No system events recorded yet.</span>
                      </div>
                    ) : (
                      adminNotifications.slice(0, 6).map((notif, idx) => (
                        <div key={notif._id || idx} className={`stream-item-row ${!notif.isRead ? 'unread' : ''}`}>
                          <div className={`stream-icon-pill ${notif.type || 'general'}`}>
                            {notif.type === 'ticket_created' && <ClipboardList size={14} />}
                            {notif.type === 'worker_assigned' && <HardHat size={14} />}
                            {notif.type === 'ticket_resolved' && <CheckCircle2 size={14} />}
                            {notif.type === 'new_review' && <Star size={14} />}
                            {notif.type === 'ticket_deleted' && <Trash2 size={14} />}
                            {(!notif.type || notif.type === 'general' || notif.type === 'status_updated') && <Zap size={14} />}
                          </div>

                          <div className="stream-content-block">
                            <div className="stream-top-meta">
                              <span className="stream-item-title">{notif.title}</span>
                              <span className="stream-time-text">
                                {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="stream-message-text">{notif.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: CIVIC COMPLAINTS REGISTRY ================= */}
          {activeTab === 'complaints' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <div className="header-tag-pill">
                    <ClipboardList size={12} />
                    <span>MUNICIPAL INFRASTRUCTURE REGISTRY</span>
                  </div>
                  <h2>Civic Complaints &amp; Work Orders ({filteredComplaints.length})</h2>
                  <p>Search, inspect AI diagnostics, filter by district, and transition work orders.</p>
                </div>

                <div className="pane-header-actions">
                  <button className="cyber-action-btn" onClick={fetchDbComplaints}>
                    <RefreshCw size={14} className={complaintsLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Search & Category & Status Filters Bar */}
              <div className="filter-controls-row">
                <div className="search-box-wrap">
                  <Search size={15} color="#00e5ff" />
                  <input 
                    type="text" 
                    placeholder="Search Ticket ID, Title, Citizen, Crew..." 
                    value={complaintSearch}
                    onChange={e => setComplaintSearch(e.target.value)}
                  />
                </div>

                <div className="category-select-wrap">
                  <Filter size={15} color="#00e5ff" />
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Water & Drainage">Water &amp; Drainage</option>
                    <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                    <option value="Waste & Sanitation">Waste &amp; Sanitation</option>
                    <option value="Electricity & Power">Electricity &amp; Power</option>
                    <option value="Public Safety & Streetlights">Public Safety</option>
                  </select>
                </div>

                <div className="category-select-wrap">
                  <Layers size={15} color="#00e5ff" />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Statuses</option>
                    <option value="Open">Open (Pending)</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Complaints Table */}
              <div className="table-wrapper-card">
                {filteredComplaints.length === 0 ? (
                  <div className="empty-state-wrap">
                    <ClipboardList size={36} className="text-muted" />
                    <p className="empty-title">No matching complaints found.</p>
                    <p className="empty-sub">Adjust your search or filter parameters.</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Title &amp; Location</th>
                        <th>Citizen Details</th>
                        <th>Department</th>
                        <th>Assigned Crew</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map(c => (
                        <tr key={c.id}>
                          <td className="font-mono font-bold text-cyan">{c.id}</td>
                          <td>
                            <div className="title-location-cell">
                              <span className="complaint-title-text" onClick={() => handleInspectComplaint(c)}>{c.title}</span>
                              <span className="location-sub"><MapPin size={11} /> {c.location}</span>
                            </div>
                          </td>
                          <td>
                            <div className="citizen-cell">
                              <span className="citizen-name-text">{c.citizenName}</span>
                              <small className="citizen-contact-sub">{c.citizenContact || c.citizenEmail}</small>
                            </div>
                          </td>
                          <td className="dept-cell">{c.department}</td>
                          <td>
                            <span className="crew-assigned-text font-bold">{c.assignedWorker}</span>
                          </td>
                          <td>
                            <span className={`priority-tag-mini ${c.priority.toLowerCase()}`}>
                              {c.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`status-tag-mini ${c.status.toLowerCase().replace(' ', '-')}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-btns">
                              {c.status !== 'In Progress' && c.status !== 'Resolved' && (
                                <button 
                                  className="action-btn-sm" 
                                  onClick={() => handleStatusChange(c.id, 'In Progress')}
                                  title="Dispatch & Start Work"
                                >
                                  Start
                                </button>
                              )}
                              {c.status !== 'Resolved' && (
                                <button 
                                  className="action-btn-sm success" 
                                  onClick={() => handleStatusChange(c.id, 'Resolved')}
                                  title="Mark as Resolved"
                                >
                                  Resolve
                                </button>
                              )}
                              <button 
                                className="action-btn-sm inspect-btn" 
                                onClick={() => handleInspectComplaint(c)}
                                title="Inspect Full Diagnostic"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: USER & ROLE MANAGEMENT ================= */}
          {activeTab === 'users' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <div className="header-tag-pill">
                    <Users size={12} />
                    <span>RBAC ACCESS CONTROL MATRIX</span>
                  </div>
                  <h2>User &amp; Role Management ({filteredUsers.length})</h2>
                  <p>Assign and modify roles: <strong>Customer</strong>, <strong>Worker</strong>, or <strong>Admin</strong>.</p>
                </div>

                <div className="pane-header-actions">
                  <button className="cyber-action-btn" onClick={fetchDbUsers} title="Refresh User List">
                    <RefreshCw size={14} className={usersLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="filter-controls-row">
                <div className="search-box-wrap">
                  <Search size={15} color="#00e5ff" />
                  <input 
                    type="text" 
                    placeholder="Search by Name, Email, Role..." 
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper-card users-table-card">
                <table className="admin-table modern-user-table">
                  <thead>
                    <tr>
                      <th>User Profile</th>
                      <th>Email Address</th>
                      <th>Auth Provider</th>
                      <th>Current Role</th>
                      <th>Role Permissions &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const isSuper = 
                        u.email?.toLowerCase() === 'amin@gmail.com' ||
                        u.email?.toLowerCase() === 'admin@gmail.com' ||
                        u.name?.toLowerCase() === 'admin' ||
                        u.role === 'administrator';
                      
                      const normRole = (u.role || 'customer').toLowerCase();

                      return (
                        <tr key={u._id} className={isSuper ? 'master-admin-row' : ''}>
                          <td>
                            <div className="user-profile-meta-cell">
                              <div className={`user-table-avatar ${isSuper ? 'super-avatar' : ''}`}>
                                {u.profilePic ? (
                                  <img src={u.profilePic} alt={u.name} />
                                ) : (
                                  <span>{(u.name || 'U').charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="user-name-wrapper">
                                <span className="user-name-title">{u.name}</span>
                                {isSuper && <span className="master-sub-tag">Master Account</span>}
                              </div>
                            </div>
                          </td>

                          <td className="user-email-cell">
                            <span className="email-text">{u.email}</span>
                          </td>

                          <td>
                            <span className={`provider-pill provider-${(u.authProvider || 'local').toLowerCase()}`}>
                              {u.authProvider || 'Local'}
                            </span>
                          </td>

                          <td>
                            {isSuper ? (
                              <span className="modern-role-badge badge-master-admin">
                                <Shield size={13} />
                                <span>MASTER ADMIN</span>
                              </span>
                            ) : normRole === 'admin' ? (
                              <span className="modern-role-badge badge-admin">
                                <ShieldCheck size={13} />
                                <span>ADMIN</span>
                              </span>
                            ) : normRole === 'worker' ? (
                              <span className="modern-role-badge badge-worker">
                                <HardHat size={13} />
                                <span>WORKER</span>
                              </span>
                            ) : (
                              <span className="modern-role-badge badge-customer">
                                <User size={13} />
                                <span>CUSTOMER</span>
                              </span>
                            )}
                          </td>

                          <td>
                            {isSuper ? (
                              <div className="master-admin-locked-pill" title="Permanent Master Administrator">
                                <Lock size={13} />
                                <span>Protected (Permanent Role)</span>
                              </div>
                            ) : (
                              <div className="modern-role-actions-bar">
                                {normRole !== 'customer' && (
                                  <button 
                                    className="role-pill-action btn-make-customer" 
                                    onClick={() => handleRoleChange(u, 'customer')}
                                    title="Set role to Citizen/Customer"
                                  >
                                    <User size={12} />
                                    <span>Customer</span>
                                  </button>
                                )}
                                {normRole !== 'worker' && (
                                  <button 
                                    className="role-pill-action btn-make-worker" 
                                    onClick={() => handleRoleChange(u, 'worker')}
                                    title="Set role to Field Support Worker"
                                  >
                                    <HardHat size={12} />
                                    <span>Worker</span>
                                  </button>
                                )}
                                {normRole !== 'admin' && (
                                  <button 
                                    className="role-pill-action btn-make-admin" 
                                    onClick={() => handleRoleChange(u, 'admin')}
                                    title="Promote to System Administrator"
                                  >
                                    <ShieldCheck size={12} />
                                    <span>Admin</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: FIELD WORKER FLEET ================= */}
          {activeTab === 'workers' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <div className="header-tag-pill">
                    <HardHat size={12} />
                    <span>MUNICIPAL CREW OPERATIONS</span>
                  </div>
                  <h2>Field Worker Fleet Management ({dbWorkers.length > 0 ? dbWorkers.length : DEFAULT_FIELD_WORKERS.length})</h2>
                  <p>Active field crews, live ratings, citizen reviews, and task dispatch controls.</p>
                </div>

                <div className="pane-header-actions">
                  <button className="cyber-action-btn" onClick={fetchDbWorkers}>
                    <RefreshCw size={14} className={workersLoading ? 'animate-spin' : ''} />
                    <span>Refresh Fleet</span>
                  </button>
                </div>
              </div>

              <div className="workers-grid-layout">
                {(dbWorkers.length > 0 ? dbWorkers : DEFAULT_FIELD_WORKERS).map((w, idx) => {
                  const workerName = w.name || 'Field Officer';
                  const workerDept = w.department || 'Municipal Operations Dept';
                  const workerRating = w.rating || 5.0;
                  const reviewCount = w.reviewsCount || (w.reviews ? w.reviews.length : 0);
                  const activeTasks = w.activeTasks !== undefined ? w.activeTasks : complaints.filter(c => c.assignedWorker === workerName && c.status === 'In Progress').length;
                  const sector = w.sector || 'District Central';
                  const avatar = w.profilePic || w.avatar || '';

                  return (
                    <div key={w._id || w.id || idx} className="worker-fleet-card">
                      <div className="w-card-header">
                        <div className="w-avatar-wrap">
                          {avatar ? (
                            <img src={avatar} alt={workerName} className="w-avatar-img" />
                          ) : (
                            <HardHat size={20} className="text-cyan" />
                          )}
                        </div>
                        <div className="w-header-text">
                          <h4>{workerName}</h4>
                          <span className="w-dept-text">{workerDept}</span>
                        </div>
                      </div>

                      <div className="w-rating-badge-row">
                        <div className="star-rating-box">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span className="rating-num-text">{workerRating.toFixed(1)}</span>
                          <span className="reviews-count-text">({reviewCount} verified reviews)</span>
                        </div>
                      </div>

                      <div className="w-meta-row">
                        <div className="meta-item">
                          <span className="meta-label">Assigned Sector</span>
                          <span className="meta-val">{sector}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Active Orders</span>
                          <span className="meta-val highlight">{activeTasks}</span>
                        </div>
                      </div>

                      <div className="w-status-row">
                        <span className="w-status-badge on-duty">
                          <span className="status-dot"></span> On Duty
                        </span>
                        <button 
                          className="assign-order-btn"
                          onClick={() => toast.success(`Field dispatch priority signal transmitted to ${workerName}!`)}
                        >
                          Dispatch Order
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 5: SYSTEM NOTIFICATIONS & AUDIT LOG ================= */}
          {activeTab === 'notifications' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <div className="header-tag-pill">
                    <Bell size={12} />
                    <span>REAL-TIME SYSTEM AUDIT LOG</span>
                  </div>
                  <h2>System Notifications &amp; Event Stream ({filteredNotifications.length})</h2>
                  <p>Chronological feed of all ticket generations, crew assignments, resolution submissions, citizen ratings, and deletions.</p>
                </div>

                <div className="pane-header-actions">
                  <button className="cyber-action-btn" onClick={fetchAdminNotifications}>
                    <RefreshCw size={14} className={notifLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                  {adminNotifications.length > 0 && (
                    <button className="cyber-action-btn danger" onClick={handleClearAllNotifs}>
                      <Trash2 size={14} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Filter Chips */}
              <div className="notif-filter-chips-row">
                <button 
                  className={`filter-chip ${notifFilter === 'All' ? 'active' : ''}`} 
                  onClick={() => setNotifFilter('All')}
                >
                  All Events ({adminNotifications.length})
                </button>
                <button 
                  className={`filter-chip ${notifFilter === 'Tickets' ? 'active' : ''}`} 
                  onClick={() => setNotifFilter('Tickets')}
                >
                  Tickets &amp; Assignments
                </button>
                <button 
                  className={`filter-chip ${notifFilter === 'Resolutions' ? 'active' : ''}`} 
                  onClick={() => setNotifFilter('Resolutions')}
                >
                  Work Order Resolutions
                </button>
                <button 
                  className={`filter-chip ${notifFilter === 'Ratings' ? 'active' : ''}`} 
                  onClick={() => setNotifFilter('Ratings')}
                >
                  Citizen Ratings (⭐)
                </button>
                <button 
                  className={`filter-chip ${notifFilter === 'Deletions' ? 'active' : ''}`} 
                  onClick={() => setNotifFilter('Deletions')}
                >
                  Deletions
                </button>
              </div>

              {/* Notification Stream Feed */}
              <div className="admin-notifications-stream-card">
                {filteredNotifications.length === 0 ? (
                  <div className="empty-state-wrap">
                    <Bell size={42} className="text-muted" />
                    <p className="empty-title">No notifications matching this filter.</p>
                    <p className="empty-sub">System events will automatically stream here in real-time as users and workers interact.</p>
                  </div>
                ) : (
                  <div className="notif-feed-list">
                    {filteredNotifications.map((notif) => {
                      const type = notif.type || 'general';
                      const isUnread = !notif.isRead;

                      return (
                        <div key={notif._id} className={`notif-feed-item ${isUnread ? 'unread-item' : ''}`}>
                          <div className={`notif-icon-col ${type}`}>
                            {type === 'ticket_created' && <ClipboardList size={18} />}
                            {type === 'worker_assigned' && <HardHat size={18} />}
                            {type === 'ticket_resolved' && <CheckCircle2 size={18} />}
                            {type === 'new_review' && <Star size={18} />}
                            {type === 'ticket_deleted' && <Trash2 size={18} />}
                            {(!type || type === 'general' || type === 'status_updated') && <Zap size={18} />}
                          </div>

                          <div className="notif-info-col">
                            <div className="notif-header-line">
                              <div className="notif-title-group">
                                <h4>{notif.title}</h4>
                                {notif.ticketId && (
                                  <span className="notif-ticket-tag font-mono">#{notif.ticketId}</span>
                                )}
                              </div>
                              <span className="notif-timestamp">
                                {new Date(notif.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{' '}
                                {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className="notif-body-text">{notif.message}</p>

                            {notif.senderName && (
                              <div className="notif-sender-meta">
                                <span className="sender-tag">Triggered by: <strong>{notif.senderName}</strong></span>
                              </div>
                            )}
                          </div>

                          <div className="notif-actions-col">
                            {isUnread && (
                              <button 
                                className="notif-action-btn read-btn" 
                                onClick={() => handleMarkNotifRead(notif._id)}
                                title="Mark as Read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button 
                              className="notif-action-btn delete-btn" 
                              onClick={() => handleDeleteNotif(notif._id)}
                              title="Delete Event Log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
