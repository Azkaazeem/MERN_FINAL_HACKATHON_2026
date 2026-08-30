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
import aiRoboImg from '../../assets/AI robo.jpg';
import './Chatbot.css';

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
    const query = inputMsg.trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');

    // Generate Intelligent Civic AI Response
    setTimeout(() => {
      let botReply = `🤖 I have analyzed your query regarding "${query}". You can report this issue via the Home page form, and our system will automatically categorize and dispatch it!`;
      const q = query.toLowerCase();

      if (q.includes('water') || q.includes('leak') || q.includes('pipe') || q.includes('sewage')) {
        botReply = "💧 For water pipe leaks or sewage overflow, submit a report selecting 'Water & Drainage'. Emergency main pipe bursts are dispatched to WSSB with a 4-hour inspection SLA!";
      } else if (q.includes('road') || q.includes('pothole') || q.includes('street')) {
        botReply = "🛣️ Potholes and damaged asphalt are automatically assigned to the Municipal Works & Engineering Department for asphalt repair.";
      } else if (q.includes('garbage') || q.includes('trash') || q.includes('waste')) {
        botReply = "🗑️ Solid waste and bin overflows receive mandatory 24-hour cleanup SLA dispatched to Solid Waste Management Authority (SWMA).";
      } else if (q.includes('power') || q.includes('wire') || q.includes('spark') || q.includes('electric')) {
        botReply = "⚡ Exposed electrical wiring and sparking transformers are classified Critical Urgency with direct emergency line dispatch.";
      } else if (q.includes('right') || q.includes('law') || q.includes('sla')) {
        botReply = "📜 Citizen Rights: Every citizen has the right to clean water, safe roads, unpolluted environment, and timely government service response within 24-48 hours.";
      } else if (q.includes('track') || q.includes('status')) {
        botReply = "🔍 You can track any complaint in real time by scrolling to the 'Track Complaint Status' section and entering your Ticket ID!";
      } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        botReply = "👋 Hello! I am CivicBot, your AI Assistant. How can I help you report an infrastructure issue or understand your civic rights today?";
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="chatbot-wrapper">
      
      {/* ================= 1. FLOATING PROMPT BUBBLE (Notice box) ================= */}
      {showPrompt && !isOpen && (
        <div className="chatbot-prompt-bubble" onClick={toggleChat} title="Click to chat with AI">
          {/* Left: Custom Cartoon Robot Image */}
          <img 
            src={aiRoboImg} 
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
              <img src={aiRoboImg} alt="Robot Avatar" className="header-avatar" />
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
                  <img src={aiRoboImg} alt="Bot" className="bot-msg-avatar" />
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
