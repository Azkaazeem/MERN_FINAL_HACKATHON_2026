import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Smile, 
  Trash2, 
  Play, 
  Pause, 
  CheckCheck, 
  ShieldCheck, 
  User, 
  Paperclip,
  Sparkles,
  Volume2,
  MessageSquare,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  HelpCircle,
  Search
} from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import './TicketChatModal.css';

// Quick One-Click Suggested Prompts
const QUICK_PROMPTS = [
  'What is the estimated completion time?',
  'Is the repair team currently on-site?',
  'Please verify when the water/power will resume.',
  'Attaching photo of recent damage.'
];

const TicketChatModal = ({ ticket, isOpen, onClose, userRole = 'customer' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [selectedChatImage, setSelectedChatImage] = useState(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  // Load ticket conversation history from Database with LocalStorage fallback
  const fetchDbMessages = async () => {
    if (!ticket) return;
    const tId = ticket.ticketId || ticket.id || '101';
    
    try {
      const res = await API.get(`/chat/${tId}`);
      if (res.data?.messages?.length > 0) {
        setMessages(res.data.messages);
        return;
      }
    } catch (e) {}

    const storageKey = `ticket_chat_${tId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages(getInitialSeedMessages(ticket));
      }
    } else {
      const initial = getInitialSeedMessages(ticket);
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  };

  // Poll database messages every 2 seconds for real-time synchronization between User & Worker!
  useEffect(() => {
    if (!isOpen || !ticket) return;
    fetchDbMessages();
    const interval = setInterval(fetchDbMessages, 2000);
    return () => clearInterval(interval);
  }, [isOpen, ticket]);

  // Save messages to persistent storage
  useEffect(() => {
    if (!ticket || messages.length === 0) return;
    const tId = ticket.ticketId || ticket.id || '101';
    const storageKey = `ticket_chat_${tId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, ticket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentTyping, isOpen]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecordingVoice]);

  // Initial seed conversation
  const getInitialSeedMessages = (t) => [
    {
      id: 'msg_sys_1',
      senderRole: 'system',
      senderName: 'NovaDesk AI Triage Engine',
      text: `Ticket #${t.ticketId || t.id || '101'} triaged as ${t.priority || 'High'} Priority. Automated dispatch routed to ${t.assigned_department || t.assignedDept || 'Municipal Authority'}.`,
      time: '10:15 AM',
      type: 'system'
    },
    {
      id: 'msg_agent_1',
      senderRole: 'worker',
      senderName: t.assignedWorker || 'Officer Tariq Mehmood (Field Crew)',
      text: `Assigned inspection order #${t.ticketId || t.id || '101'}. Our mobile repair van is currently en route with required hydraulic maintenance crew.`,
      time: '10:18 AM',
      type: 'text'
    },
    {
      id: 'msg_cust_1',
      senderRole: 'customer',
      senderName: t.citizen_name || user?.name || 'Citizen Reporter',
      text: `Thank you Officer. Please check the main junction valve as water flow is heavy.`,
      time: '10:22 AM',
      type: 'text'
    }
  ];

  if (!isOpen || !ticket) return null;

  // Send Text Message
  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const tId = ticket.ticketId || ticket.id || '101';
    const newMsg = {
      ticketId: tId,
      senderRole: userRole === 'worker' ? 'worker' : 'customer',
      senderName: user?.name || (userRole === 'worker' ? 'Assigned Field Officer' : 'Citizen Reporter'),
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setShowEmojiPicker(false);

    // Save to Database API
    try {
      await API.post(`/chat/${tId}`, newMsg);
    } catch (err) {
      console.warn('Chat DB post fallback:', err);
    }
  };

  // Add Emoji
  const handleAddEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Send Image File Attachment
  const handleImageAttachment = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG, JPG, and JPEG images are allowed.');
      return;
    }

    const tId = ticket.ticketId || ticket.id || '101';
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newMsg = {
        ticketId: tId,
        senderRole: userRole === 'worker' ? 'worker' : 'customer',
        senderName: user?.name || (userRole === 'worker' ? 'Field Officer' : 'Citizen Reporter'),
        mediaUrl: reader.result,
        mediaName: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image'
      };
      setMessages(prev => [...prev, newMsg]);
      try {
        await API.post(`/chat/${tId}`, newMsg);
      } catch (err) {}
      toast.success('Photo proof attached to conversation!');
    };
    reader.readAsDataURL(file);
  };

  // Toggle Voice Note Recording
  const toggleVoiceRecording = async () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      toast('Recording voice note... Click mic again to send.', { icon: '🎙️' });
    } else {
      setIsRecordingVoice(false);
      const durationSec = recordingSeconds > 0 ? recordingSeconds : 5;
      const tId = ticket.ticketId || ticket.id || '101';
      const newMsg = {
        ticketId: tId,
        senderRole: userRole === 'worker' ? 'worker' : 'customer',
        senderName: user?.name || (userRole === 'worker' ? 'Field Officer' : 'Citizen Reporter'),
        duration: `0:0${durationSec}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'voice'
      };
      setMessages(prev => [...prev, newMsg]);
      try {
        await API.post(`/chat/${tId}`, newMsg);
      } catch (err) {}
      toast.success('Voice note sent to ticket conversation!');
    }
  };

  // Delete / Unsend Message
  const handleDeleteMessage = async (msgId) => {
    setMessages(prev => prev.filter(m => m._id !== msgId && m.id !== msgId));
    try {
      const tId = ticket.ticketId || ticket.id || '101';
      await API.delete(`/chat/${tId}/${msgId}`);
    } catch (e) {}
    toast.success('Message deleted');
  };

  return (
    <div className="ticket-chat-backdrop" onClick={onClose}>
      <div className="ticket-chat-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* ================= MODAL HEADER ================= */}
        <div className="chat-dialog-header">
          
          <div className="chat-header-agent-profile">
            <div className="agent-avatar-wrap">
              <div className="agent-avatar-circle">
                <Building2 size={18} />
              </div>
              <span className="agent-status-dot" title="Live Civic Channel" />
            </div>

            <div className="agent-profile-text">
              <div className="agent-name-row">
                <h4>{ticket.title || 'Civic Help Desk'}</h4>
                <span className="verified-badge">Official Channel</span>
              </div>
              <p className="agent-dept-sub">
                {ticket.assigned_department || ticket.assignedDept || ticket.category || 'Municipal Support'} &bull; Ticket #{ticket.id || ticket.ticketId}
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            <span className={`chat-priority-badge ${(ticket.priority || 'medium').toLowerCase()}`}>
              {ticket.priority || 'Medium'} Priority
            </span>
            <button className="chat-close-btn" onClick={onClose} title="Close Chat (Esc)">
              <X size={18} />
            </button>
          </div>

        </div>

        {/* ================= TICKET CONTEXT BANNER ================= */}
        <div className="chat-ticket-context-bar">
          <div className="ctc-subject">
            <strong>Incident:</strong> <span>{ticket.title}</span>
          </div>
          <div className="ctc-meta">
            <span>📍 {ticket.location || 'Central District'}</span>
            <span>&bull;</span>
            <span>Status: <strong style={{ color: '#00e5ff' }}>{ticket.status || 'In Progress'}</strong></span>
          </div>
        </div>

        {/* ================= MESSAGE STREAM ================= */}
        <div className="chat-messages-container">
          
          {messages.map((msg) => {
            const isMe = (userRole === 'worker' && msg.senderRole === 'worker') || (userRole === 'customer' && msg.senderRole === 'customer');
            const isSystem = msg.type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="system-msg-bubble">
                  <Sparkles size={13} className="sys-icon" />
                  <span>{msg.text}</span>
                  <span className="sys-time">{msg.time}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`chat-message-row ${isMe ? 'outgoing' : 'incoming'}`}>
                <div className="msg-bubble-card">
                  
                  {/* Sender Name & Action Header */}
                  <div className="msg-header-row">
                    <span className="msg-sender-name">{isMe ? 'You' : msg.senderName}</span>
                    <div className="msg-actions-group">
                      <span className="msg-time">{msg.time}</span>
                      {isMe && (
                        <button 
                          type="button" 
                          className="msg-delete-btn" 
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete / Unsend message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content: Text */}
                  {msg.type === 'text' && (
                    <p className="msg-text-content">{msg.text}</p>
                  )}

                  {/* Content: Image Attachment */}
                  {msg.type === 'image' && (
                    <div className="msg-image-wrap" onClick={() => setSelectedChatImage(msg.mediaUrl)}>
                      <img src={msg.mediaUrl} alt="Chat Attachment" className="msg-img-preview" />
                      <div className="msg-img-overlay">
                        <span><Search size={13} /> Click to view large</span>
                      </div>
                    </div>
                  )}

                  {/* Content: Voice Note */}
                  {msg.type === 'voice' && (
                    <div className="msg-voice-wrap">
                      <button 
                        type="button" 
                        className="voice-play-btn"
                        onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                      >
                        {playingAudioId === msg.id ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <div className="voice-waveform-graphic">
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                        <span className={`bar ${playingAudioId === msg.id ? 'animating' : ''}`} />
                      </div>
                      <span className="voice-duration"><Mic size={12} /> {msg.duration || '0:05'}</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isAgentTyping && (
            <div className="chat-message-row incoming">
              <div className="msg-bubble-card typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-text">Officer is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================= QUICK PROMPTS CHIPS ================= */}
        <div className="quick-prompts-bar">
          <span className="qp-label"><Sparkles size={11} /> Quick Questions:</span>
          <div className="qp-chips-list">
            {QUICK_PROMPTS.map((q, idx) => (
              <button 
                key={idx}
                type="button" 
                className="qp-chip-btn"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ================= FULL CATEGORIZED EMOJI PICKER POPUP ================= */}
        {showEmojiPicker && (
          <div className="chat-emoji-palette-picker">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                handleAddEmoji(emojiData.emoji);
                setShowEmojiPicker(false);
              }}
              autoFocusSearch={false}
              theme={document.documentElement.getAttribute('data-theme') === 'dark' ? Theme.DARK : Theme.LIGHT}
              width={320}
              height={360}
              searchPlaceHolder="Search all emojis..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        {/* ================= INPUT FOOTER CONTROLS ================= */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-footer">
          
          {/* Action Tools: Emoji, Image Attachment, Voice Note */}
          <div className="chat-toolbar-left">
            <button 
              type="button" 
              className={`tool-icon-btn ${showEmojiPicker ? 'active' : ''}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
            >
              <Smile size={19} />
            </button>

            <label className="tool-icon-btn file-attach-label" title="Attach Photo Proof (PNG, JPG)">
              <ImageIcon size={19} />
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleImageAttachment}
                className="chat-hidden-file"
              />
            </label>

            <button 
              type="button" 
              className={`tool-icon-btn ${isRecordingVoice ? 'recording-active' : ''}`}
              onClick={toggleVoiceRecording}
              title={isRecordingVoice ? 'Stop & Send Voice Note' : 'Record Audio Note'}
            >
              {isRecordingVoice ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          </div>

          {/* Text Input / Recording Indicator */}
          {isRecordingVoice ? (
            <div className="voice-recording-banner">
              <span className="rec-dot" />
              <span>Recording Voice Note (0:0{recordingSeconds}s) — Click mic to send</span>
            </div>
          ) : (
            <input 
              type="text" 
              className="chat-text-input"
              placeholder={userRole === 'worker' ? 'Type message or repair update to citizen...' : 'Type message to assigned field officer...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              autoFocus
            />
          )}

          {/* Send Button Icon */}
          <button 
            type="submit" 
            className="chat-send-btn" 
            disabled={!inputText.trim() && !isRecordingVoice}
            title="Send Message"
          >
            <Send size={17} />
          </button>
        </form>

        {/* Image Preview Sub-Modal */}
        {selectedChatImage && (
          <div className="chat-lightbox-overlay" onClick={() => setSelectedChatImage(null)}>
            <div className="chat-lightbox-card" onClick={(e) => e.stopPropagation()}>
              <button className="chat-lightbox-close" onClick={() => setSelectedChatImage(null)}>
                <X size={18} />
              </button>
              <img src={selectedChatImage} alt="Large Attachment" className="chat-lightbox-img" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TicketChatModal;
