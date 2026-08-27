import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Minus, 
  Sparkles, 
  Smile, 
  Paperclip,
  Bot
} from 'lucide-react';
import './Chatbot.css';

// High Quality Cute Cartoon Robot Avatar
const ROBO_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=ff4b2b,ff416c";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [inputMsg, setInputMsg] = useState('');

  // Sample default messages for clean UI presentation
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi there! I'm your AI Assistant. How can I help you today?",
      time: 'Just now'
    }
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowPrompt(false); // Hide prompt once user opens chat
    }
  };

  const handleClosePrompt = (e) => {
    e.stopPropagation();
    setShowPrompt(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    // Add user message to UI state (Logic can be connected anytime)
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  return (
    <div className="chatbot-wrapper">
      
      {/* ================= 1. FLOATING PROMPT BUBBLE (Notice box) ================= */}
      {showPrompt && !isOpen && (
        <div className="chatbot-prompt-bubble" onClick={toggleChat} title="Click to chat with AI">
          {/* Left: Cartoon Robot Avatar */}
          <img 
            src={ROBO_AVATAR} 
            alt="AI Bot" 
            className="bubble-robot-img" 
          />

          {/* Right: Message & Title */}
          <div className="bubble-text-content">
            <div className="bubble-title">AI Assistant</div>
            <div className="bubble-msg">👋 Need help? Chat with me!</div>
          </div>

          {/* Close 'X' Button to dismiss prompt */}
          <button 
            type="button" 
            className="bubble-close-btn" 
            onClick={handleClosePrompt} 
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================= 2. CHAT MODAL WINDOW ================= */}
      {isOpen && (
        <div className="chatbot-modal">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-left">
              <img src={ROBO_AVATAR} alt="Robot Avatar" className="header-avatar" />
              <div className="header-info">
                <h4>AI Assistant</h4>
                <div className="header-status">
                  <span className="status-indicator" /> Online
                </div>
              </div>
            </div>
            <button className="header-close-btn" onClick={toggleChat} title="Minimize Chat">
              <Minus size={18} />
            </button>
          </div>

          {/* Chat Body / Messages */}
          <div className="chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-item ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <img src={ROBO_AVATAR} alt="Bot" className="bot-msg-avatar" />
                )}
                <div>
                  <div className="message-bubble">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer / Input Area (Ready for custom logic) */}
          <div className="chatbot-footer">
            <form onSubmit={handleSendMessage} className="chat-input-wrapper">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
              />
              <button type="submit" className="chat-send-btn" title="Send message">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 3. FLOATING ACTION BUTTON (FAB) ================= */}
      <button 
        className="chatbot-fab-btn" 
        onClick={toggleChat} 
        title={isOpen ? "Close Chat" : "Open AI Chatbot"}
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <>
            <img src={ROBO_AVATAR} alt="Chatbot Icon" className="fab-robo-icon" />
            <span className="fab-online-dot" />
          </>
        )}
      </button>

    </div>
  );
};

export default Chatbot;
