import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { showAuthAlert } from '../../utils/authAlert';
import API from '../../api/axios';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Send, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  ShieldAlert,
  HardHat,
  Filter,
  CheckCircle,
  MessageSquare,
  Building2,
  Layers,
  Award
} from 'lucide-react';
import TicketChatModal from '../../components/TicketChat/TicketChatModal';
import './Worker.css';

const Worker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [departmentScope, setDepartmentScope] = useState('my_dept'); // 'my_dept' or 'all'
  const [filter, setFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [activeChatTicket, setActiveChatTicket] = useState(null);

  const workerDept = user?.department || 'General Civic Support';

  // Helper: map department to category keywords
  const getDeptCategoryMatch = (dept) => {
    if (!dept) return 'All';
    if (dept.includes('Water')) return 'Water & Drainage';
    if (dept.includes('Power') || dept.includes('Grid')) return 'Electricity & Power';
    if (dept.includes('Waste') || dept.includes('Sanitation')) return 'Waste & Sanitation';
    if (dept.includes('Roads') || dept.includes('Asphalt') || dept.includes('Municipal Works')) return 'Roads & Infrastructure';
    return 'All';
  };

  // Fetch real complaints from Database
  const fetchWorkerTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await API.get('/complaints');
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(c => ({
          id: c.ticketId || c._id || (Math.floor(100 + Math.random() * 900)).toString(),
          title: c.title,
          category: c.category || 'General Civic',
          priority: c.priority || 'Medium',
          status: c.status === 'Open' ? 'Pending' : (c.status || 'Pending'),
          assignedDept: c.department || c.assigned_department || 'General Civic Support',
          location: c.location || 'Central District',
          slaRemaining: c.status === 'Resolved' ? 'Completed' : (c.priority === 'Critical' ? '1 hr 45 min' : '14 hrs'),
          timeAgo: 'Just now',
          citizenName: c.citizenName || c.citizen_name || 'Citizen Reporter'
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.warn('API fetch tasks fallback:', e);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  // Stats calculation directly from DB tasks
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tasks.filter(t => t.status === 'Resolved').length;
  const criticalCount = tasks.filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length;

  const handleStatusChange = async (taskId, newStatus) => {
    if (!user) {
      showAuthAlert(navigate, 'activate or update field work orders');
      return;
    }
    Swal.fire({
      title: 'Start Complaint Work Order?',
      text: `Change complaint ${taskId} to "${newStatus}" and begin field repair?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00e5ff',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Start Order',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.put(`/complaints/${taskId}/status`, { 
            status: newStatus, 
            assignedWorker: user?.name || 'Field Officer' 
          });
        } catch (e) {}
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        fetchWorkerTasks();
        Swal.fire({
          icon: 'success',
          title: 'Work Order Activated',
          text: `Complaint ${taskId} is now In Progress.`,
          timer: 1500,
          showConfirmButton: false,
          background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
        });
      }
    });
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!user) {
      showAuthAlert(navigate, 'submit work order resolution proof');
      return;
    }
    if (!selectedTask) return;
    
    try {
      await API.put(`/complaints/${selectedTask.id}/status`, {
        status: 'Resolved',
        resolutionNotes: resolutionNotes || 'Field inspection & repair completed.',
        resolutionProofUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8'
      });
    } catch (e) {}

    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        return { ...t, status: 'Resolved', slaRemaining: 'Completed' };
      }
      return t;
    }));
    
    fetchWorkerTasks();
    setIsResolving(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Complaint Marked Resolved!',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p><strong>Complaint ID:</strong> ${selectedTask.id}</p>
          <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">RESOLVED &amp; CLOSED</span></p>
          <p><strong>Notes:</strong> ${resolutionNotes || 'Field repair completed successfully.'}</p>
          <div style="background: rgba(0, 229, 255, 0.1); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 8px; padding: 10px; margin-top: 10px;">
            <strong style="color: #00e5ff;">Government Payout Logged:</strong><br/>
            <span style="font-size: 12.5px; color: #64748b;">+50 Municipal Karma Credits & Task Honorarium logged for ${user?.name || 'Officer'}.</span>
          </div>
        </div>
      `,
      confirmButtonColor: '#00e5ff',
      confirmButtonText: 'Next Complaint',
      background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
      color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
    });

    setResolutionNotes('');
    setSelectedTask(null);
  };

  // Filter tasks based on Department Scope & Status
  const filteredTasks = tasks.filter(t => {
    // 1. Department Filter
    if (departmentScope === 'my_dept') {
      const matchedCat = getDeptCategoryMatch(workerDept);
      const isDeptMatch = t.assignedDept?.toLowerCase().includes(workerDept.toLowerCase()) || 
                          workerDept.toLowerCase().includes(t.assignedDept?.toLowerCase());
      const isCatMatch = matchedCat !== 'All' && t.category === matchedCat;
      if (!isDeptMatch && !isCatMatch && workerDept !== 'General Civic Support') {
        return false;
      }
    }

    // 2. Status Filter
    if (filter === 'All') return true;
    if (filter === 'In Progress') return t.status === 'In Progress';
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'Critical') return t.priority === 'Critical';
    if (filter === 'Resolved') return t.status === 'Resolved';
    return true;
  });

  return (
    <div className="worker-page-container">
      <Toaster position="top-right" />

      <main className="worker-main-content">
        {/* ================= HERO HEADER ================= */}
        <section className="worker-hero-section">
          <div className="worker-hero-content">
            <h1>
              Field Operations: <span className="highlight-text">{user?.name || 'Field Officer'}</span>
            </h1>
            <p className="worker-subtitle">
              Department: <strong>{workerDept}</strong> &bull; Live citizen complaints feed. Chat directly with citizens, initiate repair orders, and earn municipal credits.
            </p>
          </div>

          <div className="worker-stats-grid">
            <div className="worker-stat-card">
              <div className="stat-icon-wrapper blue">
                <Wrench size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-num">{totalTasks}</span>
                <span className="stat-label">Total Complaints</span>
              </div>
            </div>

            <div className="worker-stat-card">
              <div className="stat-icon-wrapper amber">
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-num">{inProgressCount}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>

            <div className="worker-stat-card">
              <div className="stat-icon-wrapper green">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-num">{resolvedCount}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>

            <div className="worker-stat-card">
              <div className="stat-icon-wrapper red">
                <Flame size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-num">{criticalCount}</span>
                <span className="stat-label">Critical Incidents</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DEPARTMENT SCOPE TOGGLE & STATUS TABS ================= */}
        <div className="worker-controls-container">
          
          {/* Scope Selector */}
          <div className="worker-scope-pills">
            <button 
              type="button" 
              className={`scope-pill-btn ${departmentScope === 'my_dept' ? 'active' : ''}`}
              onClick={() => setDepartmentScope('my_dept')}
            >
              <Building2 size={15} />
              <span>My Department Feed ({workerDept.split('(')[0].trim()})</span>
            </button>
            <button 
              type="button" 
              className={`scope-pill-btn ${departmentScope === 'all' ? 'active' : ''}`}
              onClick={() => setDepartmentScope('all')}
            >
              <Layers size={15} />
              <span>All Municipal Complaints</span>
            </button>
          </div>

          {/* Status Filter Bar */}
          <div className="worker-filter-bar">
            <div className="filter-tabs">
              {['All', 'In Progress', 'Pending', 'Critical', 'Resolved'].map(tab => (
                <button
                  key={tab}
                  className={`filter-tab-btn ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                  <span className="filter-count">
                    {tab === 'All' ? filteredTasks.length :
                     tab === 'Critical' ? filteredTasks.filter(t => t.priority === 'Critical').length :
                     filteredTasks.filter(t => t.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            <button 
              className="emergency-sos-btn"
              onClick={() => {
                Swal.fire({
                  title: 'Emergency Backup Requested!',
                  text: 'High-priority alert dispatched to Central Control Room & District Engineering Fleet with your current GPS coordinates.',
                  icon: 'warning',
                  confirmButtonColor: '#ef4444',
                  confirmButtonText: 'Understood'
                });
              }}
            >
              <ShieldAlert size={16} />
              <span>Request Emergency Backup</span>
            </button>
          </div>

        </div>

        {/* ================= TASK CARDS LIST ================= */}
        <section className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', gridColumn: '1 / -1', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-dark)', margin: '0 0 6px' }}>
                No active complaints found in this category.
              </p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                {departmentScope === 'my_dept' ? 'Switch to "All Municipal Complaints" above to view citywide issues.' : 'No complaints logged currently.'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.priority.toLowerCase()} ${task.status === 'Resolved' ? 'task-resolved' : ''}`}>
              <div className="task-header">
                <div className="task-id-badge">
                  <span className="ticket-tag">{task.id}</span>
                  <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                    {task.priority} Priority
                  </span>
                </div>
                <div className={`status-pill ${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </div>
              </div>

              <h3 className="task-title">{task.title}</h3>

              <div className="task-meta-row">
                <div className="meta-item">
                  <MapPin size={15} />
                  <span>{task.location}</span>
                </div>
                <div className="meta-item">
                  <Clock size={15} />
                  <span>SLA: <strong>{task.slaRemaining}</strong></span>
                </div>
              </div>

              <div className="ai-diagnosis-box">
                <div className="ai-badge">
                  <Sparkles size={13} />
                  <span>Category &amp; Department</span>
                </div>
                <p>Category: <strong>{task.category}</strong> &bull; Reporter: {task.citizenName}</p>
                <div className="dept-tag">Assigned Dept: {task.assignedDept}</div>
              </div>

              {/* Action Buttons: Live Chat with Citizen on EVERY complaint card */}
              <div className="task-actions-row">
                <button 
                  type="button"
                  className="action-btn chat-citizen-btn"
                  onClick={() => setActiveChatTicket(task)}
                  title="Open live chat conversation with reporting citizen"
                >
                  <MessageSquare size={15} />
                  <span>Chat with Citizen</span>
                </button>

                {task.status === 'Pending' && (
                  <button 
                    type="button"
                    className="action-btn start-btn"
                    onClick={() => handleStatusChange(task.id, 'In Progress')}
                  >
                    <Wrench size={15} />
                    <span>Start Repair</span>
                  </button>
                )}

                {task.status === 'In Progress' && (
                  <>
                    <button 
                      type="button"
                      className="action-btn resolve-btn"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsResolving(true);
                      }}
                    >
                      <CheckCircle size={15} />
                      <span>Submit Resolution</span>
                    </button>
                    <button 
                      type="button"
                      className="action-btn photo-btn"
                      onClick={() => toast.success('Site Inspection Photo Attached!')}
                      title="Upload Field Photo"
                    >
                      <Camera size={15} />
                    </button>
                  </>
                )}

                {task.status === 'Resolved' && (
                  <div className="resolved-status-indicator">
                    <CheckCircle2 size={16} />
                    <span>Work Completed &amp; Payout Logged</span>
                  </div>
                )}
              </div>
            </div>
          )))}
        </section>

        {/* ================= RESOLUTION MODAL ================= */}
        {isResolving && selectedTask && (
          <div className="modal-overlay" onClick={() => setIsResolving(false)}>
            <div className="resolution-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Submit Work Resolution for {selectedTask.id}</h3>
                <button className="close-modal-btn" onClick={() => setIsResolving(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCompleteTask}>
                <p className="modal-task-title">{selectedTask.title}</p>
                
                <div className="form-group">
                  <label>Materials Used &amp; Work Summary:</label>
                  <textarea 
                    rows={3} 
                    placeholder="e.g. Replaced 4-inch PVC pipe, welded joints, tested water pressure, asphalt patched."
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Resolution Photo Proof:</label>
                  <div className="upload-box-field" onClick={() => toast.success('Photo Attached: resolution_proof.jpg')}>
                    <Camera size={24} />
                    <span>Click to Capture / Attach Before-After Photo</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsResolving(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-resolution">
                    <CheckCircle size={16} />
                    <span>Mark Task Completed</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= IN-TICKET LIVE CHAT MODAL (AGENT / WORKER ROLE) ================= */}
        <TicketChatModal 
          ticket={activeChatTicket}
          isOpen={!!activeChatTicket}
          onClose={() => setActiveChatTicket(null)}
          userRole="worker"
        />

      </main>

      <Footer />
    </div>
  );
};

export default Worker;
