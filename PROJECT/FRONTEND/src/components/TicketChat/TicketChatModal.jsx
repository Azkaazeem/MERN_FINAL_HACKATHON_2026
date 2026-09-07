import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  X, 
  Send, 
  Smile, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  Sparkles, 
  Paperclip, 
  Star, 
  HardHat,
  Trash2
} from 'lucide-react';
import EmojiPicker, { Theme, EmojiStyle, Emoji } from 'emoji-picker-react';
import './TicketChatModal.css';

const QUICK_PROMPTS = [
  'What is the estimated completion time?',
  'Is the field repair team currently on-site?',
  'I have attached photo evidence.',
  'Please verify when the water/power will resume.'
];

const WA_QUICK_EMOJIS = ['😂', '😍', '❤️', '👍', '🙏', '🔥', '👏', '🎉', '💯', '⚡', '💧', '🛠️', '🚨', '😎'];

const emojiRegex = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/gu;

function toUnified(em) {
  if (!em) return '';
  return [...em]
    .map(c => c.codePointAt(0).toString(16))
    .filter(x => x !== 'fe0f')
    .join('-');
}

const TicketChatModal = ({ ticket, isOpen, onClose, userRole = 'customer', onSelectWorkerRequest }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const tId = ticket?.ticketId || ticket?.id || 'TKT-1001';
  const workerName = ticket?.assignedWorkerName || ticket?.assignedWorker || 'Field Officer';
  const workerEmail = ticket?.assignedWorkerEmail || '';
  const workerDept = ticket?.department || ticket?.assigned_department || 'Municipal Operations Board';
  const workerRating = ticket?.workerRating || 5.0;
  const isUnassigned = !ticket?.assignedWorker || ticket?.assignedWorker === 'Unassigned' || workerName === 'Field Officer' || workerName === 'Unassigned';
  const workerAvatar = ticket?.assignedWorkerPic || ticket?.workerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerName !== 'Unassigned' ? workerName : 'Officer')}&background=030712&color=00e5ff&bold=true&size=128`;
  const citizenAvatar = user?.profilePic || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Citizen')}&background=030712&color=00e5ff&bold=true`;

  const myRole = (user?.role || userRole || 'customer').toLowerCase().trim();
  const myName = (user?.name || '').toLowerCase().trim();

  // Robust check if message was sent by the current active viewer
  const getIsMe = (msg) => {
    const sRole = (msg.senderRole || msg.sender || '').toLowerCase().trim();
    const sName = (msg.senderName || '').toLowerCase().trim();

    if (myRole === 'worker' || myRole === 'agent') {
      return sRole === 'worker' || sRole === 'agent' || (sName && sName === myName) || (sName && sName === 'worker');
    } else {
      return sRole === 'customer' || sRole === 'user' || (sName && sName === myName) || (!sRole && sName !== workerName.toLowerCase().trim());
    }
  };

  // Helper to render cute Apple Emojis inside message bubbles
  const renderMessageContent = (text) => {
    if (!text) return null;
    const trimmed = text.trim();
    const matches = trimmed.match(emojiRegex);
    const isOnlyEmojis = matches && matches.join('') === trimmed && matches.length <= 4;
    const emojiSize = isOnlyEmojis ? 32 : 20;

    const parts = text.split(emojiRegex);
    return parts.map((part, index) => {
      if (emojiRegex.test(part)) {
        emojiRegex.lastIndex = 0;
        const u = toUnified(part);
        return (
          <span 
            key={index} 
            className="inline-apple-emoji-wrap" 
            style={{ 
              display: 'inline-block', 
              verticalAlign: isOnlyEmojis ? 'middle' : '-3.5px', 
              margin: isOnlyEmojis ? '2px 4px' : '0 1.5px' 
            }}
          >
            <Emoji unified={u} size={emojiSize} emojiStyle={EmojiStyle.APPLE} />
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Fetch messages from MongoDB API & Mark as Read
  const fetchMessages = async () => {
    if (!ticket) return;
    try {
      const res = await API.get(`/chat/${tId}`, { params: { readerRole: myRole, readerName: myName } });
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
          senderRole: 'worker',
          senderName: workerName,
          text: `Assalam-o-Alaikum! I am ${workerName}${workerEmail ? ` (${workerEmail})` : ''} from ${workerDept}. I have been assigned to your ticket #${tId}. How can I assist you with this issue?`,
          createdAt: new Date()
        }
      ];
    });
  };

  useEffect(() => {
    if (!isOpen || !ticket) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
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

  // Handle Delete Message
  const handleDeleteMessage = async (messageId) => {
    if (!messageId) return;
    const strId = messageId.toString();
    if (strId.startsWith('temp-') || strId.startsWith('welcome-')) {
      setMessages(prev => prev.filter(m => m._id !== messageId));
      toast.success('Message removed', { duration: 1500 });
      return;
    }
    try {
      setMessages(prev => prev.filter(m => m._id !== messageId));
      await API.delete(`/chat/${tId}/${messageId}`);
      toast.success('Message deleted', { duration: 1500 });
    } catch (err) {
      console.warn('Failed to delete message:', err);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (customText = null) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend && !selectedImage) return;

    const currentSender = (user?.role || userRole || 'customer').toLowerCase().trim();
    const currentSenderName = user?.name || (currentSender === 'worker' ? workerName : 'Citizen');

    const tempMsg = {
      _id: 'temp-' + Date.now(),
      senderRole: currentSender,
      sender: currentSender,
      senderName: currentSenderName,
      text: textToSend,
      imageUrl: selectedImage || '',
      isRead: false,
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
        senderRole: currentSender,
        senderName: currentSenderName,
        senderAvatar: user?.profilePic || user?.avatar || '',
        text: textToSend,
        imageUrl: tempMsg.imageUrl,
        mediaUrl: tempMsg.imageUrl,
        type: tempMsg.imageUrl ? 'image' : 'text'
      });
    } catch (err) {
      console.warn('Chat send error:', err);
    } finally {
      setIsSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="modern-messenger-overlay" onClick={onClose}>
      <div className="modern-messenger-container theme-chat-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ================= 1. THEMED HEADER ================= */}
        <div className="messenger-header theme-header">
          
          <div className="messenger-worker-info">
            <div className="worker-avatar-wrap">
              <img 
                src={workerAvatar} 
                alt={workerName}
                className="worker-header-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(workerName)}&background=030712&color=00e5ff&bold=true`;
                }}
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
                {workerEmail && <span className="worker-dept-badge text-cyan">{workerEmail}</span>}
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

        {/* ================= 2. MESSAGES STREAM (THEMED) ================= */}
        <div className="messenger-body theme-chat-body">
          {isUnassigned ? (
            <div className="unassigned-chat-placeholder">
              <div className="unassigned-icon-circle">
                <HardHat size={34} color="#00e5ff" />
              </div>
              <h3>No Field Officer Assigned Yet</h3>
              <p>
                Is ticket ke liye abhi koi worker select nahi kiya gaya. Live chat karne aur problem resolve karwane ke liye pehle database se worker select karein.
              </p>
              <button
                type="button"
                className="btn-select-worker-action"
                onClick={() => {
                  onClose();
                  if (onSelectWorkerRequest) onSelectWorkerRequest(ticket);
                }}
              >
                <HardHat size={16} />
                <span>Select Field Worker Now</span>
              </button>
            </div>
          ) : (
            <>
              <div className="theme-date-pill-wrap">
                <span className="theme-date-pill">Direct Secure Messenger &bull; Incident #{tId}</span>
              </div>

              <div className="theme-messages-list">
                {messages.map((msg, idx) => {
                  const isMe = getIsMe(msg);
                  const msgSenderName = msg.senderName || (msg.senderRole === 'worker' ? workerName : 'Citizen');
                  const msgTime = msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');
                  const avatarToUse = msg.senderRole === 'worker' ? workerAvatar : citizenAvatar;

                  return (
                    <div 
                      key={msg._id || idx} 
                      className={`theme-msg-row ${isMe ? 'theme-row-me' : 'theme-row-other'}`}
                    >
                      {/* Left Avatar for Received Messages */}
                      {!isMe && (
                        <div className="theme-avatar-box">
                          <img 
                            src={avatarToUse} 
                            alt={msgSenderName}
                            className="theme-msg-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msgSenderName)}&background=0284c7&color=ffffff&bold=true`;
                            }}
                          />
                        </div>
                      )}

                      {/* Themed Speech Bubble */}
                      <div className={`theme-bubble ${isMe ? 'theme-bubble-me' : 'theme-bubble-other'}`}>
                        
                        {/* Sender Label for Received Messages */}
                        {!isMe && (
                          <div className="theme-sender-header">
                            <span className="theme-sender-name">{msgSenderName}</span>
                          </div>
                        )}

                        {/* Image Attachment */}
                        {(msg.imageUrl || msg.mediaUrl) && (
                          <div className="theme-media-box">
                            <img src={msg.imageUrl || msg.mediaUrl} alt="Evidence" />
                          </div>
                        )}

                        {/* Message Text with Cute Apple Emojis, Inline Time, Ticks & Delete */}
                        <div className="theme-bubble-content">
                          <div className="theme-text-block">
                            {renderMessageContent(msg.text)}
                          </div>
                          
                          <div className="theme-meta-inline">
                            <span className="theme-time-text">{msgTime}</span>
                            {isMe && (
                              msg.isRead ? (
                                <span className="theme-ticks-cyan" title="Seen">
                                  <CheckCheck size={14} />
                                </span>
                              ) : (
                                <span className="theme-ticks-grey" title="Sent">
                                  <Check size={13} />
                                </span>
                              )
                            )}
                            {isMe && (
                              <button 
                                type="button" 
                                className="theme-msg-del-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMessage(msg._id);
                                }}
                                title="Delete message"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ================= 3. QUICK APPLE EMOJIS BAR ================= */}
        <div className="theme-quick-emojis-bar">
          <div className="theme-emojis-scroll">
            {WA_QUICK_EMOJIS.map((em, i) => (
              <button
                key={i}
                type="button"
                className="theme-quick-em-btn"
                onClick={() => {
                  setInputText(prev => prev + em);
                  if (inputRef.current) inputRef.current.focus();
                }}
                title={`Insert ${em}`}
              >
                <Emoji unified={toUnified(em)} size={20} emojiStyle={EmojiStyle.APPLE} />
              </button>
            ))}
          </div>
        </div>

        {/* ================= 4. QUICK PROMPT CHIPS ================= */}
        <div className="messenger-quick-prompts theme-prompts">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button 
              key={i} 
              type="button" 
              className="quick-prompt-chip theme-prompt-chip" 
              onClick={() => handleSendMessage(prompt)}
              disabled={isSending}
            >
              <Sparkles size={11} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* ================= 5. IMAGE ATTACHMENT PREVIEW ================= */}
        {selectedImage && (
          <div className="messenger-attachment-preview theme-attachment-preview">
            <img src={selectedImage} alt="Preview" />
            <button type="button" className="remove-preview-btn" onClick={() => setSelectedImage(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================= 6. AUTHENTIC APPLE EMOJI PICKER POPUP ================= */}
        {showEmojiPicker && (
          <div className="messenger-emoji-popup theme-emoji-popup">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setInputText(prev => prev + emojiData.emoji);
                if (inputRef.current) inputRef.current.focus();
              }}
              theme={document.documentElement.getAttribute('data-theme') === 'dark' ? Theme.DARK : Theme.AUTO}
              emojiStyle={EmojiStyle.APPLE}
              lazyLoadEmojis={true}
              searchPlaceHolder="Search emojis..."
              height={320}
              width="100%"
              previewConfig={{
                showPreview: true,
                defaultEmoji: "1f600",
                defaultCaption: "Select Emoji"
              }}
            />
          </div>
        )}

        {/* ================= 7. FOOTER INPUT BAR ================= */}
        <div className="messenger-footer theme-footer">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="messenger-input-form theme-form"
          >
            
            <button 
              type="button" 
              className={`footer-icon-btn theme-icon-btn ${showEmojiPicker ? 'active' : ''}`} 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add Emoji"
            >
              <Smile size={20} />
            </button>

            <label className="footer-icon-btn theme-icon-btn file-label" title="Attach Photo Proof">
              <Paperclip size={20} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect} 
                style={{ display: 'none' }} 
              />
            </label>

            <input 
              ref={inputRef}
              type="text" 
              className="messenger-text-input theme-input" 
              placeholder="Type your message..." 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              disabled={isSending || uploadingImage}
            />

            <button 
              type="submit" 
              className="messenger-send-btn theme-send-btn" 
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
