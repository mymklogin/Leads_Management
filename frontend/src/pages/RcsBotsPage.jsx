import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bot, 
  Plus, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Code2, 
  Copy, 
  Send, 
  RefreshCw, 
  X,
  Zap,
  SlidersHorizontal,
  Wallet,
  Check,
  AlertCircle,
  Play
} from 'lucide-react';

export const RcsBotsPage = ({ onNavigateToCampaign }) => {
  const [bots, setBots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState('bot_abc123');
  const [templates, setTemplates] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [activeScenario, setActiveScenario] = useState('ALL'); // 'ALL', 'NAME', 'TYPE', 'COMBINED'
  const [loading, setLoading] = useState(false);
  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [showApiDocDrawer, setShowApiDocDrawer] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [activeApiTab, setActiveApiTab] = useState('GetTemplates');
  const [apiTestResponse, setApiTestResponse] = useState(null);
  const [apiTesting, setApiTesting] = useState(false);

  // New Bot Form State
  const [newBotName, setNewBotName] = useState('');
  const [newBotDescription, setNewBotDescription] = useState('');
  const [newBotColor, setNewBotColor] = useState('#4f46e5');
  const [newBotWebhook, setNewBotWebhook] = useState('https://yourdomain.com/rcs-webhook');
  const [botActionMsg, setBotActionMsg] = useState('');

  const API_KEY = '130A8005B8EF4D5BB74E96D1A5CC9063993';

  useEffect(() => {
    fetchBots();
  }, []);

  useEffect(() => {
    if (selectedBotId) {
      fetchBotTemplates(selectedBotId, searchName, filterType);
    }
  }, [selectedBotId, filterType]);

  const fetchBots = async () => {
    try {
      const res = await api.get('/RCSApi/GetBots');
      if (res.data?.response?.bots) {
        setBots(res.data.response.bots);
        if (res.data.response.bots.length > 0 && !selectedBotId) {
          setSelectedBotId(res.data.response.bots[0].botId);
        }
      }
    } catch (err) {
      console.error('Failed to load RCS bots', err);
    }
  };

  const fetchBotTemplates = async (bId, nameFilter, typeFilter) => {
    try {
      setLoading(true);
      const params = {};
      if (bId && bId !== 'ALL_BOTS') params.botId = bId;
      if (typeFilter && typeFilter !== 'All') params.templateType = typeFilter;
      if (nameFilter) params.templateName = nameFilter;

      const res = await api.get('/RCSApi/GetTemplates', { params });
      if (res.data?.response?.templates) {
        setTemplates(res.data.response.templates);
      }
    } catch (err) {
      console.error('Failed to load templates for bot', err);
    } finally {
      setLoading(false);
    }
  };

  // Scenario switchers adhering to Page 6 & 8 in PDF:
  // 1. Get All Templates for a BOT
  // 2. Filter by Template Name (Partial Match)
  // 3. Filter by Template Type
  // 4. Combine Multiple Filters
  const handleSelectScenario = (scenario) => {
    setActiveScenario(scenario);
    if (scenario === 'ALL') {
      setSearchName('');
      setFilterType('All');
      fetchBotTemplates(selectedBotId, '', 'All');
    } else if (scenario === 'NAME') {
      setSearchName('Welcome');
      setFilterType('All');
      fetchBotTemplates(selectedBotId, 'Welcome', 'All');
    } else if (scenario === 'TYPE') {
      setSearchName('');
      setFilterType('RichCard');
      fetchBotTemplates(selectedBotId, '', 'RichCard');
    } else if (scenario === 'COMBINED') {
      setSearchName('promo');
      setFilterType('PlainText');
      fetchBotTemplates(selectedBotId, 'promo', 'PlainText');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBotTemplates(selectedBotId, searchName, filterType);
  };

  const handleCreateBot = async (e) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    try {
      const res = await api.post('/RCSApi/CreateBot', {
        botName: newBotName.trim(),
        description: newBotDescription.trim(),
        color: newBotColor,
        webhookUrl: newBotWebhook
      });

      if (res.data?.status === 'OK') {
        setShowAddBotModal(false);
        setBotActionMsg(`Bot "${newBotName}" registered successfully!`);
        fetchBots();
        setNewBotName('');
        setNewBotDescription('');
        setTimeout(() => setBotActionMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to register new bot.');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 3000);
  };

  // Live Test an RCS API from PDF
  const handleTestApi = async (endpointKey) => {
    setApiTesting(true);
    setApiTestResponse(null);
    try {
      let res;
      if (endpointKey === 'GetBots') {
        res = await api.get(`/RCSApi/GetBots?apiKey=${API_KEY}`);
      } else if (endpointKey === 'CheckRcsBalance') {
        res = await api.get(`/RCSApi/CheckRcsBalance?apiKey=${API_KEY}`);
      } else if (endpointKey === 'GetTemplates') {
        res = await api.get(`/RCSApi/GetTemplates?apiKey=${API_KEY}&botId=${selectedBotId}&templateName=${searchName}&templateType=${filterType === 'All' ? '' : filterType}`);
      } else if (endpointKey === 'CreateCampaign') {
        res = await api.post(`/RCSApi/CreateCampaign?apiKey=${API_KEY}`, {
          templateId: templates[0]?.templateId || 'vendor_tpl_xyz789',
          campaignName: 'Test_Campaign_API',
          mobileNumbers: ['9876543210', '9123456789'],
          enableFallback: false
        });
      }
      setApiTestResponse(res.data);
    } catch (err) {
      setApiTestResponse(err.response?.data || { error: err.message });
    } finally {
      setApiTesting(false);
    }
  };

  const selectedBot = bots.find(b => b.botId === selectedBotId) || bots[0];

  // Construct live API URL based on current inputs
  const currentApiUrl = `http://localhost:5108/api/RCSApi/GetTemplates?apiKey=${API_KEY}&botId=${selectedBotId}${searchName ? `&templateName=${encodeURIComponent(searchName)}` : ''}${filterType !== 'All' ? `&templateType=${filterType}` : ''}`;
  const currentCurl = `curl -X GET "${currentApiUrl}"`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>RCS Verified Bots & Templates Directory</h2>
            <span className="badge badge-hot" style={{ fontSize: '11px' }}>RCS API Spec Compliant (Pages 1–12)</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 3 }}>
            Query registered RCS bots, filter templates dynamically across all 4 scenarios from documentation, and test all carrier endpoints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="btn btn-outline"
            onClick={() => setShowApiDocDrawer(!showApiDocDrawer)}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, borderColor: '#6366f1', color: '#4f46e5' }}
          >
            <Code2 size={16} />
            <span>RCS API Hub & Testing (All 4 Endpoints)</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={() => setShowAddBotModal(true)}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} />
            <span>Register New Bot</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {botActionMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontWeight: 700 }}>{botActionMsg}</span>
        </div>
      )}

      {/* SECTION 1: REGISTERED BOTS CARDS (GET BOTS API - PAGE 9 & 10 IN PDF) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🏢 Registered Brand Bots ({bots.length}) <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>(Page 9-10: GET /GetBots)</span>
          </div>
          <code style={{ fontSize: '11px', color: '#4f46e5' }}>Active Bot: {selectedBot?.botName} ({selectedBotId})</code>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {bots.map(b => {
            const isSelected = selectedBotId === b.botId;
            return (
              <div 
                key={b.botId}
                onClick={() => setSelectedBotId(b.botId)}
                style={{ 
                  background: isSelected ? '#ffffff' : '#f8fafc', 
                  borderRadius: '14px', 
                  border: isSelected ? `2px solid ${b.color || '#4f46e5'}` : '1px solid #e2e8f0', 
                  padding: '16px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 8px 20px -4px rgba(79, 70, 229, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ 
                      width: 42, 
                      height: 42, 
                      borderRadius: '12px', 
                      background: b.color || '#4f46e5', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 800
                    }}>
                      <Bot size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{b.botName}</span>
                        <CheckCircle2 size={15} color="#2563eb" />
                      </div>
                      <code style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>{b.botId}</code>
                    </div>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: '10px', fontWeight: 700 }}>
                    ✓ {b.status || 'Verified'}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  {b.description || 'Carrier-verified brand bot for rich conversational & transactional messaging.'}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11px', color: '#64748b' }}>
                  <span>Verified Templates: <b style={{ color: '#0f172a' }}>{b.templateCount ?? templates.length}</b></span>
                  <span style={{ color: isSelected ? '#4f46e5' : '#64748b', fontWeight: isSelected ? 800 : 500 }}>
                    {isSelected ? '● Currently Active Filter' : 'Click to Filter →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: BOT-SPECIFIC TEMPLATE EXPLORER MATCHING THE 4 SPECIFICATION SCENARIOS */}
      <div className="card">
        {/* Card Title & Scenario Selector Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '14px' }}>
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '16px', fontWeight: 800 }}>
                <Layers size={18} color="#4f46e5" />
                <span>Get RCS Templates: 4 Query Scenarios from PDF Specification</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                PDF Documentation Page 6: Tests All Templates for a Bot, Name Partial Match, Type Filter, and Combined Filters.
              </p>
            </div>

            <span className="badge badge-primary" style={{ fontSize: '11px', padding: '4px 10px' }}>
              Selected Bot: <b>{selectedBot?.botName} ({selectedBotId})</b>
            </span>
          </div>

          {/* 4 SCENARIO TABS (Directly matching PDF Page 6 & 8) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            
            {/* Scenario 1 */}
            <button 
              type="button" 
              className={`btn ${activeScenario === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSelectScenario('ALL')}
              style={{ fontSize: '12px', fontWeight: 700, padding: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} />
                <span>1. All Templates for BOT</span>
              </div>
              <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 500 }}>?botId={selectedBotId}</span>
            </button>

            {/* Scenario 2 */}
            <button 
              type="button" 
              className={`btn ${activeScenario === 'NAME' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSelectScenario('NAME')}
              style={{ fontSize: '12px', fontWeight: 700, padding: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={14} />
                <span>2. Name Partial Match</span>
              </div>
              <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 500 }}>?templateName=Welcome</span>
            </button>

            {/* Scenario 3 */}
            <button 
              type="button" 
              className={`btn ${activeScenario === 'TYPE' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSelectScenario('TYPE')}
              style={{ fontSize: '12px', fontWeight: 700, padding: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={14} />
                <span>3. Template Type Filter</span>
              </div>
              <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 500 }}>?templateType=RichCard</span>
            </button>

            {/* Scenario 4 */}
            <button 
              type="button" 
              className={`btn ${activeScenario === 'COMBINED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleSelectScenario('COMBINED')}
              style={{ fontSize: '12px', fontWeight: 700, padding: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} />
                <span>4. Combine Multiple Filters</span>
              </div>
              <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 500 }}>?templateName=promo&templateType=PlainText</span>
            </button>

          </div>
        </div>

        {/* Live Filter Controls & Live cURL Box */}
        <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Bot Dropdown */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>Select Bot:</label>
              <select 
                className="form-select"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
              >
                {bots.map(b => (
                  <option key={b.botId} value={b.botId}>{b.botName} ({b.botId})</option>
                ))}
              </select>
            </div>

            {/* Search by Template Name (Partial Match as per Page 6 & 8) */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>Template Name (Partial Match):</label>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 6 }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="Search name (e.g. Welcome, promo)"
                    style={{ fontSize: '12px', padding: '6px 10px 6px 28px', width: '220px' }}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                  <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 8, top: 10 }} />
                </div>

                <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '12px', padding: '6px 12px' }}>
                  Filter
                </button>

                {searchName && (
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    onClick={() => { setSearchName(''); fetchBotTemplates(selectedBotId, '', filterType); }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {/* Type Filter Chips (PlainText, RichCard, Carousel as per Page 7) */}
            <div style={{ marginLeft: 'auto' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>Format Type Filter (Page 7):</label>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {['All', 'PlainText', 'RichCard', 'Carousel'].map(t => (
                  <button 
                    key={t}
                    type="button"
                    className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => {
                      setFilterType(t);
                      fetchBotTemplates(selectedBotId, searchName, t);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Dynamic Executed Request & cURL Display (Matching Page 6 & 8) */}
          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>GET</span> {currentApiUrl}
            </div>
            <button 
              type="button"
              className="btn btn-sm"
              onClick={() => copyToClipboard(currentCurl, 'curl')}
              style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '11px', padding: '3px 10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Copy size={12} />
              <span>{copiedText === 'curl' ? 'Copied!' : 'Copy cURL'}</span>
            </button>
          </div>

        </div>

        {/* Templates Grid Cards (Conforming to PDF Page 7 Specification) */}
        <div style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px' }} />
              <div>Querying GetTemplates endpoint...</div>
            </div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Bot size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: '#0f172a' }}>No RCS Templates Found (TotalCount: 0)</div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                Empty results response matching PDF Page 8: <code>Status: "OK", Response: {`{ Templates: [], TotalCount: 0 }`}</code>.
              </p>
              <button 
                className="btn btn-outline btn-sm" 
                onClick={() => handleSelectScenario('ALL')} 
                style={{ marginTop: 10 }}
              >
                Reset to All Templates
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
              {templates.map(tmpl => {
                const isPlainText = tmpl.templateType === 'PlainText';
                const isRichCard = tmpl.templateType === 'RichCard';
                const isCarousel = tmpl.templateType === 'Carousel';
                const isActive = tmpl.templateStatus === 'Active';
                const isPending = tmpl.templateStatus === 'Pending';
                const isRejected = tmpl.templateStatus === 'Rejected';

                let parsedBtns = [];
                if (tmpl.buttonsJson) {
                  try { parsedBtns = JSON.parse(tmpl.buttonsJson); } catch(e) {}
                }
                if (parsedBtns.length === 0 && tmpl.buttonLabel) {
                  parsedBtns = [{ label: tmpl.buttonLabel }];
                }

                return (
                  <div 
                    key={tmpl.templateId}
                    style={{ 
                      background: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Card Header: Type Badge + Status Indicator as per PDF Page 7 */}
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${
                        isRichCard ? 'badge-hot' :
                        isCarousel ? 'badge-warm' : 'badge-cold'
                      }`} style={{ fontSize: '10px' }}>
                        {tmpl.templateType}
                      </span>

                      {/* Status indicator with 'Can Use in Campaign?' rule from Page 7 */}
                      <span className={`badge ${
                        isActive ? 'badge-success' :
                        isPending ? 'badge-warm' : 'badge-dnd'
                      }`} style={{ fontSize: '10px', fontWeight: 700 }}>
                        {isActive ? '✓ Active (Ready)' : isPending ? '⏳ Pending Approval' : '✕ Rejected'}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{tmpl.templateName}</div>
                        <code style={{ fontSize: '11px', color: '#4f46e5' }}>{tmpl.vendorTemplateId || tmpl.templateId}</code>
                      </div>

                      {/* Use Case hint from PDF Page 7 */}
                      <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                        {isPlainText && 'Use Case: Basic notifications, quick surveys & confirmations'}
                        {isRichCard && 'Use Case: Product showcases, high-engagement promotional campaigns'}
                        {isCarousel && 'Use Case: Multi-product catalogs, step-by-step guides'}
                      </div>

                      {/* Message Content Preview */}
                      <div style={{ fontSize: '12px', color: '#334155', background: '#f1f5f9', padding: '8px 10px', borderRadius: '6px', lineHeight: 1.4 }}>
                        {tmpl.cardTitle && <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{tmpl.cardTitle}</div>}
                        <div>💬 "{tmpl.cardDescription || tmpl.smsText || 'Message content.'}"</div>
                      </div>

                      {/* Interactive Buttons / Chips preview */}
                      {parsedBtns.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                          {parsedBtns.map((b, i) => (
                            <span key={i} className="badge badge-primary" style={{ fontSize: '9px', padding: '2px 8px' }}>
                              💬 {b.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* DLT Compliance Info Box */}
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                        <div><b>DLT ID / Entity ID:</b> <code style={{ color: '#4f46e5' }}>{tmpl.entityId || '1201161304403738311'}</code></div>
                        <div><b>Template ID:</b> <code style={{ color: '#059669' }}>{tmpl.smsTemplateId || '—'}</code></div>
                        <div><b>Header:</b> {tmpl.senderId || 'EXPRSS'} | <b>Created:</b> {tmpl.createdDate}</div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ padding: '10px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => copyToClipboard(tmpl.templateId, tmpl.templateId)}
                      >
                        <Copy size={11} />
                        <span>{copiedText === tmpl.templateId ? 'Copied!' : 'Copy ID'}</span>
                      </button>

                      {isActive ? (
                        <button 
                          type="button" 
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={onNavigateToCampaign}
                        >
                          <Send size={11} />
                          <span>Dispatch Campaign</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Cannot use in campaign ({tmpl.templateStatus})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: ALL 4 RCS CARRIER APIS TESTING HUB (DRAWER / MODAL AS PER PDF SPECIFICATION) */}
      {showApiDocDrawer && (
        <div className="card" style={{ background: '#0f172a', color: '#f8fafc', padding: '22px', border: '1px solid #334155', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code2 size={20} color="#38bdf8" />
              <span style={{ fontWeight: 800, fontSize: '16px', color: '#38bdf8' }}>
                Official Carrier RCS API Hub (Tested Against PDF Pages 1–12)
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => setShowApiDocDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* API Selector Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { key: 'GetTemplates', label: '1. Get RCS Templates (Page 5-8)' },
              { key: 'GetBots', label: '2. Get RCS Bots (Page 9-10)' },
              { key: 'CheckRcsBalance', label: '3. Check RCS Balance (Page 4-5)' },
              { key: 'CreateCampaign', label: '4. Create Campaign (Page 1-4)' }
            ].map(tab => (
              <button 
                key={tab.key}
                type="button"
                className={`btn btn-sm ${activeApiTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => { setActiveApiTab(tab.key); setApiTestResponse(null); }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* API Info & Live Test Runner */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            
            {/* Left: Endpoint Details & cURL */}
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#a5b4fc', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {activeApiTab === 'GetTemplates' && 'GET /api/RCSApi/GetTemplates (Filter templates by Bot, Name, Type)'}
                  {activeApiTab === 'GetBots' && 'GET /api/RCSApi/GetBots (Retrieve all registered brand bots)'}
                  {activeApiTab === 'CheckRcsBalance' && 'GET /api/RCSApi/CheckRcsBalance (Check RCS and SMS Balance)'}
                  {activeApiTab === 'CreateCampaign' && 'POST /api/RCSApi/CreateCampaign (Create campaign with optional fallback)'}
                </span>
              </div>

              {/* cURL Display */}
              <pre style={{ margin: '8px 0 12px 0', fontSize: '11px', color: '#38bdf8', overflowX: 'auto', background: '#090d16', padding: '10px', borderRadius: '6px' }}>
                {activeApiTab === 'GetTemplates' && `curl -X GET "http://localhost:5108/api/RCSApi/GetTemplates?apiKey=${API_KEY}&botId=${selectedBotId}&templateName=${searchName}&templateType=${filterType === 'All' ? '' : filterType}"`}
                {activeApiTab === 'GetBots' && `curl -X GET "http://localhost:5108/api/RCSApi/GetBots?apiKey=${API_KEY}"`}
                {activeApiTab === 'CheckRcsBalance' && `curl -X GET "http://localhost:5108/api/RCSApi/CheckRcsBalance?apiKey=${API_KEY}"`}
                {activeApiTab === 'CreateCampaign' && `curl -X POST "http://localhost:5108/api/RCSApi/CreateCampaign?apiKey=${API_KEY}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "TemplateId": "${templates[0]?.templateId || 'vendor_tpl_xyz789'}",\n    "CampaignName": "Sample_Promo_Campaign",\n    "MobileNumbers": ["9876543210", "9123456789"],\n    "EnableFallback": false\n  }'`}
              </pre>

              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => handleTestApi(activeApiTab)}
                disabled={apiTesting}
                style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Play size={13} />
                <span>{apiTesting ? 'Testing Endpoint...' : 'Execute Live API Test Now'}</span>
              </button>
            </div>

            {/* Right: Real-time Live Response JSON */}
            <div style={{ background: '#1e293b', padding: '16px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Live Response from Backend (port 5108):
              </div>

              <pre style={{ 
                margin: 0, 
                fontSize: '11px', 
                color: apiTestResponse?.Status === 'OK' || apiTestResponse?.status === 'OK' ? '#4ade80' : '#f87171', 
                overflowX: 'auto', 
                background: '#090d16', 
                padding: '10px', 
                borderRadius: '6px',
                flex: 1,
                maxHeight: '260px'
              }}>
                {apiTestResponse ? JSON.stringify(apiTestResponse, null, 2) : '// Click "Execute Live API Test Now" to inspect live response'}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Register New Bot */}
      {showAddBotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '460px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={18} color="#4f46e5" />
                <span>Register New RCS Brand Bot</span>
              </div>
              <button 
                type="button" 
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddBotModal(false)}
                style={{ border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBot}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Bot Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Sales Assistant Bot"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Brand Purpose / Description</label>
                <textarea 
                  className="form-input" 
                  rows={2}
                  placeholder="Describe bot use case (Transactional, Marketing, Support)"
                  value={newBotDescription}
                  onChange={(e) => setNewBotDescription(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Brand Theme Accent Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={newBotColor} 
                    onChange={(e) => setNewBotColor(e.target.value)}
                    style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newBotColor} 
                    onChange={(e) => setNewBotColor(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Webhook Callback URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={newBotWebhook}
                  onChange={(e) => setNewBotWebhook(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddBotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 800 }}>
                  Register Verified Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
