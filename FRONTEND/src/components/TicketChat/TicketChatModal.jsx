import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  CheckCheck, 
  ShieldCheck, 
  User, 
  Phone,
  Sparkles,
  Paperclip,
  Star,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import './TicketChatModal.css';

const QUICK_PROMPTS = [
  'What is the estimated completion time?',
  'Is the field repair team currently on-site?',
  'I have attached photo evidence.',
  'Please verify when the water/power will resume.'
];

const TicketChatModal = ({ ticket, isOpen, onClose, userRole = 'customer' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const tId = ticket?.ticketId || ticket?.id || 'TKT-1001';
  const workerName = ticket?.assignedWorkerName || ticket?.assignedWorker || 'Engr. Tariq Mehmood';
  const workerDept = ticket?.department || 'Water Supply & Sewerage Board (WSSB)';
  const workerRating = ticket?.workerRating || 4.9;

  // Fetch messages from MongoDB API
  const fetchMessages = async () => {
    if (!ticket) return;
    try {
      const res = await API.get(`/chat/${tId}`);
      if (res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
        return;
      }
    } catch (e) {}

    // Initial Welcome Message from Worker if empty
    setMessages(prev => {
      if (prev.length > 0) return prev;
      return [
        {
          _id: 'welcome-1',
          sender: 'worker',
          senderName: workerName,
          text: `Assalam-o-Alaikum! I am ${workerName} from ${workerDept}. I have been assigned to your ticket #${tId}. How can I assist you with this issue?`,
          createdAt: new Date()
        }
      ];
    });
  };

  useEffect(() => {
    if (!isOpen || !ticket) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isOpen, ticket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Photo Attachment via Cloudinary / Base64
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('Attaching image...');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await API.post('/upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.imageUrl) {
        setSelectedImage(res.data.imageUrl);
        toast.success('Image attached!', { id: toastId });
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        toast.success('Image attached locally!', { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend && !selectedImage) return;

    const currentSender = userRole === 'worker' ? 'worker' : 'customer';
    const currentSenderName = user?.name || (currentSender === 'worker' ? workerName : 'Citizen');

    const tempMsg = {
      _id: 'temp-' + Date.now(),
      sender: currentSender,
      senderName: currentSenderName,
      text: textToSend,
      imageUrl: selectedImage || '',
      createdAt: new Date()
    };

    setMessages(prev => [...prev, tempMsg]);
    if (!customText) setInputText('');
    setSelectedImage(null);
    setShowEmojiPicker(false);
    setIsSending(true);

    try {
      await API.post('/chat/send', {
        ticketId: tId,
        sender: currentSender,
        senderName: currentSenderName,
        text: textToSend,
        imageUrl: tempMsg.imageUrl
      });
    } catch (err) {
      console.warn('Chat send error, saved locally:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="modern-messenger-overlay" onClick={onClose}>
      <div className="modern-messenger-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ================= 1. SLEEK HEADER ================= */}
        <div className="messenger-header">
          
          <div className="messenger-worker-info">
            <div className="worker-avatar-wrap">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" 
                alt={workerName}
                className="worker-header-avatar"
              />
              <span className="worker-online-status" title="Active on Duty" />
            </div>

            <div className="worker-text-meta">
              <div className="worker-name-row">
                <h3>{workerName}</h3>
                <span className="verified-officer-tag">
                  <ShieldCheck size={12} />
                  <span>Certified</span>
                </span>
              </div>
              <div className="worker-sub-row">
                <span className="worker-dept-badge">{workerDept}</span>
                <span className="worker-rating-badge">
                  <Star size={11} fill="#eab308" color="#eab308" />
                  <span>{workerRating}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="messenger-header-actions">
            <div className="ticket-ref-pill">
              <span>#{tId}</span>
            </div>
            <button className="messenger-close-btn" onClick={onClose} title="Close Messenger">
              <X size={18} />
            </button>
          </div>

        </div>

        {/* ================= 2. MESSAGES FEED ================= */}
        <div className="messenger-body">
          
          <div className="messenger-date-divider">
            <span>Direct Secure Messenger &bull; Incident #{tId}</span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = (userRole === 'worker' && msg.sender === 'worker') || 
                         (userRole !== 'worker' && msg.sender === 'customer');

            return (
              <div key={msg._id || idx} className={`modern-message-row ${isMe ? 'my-message' : 'other-message'}`}>
                
                {!isMe && (
                  <img 
                    src={msg.sender === 'worker' 
                      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="msg-author-avatar"
                  />
                )}

                <div className="msg-bubble-wrapper">
                  
                  {!isMe && (
                    <span className="msg-sender-name">
                      {msg.senderName || (msg.sender === 'worker' ? workerName : 'Citizen')}
                    </span>
                  )}

                  <div className="msg-bubble">
                    {msg.imageUrl && (
                      <div className="msg-image-attachment">
                        <img src={msg.imageUrl} alt="Attached Evidence" />
                      </div>
                    )}
                    {msg.text && <p className="msg-text-content">{msg.text}</p>}

                    <div className="msg-timestamp-row">
                      <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck size={13} className="check-double-icon" />}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= 3. QUICK PROMPTS ================= */}
        <div className="messenger-quick-prompts">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button 
              key={i} 
              type="button" 
              className="quick-prompt-chip" 
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
            >
              <Sparkles size={11} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* ================= 4. IMAGE PREVIEW (IF SELECTED) ================= */}
        {selectedImage && (
          <div className="messenger-attachment-preview">
            <img src={selectedImage} alt="Preview" />
            <button type="button" className="remove-preview-btn" onClick={() => setSelectedImage(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================= 5. EMOJI PICKER POPUP ================= */}
        {showEmojiPicker && (
          <div className="messenger-emoji-popup">
            <EmojiPicker
              onEmojiClick={(emojiData) => setInputText(prev => prev + emojiData.emoji)}
              theme={Theme.DARK}
              lazyLoadEmojis={true}
              height={320}
              width={300}
            />
          </div>
        )}

        {/* ================= 6. FOOTER INPUT BAR ================= */}
        <div className="messenger-footer">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="messenger-input-form"
          >
            
            <button 
              type="button" 
              className="footer-icon-btn" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add Emoji"
            >
              <Smile size={18} />
            </button>

            <label className="footer-icon-btn file-label" title="Attach Photo Proof">
              <Paperclip size={18} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect} 
                style={{ display: 'none' }} 
              />
            </label>

            <input 
              type="text" 
              className="messenger-text-input" 
              placeholder="Type your message..." 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              disabled={isSending || uploadingImage}
            />

            <button 
              type="submit" 
              className="messenger-send-btn" 
              disabled={(!inputText.trim() && !selectedImage) || isSending}
              title="Send Message"
            >
              <Send size={16} />
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default TicketChatModal;
