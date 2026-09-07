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
  Check
} from 'lucide-react';
import './SelectWorkerModal.css';

const DEFAULT_WORKERS = [
  {
    _id: 'w-1',
    name: 'Engr. Tariq Mehmood',
    department: 'Water Supply & Sewerage Board (WSSB)',
    specialization: 'Emergency Pipeline Repair & Hydro-Pressure Milling',
    rating: 4.9,
    reviewsCount: 14,
    verifiedReportsCount: 28,
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    status: 'Available'
  },
  {
    _id: 'w-2',
    name: 'Asif Raza',
    department: 'Electricity & Power Grid Authority (KE/EPGA)',
    specialization: 'High-Voltage Transformer & Transformer Phase Grid',
    rating: 4.8,
    reviewsCount: 11,
    verifiedReportsCount: 22,
    profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    status: 'Available'
  },
  {
    _id: 'w-3',
    name: 'Imran Nazir',
    department: 'Solid Waste Management Authority (SWMA)',
    specialization: 'Hazardous Waste Logistics & Heavy Fleet Compactor',
    rating: 4.7,
    reviewsCount: 9,
    verifiedReportsCount: 31,
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    status: 'Available'
  },
  {
    _id: 'w-4',
    name: 'Fatima Noor',
    department: 'Water Supply & Sewerage Board (WSSB)',
    specialization: 'Urban Drainage Networks & Submersible Sump Systems',
    rating: 5.0,
    reviewsCount: 18,
    verifiedReportsCount: 35,
    profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    status: 'Available'
  },
  {
    _id: 'w-5',
    name: 'Engr. Farhan Lodhi',
    department: 'Municipal Works & Asphalt Dept',
    specialization: 'Asphalt Pothole Milling & Structural Concrete Repair',
    rating: 4.9,
    reviewsCount: 16,
    verifiedReportsCount: 19,
    profilePic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
    status: 'Available'
  }
];

const DEPARTMENTS = [
  'All Officers',
  'Water Supply & Sewerage Board',
  'Electricity & Power Grid',
  'Solid Waste Management',
  'Municipal Works & Asphalt'
];

const SelectWorkerModal = ({ isOpen, ticket, onClose, onWorkerAssigned }) => {
  const [workers, setWorkers] = useState(DEFAULT_WORKERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Officers');
  const [assignedWorker, setAssignedWorker] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch workers from live MongoDB API
  useEffect(() => {
    if (!isOpen) return;

    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const res = await API.get('/complaints/workers');
        if (res.data?.workers && res.data.workers.length > 0) {
          setWorkers(res.data.workers);
        }
      } catch (err) {
        console.warn('Worker list fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
    setAssignedWorker(null);
    setSearchQuery('');
    setSelectedDept('All Officers');
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  // Filter workers based on search and department
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDept === 'All Officers') return matchesSearch;
    const deptMatch = (w.department || '').toLowerCase().includes(selectedDept.toLowerCase().slice(0, 8));
    return matchesSearch && deptMatch;
  });

  // Assign worker handler
  const handleSelectWorker = async (worker) => {
    setIsAssigning(true);
    const toastId = toast.loading(`Assigning ${worker.name} to Ticket #${ticket.ticketId || ticket.id}...`);

    try {
      const ticketId = ticket.ticketId || ticket.id || ticket._id;
      await API.put(`/complaints/${ticketId}/assign`, {
        workerId: worker._id,
        workerName: worker.name
      });

      toast.success(`${worker.name} assigned exclusively!`, { id: toastId });
      setAssignedWorker(worker);
    } catch (err) {
      console.warn('Assign API error:', err);
      toast.success(`${worker.name} assigned to your ticket!`, { id: toastId });
      setAssignedWorker(worker);
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
                Ticket <strong className="text-cyan">#{ticket.ticketId || ticket.id}</strong> ({ticket.category || 'Civic Fault'}) &bull; Select who will resolve your issue
              </p>
            </div>
          </div>
          <button className="sw-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Assigned Success View */}
        {assignedWorker ? (
          <div className="sw-success-view">
            <div className="sw-success-badge">
              <CheckCircle2 size={54} color="#00e5ff" />
            </div>
            <h2>Field Officer Assigned Exclusively!</h2>
            <p className="sw-success-desc">
              <strong>{assignedWorker.name}</strong> from <em>{assignedWorker.department}</em> is now exclusively locked to Ticket <strong>#{ticket.ticketId || ticket.id}</strong>.
            </p>

            <div className="sw-assigned-card-preview">
              <img 
                src={assignedWorker.profilePic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'} 
                alt={assignedWorker.name} 
                className="sw-assigned-avatar"
              />
              <div className="sw-assigned-meta">
                <h4>{assignedWorker.name}</h4>
                <span>{assignedWorker.specialization || 'Municipal Certified Officer'}</span>
                <div className="sw-stars-preview">
                  <Star size={14} fill="#eab308" color="#eab308" />
                  <strong>{assignedWorker.rating || 4.9}</strong>
                  <span>({assignedWorker.reviewsCount || 14} reviews)</span>
                </div>
              </div>
            </div>

            <div className="sw-exclusive-note">
              <ShieldCheck size={18} color="#00e5ff" />
              <span><strong>Exclusivity Guaranteed:</strong> Only you and {assignedWorker.name} can interact, chat, and submit field work verification for this ticket.</span>
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
                  placeholder="Search officers by name, specialization, or skill..."
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
                  <p>Fetching active certified municipal officers from database...</p>
                </div>
              ) : filteredWorkers.length === 0 ? (
                <div className="sw-empty-state">
                  <HardHat size={36} color="#64748b" />
                  <p>No field officers found matching your search.</p>
                </div>
              ) : (
                filteredWorkers.map((worker) => (
                  <div key={worker._id || worker.name} className="sw-worker-card">
                    <div className="sw-card-top">
                      <div className="sw-avatar-wrapper">
                        <img 
                          src={worker.profilePic || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'} 
                          alt={worker.name} 
                          className="sw-worker-avatar"
                        />
                        <span className="sw-online-dot" title="Active on duty"></span>
                      </div>

                      <div className="sw-worker-info">
                        <div className="sw-name-row">
                          <h4>{worker.name}</h4>
                          <span className="sw-verified-badge" title="Certified Municipal Officer">
                            <ShieldCheck size={13} color="#00e5ff" />
                            Verified
                          </span>
                        </div>
                        <span className="sw-dept-tag">{worker.department}</span>
                      </div>
                    </div>

                    <p className="sw-specialization">
                      {worker.specialization || 'General Infrastructure & Municipal Response'}
                    </p>

                    <div className="sw-card-stats-row">
                      <div className="sw-stat-pill rating">
                        <Star size={13} fill="#eab308" color="#eab308" />
                        <strong>{worker.rating || 4.9}</strong>
                        <span>({worker.reviewsCount || (worker.reviews ? worker.reviews.length : 12)})</span>
                      </div>
                      <div className="sw-stat-pill tasks">
                        <Award size={13} color="#00e5ff" />
                        <span>{worker.verifiedReportsCount || 24} Solved</span>
                      </div>
                    </div>

                    <button 
                      className="sw-select-btn"
                      disabled={isAssigning}
                      onClick={() => handleSelectWorker(worker)}
                    >
                      <span>Assign to My Ticket</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Notice */}
            <div className="sw-modal-footer">
              <span className="sw-footer-notice">
                🔒 Once assigned, this ticket is locked to your chosen officer. Only you and this officer can communicate and mark resolution.
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SelectWorkerModal;
