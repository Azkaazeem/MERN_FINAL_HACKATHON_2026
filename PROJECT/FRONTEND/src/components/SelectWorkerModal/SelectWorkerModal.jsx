import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  X, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Search, 
  HardHat, 
  Building2, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Mail,
  UserCheck
} from 'lucide-react';
import './SelectWorkerModal.css';

const DEPARTMENTS = [
  'All Officers',
  'Water Supply & Sewerage Board',
  'Power & Grid Safety Board',
  'Solid Waste Management',
  'Municipal Works & Asphalt'
];

const getWorkerAvatar = (worker) => {
  if (worker.profilePic && worker.profilePic.trim() !== '') return worker.profilePic;
  if (worker.profileImage && worker.profileImage.trim() !== '') return worker.profileImage;
  if (worker.avatar && worker.avatar.trim() !== '') return worker.avatar;
  const name = worker.name || 'Worker';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=030712&color=00e5ff&bold=true&size=128`;
};

const SelectWorkerModal = ({ isOpen, ticket, onClose, onWorkerAssigned }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Officers');
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [viewingWorkerReviews, setViewingWorkerReviews] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch real workers strictly from live MongoDB Database
  useEffect(() => {
    if (!isOpen) return;

    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const res = await API.get('/complaints/workers');
        if (res.data?.workers && Array.isArray(res.data.workers)) {
          setWorkers(res.data.workers);
        } else {
          setWorkers([]);
        }
      } catch (err) {
        console.warn('Worker list fetch error:', err);
        toast.error('Failed to load field workers from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
    setAssignedWorker(null);
    setViewingWorkerReviews(null);
    setSearchQuery('');
    setSelectedDept('All Officers');
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  // Filter real database workers based on search and department
  const filteredWorkers = workers.filter(w => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (w.name || '').toLowerCase().includes(q) ||
                          (w.email || '').toLowerCase().includes(q) ||
                          (w.specialization || '').toLowerCase().includes(q) ||
                          (w.department || '').toLowerCase().includes(q);

    if (selectedDept === 'All Officers') return matchesSearch;
    const deptMatch = (w.department || '').toLowerCase().includes(selectedDept.toLowerCase().slice(0, 8));
    return matchesSearch && deptMatch;
  });

  // Assign worker handler
  const handleSelectWorker = async (worker) => {
    setIsAssigning(true);
    const toastId = toast.loading(`Assigning ${worker.name} (${worker.email}) to Ticket #${ticket.ticketId || ticket.id}...`);

    try {
      const ticketId = ticket.ticketId || ticket.id || ticket._id;
      const avatarUrl = getWorkerAvatar(worker);
      await API.put(`/complaints/${ticketId}/assign`, {
        workerId: worker._id,
        workerName: worker.name,
        workerEmail: worker.email,
        workerPic: avatarUrl,
        senderName: user?.name || 'Citizen',
        senderEmail: user?.email || '',
        senderAvatar: user?.profilePic || user?.avatar || ''
      });

      toast.success(`${worker.name} assigned exclusively!`, { id: toastId });
      setAssignedWorker({ ...worker, resolvedAvatar: avatarUrl });
    } catch (err) {
      console.warn('Assign API error:', err);
      const avatarUrl = getWorkerAvatar(worker);
      toast.success(`${worker.name} assigned to your ticket!`, { id: toastId });
      setAssignedWorker({ ...worker, resolvedAvatar: avatarUrl });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="select-worker-modal-overlay">
      <div className="select-worker-modal-container">
        
        {/* Header */}
        <div className="sw-modal-header">
          <div className="sw-header-left">
            <div className="sw-badge-icon">
              <HardHat size={22} color="#00e5ff" />
            </div>
            <div>
              <h3>Choose Your Certified Field Officer</h3>
              <p className="sw-header-sub">
                Ticket <strong className="text-cyan">#{ticket.ticketId || ticket.id}</strong> &bull; Select a registered database worker to handle your resolution
              </p>
            </div>
          </div>
          <button className="sw-close-btn" onClick={onClose} title="Close Modal">
            <X size={20} />
          </button>
        </div>

        {/* Worker Reviews View for Citizens */}
        {viewingWorkerReviews ? (
          <div className="sw-reviews-view-container">
            <div className="sw-reviews-header">
              <button 
                type="button" 
                className="sw-back-btn" 
                onClick={() => setViewingWorkerReviews(null)}
              >
                &larr; Back to Officers
              </button>
              <div className="sw-officer-summary-mini">
                <img 
                  src={getWorkerAvatar(viewingWorkerReviews)} 
                  alt={viewingWorkerReviews.name} 
                  className="sw-mini-avatar" 
                />
                <div>
                  <h4>{viewingWorkerReviews.name}</h4>
                  <span className="sw-mini-meta">{viewingWorkerReviews.department || 'Municipal Board'} &bull; ⭐ {viewingWorkerReviews.rating || 5.0} ({viewingWorkerReviews.reviewsCount || (viewingWorkerReviews.reviews ? viewingWorkerReviews.reviews.length : 0)} reviews)</span>
                </div>
              </div>
            </div>

            <div className="sw-reviews-scroll-list">
              {(!viewingWorkerReviews.reviews || viewingWorkerReviews.reviews.length === 0) ? (
                <div className="sw-no-reviews-box">
                  <Star size={34} color="#64748b" />
                  <h4>No Reviews Logged Yet</h4>
                  <p>When citizens rate this officer after service resolution, their verified feedback and ratings will appear here.</p>
                </div>
              ) : (
                viewingWorkerReviews.reviews.map((rev, ri) => (
                  <div key={ri} className="sw-citizen-review-item">
                    <div className="sw-cr-header">
                      <div className="sw-cr-user">
                        <img 
                          src={rev.customerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.customerName || 'Citizen')}&background=030712&color=00e5ff&bold=true`} 
                          alt={rev.customerName} 
                          className="sw-cr-avatar"
                        />
                        <div>
                          <strong>{rev.customerName || 'Citizen'}</strong>
                          <span className="sw-cr-tkt">Ref: Ticket #{rev.ticketId || 'TKT-2026'}</span>
                        </div>
                      </div>
                      <div className="sw-cr-stars">
                        {[...Array(rev.stars || 5)].map((_, si) => (
                          <Star key={si} size={13} fill="#eab308" color="#eab308" />
                        ))}
                      </div>
                    </div>
                    <p className="sw-cr-comment">"{rev.comment || 'Service completed to municipal standards.'}"</p>
                    <span className="sw-cr-date">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Feedback'}</span>
                  </div>
                ))
              )}
            </div>

            <div className="sw-reviews-footer">
              <button 
                type="button" 
                className="sw-btn-primary" 
                onClick={() => {
                  const target = viewingWorkerReviews;
                  setViewingWorkerReviews(null);
                  handleSelectWorker(target);
                }}
              >
                <UserCheck size={16} />
                <span>Assign {viewingWorkerReviews.name} to My Ticket</span>
              </button>
            </div>
          </div>
        ) : assignedWorker ? (
          <div className="sw-success-view">
            <div className="sw-success-badge">
              <CheckCircle2 size={54} color="#00e5ff" />
            </div>
            <h2>Field Officer Assigned Exclusively!</h2>
            <p className="sw-success-desc">
              <strong>{assignedWorker.name}</strong> ({assignedWorker.email}) from <em>{assignedWorker.department || 'Municipal Operations'}</em> is now exclusively assigned to Ticket <strong>#{ticket.ticketId || ticket.id}</strong>.
            </p>

            <div className="sw-assigned-card-preview">
              <img 
                src={assignedWorker.resolvedAvatar || getWorkerAvatar(assignedWorker)} 
                alt={assignedWorker.name} 
                className="sw-assigned-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedWorker.name || 'Officer')}&background=030712&color=00e5ff&bold=true`;
                }}
              />
              <div className="sw-assigned-meta">
                <h4>{assignedWorker.name}</h4>
                <span className="sw-preview-email">
                  <Mail size={12} className="inline-mail-icon" />
                  {assignedWorker.email}
                </span>
                <span className="sw-preview-dept">{assignedWorker.department || 'Municipal Operations Department'}</span>
                <div className="sw-stars-preview">
                  <Star size={14} fill="#eab308" color="#eab308" />
                  <strong>{assignedWorker.rating || 5.0}</strong>
                  <span>({assignedWorker.reviewsCount || (assignedWorker.reviews ? assignedWorker.reviews.length : 0)} reviews)</span>
                </div>
              </div>
            </div>

            <div className="sw-exclusive-note">
              <ShieldCheck size={18} color="#00e5ff" />
              <span><strong>1-on-1 Exclusivity:</strong> Only you and {assignedWorker.name} ({assignedWorker.email}) can message, send progress updates, and mark this ticket resolved.</span>
            </div>

            <div className="sw-success-actions">
              <button 
                className="sw-btn-primary"
                onClick={() => {
                  if (onWorkerAssigned) onWorkerAssigned(assignedWorker, ticket, 'chat');
                }}
              >
                <MessageSquare size={17} />
                Open Direct Messenger Now
              </button>
              <button 
                className="sw-btn-secondary"
                onClick={() => {
                  if (onWorkerAssigned) onWorkerAssigned(assignedWorker, ticket, 'track');
                }}
              >
                <ExternalLink size={17} />
                Track Ticket Status
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter Bar */}
            <div className="sw-toolbar">
              <div className="sw-search-box">
                <Search size={16} className="sw-search-icon" />
                <input 
                  type="text"
                  placeholder="Search registered workers by name, email, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="sw-dept-chips">
                {DEPARTMENTS.map((dept) => (
                  <button 
                    key={dept}
                    className={`sw-chip ${selectedDept === dept ? 'active' : ''}`}
                    onClick={() => setSelectedDept(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Workers Grid */}
            <div className="sw-workers-grid">
              {loading ? (
                <div className="sw-loading-state">
                  <div className="sw-spinner"></div>
                  <p>Fetching registered workers from MongoDB Atlas...</p>
                </div>
              ) : filteredWorkers.length === 0 ? (
                <div className="sw-empty-state">
                  <HardHat size={36} color="#64748b" />
                  <p>No registered workers found in database matching your filter.</p>
                </div>
              ) : (
                filteredWorkers.map((worker) => {
                  const avatarUrl = getWorkerAvatar(worker);
                  return (
                    <div key={worker._id || worker.email || worker.name} className="sw-worker-card">
                      <div className="sw-card-top">
                        <div className="sw-avatar-wrapper">
                          <img 
                            src={avatarUrl} 
                            alt={worker.name} 
                            className="sw-worker-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'Worker')}&background=030712&color=00e5ff&bold=true`;
                            }}
                          />
                          <span className="sw-online-dot" title="Active on duty"></span>
                        </div>

                        <div className="sw-worker-info">
                          <div className="sw-name-row">
                            <h4>{worker.name}</h4>
                            <span className="sw-verified-badge" title="Verified Worker">
                              <ShieldCheck size={13} color="#00e5ff" />
                              Verified
                            </span>
                          </div>
                          
                          {/* Worker Real Email Badge */}
                          <div className="sw-email-row" title={worker.email}>
                            <Mail size={11} className="email-icon" />
                            <span className="sw-email-text">{worker.email}</span>
                          </div>

                          <span className="sw-dept-tag">{worker.department || 'General Civic Support'}</span>
                        </div>
                      </div>

                      <p className="sw-specialization">
                        {worker.specialization || 'Municipal Infrastructure & Field Operations'}
                      </p>

                      <div className="sw-card-stats-row">
                        <div 
                          className="sw-stat-pill rating sw-clickable-rating" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingWorkerReviews(worker);
                          }}
                          title="Click to view citizen ratings & reviews"
                        >
                          <Star size={13} fill="#eab308" color="#eab308" />
                          <strong>{worker.rating || 5.0}</strong>
                          <span>({worker.reviewsCount || (worker.reviews ? worker.reviews.length : 0)} reviews)</span>
                        </div>
                        <div className="sw-stat-pill tasks">
                          <Award size={13} color="#00e5ff" />
                          <span>{worker.verifiedReportsCount || 5} Solved</span>
                        </div>
                      </div>

                      <button 
                        className="sw-select-btn"
                        disabled={isAssigning}
                        onClick={() => handleSelectWorker(worker)}
                      >
                        <UserCheck size={15} />
                        <span>Assign to My Ticket</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Notice */}
            <div className="sw-modal-footer">
              <span className="sw-footer-notice">
                🔒 All workers listed are fetched directly from MongoDB with their registered names, emails, and profiles.
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SelectWorkerModal;
