import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  ClipboardList,
  BarChart3, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  Lock,
  UserCheck,
  UserX,
  RefreshCw,
  Package,
  XCircle,
  Check,
  RotateCcw
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

// --- Sample Chart Datasets ---
const monthlyRevenueData = [
  { month: 'Jan', revenue: 4200, orders: 240 },
  { month: 'Feb', revenue: 5800, orders: 320 },
  { month: 'Mar', revenue: 5100, orders: 290 },
  { month: 'Apr', revenue: 7400, orders: 410 },
  { month: 'May', revenue: 8900, orders: 490 },
  { month: 'Jun', revenue: 8200, orders: 450 },
  { month: 'Jul', revenue: 9800, orders: 560 },
  { month: 'Aug', revenue: 11200, orders: 630 },
  { month: 'Sep', revenue: 10400, orders: 590 },
  { month: 'Oct', revenue: 12800, orders: 710 },
  { month: 'Nov', revenue: 14200, orders: 790 },
  { month: 'Dec', revenue: 16500, orders: 880 },
];

const trafficDeviceData = [
  { name: 'Desktop', value: 58, color: '#ff4b2b' },
  { name: 'Mobile', value: 32, color: '#3b82f6' },
  { name: 'Tablet', value: 10, color: '#10b981' }
];

// --- Sample Table Transactions ---
const initialTransactions = [
  { id: '#TRX-9481', user: 'Hamza Khan', email: 'hamza@example.com', role: 'user', action: 'Pro Subscription', amount: '$49.00', status: 'completed', date: '27 Aug 2026' },
  { id: '#TRX-9482', user: 'Sarah Ahmed', email: 'sarah@example.com', role: 'user', action: 'Cloud Storage 50GB', amount: '$15.00', status: 'completed', date: '27 Aug 2026' },
  { id: '#TRX-9483', user: 'Bilal Tariq', email: 'bilal@example.com', role: 'user', action: 'API Credits 10k', amount: '$99.00', status: 'pending', date: '26 Aug 2026' },
  { id: '#TRX-9484', user: 'Ayesha Noor', email: 'ayesha@example.com', role: 'user', action: 'Domain Purchase', amount: '$12.00', status: 'completed', date: '26 Aug 2026' },
  { id: '#TRX-9485', user: 'Zain Malik', email: 'zain@example.com', role: 'user', action: 'Custom Integration', amount: '$250.00', status: 'failed', date: '25 Aug 2026' },
];

// --- Sample Initial Product Requests / Orders Dataset ---
const initialOrders = [
  {
    id: '#REQ-7801',
    userName: 'Hamza Khan',
    userEmail: 'hamza@example.com',
    productName: 'MacBook Pro M3 Max 16"',
    category: 'Electronics',
    quantity: 1,
    price: '$2,499.00',
    status: 'pending', // 'pending' | 'received' | 'rejected'
    date: '27 Aug 2026'
  },
  {
    id: '#REQ-7802',
    userName: 'Sarah Ahmed',
    userEmail: 'sarah@example.com',
    productName: 'Ergonomic Standing Desk',
    category: 'Furniture',
    quantity: 2,
    price: '$480.00',
    status: 'received',
    date: '26 Aug 2026'
  },
  {
    id: '#REQ-7803',
    userName: 'Bilal Tariq',
    userEmail: 'bilal@example.com',
    productName: 'Sony WH-1000XM5 Headphones',
    category: 'Audio',
    quantity: 1,
    price: '$349.00',
    status: 'rejected',
    date: '25 Aug 2026'
  },
  {
    id: '#REQ-7804',
    userName: 'Ayesha Noor',
    userEmail: 'ayesha@example.com',
    productName: '4K Ultra HD Gaming Monitor 27"',
    category: 'Displays',
    quantity: 1,
    price: '$599.00',
    status: 'pending',
    date: '25 Aug 2026'
  },
  {
    id: '#REQ-7805',
    userName: 'Zain Malik',
    userEmail: 'zain@example.com',
    productName: 'Keychron Q1 Pro Mechanical Keyboard',
    category: 'Accessories',
    quantity: 3,
    price: '$220.00',
    status: 'received',
    date: '24 Aug 2026'
  }
];

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersSearch, setUsersSearch] = useState('');

  // Live Database Users State
  const [dbUsers, setDbUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Orders / Product Requests State (Modular UI state ready for hackathon)
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all');
  const [ordersSearch, setOrdersSearch] = useState('');

  const isSuperAdmin = user?.email?.toLowerCase() === 'admin@gmail.com';

  // Fetch all users from MongoDB API
  const fetchDbUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setDbUsers(res.data.users);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users from database');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  // Handle Role Change with SweetAlert2
  const handleRoleChange = (targetUser, newRole) => {
    if (!isSuperAdmin) {
      return toast.error('Access Denied: Only Super Admin (admin@gmail.com) can modify roles!');
    }

    if (targetUser.email.toLowerCase() === 'admin@gmail.com') {
      return toast.error('Super Admin role is permanently locked and cannot be changed!');
    }

    Swal.fire({
      title: `Change Role to ${newRole.toUpperCase()}?`,
      text: `Are you sure you want to change ${targetUser.name}'s role to ${newRole.toUpperCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff4b2b',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, Make ${newRole.toUpperCase()}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await API.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
          if (res.data.success) {
            toast.success(res.data.message);
            fetchDbUsers();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update role');
        }
      }
    });
  };

  // Handle Order / Request Status Update with SweetAlert2
  const handleOrderStatusChange = (orderId, newStatus) => {
    const statusText = newStatus === 'received' ? 'RECEIVED / APPROVED' : newStatus === 'rejected' ? 'REJECTED' : 'PENDING';
    
    Swal.fire({
      title: `Mark as ${statusText}?`,
      text: `Update status for Request ${orderId}?`,
      icon: newStatus === 'received' ? 'success' : newStatus === 'rejected' ? 'warning' : 'info',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'received' ? '#16a34a' : newStatus === 'rejected' ? '#dc2626' : '#eab308',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, Set ${newStatus.toUpperCase()}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        setOrdersList((prev) => 
          prev.map((ord) => ord.id === orderId ? { ...ord, status: newStatus } : ord)
        );
        toast.success(`Request ${orderId} marked as ${newStatus.toUpperCase()}!`);
      }
    });
  };

  // Filter live database users
  const filteredDbUsers = dbUsers.filter((u) => 
    u.name?.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.cnic?.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(usersSearch.toLowerCase())
  );

  // Filter orders by status & search
  const filteredOrders = ordersList.filter((ord) => {
    const matchesStatus = ordersStatusFilter === 'all' || ord.status === ordersStatusFilter;
    const matchesSearch = 
      ord.id.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      ord.userName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      ord.userEmail.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      ord.productName.toLowerCase().includes(ordersSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingOrdersCount = ordersList.filter((o) => o.status === 'pending').length;
  const receivedOrdersCount = ordersList.filter((o) => o.status === 'received').length;
  const rejectedOrdersCount = ordersList.filter((o) => o.status === 'rejected').length;

  return (
    <div className="admin-layout-container">
      <Toaster position="top-right" />
      
      {/* Top Navbar */}
      <Navbar />

      <div className="admin-main-body">
        
        {/* ================= 1. SHARP DESKTOP SIDEBAR ================= */}
        <aside className="admin-sidebar">
          <div>
            <div className="sidebar-section-title">Navigation</div>
            <div className="sidebar-nav-list">
              <button 
                className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard Overview</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <Users size={18} />
                <span>Users Management</span>
                <span className="nav-count">{dbUsers.length}</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ClipboardList size={18} />
                <span>Product Requests</span>
                <span className="nav-count" style={{ background: pendingOrdersCount > 0 ? '#eab308' : 'rgba(255,255,255,0.15)', color: '#fff' }}>
                  {ordersList.length}
                </span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 size={18} />
                <span>Analytics & Reports</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={18} />
                <span>System Settings</span>
              </button>
            </div>
          </div>

          {/* System Health Box */}
          <div className="sidebar-footer-box">
            <div className="health-header">
              <span>Server Uptime</span>
              <span className="health-dot" />
            </div>
            <div className="health-bar-container">
              <div className="health-bar-fill" />
            </div>
            <div className="health-text">99.98% Operational (Node + Mongo)</div>
          </div>
        </aside>

        {/* ================= 2. MAIN ADMIN CONTENT ================= */}
        <main className="admin-content-area">
          
          {/* Header Row */}
          <div className="admin-header-row">
            <div className="admin-title-col">
              <h1>
                {activeTab === 'overview' && 'Admin Control Center'}
                {activeTab === 'users' && 'Users Directory & Role Control'}
                {activeTab === 'orders' && 'Product Requests & Order Status'}
                {activeTab === 'analytics' && 'System Analytics & Insights'}
                {activeTab === 'settings' && 'Global System Settings'}
              </h1>
              <p>
                Logged in as <b>{user?.name || 'Administrator'}</b> ({user?.email}) — {isSuperAdmin ? '👑 Super Admin Authority' : 'Standard Admin Access'}
              </p>
            </div>
            <div className="admin-actions-col">
              <button 
                className="btn-sharp"
                onClick={fetchDbUsers}
                title="Refresh Live Data"
              >
                <RefreshCw size={15} className={usersLoading ? 'animate-spin' : ''} />
                <span>Sync DB</span>
              </button>
              <button 
                className="btn-sharp primary"
                onClick={() => setActiveTab('orders')}
              >
                <ClipboardList size={15} />
                <span>Manage {ordersList.length} Requests</span>
              </button>
            </div>
          </div>

          {/* ================= TAB 1: DASHBOARD OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Sharp Stat Cards */}
              <div className="stats-grid-4">
                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">Total Revenue</span>
                    <span className="stat-value">$84,650.00</span>
                    <span className="stat-badge-sharp green">
                      <ArrowUpRight size={14} /> +18.4% vs last month
                    </span>
                  </div>
                  <div className="stat-icon-wrapper revenue">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">Registered Users</span>
                    <span className="stat-value">{dbUsers.length}</span>
                    <span className="stat-badge-sharp green">
                      <ArrowUpRight size={14} /> Live in MongoDB
                    </span>
                  </div>
                  <div className="stat-icon-wrapper users">
                    <Users size={22} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">Pending Requests</span>
                    <span className="stat-value">{pendingOrdersCount}</span>
                    <span className="stat-badge-sharp" style={{ background: '#fef9c3', color: '#854d0e' }}>
                      <Clock size={14} /> Needs Action
                    </span>
                  </div>
                  <div className="stat-icon-wrapper orders">
                    <ClipboardList size={22} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">System Status</span>
                    <span className="stat-value">Healthy</span>
                    <span className="stat-badge-sharp green">
                      <ShieldCheck size={14} /> 0 Alerts
                    </span>
                  </div>
                  <div className="stat-icon-wrapper growth">
                    <Server size={22} />
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="charts-grid-2">
                <div className="chart-card-sharp">
                  <div className="chart-header">
                    <h3>Revenue Growth & Order Volume</h3>
                    <div className="chart-legend-sharp">
                      <span><span className="legend-dot" style={{ background: 'var(--primary-color)' }}></span> Revenue ($)</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff4b2b" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ff4b2b" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#ff4b2b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card-sharp">
                  <div className="chart-header">
                    <h3>User Device Breakdown</h3>
                  </div>
                  <div style={{ width: '100%', height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficDeviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {trafficDeviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: '#64748b', marginTop: '10px' }}>
                    {trafficDeviceData.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', background: item.color, display: 'inline-block', borderRadius: '2px' }}></span>
                        <b>{item.name}:</b> {item.value}%
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="table-card-sharp">
                <div className="table-header-row">
                  <h3>Recent System Transactions</h3>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px' }}>
                    <Search size={14} color="#64748b" style={{ marginRight: '6px' }} />
                    <input 
                      type="text" 
                      placeholder="Search transactions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'var(--font-family)' }}
                    />
                  </div>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="sharp-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{tx.id}</td>
                          <td>
                            <div className="user-cell-sharp">
                              <div className="user-avatar-sharp">
                                {tx.user.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600' }}>{tx.user}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>{tx.action}</td>
                          <td style={{ fontWeight: '700' }}>{tx.amount}</td>
                          <td>
                            <span className={`status-tag-sharp ${tx.status}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '12px' }}>{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ================= TAB 2: USERS MANAGEMENT ================= */}
          {activeTab === 'users' && (
            <div className="table-card-sharp">
              <div className="table-header-row">
                <div>
                  <h3>Registered Users in MongoDB ({filteredDbUsers.length})</h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0' }}>
                    {isSuperAdmin ? '👑 You have Super Admin rights to promote or demote roles.' : '🔒 Role editing is restricted to Super Admin (admin@gmail.com).'}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '7px 14px', borderRadius: '4px' }}>
                    <Search size={14} color="#64748b" style={{ marginRight: '8px' }} />
                    <input 
                      type="text" 
                      placeholder="Search by Name, Email, CNIC..." 
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12.5px', fontFamily: 'var(--font-family)', width: '220px' }}
                    />
                  </div>
                </div>
              </div>

              {usersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  Loading users from database...
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <table className="sharp-table">
                    <thead>
                      <tr>
                        <th>User Profile</th>
                        <th>Email</th>
                        <th>DOB</th>
                        <th>CNIC</th>
                        <th>Provider</th>
                        <th>Current Role</th>
                        <th>Role Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDbUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No users found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredDbUsers.map((u) => {
                          const isTargetSuperAdmin = u.email?.toLowerCase() === 'admin@gmail.com';

                          return (
                            <tr key={u._id}>
                              <td>
                                <div className="user-cell-sharp">
                                  {u.profilePic ? (
                                    <img src={u.profilePic} alt="" className="user-avatar-sharp" style={{ objectFit: 'cover' }} />
                                  ) : (
                                    <div className="user-avatar-sharp">
                                      {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ID: {u._id.slice(-6)}</div>
                                  </div>
                                </div>
                              </td>

                              <td style={{ fontWeight: '500' }}>{u.email}</td>
                              <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                                {u.dob ? new Date(u.dob).toLocaleDateString() : 'N/A'}
                              </td>
                              <td style={{ fontSize: '12.5px', color: '#64748b' }}>{u.cnic || 'N/A'}</td>
                              
                              <td>
                                <span style={{ textTransform: 'capitalize', fontSize: '11.5px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '2px', fontWeight: '600' }}>
                                  {u.authProvider || 'local'}
                                </span>
                              </td>

                              <td>
                                {isTargetSuperAdmin ? (
                                  <span className="status-tag-sharp" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                                    👑 Super Admin
                                  </span>
                                ) : (
                                  <span className={`status-tag-sharp ${u.role === 'admin' ? 'completed' : 'pending'}`}>
                                    {u.role?.toUpperCase() || 'USER'}
                                  </span>
                                )}
                              </td>

                              {/* Super Admin Role Control */}
                              <td>
                                {isTargetSuperAdmin ? (
                                  <span style={{ fontSize: '11px', color: '#92400e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Lock size={12} /> Permanent Locked
                                  </span>
                                ) : isSuperAdmin ? (
                                  u.role === 'admin' ? (
                                    <button 
                                      className="action-btn-sharp" 
                                      onClick={() => handleRoleChange(u, 'user')}
                                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                      title="Demote to standard user"
                                    >
                                      Demote to User
                                    </button>
                                  ) : (
                                    <button 
                                      className="action-btn-sharp" 
                                      onClick={() => handleRoleChange(u, 'admin')}
                                      style={{ color: '#16a34a', borderColor: '#86efac' }}
                                      title="Promote to Admin"
                                    >
                                      Promote to Admin
                                    </button>
                                  )
                                ) : (
                                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                                    Read-only
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: PRODUCT REQUESTS & ORDERS ================= */}
          {activeTab === 'orders' && (
            <div>
              {/* Top Mini Stat Row for Orders */}
              <div className="stats-grid-4" style={{ marginBottom: '20px' }}>
                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">All Requests</span>
                    <span className="stat-value">{ordersList.length}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
                    <ClipboardList size={20} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">🟡 Pending</span>
                    <span className="stat-value">{pendingOrdersCount}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#fef9c3', color: '#854d0e' }}>
                    <Clock size={20} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">🟢 Received / Done</span>
                    <span className="stat-value">{receivedOrdersCount}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#166534' }}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="stat-card-sharp">
                  <div className="stat-info-left">
                    <span className="stat-title">🔴 Rejected</span>
                    <span className="stat-value">{rejectedOrdersCount}</span>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#991b1b' }}>
                    <XCircle size={20} />
                  </div>
                </div>
              </div>

              {/* Main Orders Table Card */}
              <div className="table-card-sharp">
                <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '15px' }}>
                  
                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      className={`btn-sharp ${ordersStatusFilter === 'all' ? 'primary' : ''}`}
                      onClick={() => setOrdersStatusFilter('all')}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      All ({ordersList.length})
                    </button>
                    <button 
                      className={`btn-sharp ${ordersStatusFilter === 'pending' ? 'primary' : ''}`}
                      onClick={() => setOrdersStatusFilter('pending')}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Pending ({pendingOrdersCount})
                    </button>
                    <button 
                      className={`btn-sharp ${ordersStatusFilter === 'received' ? 'primary' : ''}`}
                      onClick={() => setOrdersStatusFilter('received')}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Received ({receivedOrdersCount})
                    </button>
                    <button 
                      className={`btn-sharp ${ordersStatusFilter === 'rejected' ? 'primary' : ''}`}
                      onClick={() => setOrdersStatusFilter('rejected')}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Rejected ({rejectedOrdersCount})
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px' }}>
                    <Search size={14} color="#64748b" style={{ marginRight: '8px' }} />
                    <input 
                      type="text" 
                      placeholder="Search by User, Item, ID..." 
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'var(--font-family)', width: '180px' }}
                    />
                  </div>

                </div>

                <div className="table-responsive-wrapper">
                  <table className="sharp-table">
                    <thead>
                      <tr>
                        <th>Req ID</th>
                        <th>User (Applicant/Buyer)</th>
                        <th>Product / Item Requested</th>
                        <th>Qty & Total</th>
                        <th>Date</th>
                        <th>Current Status</th>
                        <th>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No requests found matching the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr key={ord.id}>
                            <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{ord.id}</td>
                            
                            {/* User Info */}
                            <td>
                              <div className="user-cell-sharp">
                                <div className="user-avatar-sharp">
                                  {ord.userName.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: '600' }}>{ord.userName}</div>
                                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ord.userEmail}</div>
                                </div>
                              </div>
                            </td>

                            {/* Product Info */}
                            <td>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{ord.productName}</div>
                              <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '2px' }}>
                                {ord.category}
                              </span>
                            </td>

                            {/* Qty & Price */}
                            <td>
                              <div style={{ fontWeight: '700' }}>{ord.price}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>Qty: {ord.quantity}</div>
                            </td>

                            {/* Date */}
                            <td style={{ color: '#64748b', fontSize: '12px' }}>{ord.date}</td>

                            {/* Status Tag */}
                            <td>
                              {ord.status === 'pending' && (
                                <span className="status-tag-sharp pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} /> Pending
                                </span>
                              )}
                              {ord.status === 'received' && (
                                <span className="status-tag-sharp completed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckCircle2 size={11} /> Received
                                </span>
                              )}
                              {ord.status === 'rejected' && (
                                <span className="status-tag-sharp failed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <XCircle size={11} /> Rejected
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {ord.status !== 'received' && (
                                  <button 
                                    className="action-btn-sharp"
                                    onClick={() => handleOrderStatusChange(ord.id, 'received')}
                                    style={{ color: '#16a34a', borderColor: '#86efac' }}
                                    title="Mark as Received / Approved"
                                  >
                                    <Check size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Receive
                                  </button>
                                )}

                                {ord.status !== 'rejected' && (
                                  <button 
                                    className="action-btn-sharp"
                                    onClick={() => handleOrderStatusChange(ord.id, 'rejected')}
                                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                    title="Reject Request"
                                  >
                                    <XCircle size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reject
                                  </button>
                                )}

                                {ord.status !== 'pending' && (
                                  <button 
                                    className="action-btn-sharp"
                                    onClick={() => handleOrderStatusChange(ord.id, 'pending')}
                                    style={{ color: '#d97706', borderColor: '#fde68a' }}
                                    title="Reset to Pending"
                                  >
                                    <RotateCcw size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Reset
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="table-card-sharp">
              <div className="table-header-row">
                <h3>Advanced System Analytics & Logs</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', padding: '20px 0' }}>
                📈 Real-time metrics, server response times, and API usage analytics.
              </p>
            </div>
          )}

          {/* ================= TAB 5: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="table-card-sharp">
              <div className="table-header-row">
                <h3>Admin & Security Settings</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '14px', padding: '20px 0' }}>
                ⚙️ Configure CORS policies, JWT expirations, and Cloudinary storage settings.
              </p>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Admin;