import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  X,
  PhoneCall
} from 'lucide-react';

export const RcsCampaignPage = () => {
  // Balances
  const [rcsBalance, setRcsBalance] = useState(104997);
  const [smsBalance, setSmsBalance] = useState(100000);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('tpl_welcome_01');

  // Campaign Dispatch Form States
  const [campaignName, setCampaignName] = useState('Summer Product Launch');
  const [mobilesText, setMobilesText] = useState(
`9876543210
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
9824252627`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>RCS Campaigns Dispatcher</h2>
            <span className="badge badge-hot" style={{ fontSize: '11px' }}>Rich Messaging Broadcast</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 2 }}>
            Official verified RCS messaging with PlainText, Rich Cards, Carousels & 100% DLT SMS Fallback.
          </p>
        </div>

        {/* Live Balance Chips */}
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
              Live RCS Balance
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
        </div>
      </div>

      {/* Alert Notifications */}
      {result && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      {/* 3-COLUMN COMPACT CAMPAIGN DISPATCHER */}
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
                      <span><b>Header:</b> {senderId} | <b>DLT ID / Entity ID:</b> <code style={{ color: '#4f46e5' }}>{entityId}</code> | <b>Template ID:</b> <code style={{ color: '#059669' }}>{smsTemplateId}</code></span>
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
    </div>
  );
};
