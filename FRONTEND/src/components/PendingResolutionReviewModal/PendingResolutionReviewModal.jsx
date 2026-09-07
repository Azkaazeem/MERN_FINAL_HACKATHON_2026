import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { 
  X, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  HardHat, 
  Send, 
  MessageSquare,
  ShieldCheck,
  Award
} from 'lucide-react';
import './PendingResolutionReviewModal.css';

const RATING_LABELS = {
  1: 'Poor - Service was unsatisfactory',
  2: 'Fair - Needs significant improvement',
  3: 'Good - Standard resolution completed',
  4: 'Very Good - Fast response & polite service',
  5: 'Outstanding - Exceptional field repair!'
};

const PendingResolutionReviewModal = () => {
  const { user } = useAuth();
  const [pendingComplaint, setPendingComplaint] = useState(null);
  const [stars, setStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for resolved unreviewed tickets for the logged in user
  const checkPendingReviews = async () => {
    if (!user || user.role === 'admin' || user.role === 'worker') return;
    try {
      const email = user.email || '';
      const res = await API.get(`/complaints/my?email=${encodeURIComponent(email)}`);
      const complaints = res.data?.complaints || [];

      // Find first resolved complaint that hasn't been reviewed
      const unreviewed = complaints.find(c => {
        const isResolved = c.status === 'Resolved' || c.status === 'Closed';
        const hasNoDbRating = !c.rating || c.rating === 0;
        const notDismissed = sessionStorage.getItem(`dismissed_review_${c.ticketId}`) !== 'true';
        const notLocallyReviewed = localStorage.getItem(`ticket_rating_${c.ticketId}`) === null;
        return isResolved && hasNoDbRating && notDismissed && notLocallyReviewed;
      });

      if (unreviewed && !pendingComplaint) {
        setPendingComplaint(unreviewed);
      }
    } catch (e) {
      console.warn('Pending review check error:', e);
    }
  };

  useEffect(() => {
    // Check upon component mount (website opened/refreshed)
    checkPendingReviews();

    // Periodic check every 15s
    const interval = setInterval(checkPendingReviews, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (!pendingComplaint) return null;

  const workerName = pendingComplaint.assignedWorkerName || pendingComplaint.assignedWorker || 'Municipal Field Officer';
  const departmentName = pendingComplaint.department || 'Municipal Works Board';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Recording your 5-star evaluation...');

    try {
      const ticketId = pendingComplaint.ticketId || pendingComplaint._id;
      await API.post(`/complaints/${ticketId}/review`, {
        stars,
        comment: comment.trim() || 'Work completed to high civic standard.',
        customerName: user?.name || 'Citizen'
      });

      localStorage.setItem(`ticket_rating_${ticketId}`, JSON.stringify({
        stars,
        comment,
        ratedAt: new Date().toISOString()
      }));

      toast.success('Rating & Review Saved!', { id: toastId });

      Swal.fire({
        icon: 'success',
        title: 'Thank You for Rating! ⭐',
        text: `Your ${stars}-Star review for ${workerName} has been recorded in the municipal public directory.`,
        confirmButtonColor: '#00e5ff',
        background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a'
      });

      setPendingComplaint(null);
      setComment('');
      setStars(5);
    } catch (err) {
      toast.error('Failed to submit review.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    if (pendingComplaint) {
      sessionStorage.setItem(`dismissed_review_${pendingComplaint.ticketId}`, 'true');
    }
    setPendingComplaint(null);
  };

  const currentDisplayStars = hoveredStars || stars;

  return (
    <div className="pending-review-overlay">
      <div className="pending-review-modal-card">
        
        {/* Close / Dismiss */}
        <button className="pr-close-btn" onClick={handleDismiss} title="Remind me later">
          <X size={18} />
        </button>

        {/* Celebration Header */}
        <div className="pr-celebrate-header">
          <div className="pr-badge-glow">
            <Sparkles size={24} color="#00e5ff" />
          </div>
          <h3>Work Order Completed! 🎉</h3>
          <p className="pr-sub">
            Your complaint <strong className="text-cyan">#{pendingComplaint.ticketId}</strong> ({pendingComplaint.title}) has been resolved.
          </p>
        </div>

        {/* Assigned Officer Card */}
        <div className="pr-officer-banner">
          <div className="pr-officer-avatar-box">
            <HardHat size={22} color="#00e5ff" />
          </div>
          <div className="pr-officer-details">
            <span className="pr-label">Service Executed By:</span>
            <strong>{workerName}</strong>
            <span className="pr-dept">{departmentName}</span>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="pr-form">
          <div className="pr-stars-section">
            <label className="pr-field-label">Rate Municipal Officer Performance</label>
            <div className="pr-stars-row">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  type="button"
                  key={starNum}
                  className={`pr-star-btn ${currentDisplayStars >= starNum ? 'active' : ''}`}
                  onMouseEnter={() => setHoveredStars(starNum)}
                  onMouseLeave={() => setHoveredStars(0)}
                  onClick={() => setStars(starNum)}
                >
                  <Star 
                    size={32} 
                    fill={currentDisplayStars >= starNum ? '#eab308' : 'none'} 
                    color={currentDisplayStars >= starNum ? '#eab308' : '#64748b'} 
                  />
                </button>
              ))}
            </div>
            <span className="pr-rating-text-label">
              {RATING_LABELS[currentDisplayStars] || 'Click to select rating'}
            </span>
          </div>

          {/* Feedback Textarea */}
          <div className="pr-feedback-section">
            <label className="pr-field-label">Worker Review &amp; Quality Feedback</label>
            <textarea
              rows={3}
              placeholder="How was the response speed, professionalism, and quality of field repair? Write your review for the worker..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pr-actions-row">
            <button 
              type="button" 
              className="pr-btn-dismiss" 
              onClick={handleDismiss}
            >
              Remind Me Later
            </button>

            <button 
              type="submit" 
              className="pr-btn-submit"
              disabled={isSubmitting}
            >
              <Send size={15} />
              <span>Submit Rating &amp; Review</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PendingResolutionReviewModal;
