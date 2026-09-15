import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Send, 
  Wallet, 
  Layers, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  PhoneCall,
  Smartphone,
  Check,
  X,
  ExternalLink,
  Flame,
  ArrowRight
} from 'lucide-react';

export const RcsPage = ({ onNavigateToOverview }) => {
  const [activeSubTab, setActiveSubTab] = useState('campaign'); // 'campaign', 'templates'
  
  // Balances
  const [rcsBalance, setRcsBalance] = useState(100);
  const [smsBalance, setSmsBalance] = useState(100.0);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('YCSLPB_vg');
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateName: 'pbg_account_status_u',
    templateType: 'PlainText',
    botId: '3c4fa9a066274cd2',
    botName: 'PBG INFO',
    entityId: '1201161304403738311',
    senderId: 'PBGACC',
    smsTemplateId: '1207161545678901235',
    smsText: 'Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.'
  });

  // Campaign Dispatch Form States
  const [campaignName, setCampaignName] = useState('PBG_Account_Status');
  const [mobilesText, setMobilesText] = useState(
`9170304221
7840095957
9868040206`
  );
  const [enableFallback, setEnableFallback] = useState(true);
  const [entityId, setEntityId] = useState('1201161304403738311');
  const [senderId, setSenderId] = useState('EXPRSS');
  const [smsTemplateId, setSmsTemplateId] = useState('1207161545678901235');
  const [smsText, setSmsText] = useState('Summer Exclusive Sale! Claim up to 40% discount on all plans: https://offers.io');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Sample 20 numbers for quick paste
  const sample20Numbers = `9876543210
9123456789
9988776655
9811223344
9822334455
9833445566
9844556677
9855667788
9866778899
9877889900
9888990011
9899001122
9810111213
9812131415
9814151617
9816171819
9818192021
9820212223
9822232425
9824252627`;

  // Mask sensitive DLT IDs for security (1207 XXXX XXXX 1234)
  const maskDltId = (id) => {
    if (!id) return 'XXXX-XXXX-XXXX';
    const str = String(id).trim();
    if (str.length <= 8) return '**** ****';
    return `${str.slice(0, 4)} XXXX XXXX ${str.slice(-4)}`;
  };

  useEffect(() => {
    fetchBalances();
    fetchTemplates();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      if (res.data?.response) {
        setRcsBalance(res.data.response.rcsBalance);
        setSmsBalance(res.data.response.smsBalance);
      }
    } catch (err) {
      console.error('Failed to load RCS balance', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/RCSApi/GetTemplates');
      const list = res.data?.response?.templates || [];
      setTemplates(list);

      const activeFirst = list.find(t => t.templateStatus === 'Active');
      if (activeFirst) {
        setSelectedTemplateId(activeFirst.templateId);
        applyTemplateDlt(activeFirst);
      }
    } catch (err) {
      console.error('Failed to load RCS templates', err);
    }
  };

  const applyTemplateDlt = (tmpl) => {
    if (!tmpl) return;
    if (tmpl.entityId) setEntityId(tmpl.entityId);
    if (tmpl.senderId) setSenderId(tmpl.senderId);
    if (tmpl.smsTemplateId) setSmsTemplateId(tmpl.smsTemplateId);
    if (tmpl.smsText) setSmsText(tmpl.smsText);
  };

  const handleSelectTemplate = (tId) => {
    setSelectedTemplateId(tId);
    const found = templates.find(t => t.templateId === tId);
    if (found) {
      applyTemplateDlt(found);
    }
  };

  const handleToggleTemplateStatus = async (tId) => {
    try {
      const res = await api.post('/RCSApi/ToggleTemplateStatus', { templateId: tId });
      if (res.data?.status === 'OK') {
        fetchTemplates();
      }
    } catch (err) {
      alert('Failed to update template status.');
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/RCSApi/CreateTemplate', newTemplate);
      if (res.data?.status === 'OK') {
        setShowAddTemplateModal(false);
        fetchTemplates();
        setNewTemplate({
          templateName: '',
          templateType: 'RichCard',
          botId: 'bot_abc123',
          botName: 'Marketing Bot',
          entityId: '1201161304403738311',
          senderId: 'EXPRSS',
          smsTemplateId: '',
          smsText: ''
        });
      }
    } catch (err) {
      alert('Failed to create new template.');
    }
  };

  // Valid numbers parser
  const parsedNumbers = mobilesText
    .split(/[\n,]+/)
    .map(m => m.trim())
    .filter(m => m.length >= 10);

  const handleLaunchCampaign = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);

    if (parsedNumbers.length === 0) {
      setError('Please provide at least one valid 10-digit mobile number.');
      return;
    }

    if (rcsBalance < parsedNumbers.length) {
      setError(`Insufficient RCS balance! Required: ${parsedNumbers.length} credits, Available: ${rcsBalance.toLocaleString()} credits.`);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        templateId: selectedTemplateId,
        campaignName: campaignName.trim(),
        mobileNumbers: parsedNumbers,
        enableFallback,
        entityId: enableFallback ? entityId : undefined,
        senderId: enableFallback ? senderId : undefined,
        smsTemplateId: enableFallback ? smsTemplateId : undefined,
        smsText: enableFallback ? smsText : undefined
      };

      const res = await api.post('/RCSApi/CreateCampaign', payload);
      if (res.data?.status === 'OK') {
        setResult(res.data.response);
        setRcsBalance(res.data.response.remainingRcsCredits);
        if (res.data.response.remainingSmsCredits) {
          setSmsBalance(res.data.response.remainingSmsCredits);
        }
        setMobilesText(''); // Numbers cleared after successful send!

        // Auto-dismiss success notification after 8 seconds
        setTimeout(() => {
          setResult(null);
        }, 8000);
      } else {
        setError(res.data?.response?.message || 'Campaign creation warning.');
      }
    } catch (err) {
      setError(err.response?.data?.response?.message || 'Failed to dispatch RCS campaign.');
    } finally {
      setLoading(false);
    }
  };

  const activeTemplates = templates.filter(t => t.templateStatus === 'Active');
  const currentTemplate = templates.find(t => t.templateId === selectedTemplateId) || activeTemplates[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>RCS Business Messaging Engine</h2>
            <span className="badge badge-hot" style={{ fontSize: '11px' }}>Rich Communication Services</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 2 }}>
            Official verified RCS messaging with PlainText, Rich Cards, Carousels & 100% DLT SMS Fallback
          </p>
        </div>

        {/* Live Balance Chips & Shortcut to Overview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', 
            border: '1px solid #c7d2fe', 
            padding: '6px 14px', 
            borderRadius: '10px', 
            fontSize: '12px', 
            color: '#3730a3' 
          }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6366f1', display: 'block', fontWeight: 700 }}>
              RCS Balance
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{rcsBalance.toLocaleString()} Credits</span>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #fefce8, #fef08a)', 
            border: '1px solid #fde047', 
            padding: '6px 14px', 
            borderRadius: '10px', 
            fontSize: '12px', 
            color: '#854d0e' 
          }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ca8a04', display: 'block', fontWeight: 700 }}>
              SMS Fallback Balance
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800 }}>{smsBalance.toLocaleString()} Credits</span>
          </div>

          {onNavigateToOverview && (
            <button 
              className="btn btn-primary" 
              style={{ padding: '8px 14px', fontWeight: 700 }}
              onClick={onNavigateToOverview}
              title="Navigate to RCS Overview & Balance Ledger"
            >
              <Wallet size={14} />
              <span>RCS Overview & Balance ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs Switcher (Only Campaign & Templates) */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          className={`btn ${activeSubTab === 'campaign' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('campaign')}
        >
          <Send size={14} />
          <span>Send RCS Campaign</span>
        </button>

        <button 
          className={`btn ${activeSubTab === 'templates' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveSubTab('templates')}
        >
          <Layers size={14} />
          <span>Registered Bots & Templates ({templates.length})</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {result && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#059669" />
            <div>
              <span style={{ fontWeight: 800 }}>Campaign Dispatched Successfully!</span> Batch ID: <b>#{result.campaignId}</b> | Contacts: <b>{result.totalMobiles}</b> | Remaining RCS Credits: <b>{result.remainingRcsCredits?.toLocaleString()}</b>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setResult(null)} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#059669', padding: '4px' }}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="#dc2626" />
            <div style={{ fontWeight: 700 }}>{error}</div>
          </div>
          <button 
            type="button" 
            onClick={() => setError('')} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
            title="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SEND RCS CAMPAIGN (3-COLUMN COMPACT NO-SCROLL)   */}
      {/* ======================================================== */}
      {activeSubTab === 'campaign' && (
        <form onSubmit={handleLaunchCampaign}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1.05fr 1.15fr 330px', 
            gap: '18px', 
            alignItems: 'start' 
          }}>
            
            {/* COLUMN 1: TEMPLATE SETUP & DLT FALLBACK SETTINGS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Card 1: Template Selection */}
              <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #4f46e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    1. Template & Bot Setup
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    {activeTemplates.length} Active
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Choose Approved Template</label>
                  <select 
                    className="form-select"
                    style={{ fontSize: '13px', padding: '7px 10px' }}
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    required
                  >
                    {activeTemplates.length === 0 ? (
                      <option value="">No Active Templates Available</option>
                    ) : (
                      activeTemplates.map(t => (
                        <option key={t.templateId} value={t.templateId}>
                          {t.templateName} ({t.templateType}) - {t.botName}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Campaign Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ fontSize: '13px', padding: '7px 10px' }}
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                  />
                </div>

                {currentTemplate && (
                  <div style={{ fontSize: '11px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span><b>Vendor ID:</b> <code style={{ color: '#4f46e5' }}>{currentTemplate.vendorTemplateId || currentTemplate.templateId}</code></span>
                    <span><b>Type:</b> <span className="badge badge-warm" style={{ fontSize: '10px' }}>{currentTemplate.templateType}</span></span>
                  </div>
                )}
              </div>

              {/* Card 2: DLT SMS Fallback (Ultra-Compact Auto-Connected) */}
              <div className="card" style={{ padding: '14px 18px', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    <input 
                      type="checkbox" 
                      checked={enableFallback} 
                      onChange={(e) => setEnableFallback(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#4f46e5' }}
                    />
                    <span>2. Enable 100% DLT SMS Fallback</span>
                  </label>

                  <span className={`badge ${enableFallback ? 'badge-success' : 'badge-cold'}`} style={{ fontSize: '10px' }}>
                    {enableFallback ? 'Active' : 'Off'}
                  </span>
                </div>

                {enableFallback && (
                  <div style={{ marginTop: '8px' }}>
                    {/* Compact Approved Fallback Message Preview with Masked Security IDs */}
                    <div style={{ 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      padding: '8px 12px', 
                      fontSize: '12px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
                        <span><b>Sender:</b> {senderId} | <b>DLT ID:</b> <code style={{ color: '#4f46e5' }}>{maskDltId(smsTemplateId)}</code></span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Auto-Connected to Template</span>
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>
                        💬 "{smsText}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 2: RECIPIENT NUMBERS (BIG 20-ROW BOX) & PRIMARY SEND BUTTON */}
            <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                    3. Recipient Mobile Numbers
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    10-digit Indian numbers (20 numbers visible at once)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => setMobilesText(sample20Numbers)}
                    title="Load 20 sample numbers to test immediately"
                  >
                    📋 Paste 20 Samples
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11px', padding: '4px 8px', color: '#dc2626' }}
                    onClick={() => setMobilesText('')}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* 12-ROW TALL TEXTAREA: EXACT 20 NUMBERS VISIBLE AT ONCE */}
              <textarea 
                className="form-input" 
                rows={12}
                style={{ 
                  fontSize: '13px', 
                  fontFamily: 'monospace', 
                  lineHeight: '1.45', 
                  padding: '10px',
                  resize: 'none',
                  width: '100%'
                }}
                value={mobilesText}
                onChange={(e) => setMobilesText(e.target.value)}
                placeholder="Paste up to 5,000 numbers (one per line)..."
                required
              />

              {/* Count & Cost Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: parsedNumbers.length > 0 ? '#10b981' : '#64748b' }}>
                  ✨ <b>{parsedNumbers.length}</b> valid numbers identified
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Cost: <b>{parsedNumbers.length} Credits</b>
                </div>
              </div>

              {/* PRIMARY SEND CAMPAIGN BUTTON */}
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '14px', 
                  fontWeight: 800, 
                  marginTop: '12px',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                }}
                disabled={loading || parsedNumbers.length === 0}
              >
                <Send size={15} />
                <span>
                  {loading ? 'Dispatching Campaign...' : `Send RCS Campaign (${parsedNumbers.length} Mobiles)`}
                </span>
              </button>
            </div>

            {/* COLUMN 3: LIVE SMARTPHONE PREVIEW */}
            <div className="card" style={{ padding: '14px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
              <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', textAlign: 'center', marginBottom: '8px' }}>
                📱 Live RCS Smartphone Preview
              </div>

              {/* Smartphone Mockup */}
              <div style={{ 
                background: '#0f172a', 
                borderRadius: '30px', 
                padding: '12px', 
                border: '3px solid #334155', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                maxWidth: '330px',
                margin: '0 auto'
              }}>
                {/* Phone Speaker & Notch */}
                <div style={{ width: '80px', height: '12px', background: '#1e293b', borderRadius: '10px', margin: '0 auto 10px' }}></div>

                {/* Phone Screen */}
                <div style={{ background: '#f8fafc', borderRadius: '20px', overflow: 'hidden', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
                  {/* Chat Header */}
                  <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      <Bot size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{currentTemplate?.botName || 'Marketing Bot'}</span>
                        <CheckCircle2 size={12} color="#2563eb" />
                      </div>
                      <div style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600 }}>Verified Brand Sender</div>
                    </div>
                  </div>

                  {/* Message Body Inside Phone */}
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                    <div style={{ alignSelf: 'center', fontSize: '9px', color: '#94a3b8', marginBottom: '10px' }}>
                      Today, 12:30 PM • RCS Chat with {currentTemplate?.botName || 'Brand'}
                    </div>

                    {/* DYNAMIC CARD RENDERING */}
                    {currentTemplate?.templateType === 'PlainText' ? (
                      /* PlainText Card */
                      <div>
                        <div style={{ 
                          background: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '14px', 
                          borderBottomLeftRadius: '4px',
                          padding: '10px 12px',
                          fontSize: '12px',
                          color: '#0f172a',
                          lineHeight: 1.4,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                        }}>
                          {currentTemplate?.smsText || 'Welcome to our verified service! Enjoy up to 10% off on your first order.'}
                        </div>

                        {/* Quick Reply Chips */}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-outline btn-sm" style={{ background: '#fff', fontSize: '10px', borderRadius: '14px', borderColor: '#cbd5e1', padding: '3px 8px' }}>
                            👍 Yes, Interested
                          </button>
                          <button type="button" className="btn btn-outline btn-sm" style={{ background: '#fff', fontSize: '10px', borderRadius: '14px', borderColor: '#cbd5e1', padding: '3px 8px' }}>
                            ❌ Stop Promo
                          </button>
                        </div>
                      </div>
                    ) : currentTemplate?.templateType === 'Carousel' ? (
                      /* Carousel Card */
                      <div>
                        <div style={{ 
                          background: '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid #cbd5e1', 
                          overflow: 'hidden',
                          boxShadow: '0 3px 6px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ height: 90, background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px' }}>
                            [ E-Commerce Carousel 1/3 ]
                          </div>
                          <div style={{ padding: '8px 10px' }}>
                            <div style={{ fontWeight: 700, fontSize: '12px' }}>Enterprise Suite Pro</div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: 2 }}>
                              Multi-channel CRM & Lead engine.
                            </div>
                            <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 6, fontSize: '10px', padding: '4px' }}>
                              View Details
                            </button>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: 6 }}>
                          Swipe left for more cards ➔
                        </div>
                      </div>
                    ) : (
                      /* RichCard (Default) */
                      <div style={{ 
                        background: '#ffffff', 
                        borderRadius: '14px', 
                        border: '1px solid #cbd5e1', 
                        overflow: 'hidden',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.06)'
                      }}>
                        {/* Rich Media Banner */}
                        <div style={{ 
                          height: 110, 
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#ffffff',
                          padding: '8px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                            ✨ Limited Time Festival Offer
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 800, marginTop: 2 }}>
                            Summer Exclusive Sale!
                          </div>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '10px' }}>
                          <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.35, marginBottom: 10 }}>
                            Get up to <b>40% OFF</b> on all premium subscriptions. Tap below to claim.
                          </div>

                          {/* Interactive CTA Buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '11px', padding: '6px' }}>
                              Claim Discount
                            </button>
                            <button type="button" className="btn btn-outline btn-sm" style={{ width: '100%', fontSize: '11px', padding: '6px', background: '#fff' }}>
                              <PhoneCall size={11} /> Call Representative
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REGISTERED BOTS & APPROVED TEMPLATES             */}
      {/* ======================================================== */}
      {activeSubTab === 'templates' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title">Registered RCS Bots & Approved Templates</div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                All templates registered with Google Jibe / Telco RCS engines with automatic DLT SMS Fallback linkage.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddTemplateModal(true)}
            >
              <Plus size={14} />
              <span>Register New Template</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Template Type</th>
                  <th>Bot Details</th>
                  <th>Vendor Template ID</th>
                  <th>Fallback DLT ID</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.templateId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.templateName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t.templateId}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        t.templateType === 'RichCard' ? 'badge-hot' :
                        t.templateType === 'Carousel' ? 'badge-warm' : 'badge-cold'
                      }`}>
                        {t.templateType}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.botName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{t.botId}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '11px', color: '#4f46e5' }}>{t.vendorTemplateId || t.templateId}</code>
                    </td>
                    <td>
                      <div style={{ fontSize: '11px' }}>
                        <div><b>Header:</b> {t.senderId || 'EXPRSS'}</div>
                        <div><b>DLT ID:</b> <code style={{ color: '#4f46e5' }}>{maskDltId(t.smsTemplateId)}</code></div>
                        {t.entityId && <div><b>Entity:</b> <code style={{ color: '#64748b' }}>{maskDltId(t.entityId)}</code></div>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.templateStatus === 'Active' ? 'badge-success' : 'badge-dnd'}`}>
                        {t.templateStatus === 'Active' ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{t.createdDate}</td>
                    <td>
                      <button 
                        className={`btn btn-sm ${t.templateStatus === 'Active' ? 'btn-outline' : 'btn-primary'}`}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={() => handleToggleTemplateStatus(t.templateId)}
                      >
                        {t.templateStatus === 'Active' ? 'Deactivate' : 'Approve & Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: REGISTER NEW TEMPLATE                            */}
      {/* ======================================================== */}
      {showAddTemplateModal && (
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
            width: '540px',
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                Register New RCS Template
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddTemplateModal(false)}
                style={{ border: 'none' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Festive_Discount_Card"
                    value={newTemplate.templateName}
                    onChange={(e) => setNewTemplate({ ...newTemplate, templateName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Template Type</label>
                  <select 
                    className="form-select"
                    value={newTemplate.templateType}
                    onChange={(e) => setNewTemplate({ ...newTemplate, templateType: e.target.value })}
                  >
                    <option value="PlainText">PlainText (Interactive Chips)</option>
                    <option value="RichCard">RichCard (Banner + CTA)</option>
                    <option value="Carousel">Carousel (Multi-Card)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Assign to Verified Bot</label>
                <select 
                  className="form-select"
                  value={newTemplate.botId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const bName = bId === 'bot_abc123' ? 'Marketing Bot' : 'Support Bot';
                    setNewTemplate({ ...newTemplate, botId: bId, botName: bName });
                  }}
                >
                  <option value="bot_abc123">Marketing Bot (bot_abc123)</option>
                  <option value="bot_def456">Support Bot (bot_def456)</option>
                </select>
              </div>

              {/* DLT Parameters */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px', color: '#475569', marginBottom: '10px' }}>
                  DLT SMS Fallback Settings (Mandatory for Fallback)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>DLT Entity ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newTemplate.entityId}
                      onChange={(e) => setNewTemplate({ ...newTemplate, entityId: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '11px' }}>DLT Sender ID (Header)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newTemplate.senderId}
                      onChange={(e) => setNewTemplate({ ...newTemplate, senderId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>SMS Content Template ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={newTemplate.smsTemplateId}
                    onChange={(e) => setNewTemplate({ ...newTemplate, smsTemplateId: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px' }}>Fallback SMS Text</label>
                  <textarea 
                    className="form-input" 
                    rows={2}
                    value={newTemplate.smsText}
                    onChange={(e) => setNewTemplate({ ...newTemplate, smsText: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddTemplateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create & Approve Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
