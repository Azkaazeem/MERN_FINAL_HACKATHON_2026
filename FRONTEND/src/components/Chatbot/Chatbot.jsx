import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Minus, 
  Sparkles, 
  Bot,
  RotateCcw,
  Search,
  Zap,
  Droplet,
  ShieldCheck,
  HardHat
} from 'lucide-react';
import API from '../../api/axios';
import aiRoboImg from '../../assets/AI robo.jpg';
import './Chatbot.css';

const QUICK_SUGGESTIONS = [
  { label: 'Track Ticket', query: 'How do I track my ticket status?' },
  { label: 'Water Pipe Leak SLA', query: 'What is the repair SLA for a water pipe leak?' },
  { label: 'Emergency Power Hazard', query: 'How to report a transformer spark or power line hazard?' },
  { label: 'Worker Karma Points', query: 'How do municipal field workers earn compensation and karma?' }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Initial greeting
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am NovaDesk AI, your 24/7 Smart Municipal Assistant powered by Gemini. You can ask me anything about reporting issues, tracking tickets, municipal SLAs, or department contacts!",
      time: 'Just now'
    }
  ]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowPrompt(false);
    }
  };

  const handleClosePrompt = (e) => {
    e.stopPropagation();
    setShowPrompt(false);
  };

  const handleSendMessage = async (customQuery) => {
    const query = (customQuery || inputMsg).trim();
    if (!query || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputMsg('');
    setIsLoading(true);

    try {
      // Build brief history context
      const historyContext = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await API.post('/ai/chat', {
        prompt: query,
        history: historyContext
      });

      const replyText = res.data?.reply || "I am here to assist you with municipal complaints and ticket tracking. Please file your issue on the Home page.";

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('AI Chat error:', err);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I am ready to help! You can report water leaks, potholes, waste, and electrical hazards on our Home page for automated AI triage.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Chat cleared! How can I assist you with your municipal queries or tickets today?",
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="chatbot-wrapper">
      
      {/* ================= 1. FLOATING PROMPT BUBBLE ================= */}
      {showPrompt && !isOpen && (
        <div className="chatbot-prompt-bubble" onClick={toggleChat} title="Click to chat with AI">
          <img 
            src={aiRoboImg} 
            alt="AI Bot" 
            className="bubble-robot-img" 
          />
          <div className="bubble-text-content">
            <div className="bubble-title">AI Assistant</div>
            <div className="bubble-msg">Need help? Chat with me!</div>
          </div>
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
              <img src={aiRoboImg} alt="Robot Avatar" className="header-avatar" />
              <div className="header-info">
                <h4>NovaDesk AI Assistant</h4>
                <div className="header-status">
                  <span className="status-indicator" /> Gemini 3.5 Active
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-action-icon-btn" onClick={handleResetChat} title="Clear Chat History">
                <RotateCcw size={14} />
              </button>
              <button className="header-close-btn" onClick={toggleChat} title="Minimize Chat">
                <Minus size={18} />
              </button>
            </div>
          </div>

          {/* Chat Body / Messages */}
          <div className="chatbot-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`message-item ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <img src={aiRoboImg} alt="Bot" className="bot-msg-avatar" />
                )}
                <div className="msg-content-wrapper">
                  <div className="message-bubble">{msg.text}</div>
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="message-item bot">
                <img src={aiRoboImg} alt="Bot" className="bot-msg-avatar" />
                <div className="message-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div className="chat-quick-suggestions">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip-btn"
                onClick={() => handleSendMessage(item.query)}
                disabled={isLoading}
              >
                <Sparkles size={11} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Footer / Input Area */}
          <div className="chatbot-footer">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-wrapper">
              <input 
                type="text" 
                placeholder="Ask NovaDesk AI anything in English or Urdu..." 
                value={inputMsg} 
                onChange={(e) => setInputMsg(e.target.value)} 
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="chat-send-btn" 
                title="Send message"
                disabled={!inputMsg.trim() || isLoading}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 3. FLOATING ACTION BUTTON (FAB) ================= */}
      <button 
        className={`chatbot-fab-btn ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat} 
        title={isOpen ? "Close Chat" : "Open AI Chatbot"}
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <>
            <img src={aiRoboImg} alt="Chatbot Icon" className="fab-robo-icon" />
            <span className="fab-online-dot" />
          </>
        )}
      </button>

    </div>
  );
};

export default Chatbot;
