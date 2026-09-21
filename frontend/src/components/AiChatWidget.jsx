import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  Mail, 
  Minimize2,
  ChevronDown,
  Headphones,
  UserCheck
} from 'lucide-react';
import api from '../services/api';

const INDIAN_FEMALE_PERSONAS = [
  'Priya Sharma',
  'Neha Patel',
  'Pooja Singh',
  'Sneha Joshi',
  'Ananya Gupta',
  'Divya Reddy',
  'Swati Mishra',
  'Kavita Sen',
  'Riya Kapoor',
  'Megha Verma'
];

const getRandomPersona = () => INDIAN_FEMALE_PERSONAS[Math.floor(Math.random() * INDIAN_FEMALE_PERSONAS.length)];

const getInitials = (name) => {
  if (!name) return 'PS';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const renderFormattedText = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ fontWeight: 700, color: 'inherit' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const getWelcomeMessage = (persona) => ({
  id: 1,
  sender: 'ai',
  text: `Hi! I am ${persona}. Which language would you prefer to chat in? (English / हिंदी / भोजपुरी)`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [assistantPersona, setAssistantPersona] = useState(() => getRandomPersona());
  const [messages, setMessages] = useState(() => [getWelcomeMessage(assistantPersona)]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [chips, setChips] = useState([
    'English',
    'हिंदी (Hindi)',
    'भोजपुरी (Bhojpuri)',
    'Sales Team 💼',
    'Support Team 🛠️'
  ]);

  // Lead state tracking
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    mobile: '',
    email: '',
    service: '',
    inquiryType: 'Sales'
  });

  // Auto-detected visitor location
  const [location, setLocation] = useState({
    city: 'Detecting...',
    state: 'India',
    country: 'IN',
    ip: '127.0.0.1'
  });

  const [leadCapturedNotice, setLeadCapturedNotice] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-detect IP location silently in background on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          setLocation({
            city: data.city || 'Delhi NCR',
            state: data.region || 'Delhi',
            country: data.country_name || 'India',
            ip: data.ip || '127.0.0.1'
          });
        }
      } catch (e) {
        // Fallback detection
        try {
          const res2 = await fetch('https://api.ipify.org?format=json');
          if (res2.ok) {
            const data2 = await res2.json();
            setLocation(prev => ({ ...prev, city: 'Delhi NCR', ip: data2.ip }));
          }
        } catch (e2) {
          setLocation({
            city: 'Delhi NCR',
            state: 'Delhi',
            country: 'India',
            ip: '127.0.0.1'
          });
        }
      }
    };
    detectLocation();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputMsg;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMsg('');
    setLoading(true);

    try {
      const historyPayload = newHistory.map(m => ({
        sender: m.sender,
        content: m.text,
        timestamp: new Date().toISOString()
      }));

      const res = await api.post('/AiChat/message', {
        message: userMsg.text,
        history: historyPayload,
        assistantName: assistantPersona,
        customerName: leadInfo.name || undefined,
        mobile: leadInfo.mobile || undefined,
        email: leadInfo.email || undefined,
        serviceRequired: leadInfo.service || undefined,
        inquiryType: leadInfo.inquiryType || 'Sales',
        city: location.city,
        state: location.state,
        country: location.country,
        ipAddress: location.ip
      });

      if (res.data) {
        if (res.data.assistantName && res.data.assistantName !== assistantPersona) {
          setAssistantPersona(res.data.assistantName);
        }

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.data.reply || 'Thank you! Our representative will be in touch shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, aiMsg]);

        // Update extracted information
        if (res.data.extractedName) setLeadInfo(prev => ({ ...prev, name: res.data.extractedName }));
        if (res.data.extractedMobile) setLeadInfo(prev => ({ ...prev, mobile: res.data.extractedMobile }));
        if (res.data.extractedEmail) setLeadInfo(prev => ({ ...prev, email: res.data.extractedEmail }));
        if (res.data.extractedService) setLeadInfo(prev => ({ ...prev, service: res.data.extractedService }));
        if (res.data.extractedInquiryType) setLeadInfo(prev => ({ ...prev, inquiryType: res.data.extractedInquiryType }));

        // Check if lead was captured
        if (res.data.leadCaptured) {
          setLeadCapturedNotice({
            id: res.data.leadId,
            name: res.data.extractedName || leadInfo.name || 'Visitor',
            service: res.data.extractedService || leadInfo.service || 'Telecom Service'
          });
        }

        if (Array.isArray(res.data.suggestedChips) && res.data.suggestedChips.length > 0) {
          setChips(res.data.suggestedChips);
        }
      }
    } catch (err) {
      console.error('AI Chat request failed:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Thank you for reaching out! We provide enterprise-grade RCS, WhatsApp, SMS, and Voice solutions. Please share your Contact Mobile number so our team can provide instant assistance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    handleSend(chipText);
  };

  const handleResetChat = () => {
    const newPersona = getRandomPersona();
    setAssistantPersona(newPersona);
    setMessages([getWelcomeMessage(newPersona)]);
    setChips([
      'English',
      'हिंदी (Hindi)',
      'भोजपुरी (Bhojpuri)',
      'Sales Team 💼',
      'Support Team 🛠️'
    ]);
    setLeadInfo({
      name: '',
      mobile: '',
      email: '',
      service: '',
      inquiryType: 'Sales'
    });
    setLeadCapturedNotice(null);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99999, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="ai-chat-launcher"
          title={`Chat with ${assistantPersona}`}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 132, 199, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.45)';
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={26} />
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #ffffff'
            }} />
          </div>
          
          {/* Support badge */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '8.5px',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '10px',
            letterSpacing: '0.3px',
            border: '1px solid rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap'
          }}>
            ONLINE SUPPORT
          </div>
        </button>
      )}

      {/* 2. CHAT WINDOW MODAL */}
      {isOpen && (
        <div style={{
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          height: isMinimized ? 56 : 560,
          maxHeight: 'calc(100vh - 48px)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(2, 132, 199, 0.15)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'height 0.25s ease'
        }}>
          {/* TOP HEADER */}
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '12px 16px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                position: 'relative',
                letterSpacing: '0.5px'
              }}>
                {getInitials(assistantPersona)}
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '1.5px solid #ffffff'
                }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: '13.5px', letterSpacing: '0.2px' }}>
                    {assistantPersona}
                  </span>
                  <span style={{ background: '#22c55e', color: '#fff', fontSize: '8.5px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>Senior Telecom Consultant</span>
                  <span>•</span>
                  <MapPin size={9} />
                  <span>{location.city}</span>
                </div>
              </div>
            </div>

            {/* Header controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={handleResetChat}
                title="Start new conversation"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Maximize" : "Minimize"}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* CAPTURED NOTICE BANNER */}
              {leadCapturedNotice && (
                <div style={{
                  background: '#f0fdf4',
                  borderBottom: '1px solid #bbf7d0',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '11.5px',
                  color: '#15803d',
                  fontWeight: 600
                }}>
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span>Lead logged as Ref #{leadCapturedNotice.id}! Our team will contact you soon.</span>
                </div>
              )}

              {/* MESSAGES SCROLL AREA */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#f8fafc'
              }}>
                {messages.map((m) => {
                  const isAi = m.sender === 'ai';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAi ? 'flex-start' : 'flex-end',
                        maxWidth: '88%',
                        alignSelf: isAi ? 'flex-start' : 'flex-end'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        flexDirection: isAi ? 'row' : 'row-reverse'
                      }}>
                        <div style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: isAi ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' : '#475569',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isAi ? '9.5px' : '11px',
                          fontWeight: isAi ? 800 : 500,
                          flexShrink: 0,
                          marginTop: 2,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          {isAi ? getInitials(assistantPersona) : <User size={13} />}
                        </div>

                        <div style={{
                          background: isAi ? '#ffffff' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: isAi ? '#1e293b' : '#ffffff',
                          padding: '9px 13px',
                          borderRadius: isAi ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                          boxShadow: isAi ? '0 1px 3px rgba(0,0,0,0.06)' : '0 2px 6px rgba(2,132,199,0.25)',
                          fontSize: '12.5px',
                          lineHeight: '1.45',
                          border: isAi ? '1px solid #e2e8f0' : 'none',
                          wordBreak: 'break-word'
                        }}>
                          {renderFormattedText(m.text)}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '9.5px',
                        color: '#94a3b8',
                        marginTop: 3,
                        paddingLeft: isAi ? 30 : 0,
                        paddingRight: !isAi ? 30 : 0
                      }}>
                        {m.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
                    <div style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: 800
                    }}>
                      {getInitials(assistantPersona)}
                    </div>
                    <div style={{
                      background: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '4px 14px 14px 14px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      gap: 4
                    }}>
                      <span className="dot-pulse" style={{ width: 6, height: 6, background: '#0284c7', borderRadius: '50%' }} />
                      <span className="dot-pulse" style={{ width: 6, height: 6, background: '#0284c7', borderRadius: '50%', animationDelay: '0.2s' }} />
                      <span className="dot-pulse" style={{ width: 6, height: 6, background: '#0284c7', borderRadius: '50%', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK SUGGESTION CHIPS */}
              {chips.length > 0 && (
                <div style={{
                  padding: '8px 12px',
                  background: '#ffffff',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  flexShrink: 0
                }}>
                  {chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      disabled={loading}
                      style={{
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        borderRadius: '16px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0284c7';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0f9ff';
                        e.currentTarget.style.color = '#0284c7';
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                style={{
                  padding: '10px 12px',
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your message or mobile no..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || loading}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: !inputMsg.trim() || loading ? '#cbd5e1' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: !inputMsg.trim() || loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
