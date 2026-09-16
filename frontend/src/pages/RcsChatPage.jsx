import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Search, 
  Phone, 
  Clock, 
  Check, 
  CheckCheck, 
  AlertCircle, 
  Download, 
  User, 
  Bot, 
  Filter,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const RcsChatPage = () => {
  const [bots, setBots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(15);

  // Engaged Numbers List & Filter
  const [engagedNumbers, setEngagedNumbers] = useState([
    {
      mobile: '9868040206',
      name: 'PBG Customer',
      lastMessage: 'Status update received. Thank you.',
      lastTime: '15:20',
      unread: 1
    },
    {
      mobile: '9170304221',
      name: 'Verified User',
      lastMessage: 'How can I renew my membership?',
      lastTime: '14:45',
      unread: 0
    },
    {
      mobile: '7840095957',
      name: 'Account Contact',
      lastMessage: 'Yes, please share the invoice link.',
      lastTime: '11:10',
      unread: 0
    }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  // Active Chat Message Thread
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadBots();
    initializeChatHistory();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(() => {
        // Background sync
      }, refreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, refreshInterval]);

  const loadBots = async () => {
    try {
      const res = await api.get('/RCSApi/GetBots');
      const botList = res.data?.response?.bots || res.data?.Response?.Bots || [];
      setBots(botList);
      if (botList.length > 0) {
        setSelectedBotId(botList[0].botId || botList[0].BotId);
      }
    } catch (err) {
      console.error('Failed to load bots', err);
      const defaultBot = [{ botId: '3c4fa9a066274cd2', botName: 'PBG INFO' }];
      setBots(defaultBot);
      setSelectedBotId(defaultBot[0].botId);
    }
  };

  const initializeChatHistory = () => {
    setMessages({
      '9868040206': [
        {
          id: 1,
          sender: 'bot',
          text: 'Dear User, your PBG account status has been updated. Please log in to review your current details.',
          time: '15:15',
          status: 'READ'
        },
        {
          id: 2,
          sender: 'user',
          text: 'Status update received. Thank you.',
          time: '15:20',
          status: 'DELIVERED'
        }
      ],
      '9170304221': [
        {
          id: 1,
          sender: 'user',
          text: 'How can I renew my membership?',
          time: '14:45',
          status: 'DELIVERED'
        }
      ],
      '7840095957': [
        {
          id: 1,
          sender: 'user',
          text: 'Yes, please share the invoice link.',
          time: '11:10',
          status: 'DELIVERED'
        }
      ]
    });
    setSelectedChat(engagedNumbers[0]);
  };

  const filteredNumbers = engagedNumbers.filter(n => 
    n.mobile.includes(searchQuery) || n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMessages = selectedChat ? (messages[selectedChat.mobile] || []) : [];

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    setFeedback(null);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: Date.now(),
      sender: 'bot',
      text: textToSend,
      time: timeStr,
      status: 'SENT'
    };

    // Optimistic update
    setMessages(prev => ({
      ...prev,
      [selectedChat.mobile]: [...(prev[selectedChat.mobile] || []), newMsg]
    }));

    try {
      // Call live vendor SendChatMessage endpoint
      const payload = {
        BotId: selectedBotId || '3c4fa9a066274cd2',
        MobileNo: selectedChat.mobile,
        MessageText: textToSend
      };

      const res = await api.post('/RCSApi/SendChatMessage', payload);
      const resData = res.data?.response || res.data?.Response;

      setFeedback({
        type: 'success',
        message: resData?.message || 'Message delivered to user device!'
      });

      // Update status to DELIVERED
      setMessages(prev => {
        const chatMsgs = [...(prev[selectedChat.mobile] || [])];
        const lastIdx = chatMsgs.findIndex(m => m.id === newMsg.id);
        if (lastIdx >= 0) {
          chatMsgs[lastIdx].status = 'DELIVERED';
        }
        return { ...prev, [selectedChat.mobile]: chatMsgs };
      });
    } catch (err) {
      console.error('Failed to send chat message', err);
      const msg = err.response?.data?.response?.message || err.response?.data?.message || err.message;
      setFeedback({
        type: 'error',
        message: msg || 'Failed to dispatch chat message.'
      });
    } finally {
      setSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Breadcrumb Header */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>
          Home / <span style={{ color: '#0a66c2' }}>RCS Chat</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={24} color="#0a66c2" />
              RCS 1-to-1 Live Chat
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time two-way conversational agent messaging with active engaged recipients.
            </p>
          </div>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div style={{ 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '14px', 
        padding: '14px 20px', 
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* BOT selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>BOT:</span>
            <select 
              className="form-control" 
              value={selectedBotId} 
              onChange={e => setSelectedBotId(e.target.value)}
              style={{ fontSize: '12.5px', padding: '6px 12px', minWidth: '160px' }}
            >
              {bots.map(b => (
                <option key={b.botId || b.BotId} value={b.botId || b.BotId}>
                  {b.botName || b.BotName}
                </option>
              ))}
            </select>
          </div>

          {/* FROM Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>FROM:</span>
            <input 
              type="date" 
              className="form-control" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            />
          </div>

          {/* TO Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TO:</span>
            <input 
              type="date" 
              className="form-control" 
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            />
          </div>

          {/* Load Button */}
          <button 
            type="button" 
            className="btn btn-primary"
            style={{ fontSize: '12.5px', padding: '6px 16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Search size={14} />
            <span>Load</span>
          </button>
        </div>

        {/* Right Auto-Refresh & Interval */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: '#334155', margin: 0 }}>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={e => setAutoRefresh(e.target.checked)} 
              style={{ width: 16, height: 16 }}
            />
            <span>AUTO</span>
          </label>

          <select 
            className="form-control" 
            value={refreshInterval} 
            onChange={e => setRefreshInterval(Number(e.target.value))}
            style={{ fontSize: '12px', padding: '4px 8px', width: '70px' }}
          >
            <option value={15}>15s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
        </div>
      </div>

      {/* Main Dual-Panel Chat Workspace */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '320px 1fr', 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '16px', 
        overflow: 'hidden',
        height: '680px',
        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
      }}>
        
        {/* Left Panel: Engaged Numbers List */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          
          {/* Left Panel Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                <Phone size={15} color="#0a66c2" />
                <span>Engaged Numbers ({filteredNumbers.length})</span>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} title="Real-time Webhook Feed Active"></span>
            </div>

            {/* Search Filter Box */}
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Filter numbers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', fontSize: '12.5px', borderRadius: '8px' }}
              />
            </div>
          </div>

          {/* Numbers Scrollable List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredNumbers.length > 0 ? (
              filteredNumbers.map((item) => {
                const isSelected = selectedChat?.mobile === item.mobile;
                return (
                  <div 
                    key={item.mobile}
                    onClick={() => setSelectedChat(item)}
                    style={{ 
                      padding: '12px 16px', 
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: isSelected ? '#e0f2fe' : 'transparent',
                      borderLeft: isSelected ? '3px solid #0a66c2' : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{item.mobile}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.lastTime}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.lastMessage}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <MessageSquare size={32} color="#cbd5e1" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>No engagements in this range.</div>
                <div style={{ fontSize: '11px', marginTop: 4 }}>Responses from campaigns appear here live.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Conversation Canvas & Message Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          
          {/* Conversation Header */}
          <div style={{ 
            padding: '14px 20px', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: '#ffffff'
          }}>
            {selectedChat ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: '50%', 
                  background: '#0a66c2', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px' 
                }}>
                  {selectedChat.mobile.slice(-2)}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    +91 {selectedChat.mobile}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                    <span>RCS Enabled Contact</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#64748b' }}>Select a number to start conversation</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '12px' }} title="Refresh Chat">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div style={{ 
              padding: '8px 16px', 
              fontSize: '12px', 
              background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: feedback.type === 'success' ? '#065f46' : '#991b1b',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {selectedChat ? (
              activeMessages.map((m) => {
                const isBot = m.sender === 'bot';
                return (
                  <div 
                    key={m.id} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: isBot ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ 
                      maxWidth: '75%', 
                      background: isBot ? '#0a66c2' : '#ffffff', 
                      color: isBot ? '#ffffff' : '#1e293b', 
                      padding: '10px 14px', 
                      borderRadius: isBot ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: isBot ? 'none' : '1px solid #e2e8f0',
                      fontSize: '13px',
                      lineHeight: 1.5
                    }}>
                      <div>{m.text}</div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: 4, 
                        marginTop: '4px',
                        fontSize: '10.5px',
                        opacity: isBot ? 0.85 : 0.6
                      }}>
                        <span>{m.time}</span>
                        {isBot && m.status === 'READ' && <CheckCheck size={12} color="#67e8f9" />}
                        {isBot && m.status === 'DELIVERED' && <CheckCheck size={12} />}
                        {isBot && m.status === 'SENT' && <Check size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No conversation selected.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Composer Bar */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea 
                  className="form-control" 
                  rows={2}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                  disabled={!selectedChat || sending}
                  style={{ width: '100%', fontSize: '13px', resize: 'none', padding: '10px 14px' }}
                />
                <div style={{ position: 'absolute', right: '10px', bottom: '6px', fontSize: '10.5px', color: '#94a3b8' }}>
                  {inputText.length}/1000
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!selectedChat || !inputText.trim() || sending}
                style={{ 
                  padding: '12px 18px', 
                  fontWeight: 700, 
                  fontSize: '13px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  height: '52px'
                }}
              >
                <Send size={15} />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
