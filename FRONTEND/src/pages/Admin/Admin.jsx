import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
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
  Server
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
  Cell,
  BarChart,
  Bar,
  Legend
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

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filteredTransactions = initialTransactions.filter((tx) => 
    tx.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-layout-container">
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
                <span className="nav-count">1.4k</span>
              </button>

              <button 
                className={`sidebar-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={18} />
                <span>Products & Stock</span>
                <span className="nav-count">389</span>
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
              <h1>Admin Control Center</h1>
              <p>Welcome back, <b>{user?.name || 'Administrator'}</b>. Here is your system performance summary.</p>
            </div>
            <div className="admin-actions-col">
              <button 
                className="btn-sharp"
                onClick={() => alert("Exporting system analytics CSV...")}
              >
                <Download size={15} />
                <span>Export Report</span>
              </button>
              <button 
                className="btn-sharp primary"
                onClick={() => alert("Quick Action triggered")}
              >
                <Plus size={15} />
                <span>Create Entry</span>
              </button>
            </div>
          </div>

          {/* ================= 3. 4 SHARP STAT CARDS ================= */}
          <div className="stats-grid-4">
            {/* Stat 1: Revenue */}
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

            {/* Stat 2: Users */}
            <div className="stat-card-sharp">
              <div className="stat-info-left">
                <span className="stat-title">Total Users</span>
                <span className="stat-value">1,428</span>
                <span className="stat-badge-sharp green">
                  <ArrowUpRight size={14} /> +12.8% growth
                </span>
              </div>
              <div className="stat-icon-wrapper users">
                <Users size={22} />
              </div>
            </div>

            {/* Stat 3: Orders */}
            <div className="stat-card-sharp">
              <div className="stat-info-left">
                <span className="stat-title">Active Orders</span>
                <span className="stat-value">389</span>
                <span className="stat-badge-sharp blue">
                  <ArrowUpRight size={14} /> +6.2% active
                </span>
              </div>
              <div className="stat-icon-wrapper orders">
                <ShoppingBag size={22} />
              </div>
            </div>

            {/* Stat 4: System Health */}
            <div className="stat-card-sharp">
              <div className="stat-info-left">
                <span className="stat-title">System Status</span>
                <span className="stat-value">Healthy</span>
                <span className="stat-badge-sharp green">
                  <ShieldCheck size={14} /> 0 Server alerts
                </span>
              </div>
              <div className="stat-icon-wrapper growth">
                <Server size={22} />
              </div>
            </div>
          </div>

          {/* ================= 4. ANALYTICS & RECHARTS ================= */}
          <div className="charts-grid-2">
            
            {/* Revenue Analytics Chart */}
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

            {/* Traffic Distribution Donut Chart */}
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

          {/* ================= 5. RECENT ACTIVITY & TRANSACTIONS TABLE ================= */}
          <div className="table-card-sharp">
            <div className="table-header-row">
              <h3>Recent System Transactions</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
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
                      <td>
                        <button className="action-btn-sharp" onClick={() => alert(`Viewing details for ${tx.id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Admin;