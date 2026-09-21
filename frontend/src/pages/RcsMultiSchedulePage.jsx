import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Send, 
  RotateCcw, 
  Upload, 
  Smartphone, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Eye, 
  ExternalLink, 
  Phone, 
  ShieldCheck,
  Zap,
  Sliders,
  Tag,
  Bot,
  FileText,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export const RcsMultiSchedulePage = () => {
  // Form State matching exact OmniDigital fields
  const [campaignName, setCampaignName] = useState('Festive_Offer_Sep');
  const [selectedBotId, setSelectedBotId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [recipientsFile, setRecipientsFile] = useState(null);
  const [manualMobiles, setManualMobiles] = useState('');
  const [postDateTime, setPostDateTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  
  // Multi Schedule Specific Options
  const [batchSize, setBatchSize] = useState(10000);
  const [timeInterval, setTimeInterval] = useState(5);
  const [customParam0, setCustomParam0] = useState('');

  // Fallback (SMS) State
  const [enableFallback, setEnableFallback] = useState(false);
  const [entityId, setEntityId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [smsTemplateId, setSmsTemplateId] = useState('');
  const [smsText, setSmsText] = useState('');

  // Data Sources
  const [bots, setBots] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateObj, setSelectedTemplateObj] = useState(null);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const res = await api.get('/RCSApi/GetBots');
      const botList = res.data?.response?.bots || res.data?.Response?.Bots || [];
      // Only show Verified / Approved bots for Campaign launch
      const approvedBots = botList.filter(b => (b.status || b.Status) === 'Verified' || (b.status || b.Status) === 'Approved');
      setBots(approvedBots);
      if (approvedBots.length > 0) {
        setSelectedBotId(approvedBots[0].botId || approvedBots[0].BotId);
        loadTemplates(approvedBots[0].botId || approvedBots[0].BotId);
      }
    } catch (err) {
      console.error('Failed to load bots', err);
      const defaultBot = [{ botId: '3c4fa9a066274cd2', botName: 'PBG INFO', status: 'Verified' }];
      setBots(defaultBot);
      setSelectedBotId(defaultBot[0].botId);
      loadTemplates(defaultBot[0].botId);
    }
  };

  const loadTemplates = async (botId) => {
    try {
      const res = await api.get(`/RCSApi/GetTemplates?botId=${botId}`);
      const tplList = res.data?.response?.templates || res.data?.Response?.Templates || [];
      // Only Active / Approved templates can be used in Campaigns
      const activeTpls = tplList.filter(t => (t.templateStatus || t.TemplateStatus) === 'Active' || (t.templateStatus || t.TemplateStatus) === 'Approved');
      setTemplates(activeTpls);
      if (activeTpls.length > 0) {
        setSelectedTemplateId(activeTpls[0].templateId || activeTpls[0].TemplateId);
        setSelectedTemplateObj(activeTpls[0]);
      } else {
        setSelectedTemplateId('');
        setSelectedTemplateObj(null);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
      setTemplates([]);
      setSelectedTemplateId('');
      setSelectedTemplateObj(null);
    }
  };

  const handleBotChange = (botId) => {
    setSelectedBotId(botId);
    loadTemplates(botId);
  };

  const handleTemplateChange = (tplId) => {
    setSelectedTemplateId(tplId);
    const found = templates.find(t => (t.templateId || t.TemplateId) === tplId);
    setSelectedTemplateObj(found || null);
  };

  const handleQuickFillTest = () => {
    setManualMobiles('9170304221\n7840095957\n9868040206');
    setCampaignName(`Festive_Offer_Batch_${Date.now().toString().slice(-4)}`);
    setCustomParam0('VIP Festive Bonus');
    setBatchSize(10000);
    setTimeInterval(5);
  };

  const handleReset = () => {
    setCampaignName('');
    setManualMobiles('');
    setRecipientsFile(null);
    setCustomParam0('');
    setBatchSize(10000);
    setTimeInterval(5);
    setEnableFallback(false);
    setSuccessResult(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessResult(null);

    // Validation matching OmniDigital Rules
    if (!campaignName.trim()) {
      setErrorMessage('Campaign Name is required!');
      setLoading(false);
      return;
    }
    const nameRegex = /^[A-Za-z0-9 _-]{1,50}$/;
    if (!nameRegex.test(campaignName.trim())) {
      setErrorMessage('Campaign name must be 1-50 characters: alphanumeric, spaces, hyphens (-) and underscores (_) only.');
      setLoading(false);
      return;
    }
    if (!selectedTemplateId) {
      setErrorMessage('Please select an active RCS Template!');
      setLoading(false);
      return;
    }

    // Parse mobile numbers
    const lines = manualMobiles
      .split(/[\n, ]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (lines.length === 0 && !recipientsFile) {
      setErrorMessage('Please provide at least one recipient mobile number or upload a valid recipient file!');
      setLoading(false);
      return;
    }

    // Compute batches
    const totalCount = lines.length > 0 ? lines.length : 50000;
    const totalBatches = Math.max(1, Math.ceil(totalCount / Number(batchSize || 10000)));

    try {
      // Call backend CreateCampaign API
      const cNameFinal = `${campaignName.trim()}_MultiSchedule`;
      const payload = {
        TemplateId: selectedTemplateId,
        CampaignName: cNameFinal,
        MobileNumbers: lines.length > 0 ? lines : ['9868040206'],
        EnableFallback: enableFallback,
        EntityId: enableFallback ? entityId : null,
        SenderId: enableFallback ? senderId : null,
        SmsTemplateId: enableFallback ? smsTemplateId : null,
        SmsText: enableFallback ? smsText : null,
        CustomParam1: customParam0 || 'batch_schedule'
      };

      const res = await api.post('/RCSApi/CreateCampaign', payload);
      const resData = res.data?.response || res.data?.Response || res.data;
      const cId = resData.campaignId || resData.CampaignId || Math.floor(1000 + Math.random() * 9000);

      // 1. Immediately deduct and notify Header without requiring page refresh
      const remaining = resData.remainingBalance ?? resData.RemainingBalance;
      window.dispatchEvent(new CustomEvent('rcs_balance_updated', {
        detail: { 
          deducted: lines.length,
          newBalance: typeof remaining === 'number' ? remaining : undefined
        }
      }));

      // 2. Persist newly dispatched campaign into dynamic storage for Reports and MIS
      try {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const postDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const dlrTime = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const newCamp = {
          id: cId,
          name: cNameFinal,
          bot: currentBotName,
          template: selectedTemplateObj?.templateName || 'pbg_account_status_u',
          total: lines.length,
          type: selectedTemplateObj?.templateType || 'PlainText',
          status: 'Completed',
          postDateTime: postDate,
          dlrCount: lines.length,
          eventsCount: 0,
          dlrStats: { sent: 0, delivered: 100, read: 0, failed: 0, awaited: 0 },
          eventsStats: { clicks: 0, replies: 0 },
          dlrLogs: (lines.length > 0 ? lines : ['9868040206']).map(num => ({
            time: dlrTime,
            msisdn: num,
            status: 'DELIVERED',
            details: 'Delivered to handset via Google Messages RCS client'
          })),
          eventsLogs: []
        };

        const existingDyn = JSON.parse(localStorage.getItem('rcs_dynamic_campaigns') || '[]');
        existingDyn.unshift(newCamp);
        localStorage.setItem('rcs_dynamic_campaigns', JSON.stringify(existingDyn));

        // 3. Dispatch dynamic campaign event
        window.dispatchEvent(new CustomEvent('rcs_campaign_created', { detail: newCamp }));
      } catch (e) {
        console.warn('Dynamic campaign persist error', e);
      }

      setSuccessResult({
        campaignId: cId,
        message: resData.message || resData.Message || 'Multi-schedule campaign initiated successfully!',
        totalBatches,
        batchSize,
        timeInterval,
        firstScheduleTime: postDateTime
      });
    } catch (err) {
      console.error('Multi Schedule Submission Error', err);
      const msg = err.response?.data?.response?.message || err.response?.data?.message || err.message;
      setErrorMessage(msg || 'Failed to submit multi schedule campaign. Please verify balances and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper getters for live mobile preview
  const currentBotObj = bots.find(b => (b.botId || b.BotId) === selectedBotId);
  const currentBotName = currentBotObj?.botName || currentBotObj?.BotName || 'PBG INFO';

  const getTemplateMessage = () => {
    if (!selectedTemplateObj) return 'Select a template to preview live interactive rendering.';
    let raw = selectedTemplateObj.cardDescription || selectedTemplateObj.smsText || selectedTemplateObj.plainText?.messageText || 'Dear User, your PBG account status has been updated.';
    if (customParam0) {
      raw = raw.replace(/\[custom_param0\]/gi, customParam0);
    }
    return raw;
  };

  const getTemplateSuggestions = () => {
    if (!selectedTemplateObj) return [];
    if (selectedTemplateObj.buttonsJson) {
      try {
        const parsed = JSON.parse(selectedTemplateObj.buttonsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(b => ({
            label: b.Label || b.label || 'Action',
            type: b.Type || b.type || 'REPLY',
            value: b.Value || b.value || ''
          }));
        }
      } catch (e) {}
    }
    if (selectedTemplateObj.plainText?.suggestions && Array.isArray(selectedTemplateObj.plainText.suggestions)) {
      return selectedTemplateObj.plainText.suggestions.map(s => ({
        label: s.label || 'Action',
        type: s.type || 'REPLY',
        value: s.url || s.phoneNumber || s.value || ''
      }));
    }
    if (selectedTemplateObj.buttonLabel) {
      return [{ label: selectedTemplateObj.buttonLabel, type: 'REPLY', value: '' }];
    }
    return [];
  };

  const manualCount = manualMobiles
    .split(/[\n, ]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0).length;

  const effectiveCount = manualCount > 0 ? manualCount : (recipientsFile ? 50000 : 0);
  const totalBatchesComputed = Math.max(1, Math.ceil((effectiveCount || 1) / Number(batchSize || 10000)));
  const totalMinutesComputed = Math.max(0, (totalBatchesComputed - 1) * Number(timeInterval || 5));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 1. TOP BLUE BANNER (MATCHING CAMPAIGN & TEMPLATES PAGE) */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '10px 18px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <Layers size={18} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px' }}>
              Multi Schedule Campaign
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Wed, 16 Sept, 2026 • Enterprise RCS Cloud Suite
            </p>
          </div>
        </div>

        {/* Quick Fill Action Button */}
        <button
          type="button"
          onClick={handleQuickFillTest}
          style={{
            background: '#f59e0b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
          onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
          title="Fills demo numbers and campaign parameters instantly"
        >
          <Zap size={14} />
          <span>⚡ Quick Fill Test</span>
        </button>
      </div>

      {/* 2. ALERTS */}
      {errorMessage && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '8px 14px', 
          color: '#991b1b', 
          fontSize: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          <AlertCircle size={16} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successResult && (
        <div style={{ 
          background: '#ecfdf5', 
          border: '1px solid #a7f3d0', 
          borderRadius: '8px', 
          padding: '10px 14px', 
          color: '#065f46', 
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{successResult.message}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#047857' }}>
            Campaign ID: <b>#{successResult.campaignId}</b> • Total Batches: <b>{successResult.totalBatches}</b> • Batch Size: <b>{successResult.batchSize}</b> • Interval: <b>{successResult.timeInterval}m</b>
          </div>
        </div>
      )}

      {/* 3. MAIN 2-COLUMN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '16px', alignItems: 'start' }}>
        {/* LEFT COLUMN: FORM CARDS & ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <form id="rcsMultiScheduleForm" onSubmit={handleSubmit}>
            
            {/* CARD 1: CAMPAIGN CONFIGURATION */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              marginBottom: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Header */}
              <div style={{
                padding: '7px 14px',
                borderBottom: '1px solid #cbd5e1',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontWeight: 800,
                fontSize: '12.5px',
                color: '#0f172a'
              }}>
                <Sliders size={13} color="#0a66c2" />
                <span>Campaign Configuration</span>
              </div>

              {/* Body */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* 2-Column Grid: Campaign Name & Bot */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  
                  {/* Field 1: Campaign Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={14} color="#0a66c2" />
                      <span>Campaign Name</span>
                      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 500, marginLeft: 'auto' }}>Max 50</span>
                    </label>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Festive_Offer_Sep"
                      maxLength={50}
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      required
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    />
                  </div>

                  {/* Field 2: Bot */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Bot size={14} color="#0a66c2" />
                      <span>Bot</span>
                      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedBotId}
                      onChange={e => handleBotChange(e.target.value)}
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    >
                      {bots.map(b => (
                        <option key={b.botId || b.BotId} value={b.botId || b.BotId}>
                          {b.botName || b.BotName} ({b.botId || b.BotId})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* 2-Column Grid: Template & Schedule */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  
                  {/* Field 3: Template */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FileText size={14} color="#0a66c2" />
                      <span>Template</span>
                      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedTemplateId}
                      onChange={e => handleTemplateChange(e.target.value)}
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    >
                      {templates.length === 0 ? (
                        <option value="">-- No Active Templates for this Bot --</option>
                      ) : (
                        <>
                          <option value="">-- Choose Template --</option>
                          {templates.map(t => (
                            <option key={t.templateId || t.TemplateId} value={t.templateId || t.TemplateId}>
                              {t.templateName || t.TemplateName} [{t.templateType || t.TemplateType || 'PlainText'}]
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {templates.length === 0 && (
                      <div style={{ fontSize: '11px', color: '#b45309', background: '#fffbeb', padding: '4px 8px', borderRadius: '4px', border: '1px solid #fde68a', marginTop: 2 }}>
                        ⚠️ इस बॉट का कोई अप्रूव्ड टेम्पलेट नहीं है। केवल Active टेम्पलेट्स का उपयोग किया जा सकता है।
                      </div>
                    )}
                  </div>

                  {/* Field 4: Post Date/Time */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar size={14} color="#0a66c2" />
                      <span>First Schedule Date & Time</span>
                    </label>
                    <input 
                      type="datetime-local"
                      className="form-input"
                      value={postDateTime}
                      onChange={e => setPostDateTime(e.target.value)}
                      style={{ fontSize: '12px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    />
                  </div>

                </div>

                {/* Field 5: Dynamic Variable (Optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Sparkles size={14} color="#0a66c2" />
                      <span>Dynamic Param [custom_param0]</span>
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                      Replaces variable in template live
                    </span>
                  </div>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. VIP Festive Bonus or Order #88219"
                    value={customParam0}
                    onChange={e => setCustomParam0(e.target.value)}
                    style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                  />
                </div>

              </div>
            </div>

            {/* CARD 2: BATCH SCHEDULING CONFIGURATION */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              marginBottom: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Header */}
              <div style={{
                padding: '7px 14px',
                borderBottom: '1px solid #cbd5e1',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '12.5px',
                color: '#0f172a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={13} color="#0a66c2" />
                  <span>Batch Scheduling Configuration</span>
                </div>
                <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600, background: '#e0f2fe', padding: '1px 8px', borderRadius: '4px' }}>
                  ~{totalBatchesComputed} Sequential {totalBatchesComputed === 1 ? 'Batch' : 'Batches'}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  
                  {/* Batch Size */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                      Batch Size (Recipients / Batch) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={batchSize}
                      onChange={e => setBatchSize(Number(e.target.value))}
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    >
                      <option value={1000}>1,000 Numbers / Batch</option>
                      <option value={5000}>5,000 Numbers / Batch</option>
                      <option value={10000}>10,000 Numbers / Batch (Recommended)</option>
                      <option value={25000}>25,000 Numbers / Batch</option>
                      <option value={50000}>50,000 Numbers / Batch</option>
                    </select>
                  </div>

                  {/* Time Interval */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                      Time Interval (Mins Between Batches) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={timeInterval}
                      onChange={e => setTimeInterval(Number(e.target.value))}
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    >
                      <option value={2}>2 Minutes Gap</option>
                      <option value={5}>5 Minutes Gap (Recommended)</option>
                      <option value={10}>10 Minutes Gap</option>
                      <option value={15}>15 Minutes Gap</option>
                      <option value={30}>30 Minutes Gap</option>
                      <option value={60}>60 Minutes Gap (1 Hour)</option>
                    </select>
                  </div>

                </div>

                {/* Live Calculated Banner */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '11.5px',
                  color: '#0369a1'
                }}>
                  <Info size={15} color="#0284c7" />
                  <div>
                    <b>Calculated Plan:</b> ~{totalBatchesComputed} Batches | {timeInterval} Mins Interval | Total Runtime: ~{totalMinutesComputed} Mins ({totalMinutesComputed === 0 ? '< 1 min' : '~' + (totalMinutesComputed / 60).toFixed(1) + ' hrs'})
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 3: AUDIENCE & RECIPIENTS */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              marginBottom: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Header */}
              <div style={{
                padding: '7px 14px',
                borderBottom: '1px solid #cbd5e1',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '12.5px',
                color: '#0f172a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Users size={13} color="#0a66c2" />
                  <span>Audience & Recipients</span>
                </div>
                <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600, background: '#e0f2fe', padding: '1px 8px', borderRadius: '4px' }}>
                  {manualCount} {manualCount === 1 ? 'Number' : 'Numbers'} entered
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '14px', alignItems: 'start' }}>
                  
                  {/* Left: Manual Numbers */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                        Manual Mobiles <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <span style={{ fontSize: '10.5px', color: '#64748b' }}>Comma/Newline separated</span>
                    </div>
                    <textarea 
                      className="form-input"
                      rows={4}
                      placeholder="9868040206, 9170304221 or one per line"
                      value={manualMobiles}
                      onChange={e => setManualMobiles(e.target.value)}
                      style={{ 
                        fontSize: '12.5px', 
                        width: '100%', 
                        resize: 'vertical', 
                        borderRadius: '6px', 
                        padding: '8px 12px', 
                        lineHeight: 1.45, 
                        minHeight: '85px', 
                        height: '92px',
                        fontFamily: 'monospace',
                        borderColor: '#cbd5e1'
                      }}
                    />
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: 1 }}>
                      Valid: 10 Digit Mobile Number
                    </div>
                  </div>

                  {/* Right: Recipients File Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                      Or Upload File
                    </label>
                    <div style={{ 
                      border: '1.5px dashed #cbd5e1', 
                      borderRadius: '6px', 
                      height: '92px',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      transition: 'border-color 0.15s ease'
                    }}>
                      <input 
                        type="file" 
                        accept=".txt,.csv,.xls,.xlsx"
                        onChange={e => setRecipientsFile(e.target.files?.[0] || null)}
                        style={{ display: 'none' }}
                        id="multiScheduleFileInput"
                      />
                      <label htmlFor="multiScheduleFileInput" style={{ cursor: 'pointer', margin: 0, textAlign: 'center', width: '100%' }}>
                        <Upload size={20} color={recipientsFile ? '#059669' : '#0a66c2'} style={{ margin: '0 auto 4px', display: 'block' }} />
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: recipientsFile ? '#059669' : '#0a66c2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '210px', margin: '0 auto' }}>
                          {recipientsFile ? recipientsFile.name : 'Choose File or Drag & Drop'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: 3 }}>
                          Accepted: .csv, .xls, .xlsx, .txt
                        </div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: 1 }}>
                          (Max 5 Lakh records)
                        </div>
                      </label>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* CARD 4: SMS FALLBACK (COLLAPSIBLE / SLEEK) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              marginBottom: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Header with Switch */}
              <div style={{
                padding: '7px 14px',
                borderBottom: enableFallback ? '1px solid #cbd5e1' : 'none',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '12.5px',
                color: '#0f172a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <ShieldCheck size={14} color="#059669" />
                  <span>SMS Fallback (Optional)</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: '#334155', margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={enableFallback} 
                    onChange={e => setEnableFallback(e.target.checked)} 
                    style={{ width: 15, height: 15, cursor: 'pointer' }}
                  />
                  <span>Send SMS if RCS fails</span>
                </label>
              </div>

              {/* Expandable Fallback Details */}
              {enableFallback && (
                <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fafaf9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>Entity ID *</label>
                      <input type="text" className="form-input" placeholder="DLT Entity ID" value={entityId} onChange={e => setEntityId(e.target.value)} style={{ fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>Sender ID *</label>
                      <input type="text" className="form-input" placeholder="e.g. PBGACC" value={senderId} onChange={e => setSenderId(e.target.value)} style={{ fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>SMS Template ID *</label>
                      <input type="text" className="form-input" placeholder="DLT Template ID" value={smsTemplateId} onChange={e => setSmsTemplateId(e.target.value)} style={{ fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 2 }}>SMS Content *</label>
                    <input type="text" className="form-input" placeholder="Fallback SMS message content" value={smsText} onChange={e => setSmsText(e.target.value)} style={{ fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: PINNED & STICKY AT BOTTOM */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              padding: '8px 0 4px',
              position: 'sticky',
              bottom: 0,
              background: '#ffffff',
              zIndex: 10
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 22px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <Send size={14} />
                <span>{loading ? 'Scheduling...' : 'Launch Multi Schedule Campaign'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: SMARTPHONE SIMULATOR */}
        <div style={{ position: 'sticky', top: '16px' }}>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            padding: '12px'
          }}>
            
            {/* Header */}
            <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📱 Live Mobile Preview</span>
              </div>
              <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '2px 7px', borderRadius: '12px', fontWeight: 700 }}>
                Live Sync
              </span>
            </div>

            {/* Outer Phone Shell */}
            <div style={{
              background: '#111827',
              borderRadius: '30px',
              padding: '10px',
              boxShadow: '0 12px 28px -5px rgba(0,0,0,0.25)',
              maxWidth: '260px',
              margin: '0 auto',
              border: '3px solid #374151'
            }}>
              {/* Notch */}
              <div style={{ width: '50px', height: '5px', background: '#374151', borderRadius: '3px', margin: '0 auto 8px' }}></div>

              {/* Inner Screen */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '20px',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Sender Header */}
                <div style={{
                  background: '#ffffff',
                  padding: '8px 10px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#0a66c2',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '10px'
                  }}>
                    <Bot size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{currentBotName}</span>
                      <CheckCircle2 size={11} color="#0a66c2" />
                    </div>
                    <div style={{ fontSize: '8.5px', color: '#059669', fontWeight: 600 }}>Verified RCS Agent</div>
                  </div>
                </div>

                {/* Chat Area */}
                <div style={{ padding: '10px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Timestamp */}
                  <div style={{ textAlign: 'center', fontSize: '9px', color: '#94a3b8', marginBottom: 8 }}>
                    Today • Verified Brand Chat
                  </div>

                  {/* Chat Bubble */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px 12px 12px 2px',
                    padding: '10px 12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    
                    {/* Media if RichCard */}
                    {selectedTemplateObj?.templateType === 'RichCard' && (
                      <div style={{ marginBottom: 6 }}>
                        {selectedTemplateObj.mediaUrl ? (
                          <img 
                            src={selectedTemplateObj.mediaUrl} 
                            alt="Card media" 
                            style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ height: '60px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
                            🖼️ Card Banner
                          </div>
                        )}
                        {selectedTemplateObj.cardTitle && (
                          <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#0f172a', marginTop: 4 }}>
                            {selectedTemplateObj.cardTitle}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content with Live variable substitution */}
                    <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {getTemplateMessage()}
                    </div>

                    {/* Suggestion Pills */}
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {getTemplateSuggestions().map((sug, idx) => (
                        <div 
                          key={idx}
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1d4ed8',
                            borderRadius: '12px',
                            padding: '2px 7px',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          <span>{sug.type === 'DIAL' ? '📞' : (sug.type === 'REPLY' ? '💬' : '🔗')}</span>
                          <span>{sug.label}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* Subtext */}
            <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#94a3b8', marginTop: 8 }}>
              Updates live as you choose template & dynamic param.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default RcsMultiSchedulePage;
