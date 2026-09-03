import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Layers, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Edit2,
  Trash2,
  Upload,
  Link,
  Bot,
  Sparkles,
  Smartphone,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  Zap
} from 'lucide-react';

export const RcsTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [bots, setBots] = useState([]);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default initial dynamic template state
  const defaultNewTemplate = {
    templateName: 'Lead_Interest_Survey',
    templateType: 'PlainText', // PlainText, RichCard, Carousel
    botId: 'bot_abc123',
    botName: 'Marketing Bot',
    imageSource: 'url', // 'upload' or 'url'
    mediaUrl: '',
    cardTitle: 'Product Partnership & Collaboration',
    cardDescription: 'Hi! Are you interested in exploring our automated leads & business messaging platform?',
    buttons: [
      { id: 1, type: 'reply', label: 'Interested', value: 'Interested' },
      { id: 2, type: 'reply', label: 'Not Interested', value: 'Not Interested' }
    ],
    entityId: '1201161304403738311',
    senderId: 'EXPRSS',
    smsTemplateId: '1207161545678901237',
    smsText: 'Hi! Are you interested in exploring our leads platform? Reply YES or NO. Visit: https://leads.io'
  };

  const [newTemplate, setNewTemplate] = useState(defaultNewTemplate);

  // Edit Template Form State
  const [editingTemplate, setEditingTemplate] = useState({
    templateId: '',
    templateName: '',
    templateType: 'RichCard',
    botId: 'bot_abc123',
    botName: 'Marketing Bot',
    imageSource: 'url',
    mediaUrl: '',
    cardTitle: '',
    cardDescription: '',
    buttons: [],
    entityId: '',
    senderId: '',
    smsTemplateId: '',
    smsText: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await api.get('/RCSApi/GetBots');
      if (res.data?.response?.bots) {
        setBots(res.data.response.bots);
      }
    } catch (err) {
      console.error('Failed to load bots', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/RCSApi/GetTemplates');
      const list = res.data?.response?.templates || [];
      setTemplates(list);
    } catch (err) {
      console.error('Failed to load RCS templates', err);
    }
  };

  // 1-Click Quick Preset Handler (Interested / Not Interested, Offer, Support)
  const applyPreset = (presetKey, isEdit = false) => {
    const targetSetter = isEdit ? setEditingTemplate : setNewTemplate;
    if (presetKey === 'interested') {
      targetSetter(prev => ({
        ...prev,
        templateName: prev.templateName || 'Customer_Interest_Survey',
        templateType: 'PlainText',
        cardTitle: 'Product Partnership & Consultation',
        cardDescription: 'Hello! Are you interested in accelerating your sales pipeline with our verified leads engine?',
        smsText: 'Hello! Are you interested in accelerating your sales? Reply YES or NO. Visit: https://leads.io',
        buttons: [
          { id: 1, type: 'reply', label: 'Interested', value: 'Interested' },
          { id: 2, type: 'reply', label: 'Not Interested', value: 'Not Interested' },
          { id: 3, type: 'reply', label: 'Call Me Later', value: 'Call Me Later' }
        ]
      }));
    } else if (presetKey === 'offer') {
      targetSetter(prev => ({
        ...prev,
        templateName: prev.templateName || 'Festive_Special_Offer',
        templateType: 'RichCard',
        mediaUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
        cardTitle: 'Special Festive Discount for You!',
        cardDescription: 'Claim your exclusive 25% discount on all services using code FESTIVE25. Valid till tonight!',
        smsText: 'Special Festive Offer! Get 25% off with code FESTIVE25 at https://offers.io',
        buttons: [
          { id: 1, type: 'url', label: 'Claim Offer Now', value: 'https://offers.io' },
          { id: 2, type: 'reply', label: 'Remind Me Later', value: 'Remind Me Later' }
        ]
      }));
    } else if (presetKey === 'support') {
      targetSetter(prev => ({
        ...prev,
        templateName: prev.templateName || 'Support_Feedback_Check',
        templateType: 'PlainText',
        botId: 'bot_def456',
        botName: 'Support Bot',
        cardTitle: 'Support Ticket #8492 Update',
        cardDescription: 'Your support ticket has been resolved. Were you satisfied with our assistance?',
        smsText: 'Your ticket #8492 is resolved. Were you satisfied? Reply 1 for Yes, 2 for No.',
        buttons: [
          { id: 1, type: 'reply', label: 'Yes, Satisfied', value: 'Yes, Satisfied' },
          { id: 2, type: 'reply', label: 'Need More Help', value: 'Need More Help' },
          { id: 3, type: 'dial', label: 'Call Support', value: '+919876543210' }
        ]
      }));
    }
  };

  // Button Array Management (Add / Update / Remove)
  const handleAddButton = (isEdit = false) => {
    const targetSetter = isEdit ? setEditingTemplate : setNewTemplate;
    targetSetter(prev => {
      const currentButtons = prev.buttons || [];
      if (currentButtons.length >= 4) {
        alert('Maximum 4 interactive buttons / chips allowed per RCS template.');
        return prev;
      }
      const newBtn = {
        id: Date.now(),
        type: 'reply',
        label: currentButtons.length === 0 ? 'Interested' : (currentButtons.length === 1 ? 'Not Interested' : `Option ${currentButtons.length + 1}`),
        value: currentButtons.length === 0 ? 'Interested' : (currentButtons.length === 1 ? 'Not Interested' : `Option ${currentButtons.length + 1}`)
      };
      return { ...prev, buttons: [...currentButtons, newBtn] };
    });
  };

  const handleUpdateButton = (btnId, field, value, isEdit = false) => {
    const targetSetter = isEdit ? setEditingTemplate : setNewTemplate;
    targetSetter(prev => {
      const updatedButtons = (prev.buttons || []).map(b => 
        b.id === btnId ? { ...b, [field]: value } : b
      );
      return { ...prev, buttons: updatedButtons };
    });
  };

  const handleRemoveButton = (btnId, isEdit = false) => {
    const targetSetter = isEdit ? setEditingTemplate : setNewTemplate;
    targetSetter(prev => ({
      ...prev,
      buttons: (prev.buttons || []).filter(b => b.id !== btnId)
    }));
  };

  // Handle Image File Upload (Base64 data URL)
  const handleImageFileUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditingTemplate(prev => ({ ...prev, mediaUrl: reader.result, imageSource: 'upload' }));
      } else {
        setNewTemplate(prev => ({ ...prev, mediaUrl: reader.result, imageSource: 'upload' }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle Template Status
  const handleToggleTemplateStatus = async (tId) => {
    try {
      const res = await api.post('/RCSApi/ToggleTemplateStatus', { templateId: tId });
      if (res.data?.status === 'OK') {
        fetchTemplates();
        setNotification(res.data?.message || 'Template status updated.');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setErrorMsg('Failed to update template status.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (tmpl) => {
    let parsedButtons = [];
    if (tmpl.buttonsJson) {
      try {
        parsedButtons = JSON.parse(tmpl.buttonsJson);
      } catch (e) {
        parsedButtons = [];
      }
    }
    
    if (parsedButtons.length === 0 && tmpl.buttonLabel) {
      parsedButtons = [{ id: 1, type: 'url', label: tmpl.buttonLabel, value: tmpl.buttonUrl || '' }];
    }

    if (parsedButtons.length === 0) {
      parsedButtons = [
        { id: 1, type: 'reply', label: 'Interested', value: 'Interested' },
        { id: 2, type: 'reply', label: 'Not Interested', value: 'Not Interested' }
      ];
    }

    setEditingTemplate({
      templateId: tmpl.templateId || tmpl.vendorTemplateId,
      templateName: tmpl.templateName || '',
      templateType: tmpl.templateType || 'RichCard',
      botId: tmpl.botId || 'bot_abc123',
      botName: tmpl.botName || 'Marketing Bot',
      imageSource: tmpl.mediaUrl?.startsWith('data:') ? 'upload' : 'url',
      mediaUrl: tmpl.mediaUrl || '',
      cardTitle: tmpl.cardTitle || tmpl.templateName || '',
      cardDescription: tmpl.cardDescription || tmpl.smsText || '',
      buttons: parsedButtons,
      entityId: tmpl.entityId || '1201161304403738311',
      senderId: tmpl.senderId || 'EXPRSS',
      smsTemplateId: tmpl.smsTemplateId || '',
      smsText: tmpl.smsText || ''
    });
    setShowEditModal(true);
  };

  // Update Template
  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingTemplate,
        buttonLabel: editingTemplate.buttons?.[0]?.label || '',
        buttonUrl: editingTemplate.buttons?.[0]?.value || '',
        buttonsJson: JSON.stringify(editingTemplate.buttons || [])
      };

      const res = await api.post('/RCSApi/UpdateTemplate', payload);
      if (res.data?.status === 'OK') {
        setShowEditModal(false);
        fetchTemplates();
        setNotification(`Template "${editingTemplate.templateName}" updated successfully!`);
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update template.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (tmpl) => {
    const tId = tmpl.templateId || tmpl.vendorTemplateId;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete template "${tmpl.templateName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await api.post('/RCSApi/DeleteTemplate', { templateId: tId });
      if (res.data?.status === 'OK') {
        fetchTemplates();
        setNotification(`Template "${tmpl.templateName}" deleted successfully!`);
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete template.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Create Template
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newTemplate,
        buttonLabel: newTemplate.buttons?.[0]?.label || '',
        buttonUrl: newTemplate.buttons?.[0]?.value || '',
        buttonsJson: JSON.stringify(newTemplate.buttons || [])
      };

      const res = await api.post('/RCSApi/CreateTemplate', payload);
      if (res.data?.status === 'OK') {
        setShowAddTemplateModal(false);
        fetchTemplates();
        setNotification(`Template "${newTemplate.templateName}" created & approved!`);
        setTimeout(() => setNotification(''), 4000);
        setNewTemplate(defaultNewTemplate);
      }
    } catch (err) {
      setErrorMsg('Failed to create new template.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Renders Live Smartphone Mockup Preview that dynamically updates in real time
  const renderPhonePreview = (formData) => {
    const isPlainText = formData.templateType === 'PlainText';
    const activeBotName = formData.botName || (formData.botId === 'bot_abc123' ? 'Marketing Bot' : 'Support Bot');
    const buttonsList = formData.buttons || [];

    return (
      <div style={{ position: 'sticky', top: '10px' }}>
        <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', textAlign: 'center', marginBottom: '8px' }}>
          📱 Live RCS Smartphone Preview
        </div>

        <div style={{ 
          background: '#0f172a', 
          borderRadius: '30px', 
          padding: '10px', 
          border: '3px solid #334155', 
          boxShadow: '0 12px 30px -5px rgba(0,0,0,0.3)',
          maxWidth: '310px',
          margin: '0 auto'
        }}>
          {/* Phone Notch */}
          <div style={{ width: '70px', height: '10px', background: '#1e293b', borderRadius: '8px', margin: '0 auto 8px' }}></div>

          {/* Screen */}
          <div style={{ background: '#f8fafc', borderRadius: '20px', overflow: 'hidden', minHeight: '410px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Dynamic Bot Header */}
            <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: '50%', 
                background: formData.botId === 'bot_def456' ? '#059669' : '#4f46e5', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 700 
              }}>
                <Bot size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeBotName}</span>
                  <CheckCircle2 size={12} color="#2563eb" />
                </div>
                <div style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600 }}>Verified Brand Sender</div>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ alignSelf: 'center', fontSize: '9px', color: '#94a3b8', margin: '2px 0' }}>
                Today • Verified RCS Chat
              </div>

              {/* DYNAMIC RENDERING: PLAIN TEXT VS RICH CARD */}
              {isPlainText ? (
                <div>
                  {/* Message Bubble */}
                  <div style={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '14px 14px 14px 3px', 
                    padding: '10px 12px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
                  }}>
                    {formData.cardTitle ? (
                      <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', marginBottom: 4 }}>
                        {formData.cardTitle}
                      </div>
                    ) : null}

                    <div style={{ fontSize: '11px', color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {formData.cardDescription || formData.smsText || (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Type your message text...</span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic RCS Suggestion Chips below PlainText Bubble */}
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {buttonsList.map((btn, idx) => (
                      <div 
                        key={btn.id || idx}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid #4f46e5',
                          color: '#4f46e5',
                          borderRadius: '16px',
                          padding: '4px 10px',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 1px 3px rgba(79, 70, 229, 0.1)'
                        }}
                      >
                        {btn.type === 'dial' ? '📞 ' : btn.type === 'url' ? '🔗 ' : '💬 '}
                        <span>{btn.label || `Option ${idx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Rich Card Render */
                <div style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '14px', 
                  overflow: 'hidden', 
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
                }}>
                  {/* Banner Image */}
                  {formData.mediaUrl ? (
                    <img 
                      src={formData.mediaUrl} 
                      alt="Banner Preview" 
                      style={{ width: '100%', height: '115px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ height: '70px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px', borderBottom: '1px solid #e2e8f0' }}>
                      🖼️ No Media Selected (Optional)
                    </div>
                  )}

                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                      {formData.cardTitle || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Headline / Title</span>}
                    </div>

                    <div style={{ fontSize: '11px', color: '#475569', marginTop: 3, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {formData.cardDescription || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Message description text...</span>}
                    </div>

                    {/* Dynamic Action CTA Buttons */}
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {buttonsList.map((btn, idx) => (
                        <button 
                          key={btn.id || idx}
                          type="button" 
                          style={{ 
                            width: '100%', 
                            padding: '6px 10px', 
                            background: idx === 0 ? '#4f46e5' : '#e0e7ff', 
                            color: idx === 0 ? '#ffffff' : '#3730a3', 
                            border: 'none', 
                            borderRadius: '7px', 
                            fontSize: '11px', 
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5
                          }}
                        >
                          {btn.type === 'dial' ? '📞' : btn.type === 'url' ? '🔗' : '💬'}
                          <span>{btn.label || `Action ${idx + 1}`}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic DLT Fallback Footer inside phone */}
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '9px', color: '#64748b', textAlign: 'center' }}>
                DLT Fallback: <b>{formData.senderId || 'EXPRSS'}</b> | Header: <b>{formData.entityId ? formData.entityId.slice(0, 4) + '...' : 'Auto'}</b>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage RCS Templates</h2>
            <span className="badge badge-success" style={{ fontSize: '11px' }}>{templates.length} Registered</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 3 }}>
            Manage verified brand bots, multi-button interactive templates (Interested / Not Interested chips), and approved DLT SMS fallbacks.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddTemplateModal(true)}
          style={{ padding: '9px 16px', fontWeight: 700 }}
        >
          <Plus size={14} />
          <span>Add New Template</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '13px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{notification}</span>
          </div>
          <button type="button" onClick={() => setNotification('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '13px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Templates Table Card */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Template Type</th>
                <th>Bot Details</th>
                <th>Interactive Buttons / Chips</th>
                <th>DLT & SMS Fallback Details</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ minWidth: '180px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => {
                let parsedBtns = [];
                if (t.buttonsJson) {
                  try { parsedBtns = JSON.parse(t.buttonsJson); } catch (e) {}
                }
                if (parsedBtns.length === 0 && t.buttonLabel) {
                  parsedBtns = [{ label: t.buttonLabel }];
                }

                return (
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {parsedBtns.length > 0 ? (
                          parsedBtns.map((b, i) => (
                            <span key={i} className="badge badge-cold" style={{ fontSize: '10px' }}>
                              💬 {b.label}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div><b>Header:</b> <span style={{ fontWeight: 700, color: '#0f172a' }}>{t.senderId || 'EXPRSS'}</span></div>
                        <div><b>DLT ID / Entity ID:</b> <code style={{ color: '#4f46e5', fontWeight: 600 }}>{t.entityId || '—'}</code></div>
                        <div><b>Template ID:</b> <code style={{ color: '#059669', fontWeight: 600 }}>{t.smsTemplateId || '—'}</code></div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.templateStatus === 'Active' ? 'badge-success' : 'badge-dnd'}`}>
                        {t.templateStatus === 'Active' ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{t.createdDate}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button 
                          className={`btn btn-sm ${t.templateStatus === 'Active' ? 'btn-outline' : 'btn-primary'}`}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                          onClick={() => handleToggleTemplateStatus(t.templateId)}
                          title="Toggle Status"
                        >
                          {t.templateStatus === 'Active' ? 'Deactivate' : 'Approve'}
                        </button>

                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '4px 8px', color: '#4f46e5', borderColor: '#c7d2fe', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handleOpenEditModal(t)}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>

                        <button 
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '11px', padding: '4px 8px', color: '#dc2626', borderColor: '#fecaca', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => handleDeleteTemplate(t)}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTER NEW TEMPLATE (WITH REAL-TIME DYNAMIC BUTTONS & PRESETS)   */}
      {/* ========================================================================= */}
      {showAddTemplateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '1000px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#4f46e5" />
                <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Register New RCS Template</span>
                <span className="badge badge-hot" style={{ fontSize: '10px' }}>Dynamic Multi-Button Live Preview</span>
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddTemplateModal(false)}
                style={{ border: 'none', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div style={{ padding: '10px 22px', background: '#eef2ff', borderBottom: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3730a3', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={13} color="#4f46e5" />
                <span>Quick Fill Presets:</span>
              </div>

              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => applyPreset('interested', false)}
                style={{ background: '#ffffff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}
              >
                🎯 Lead Survey (Interested / Not Interested)
              </button>

              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => applyPreset('offer', false)}
                style={{ background: '#ffffff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}
              >
                🛍️ Festive Promotional Offer
              </button>

              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => applyPreset('support', false)}
                style={{ background: '#ffffff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}
              >
                🛠️ Support & Feedback (Yes / Need Help)
              </button>
            </div>

            {/* Modal Body: 2 Columns */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
              <form id="addTemplateForm" onSubmit={handleCreateTemplate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 315px', gap: '20px', alignItems: 'start' }}>
                  
                  {/* Left Column: Form Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Block 1: Template & Bot Info */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                        1. Template & Bot Setup
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Template Name</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. Lead_Interest_Survey"
                            value={newTemplate.templateName}
                            onChange={(e) => setNewTemplate({ ...newTemplate, templateName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Template Format</label>
                          <select 
                            className="form-select"
                            value={newTemplate.templateType}
                            onChange={(e) => setNewTemplate({ ...newTemplate, templateType: e.target.value })}
                          >
                            <option value="PlainText">PlainText (Suggestion Chips)</option>
                            <option value="RichCard">RichCard (Media + CTA Buttons)</option>
                            <option value="Carousel">Carousel (Multi-Card)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Assign to Verified Bot</label>
                        <select 
                          className="form-select"
                          value={newTemplate.botId}
                          onChange={(e) => {
                            const bId = e.target.value;
                            const bObj = bots.find(b => b.botId === bId);
                            const bName = bObj ? bObj.botName : (bId === 'bot_abc123' ? 'Marketing Bot' : 'Support Bot');
                            setNewTemplate({ ...newTemplate, botId: bId, botName: bName });
                          }}
                        >
                          {bots.length > 0 ? (
                            bots.map(b => (
                              <option key={b.botId} value={b.botId}>{b.botName} ({b.botId})</option>
                            ))
                          ) : (
                            <>
                              <option value="bot_abc123">Marketing Bot (bot_abc123)</option>
                              <option value="bot_def456">Support Bot (bot_def456)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Block 2: Visual Content & Text */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                        2. Message Content
                      </div>

                      {/* Optional Media (for RichCard or Carousel) */}
                      {newTemplate.templateType !== 'PlainText' && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>Banner Image</label>
                            
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button 
                                type="button" 
                                className={`btn btn-sm ${newTemplate.imageSource === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                onClick={() => setNewTemplate({ ...newTemplate, imageSource: 'upload' })}
                              >
                                <Upload size={10} />
                                <span>Upload</span>
                              </button>

                              <button 
                                type="button" 
                                className={`btn btn-sm ${newTemplate.imageSource === 'url' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                onClick={() => setNewTemplate({ ...newTemplate, imageSource: 'url' })}
                              >
                                <Link size={10} />
                                <span>URL</span>
                              </button>
                            </div>
                          </div>

                          {newTemplate.imageSource === 'upload' ? (
                            <div style={{ border: '1px dashed #cbd5e1', padding: '8px', borderRadius: '8px', background: '#ffffff', textAlign: 'center' }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageFileUpload(e, false)}
                                style={{ fontSize: '11px' }}
                              />
                            </div>
                          ) : (
                            <input 
                              type="url" 
                              className="form-input" 
                              placeholder="https://..."
                              value={newTemplate.mediaUrl}
                              onChange={(e) => setNewTemplate({ ...newTemplate, mediaUrl: e.target.value })}
                            />
                          )}
                        </div>
                      )}

                      {/* Headline / Card Title */}
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Headline / Card Title</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. Special Offer or Partnership Proposal"
                          value={newTemplate.cardTitle}
                          onChange={(e) => setNewTemplate({ ...newTemplate, cardTitle: e.target.value })}
                        />
                      </div>

                      {/* Message Body Text */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Message Body Text</label>
                        <textarea 
                          className="form-input" 
                          rows={2}
                          placeholder="Enter promotional or notification message..."
                          value={newTemplate.cardDescription}
                          onChange={(e) => setNewTemplate({ ...newTemplate, cardDescription: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Block 3: DYNAMIC INTERACTIVE BUTTONS & SUGGESTION CHIPS */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', textTransform: 'uppercase' }}>
                          3. Dynamic Interactive Buttons / Suggestion Chips ({newTemplate.buttons?.length || 0}/4)
                        </div>

                        {newTemplate.buttons?.length < 4 && (
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleAddButton(false)}
                            style={{ fontSize: '10px', padding: '2px 8px', color: '#4f46e5', fontWeight: 700 }}
                          >
                            <Plus size={11} />
                            <span>Add Button</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(newTemplate.buttons || []).map((btn, idx) => (
                          <div 
                            key={btn.id || idx}
                            style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1.2fr 110px 1.4fr 28px', 
                              gap: '6px', 
                              alignItems: 'center',
                              background: '#ffffff',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                placeholder="e.g. Interested"
                                value={btn.label}
                                onChange={(e) => handleUpdateButton(btn.id, 'label', e.target.value, false)}
                              />
                            </div>

                            <div>
                              <select 
                                className="form-select"
                                style={{ fontSize: '10px', padding: '4px 6px' }}
                                value={btn.type}
                                onChange={(e) => handleUpdateButton(btn.id, 'type', e.target.value, false)}
                              >
                                <option value="reply">💬 Quick Reply</option>
                                <option value="url">🔗 Open URL</option>
                                <option value="dial">📞 Call Phone</option>
                              </select>
                            </div>

                            <div>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                placeholder={btn.type === 'url' ? 'https://...' : (btn.type === 'dial' ? '+91...' : 'Response payload')}
                                value={btn.value}
                                onChange={(e) => handleUpdateButton(btn.id, 'value', e.target.value, false)}
                              />
                            </div>

                            <button 
                              type="button" 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleRemoveButton(btn.id, false)}
                              style={{ border: 'none', color: '#dc2626', padding: '4px' }}
                              title="Delete Button"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block 4: DLT Parameters */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                        4. DLT SMS Fallback Settings (Mandatory)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>DLT ID / Entity ID</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="1201161304403738311"
                            value={newTemplate.entityId}
                            onChange={(e) => setNewTemplate({ ...newTemplate, entityId: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>DLT Sender ID (Header)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="EXPRSS"
                            value={newTemplate.senderId}
                            onChange={(e) => setNewTemplate({ ...newTemplate, senderId: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>Template ID (DLT / SMS Template ID)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="1207161545678901237"
                          value={newTemplate.smsTemplateId}
                          onChange={(e) => setNewTemplate({ ...newTemplate, smsTemplateId: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>Fallback SMS Text</label>
                        <textarea 
                          className="form-input" 
                          rows={2}
                          value={newTemplate.smsText}
                          onChange={(e) => setNewTemplate({ ...newTemplate, smsText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Dynamic Smartphone Preview */}
                  <div>
                    {renderPhonePreview(newTemplate)}
                  </div>

                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowAddTemplateModal(false)}
                style={{ minWidth: '120px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="addTemplateForm"
                className="btn btn-primary" 
                style={{ minWidth: '220px', fontWeight: 800 }}
              >
                Create & Approve Template
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT TEMPLATE (WITH REAL-TIME DYNAMIC BUTTONS & PRESETS)          */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '1000px',
            maxWidth: '96vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '14px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit2 size={18} color="#4f46e5" />
                <span>Edit RCS Template: {editingTemplate.templateName}</span>
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowEditModal(false)}
                style={{ border: 'none', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets Bar for Edit */}
            <div style={{ padding: '10px 22px', background: '#eef2ff', borderBottom: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3730a3', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={13} color="#4f46e5" />
                <span>Quick Fill Presets:</span>
              </div>

              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => applyPreset('interested', true)}
                style={{ background: '#ffffff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}
              >
                🎯 Lead Survey (Interested / Not Interested)
              </button>

              <button 
                type="button" 
                className="btn btn-sm" 
                onClick={() => applyPreset('offer', true)}
                style={{ background: '#ffffff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}
              >
                🛍️ Festive Promotional Offer
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
              <form id="editTemplateForm" onSubmit={handleUpdateTemplate}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 315px', gap: '20px', alignItems: 'start' }}>
                  
                  {/* Left Column: Form Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Block 1 */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                        1. Template & Bot Setup
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '8px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Template Name</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editingTemplate.templateName}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, templateName: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Template Format</label>
                          <select 
                            className="form-select"
                            value={editingTemplate.templateType}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, templateType: e.target.value })}
                          >
                            <option value="PlainText">PlainText (Suggestion Chips)</option>
                            <option value="RichCard">RichCard (Media + CTA Buttons)</option>
                            <option value="Carousel">Carousel (Multi-Card)</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Assign to Verified Bot</label>
                        <select 
                          className="form-select"
                          value={editingTemplate.botId}
                          onChange={(e) => {
                            const bId = e.target.value;
                            const bObj = bots.find(b => b.botId === bId);
                            const bName = bObj ? bObj.botName : (bId === 'bot_abc123' ? 'Marketing Bot' : 'Support Bot');
                            setEditingTemplate({ ...editingTemplate, botId: bId, botName: bName });
                          }}
                        >
                          <option value="bot_abc123">Marketing Bot (bot_abc123)</option>
                          <option value="bot_def456">Support Bot (bot_def456)</option>
                        </select>
                      </div>
                    </div>

                    {/* Block 2 */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase' }}>
                        2. Message Content
                      </div>

                      {editingTemplate.templateType !== 'PlainText' && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, margin: 0 }}>Banner Media</label>
                            
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button 
                                type="button" 
                                className={`btn btn-sm ${editingTemplate.imageSource === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                onClick={() => setEditingTemplate({ ...editingTemplate, imageSource: 'upload' })}
                              >
                                <Upload size={10} />
                                <span>Upload</span>
                              </button>

                              <button 
                                type="button" 
                                className={`btn btn-sm ${editingTemplate.imageSource === 'url' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ fontSize: '10px', padding: '2px 8px' }}
                                onClick={() => setEditingTemplate({ ...editingTemplate, imageSource: 'url' })}
                              >
                                <Link size={10} />
                                <span>URL</span>
                              </button>
                            </div>
                          </div>

                          {editingTemplate.imageSource === 'upload' ? (
                            <div style={{ border: '1px dashed #cbd5e1', padding: '8px', borderRadius: '8px', background: '#ffffff', textAlign: 'center' }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageFileUpload(e, true)}
                                style={{ fontSize: '11px' }}
                              />
                            </div>
                          ) : (
                            <input 
                              type="url" 
                              className="form-input" 
                              value={editingTemplate.mediaUrl}
                              onChange={(e) => setEditingTemplate({ ...editingTemplate, mediaUrl: e.target.value })}
                            />
                          )}
                        </div>
                      )}

                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Headline / Card Title</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingTemplate.cardTitle}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, cardTitle: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 700 }}>Message Body Text</label>
                        <textarea 
                          className="form-input" 
                          rows={2}
                          value={editingTemplate.cardDescription}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, cardDescription: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Block 3: Dynamic Buttons */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', textTransform: 'uppercase' }}>
                          3. Dynamic Interactive Buttons / Suggestion Chips ({editingTemplate.buttons?.length || 0}/4)
                        </div>

                        {editingTemplate.buttons?.length < 4 && (
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleAddButton(true)}
                            style={{ fontSize: '10px', padding: '2px 8px', color: '#4f46e5', fontWeight: 700 }}
                          >
                            <Plus size={11} />
                            <span>Add Button</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(editingTemplate.buttons || []).map((btn, idx) => (
                          <div 
                            key={btn.id || idx}
                            style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1.2fr 110px 1.4fr 28px', 
                              gap: '6px', 
                              alignItems: 'center',
                              background: '#ffffff',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                value={btn.label}
                                onChange={(e) => handleUpdateButton(btn.id, 'label', e.target.value, true)}
                              />
                            </div>

                            <div>
                              <select 
                                className="form-select"
                                style={{ fontSize: '10px', padding: '4px 6px' }}
                                value={btn.type}
                                onChange={(e) => handleUpdateButton(btn.id, 'type', e.target.value, true)}
                              >
                                <option value="reply">💬 Quick Reply</option>
                                <option value="url">🔗 Open URL</option>
                                <option value="dial">📞 Call Phone</option>
                              </select>
                            </div>

                            <div>
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                value={btn.value}
                                onChange={(e) => handleUpdateButton(btn.id, 'value', e.target.value, true)}
                              />
                            </div>

                            <button 
                              type="button" 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleRemoveButton(btn.id, true)}
                              style={{ border: 'none', color: '#dc2626', padding: '4px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block 4: DLT Fallback */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 800, fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>
                        4. DLT SMS Fallback Settings
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>DLT ID / Entity ID</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editingTemplate.entityId}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, entityId: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>DLT Sender ID (Header)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editingTemplate.senderId}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, senderId: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>Template ID (DLT / SMS Template ID)</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingTemplate.smsTemplateId}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, smsTemplateId: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '10px', fontWeight: 700 }}>Fallback SMS Text</label>
                        <textarea 
                          className="form-input" 
                          rows={2}
                          value={editingTemplate.smsText}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, smsText: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Smartphone Preview */}
                  <div>
                    {renderPhonePreview(editingTemplate)}
                  </div>

                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowEditModal(false)}
                style={{ minWidth: '120px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="editTemplateForm"
                className="btn btn-primary" 
                style={{ minWidth: '220px', fontWeight: 800 }}
              >
                Save & Update Template
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
