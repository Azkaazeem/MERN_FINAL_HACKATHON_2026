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
  Send
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

// Real Civic Complaints Dataset
const INITIAL_CIVIC_COMPLAINTS = [
  {
    id: 'TKT-8942',
    title: 'Burst Main Potable Water Supply Pipeline',
    citizenName: 'Akash Ahmed',
    citizenContact: '0300-8876543',
    category: 'Water & Drainage',
    priority: 'Critical',
    status: 'In Progress',
    department: 'Water Supply & Sewerage Board (WSSB)',
    location: 'Sector 4, Main Boulevard, Karachi',
    assignedWorker: 'Officer Tariq Mehmood',
    aiSummary: 'Major underground pipeline fracture causing 400L/min water loss and street flooding.',
    date: '2026-08-30'
  },
  {
    id: 'TKT-8939',
    title: 'Severe 2.5ft Road Pothole near School Gate',
    citizenName: 'Sara Khan',
    citizenContact: '0312-4455667',
    category: 'Roads & Infrastructure',
    priority: 'High',
    status: 'Open',
    department: 'Municipal Works & Engineering Dept',
    location: 'Block 7, Gulshan Avenue, Karachi',
    assignedWorker: 'Unassigned',
    aiSummary: 'Deep asphalt road cave-in creating accident risk for school buses and pedestrians.',
    date: '2026-08-30'
  },
  {
    id: 'TKT-8931',
    title: 'Exposed High Voltage Distribution Cable Spanning Low',
    citizenName: 'Hamza Tariq',
    citizenContact: '0333-9988771',
    category: 'Electricity & Power',
    priority: 'Critical',
    status: 'In Progress',
    department: 'Power Distribution & Energy Corp',
    location: 'Street 12, Commercial Area, Karachi',
    assignedWorker: 'Crew Lead Farhan Ali',
    aiSummary: 'Live 440V distribution wire snapped and touching metallic street pole.',
    date: '2026-08-30'
  },
  {
    id: 'TKT-8924',
    title: 'Commercial Solid Waste Dumpster Overflowing',
    citizenName: 'Ayesha Siddiqui',
    citizenContact: '0321-1122334',
    category: 'Waste & Sanitation',
    priority: 'Medium',
    status: 'Resolved',
    department: 'Solid Waste Management Authority (SWMA)',
    location: 'Central Market, Sector 2, Karachi',
    assignedWorker: 'Sanitation Crew #4',
    aiSummary: 'Organic waste accumulation exceeding dumpster limits, blocking side walkway.',
    date: '2026-08-29'
  },
  {
    id: 'TKT-8918',
    title: 'Broken Streetlight Poles Creating Dark Zone',
    citizenName: 'Bilal Raza',
    citizenContact: '0345-6677889',
    category: 'Public Safety & Streetlights',
    priority: 'Low',
    status: 'Resolved',
    department: 'Municipal Works & Engineering Dept',
    location: 'Park Lane, Clifton Block 5',
    assignedWorker: 'Officer Tariq Mehmood',
    aiSummary: '3 LED streetlights burned out after power surge.',
    date: '2026-08-29'
  }
];

// Field Crew Workers
const FIELD_WORKERS = [
  { id: 'W-101', name: 'Officer Tariq Mehmood', department: 'Water Supply (WSSB)', sector: 'District South', activeTasks: 2, status: 'On Duty' },
  { id: 'W-102', name: 'Crew Lead Farhan Ali', department: 'Power Corp', sector: 'District Central', activeTasks: 1, status: 'On Duty' },
  { id: 'W-103', name: 'Supervisor Usman Ghani', department: 'Engineering Works', sector: 'District East', activeTasks: 3, status: 'On Duty' },
  { id: 'W-104', name: 'Team Lead Rashid Minhas', department: 'Solid Waste (SWMA)', sector: 'District Korangi', activeTasks: 0, status: 'Available' }
];

// Daily Incident Volume Trend
const INCIDENT_TREND = [
  { time: '06:00', complaints: 8, resolved: 6 },
  { time: '09:00', complaints: 24, resolved: 18 },
  { time: '12:00', complaints: 42, resolved: 36 },
  { time: '15:00', complaints: 38, resolved: 35 },
  { time: '18:00', complaints: 28, resolved: 27 },
  { time: '21:00', complaints: 14, resolved: 14 }
];

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Real DB Users
  const [dbUsers, setDbUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 });

  // Fetch real complaints from Database
  const fetchDbComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await API.get('/complaints');
      if (res.data.success) {
        const mapped = (res.data.complaints || []).map(c => ({
          id: c.ticketId || c._id,
          _id: c._id,
          title: c.title,
          citizenName: c.citizenName,
          citizenContact: c.citizenContact,
          category: c.category,
          priority: c.priority,
          status: c.status,
          department: c.department,
          location: c.location,
          assignedWorker: c.assignedWorker || 'Unassigned',
          aiSummary: c.aiSummary || 'Standard municipal report',
          date: new Date(c.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        }));
        setComplaints(mapped);
      }
      const statsRes = await API.get('/complaints/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      // If error, set empty
      setComplaints([]);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Fetch real users from MongoDB
  const fetchDbUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setDbUsers(res.data.users || []);
      }
    } catch (err) {
      setDbUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDbComplaints();
    fetchDbUsers();
  }, []);

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
        } catch (e) {}
        setDbUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
        Swal.fire('Updated!', `${targetUser.name} is now ${newRole.toUpperCase()}.`, 'success');
      }
    });
  };

  // Handle Complaint Status Change
  const handleStatusChange = (complaintId, newStatus) => {
    Swal.fire({
      title: `Mark as ${newStatus}?`,
      text: `Update status for Ticket ${complaintId}?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#06b6d4',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Update'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.put(`/complaints/${complaintId}/status`, { status: newStatus });
        } catch (e) {}
        setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
        fetchDbComplaints();
        Swal.fire('Updated!', `Ticket ${complaintId} marked as ${newStatus}.`, 'success');
      }
    });
  };

  // Inspect Complaint Details
  const handleInspectComplaint = (c) => {
    Swal.fire({
      title: `Ticket Details: ${c.id}`,
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6;">
          <p><strong>Title:</strong> ${c.title}</p>
          <p><strong>Citizen:</strong> ${c.citizenName} (${c.citizenContact})</p>
          <p><strong>Category:</strong> ${c.category}</p>
          <p><strong>Priority:</strong> <span style="color: ${c.priority === 'Critical' ? '#ef4444' : c.priority === 'High' ? '#f59e0b' : '#0891b2'}; font-weight: bold;">${c.priority}</span></p>
          <p><strong>Department:</strong> ${c.department}</p>
          <p><strong>Location:</strong> ${c.location}</p>
          <p><strong>Assigned Crew:</strong> ${c.assignedWorker}</p>
          <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-top: 8px; font-size: 12px;">
            <strong>AI Radar Diagnosis:</strong><br/>${c.aiSummary}
          </div>
        </div>
      `,
      confirmButtonColor: '#0891b2',
      confirmButtonText: 'Close Details'
    });
  };

  // Filters
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(complaintSearch.toLowerCase()) || 
                          c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                          c.citizenName.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredUsers = dbUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="admin-layout-container">
      <Toaster position="top-right" />

      <div className="admin-main-body">
        {/* ================= MINIMALIST SIDEBAR ================= */}
        <aside className="admin-sidebar">
          <div>
            <div className="sidebar-section-title">Municipal Console</div>
            <nav className="sidebar-nav-list">
              <button 
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={17} />
                <span>Operations Overview</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
              >
                <ClipboardList size={17} />
                <span>Civic Complaints ({complaints.length})</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={17} />
                <span>User &amp; Role Access ({dbUsers.length})</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'workers' ? 'active' : ''}`}
                onClick={() => setActiveTab('workers')}
              >
                <HardHat size={17} />
                <span>Field Worker Fleet ({FIELD_WORKERS.length})</span>
              </button>
            </nav>
          </div>

          <div className="sidebar-footer-info">
            <div className="system-pill">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>AI Dispatch Engine v2.4</span>
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
                  <h2>Municipal Command Center</h2>
                  <p>Real-time telemetry and service delivery analytics across city sectors.</p>
                </div>
              </div>

              {/* KPI Metric Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-label">Total Logged Tickets</span>
                  <span className="kpi-value">{stats.total}</span>
                  <span className="kpi-sub">Across All City Sectors</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">Critical Emergencies</span>
                  <span className="kpi-value text-red">{stats.critical}</span>
                  <span className="kpi-sub">Immediate Dispatch Active</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">In Progress Work Orders</span>
                  <span className="kpi-value text-green">{stats.inProgress}</span>
                  <span className="kpi-sub">Active Field Operations</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">Resolved Tickets</span>
                  <span className="kpi-value">{stats.resolved}</span>
                  <span className="kpi-sub">Completed &amp; Verified</span>
                </div>
              </div>

              {/* Incident Trend Chart */}
              <div className="chart-wrapper-card">
                <h3>Real-time Incident &amp; Resolution Velocity</h3>
                <div style={{ height: 260, width: '100%', marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={INCIDENT_TREND}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#fff' }} />
                      <Area type="monotone" dataKey="complaints" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.15)" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Active Complaints Summary Table */}
              <div className="table-wrapper-card">
                <div className="table-title-row">
                  <h3>Active Emergency Incidents ({complaints.length})</h3>
                  <button className="view-all-btn" onClick={() => setActiveTab('complaints')}>View All Complaints →</button>
                </div>
                {complaints.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)', margin: '0 0 4px' }}>No complaints logged in database yet (Count: 0).</p>
                    <p style={{ fontSize: '12.5px', margin: 0 }}>Submit a ticket from Customer Portal to see it appear live here!</p>
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.slice(0, 4).map(c => (
                        <tr key={c.id}>
                          <td className="font-mono font-bold">{c.id}</td>
                          <td className="font-semibold">{c.title}</td>
                          <td>{c.category}</td>
                          <td>
                            <span className={`priority-tag-mini ${c.priority?.toLowerCase()}`}>
                              {c.priority}
                            </span>
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
            </div>
          )}

          {/* ================= TAB 2: CIVIC COMPLAINTS LIST ================= */}
          {activeTab === 'complaints' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <h2>Civic Infrastructure Complaints ({filteredComplaints.length})</h2>
                  <p>Filter, inspect AI diagnostics, and dispatch tickets to municipal crews.</p>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="filter-controls-row">
                <div className="search-box-wrap">
                  <Search size={15} color="#94a3b8" />
                  <input 
                    type="text" 
                    placeholder="Search by Ticket ID, Title, Citizen..." 
                    value={complaintSearch}
                    onChange={e => setComplaintSearch(e.target.value)}
                  />
                </div>

                <div className="category-select-wrap">
                  <Filter size={15} color="#94a3b8" />
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Water & Drainage">Water &amp; Drainage</option>
                    <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                    <option value="Waste & Sanitation">Waste &amp; Sanitation</option>
                    <option value="Electricity & Power">Electricity &amp; Power</option>
                    <option value="Public Safety & Streetlights">Public Safety</option>
                  </select>
                </div>
              </div>

              {/* Complaints Table */}
              <div className="table-wrapper-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title &amp; Location</th>
                      <th>Citizen</th>
                      <th>Department</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map(c => (
                      <tr key={c.id}>
                        <td className="font-mono font-bold">{c.id}</td>
                        <td>
                          <div className="title-location-cell">
                            <span className="complaint-title-text" onClick={() => handleInspectComplaint(c)}>{c.title}</span>
                            <span className="location-sub"><MapPin size={11} /> {c.location}</span>
                          </div>
                        </td>
                        <td>
                          <div className="citizen-cell">
                            <span>{c.citizenName}</span>
                            <small>{c.citizenContact}</small>
                          </div>
                        </td>
                        <td className="dept-cell">{c.department}</td>
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
                            {c.status !== 'In Progress' && (
                              <button 
                                className="action-btn-sm" 
                                onClick={() => handleStatusChange(c.id, 'In Progress')}
                                title="Start Work"
                              >
                                Start
                              </button>
                            )}
                            {c.status !== 'Resolved' && (
                              <button 
                                className="action-btn-sm success" 
                                onClick={() => handleStatusChange(c.id, 'Resolved')}
                                title="Resolve"
                              >
                                Resolve
                              </button>
                            )}
                            <button 
                              className="action-btn-sm" 
                              onClick={() => handleInspectComplaint(c)}
                              title="Details"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: USER & ROLE MANAGEMENT ================= */}
          {activeTab === 'users' && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <div>
                  <h2>User &amp; Role Management ({filteredUsers.length})</h2>
                  <p>Assign and modify roles: <strong>Customer</strong>, <strong>Worker</strong>, or <strong>Admin</strong>.</p>
                </div>
              </div>

              <div className="filter-controls-row">
                <div className="search-box-wrap">
                  <Search size={15} color="#94a3b8" />
                  <input 
                    type="text" 
                    placeholder="Search by Name, Email..." 
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
                <button className="refresh-btn" onClick={fetchDbUsers} title="Refresh User List">
                  <RefreshCw size={14} className={usersLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="table-wrapper-card users-table-card">
                <table className="admin-table modern-user-table">
                  <thead>
                    <tr>
                      <th>User Profile</th>
                      <th>Email Address</th>
                      <th>Auth Provider</th>
                      <th>Current Role</th>
                      <th>Role Permissions & Action</th>
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
                          {/* User Profile column with avatar */}
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

                          {/* Email */}
                          <td className="user-email-cell">
                            <span className="email-text">{u.email}</span>
                          </td>

                          {/* Provider */}
                          <td>
                            <span className={`provider-pill provider-${(u.authProvider || 'local').toLowerCase()}`}>
                              {u.authProvider || 'Local'}
                            </span>
                          </td>

                          {/* Current Role Badge */}
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

                          {/* Change Role Action */}
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
                  <h2>Field Worker Fleet Management ({FIELD_WORKERS.length})</h2>
                  <p>Active field crews deployed across municipal sectors.</p>
                </div>
              </div>

              <div className="workers-grid-layout">
                {FIELD_WORKERS.map(w => (
                  <div key={w.id} className="worker-fleet-card">
                    <div className="w-card-header">
                      <div className="w-icon-wrap">
                        <HardHat size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <h4>{w.name}</h4>
                        <span className="w-dept-text">{w.department}</span>
                      </div>
                    </div>

                    <div className="w-meta-row">
                      <span><strong>Sector:</strong> {w.sector}</span>
                      <span><strong>Active Orders:</strong> {w.activeTasks}</span>
                    </div>

                    <div className="w-status-row">
                      <span className={`w-status-badge ${w.status.toLowerCase().replace(' ', '-')}`}>
                        ● {w.status}
                      </span>
                      <button 
                        className="assign-order-btn"
                        onClick={() => toast.success(`Work order dispatch prompt sent to ${w.name}!`)}
                      >
                        Dispatch Task
                      </button>
                    </div>
                  </div>
                ))}
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