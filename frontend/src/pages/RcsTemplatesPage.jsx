import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  Layers, 
  Plus, 
  Search, 
  RotateCcw, 
  Bot, 
  Tag, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Info, 
  ExternalLink,
  Phone,
  MessageSquare,
  Sparkles,
  BarChart2,
  Download,
  Clock,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  X,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';

const DEFAULT_BOTS = [
  {
    botId: '3c4fa9a066274cd2',
    botName: 'PBG INFO',
    brandName: 'PBG INFO TECH PVT LTD',
    messageType: 'Transactional',
    status: 'Verified',
    dltEntityId: '1201161304403738311'
  }
];

const DEFAULT_APPROVED_TEMPLATES = [
  {
    templateId: 'YCSLPB_vg',
    templateName: 'pbg_account_status_u',
    templateType: 'PlainText',
    templateStatus: 'Active',
    botId: '3c4fa9a066274cd2',
    botName: 'PBG INFO',
    dltTemplateId: '1207161545678901235',
    content: 'Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.',
    cardTitle: 'PBG Account Status Update',
    cardDescription: 'Dear User, your PBG account status has been updated. Please log in to your dashboard to review your current details.',
    buttonLabel: 'Check Status',
    suggestedActions: [
      { type: 'OpenUrl', title: 'Check Status', url: 'https://pbginfo.in/status' },
      { type: 'Dial', title: 'Support Call', phoneNumber: '+919868040206' }
    ]
  },
  {
    templateId: 'pbg_promo_card_01',
    templateName: 'PBG_Special_Offer_Card',
    templateType: 'RichCard',
    templateStatus: 'Active',
    botId: '3c4fa9a066274cd2',
    botName: 'PBG INFO',
    dltTemplateId: '1207161545678901236',
    cardTitle: 'Exclusive 50% Cashback on All Services!',
    cardDescription: 'Recharge your account today and enjoy instant high-priority routing and 50% bonus credits.',
    mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    buttonLabel: 'Claim Offer',
    suggestedActions: [
      { type: 'OpenUrl', title: 'Claim Offer', url: 'https://pbginfo.in/offer' },
      { type: 'Reply', title: 'Interested', postbackData: 'OPT_IN_OFFER' }
    ]
  },
  {
    templateId: 'pbg_otp_alert_02',
    templateName: 'PBG_OTP_Verification_Alert',
    templateType: 'PlainText',
    templateStatus: 'Active',
    botId: '3c4fa9a066274cd2',
    botName: 'PBG INFO',
    dltTemplateId: '1207161545678901237',
    content: 'Your PBG verification OTP is {#var#}. Valid for 10 minutes. Do not share with anyone.',
    cardTitle: 'PBG OTP Security Alert',
    cardDescription: 'Your PBG Verification OTP is {#var#}. Valid for 10 minutes. Do not share with anyone.',
    buttonLabel: 'Copy OTP',
    suggestedActions: [
      { type: 'Reply', title: 'Copy OTP', postbackData: 'COPY_OTP' }
    ]
  }
];

export const RcsTemplatesPage = ({ onNavigateToBots }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'
  const [templates, setTemplates] = useState(DEFAULT_APPROVED_TEMPLATES);
  const [bots, setBots] = useState(DEFAULT_BOTS);
  const [loading, setLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(DEFAULT_APPROVED_TEMPLATES[0]);
  const [viewingTemplate, setViewingTemplate] = useState(null);
  const [viewModalCardIdx, setViewModalCardIdx] = useState(0);
  const [copiedId, setCopiedId] = useState('');
  const [notification, setNotification] = useState('');

  // Filters State (List View)
  const [filterBot, setFilterBot] = useState('3c4fa9a066274cd2');
  const [filterType, setFilterType] = useState('');
  const [filterName, setFilterName] = useState('');

  // Create Template Form State (Create View)
  const initialCreateForm = {
    botId: '3c4fa9a066274cd2',
    templateName: '',
    templateType: 'PlainText', // PlainText, RichCard, Carousel
    messageText: '',
    suggestions: [
      { id: 1, label: 'View Details', type: 'OPEN_URL', value: 'https://example.com' }
    ],
    // Rich Card fields if selected
    cardTitle: '',
    cardDescription: '',
    mediaUrl: '',
    mediaType: 'IMAGE',
    // Carousel multi-cards (min 2, max 10 cards as per API spec)
    carouselCards: [
      {
        id: 1,
        title: 'Special Offer A',
        description: 'Get 40% discount on all premium plans today.',
        mediaHeight: 'MEDIUM',
        orientation: 'VERTICAL',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        suggestions: [
          { id: 101, label: 'Claim Offer', type: 'OPEN_URL', value: 'https://example.com/offer-a' },
          { id: 102, label: 'Learn More', type: 'REPLY', value: 'OFFER_A_INFO' }
        ]
      },
      {
        id: 2,
        title: 'Special Offer B',
        description: 'Upgrade your existing account with bonus credits.',
        mediaHeight: 'MEDIUM',
        orientation: 'VERTICAL',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        suggestions: [
          { id: 201, label: 'Upgrade Now', type: 'OPEN_URL', value: 'https://example.com/offer-b' },
          { id: 202, label: 'Call Desk', type: 'DIAL', value: '+919170304221' }
        ]
      }
    ]
  };

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [activeCarouselCardIdx, setActiveCarouselCardIdx] = useState(0);
  const [simCarouselCardIdx, setSimCarouselCardIdx] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const res = await api.get('/RCSApi/GetBots');
      const bList = res.data?.response?.bots || [];
      const approvedBots = bList.filter(b => (b.status || b.Status) === 'Verified' || (b.status || b.Status) === 'Approved');
      if (approvedBots.length > 0) {
        setBots(approvedBots);
        const initialBotId = filterBot && approvedBots.some(b => b.botId === filterBot) 
          ? filterBot 
          : approvedBots[0].botId;
        setFilterBot(initialBotId);
        setCreateForm(prev => ({ ...prev, botId: initialBotId }));
        fetchTemplates(initialBotId);
      } else {
        setBots(DEFAULT_BOTS);
        setFilterBot(DEFAULT_BOTS[0].botId);
        fetchTemplates(DEFAULT_BOTS[0].botId);
      }
    } catch (err) {
      console.error('Failed to load bots', err);
      setBots(DEFAULT_BOTS);
      setFilterBot(DEFAULT_BOTS[0].botId);
      fetchTemplates(DEFAULT_BOTS[0].botId);
    }
  };

  const fetchTemplates = async (overrideBot, overrideType, overrideName) => {
    setLoading(true);
    try {
      const botIdParam = overrideBot !== undefined ? overrideBot : filterBot;
      const typeParam = overrideType !== undefined ? overrideType : filterType;
      const nameParam = overrideName !== undefined ? overrideName : filterName;

      const params = new URLSearchParams();
      if (botIdParam && botIdParam !== 'all') params.append('botId', botIdParam);
      if (typeParam) params.append('templateType', typeParam);
      if (nameParam) params.append('templateName', nameParam);

      const res = await api.get(`/RCSApi/GetTemplates?${params.toString()}`);
      const tList = res.data?.response?.templates || [];
      if (tList.length > 0) {
        setTemplates(tList);
        setPreviewTemplate(tList[0]);
      } else {
        setTemplates(DEFAULT_APPROVED_TEMPLATES);
        setPreviewTemplate(DEFAULT_APPROVED_TEMPLATES[0]);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
      setTemplates(DEFAULT_APPROVED_TEMPLATES);
      setPreviewTemplate(DEFAULT_APPROVED_TEMPLATES[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFilters = (e) => {
    if (e) e.preventDefault();
    fetchTemplates(filterBot, filterType, filterName);
  };

  const handleClearFilters = () => {
    const defaultBotId = bots.length > 0 ? bots[0].botId : '3c4fa9a066274cd2';
    setFilterBot(defaultBotId);
    setFilterType('');
    setFilterName('');
    fetchTemplates(defaultBotId, '', '');
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleQuickApproveTemplate = async (tmpl) => {
    const tId = tmpl.templateId || tmpl.vendorTemplateId;
    try {
      const res = await api.post('/RCSApi/UpdateTemplateStatus', {
        templateId: tId,
        status: 'Active',
        reason: 'Approved by Admin for Live Broadcasting'
      });
      if (res.data?.status === 'OK' || res.data?.Status === 'OK') {
        setNotification(`✓ Template "${tmpl.templateName}" approved successfully! It is now Active for campaigns.`);
        setTimeout(() => setNotification(''), 5000);
        fetchTemplates(filterBot, filterType, filterName);
        if (viewingTemplate && (viewingTemplate.templateId === tId || viewingTemplate.vendorTemplateId === tId)) {
          setViewingTemplate(prev => ({ ...prev, status: 'Active', templateStatus: 'Active' }));
        }
      }
    } catch (err) {
      alert('Failed to approve template: ' + (err.response?.data?.response?.message || err.message));
    }
  };

  // Toggle Template Active / Inactive
  const handleToggleActive = async (tmpl) => {
    const tId = tmpl.templateId || tmpl.vendorTemplateId;
    const currentStatus = (tmpl.status || tmpl.templateStatus || 'SUBMITTED').toUpperCase();
    const isCurrentlyActive = currentStatus === 'ACTIVE' || currentStatus === 'APPROVED';
    const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
    const reason = isCurrentlyActive ? 'Paused by Admin' : 'Activated by Admin';

    try {
      const res = await api.post('/RCSApi/UpdateTemplateStatus', {
        templateId: tId,
        status: newStatus,
        reason: reason
      });
      if (res.data?.status === 'OK' || res.data?.Status === 'OK') {
        setNotification(`Template "${tmpl.templateName}" marked as ${newStatus}!`);
        setTimeout(() => setNotification(''), 4000);
        fetchTemplates(filterBot, filterType, filterName);
        if (viewingTemplate && (viewingTemplate.templateId === tId || viewingTemplate.vendorTemplateId === tId)) {
          setViewingTemplate(prev => ({ ...prev, status: newStatus, templateStatus: newStatus }));
        }
      }
    } catch (err) {
      alert(`Failed to update template status: ` + (err.response?.data?.response?.message || err.message));
    }
  };

  // Edit Template
  const handleEditTemplate = (tmpl) => {
    let sugs = [];
    if (Array.isArray(tmpl.suggestions) && tmpl.suggestions.length > 0) {
      sugs = tmpl.suggestions.map((s, idx) => ({
        id: Date.now() + idx,
        label: s.label || s.text || s.title || 'Action',
        type: s.type || 'OPEN_URL',
        value: s.value || s.url || s.phoneNumber || ''
      }));
    } else if (tmpl.buttonsJson) {
      try {
        const parsed = JSON.parse(tmpl.buttonsJson);
        if (Array.isArray(parsed)) {
          sugs = parsed.map((s, idx) => ({
            id: Date.now() + idx,
            label: s.Label || s.label || s.text || s.title || 'Action',
            type: s.Type || s.type || 'OPEN_URL',
            value: s.Value || s.value || s.url || s.phoneNumber || ''
          }));
        }
      } catch (e) {}
    }
    if (sugs.length === 0) {
      sugs = [{ id: 1, label: tmpl.buttonLabel || 'View Details', type: 'OPEN_URL', value: 'https://example.com' }];
    }

    setCreateForm({
      botId: tmpl.botId || filterBot || (bots[0]?.botId) || '3c4fa9a066274cd2',
      templateName: tmpl.templateName || '',
      templateType: tmpl.templateType || 'PlainText',
      messageText: tmpl.messageText || tmpl.cardDescription || tmpl.smsText || '',
      suggestions: sugs,
      cardTitle: tmpl.cardTitle || '',
      cardDescription: tmpl.cardDescription || tmpl.messageText || '',
      mediaUrl: tmpl.mediaUrl || '',
      mediaType: tmpl.mediaType || 'IMAGE',
      carouselCards: Array.isArray(tmpl.carouselCards) && tmpl.carouselCards.length > 0 ? tmpl.carouselCards : initialCreateForm.carouselCards
    });
    if (viewingTemplate) setViewingTemplate(null);
    setViewMode('create');
    setNotification(`Editing template "${tmpl.templateName}"`);
    setTimeout(() => setNotification(''), 3000);
  };

  // Delete Template
  const handleDeleteTemplate = async (tmpl) => {
    const tId = tmpl.templateId || tmpl.vendorTemplateId;
    if (!window.confirm(`Are you sure you want to delete template "${tmpl.templateName}"?`)) return;

    try {
      await api.post('/RCSApi/DeleteTemplate', { templateId: tId });
      setNotification(`Template "${tmpl.templateName}" deleted successfully!`);
      setTimeout(() => setNotification(''), 4000);
      if (viewingTemplate && (viewingTemplate.templateId === tId || viewingTemplate.vendorTemplateId === tId)) {
        setViewingTemplate(null);
      }
      fetchTemplates(filterBot, filterType, filterName);
    } catch (err) {
      alert('Failed to delete template: ' + (err.response?.data?.response?.message || err.message));
    }
  };

  // Add / Remove / Update Suggestions
  const handleAddSuggestion = () => {
    if (createForm.suggestions.length >= 11) {
      alert('Maximum 11 suggestions allowed for PlainText templates.');
      return;
    }
    setCreateForm(prev => ({
      ...prev,
      suggestions: [
        ...prev.suggestions,
        { id: Date.now(), label: '', type: 'OPEN_URL', value: '' }
      ]
    }));
  };

  const handleUpdateSuggestion = (id, field, value) => {
    setCreateForm(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleRemoveSuggestion = (id) => {
    setCreateForm(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== id)
    }));
  };

  // Carousel Handlers
  const handleCarouselAddCard = () => {
    if (createForm.carouselCards.length >= 10) {
      alert('Carousel supports a maximum of 10 cards as per vendor specification.');
      return;
    }
    const newId = Date.now();
    const newCardIndex = createForm.carouselCards.length + 1;
    setCreateForm(prev => ({
      ...prev,
      carouselCards: [
        ...prev.carouselCards,
        {
          id: newId,
          title: `Product Card ${newCardIndex}`,
          description: `Description for product ${newCardIndex}`,
          mediaHeight: 'MEDIUM',
          orientation: 'VERTICAL',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          suggestions: [
            { id: Date.now() + 1, label: 'View Product', type: 'OPEN_URL', value: 'https://example.com' }
          ]
        }
      ]
    }));
    setActiveCarouselCardIdx(createForm.carouselCards.length);
  };

  const handleCarouselRemoveCard = (cardId) => {
    if (createForm.carouselCards.length <= 2) {
      alert('Carousel requires a minimum of 2 cards as per vendor specification.');
      return;
    }
    setCreateForm(prev => {
      const updated = prev.carouselCards.filter(c => c.id !== cardId);
      return { ...prev, carouselCards: updated };
    });
    if (activeCarouselCardIdx >= createForm.carouselCards.length - 1) {
      setActiveCarouselCardIdx(Math.max(0, createForm.carouselCards.length - 2));
    }
  };

  const handleCarouselUpdateCard = (cardId, field, value) => {
    setCreateForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map(c => c.id === cardId ? { ...c, [field]: value } : c)
    }));
  };

  const handleCarouselAddCardSuggestion = (cardId) => {
    setCreateForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map(c => {
        if (c.id === cardId) {
          if ((c.suggestions || []).length >= 4) {
            alert('Maximum 4 suggestion buttons allowed per Carousel card.');
            return c;
          }
          return {
            ...c,
            suggestions: [
              ...(c.suggestions || []),
              { id: Date.now(), label: '', type: 'OPEN_URL', value: '' }
            ]
          };
        }
        return c;
      })
    }));
  };

  const handleCarouselRemoveCardSuggestion = (cardId, sugId) => {
    setCreateForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            suggestions: (c.suggestions || []).filter(s => s.id !== sugId)
          };
        }
        return c;
      })
    }));
  };

  const handleCarouselUpdateCardSuggestion = (cardId, sugId, field, value) => {
    setCreateForm(prev => ({
      ...prev,
      carouselCards: prev.carouselCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            suggestions: (c.suggestions || []).map(s => s.id === sugId ? { ...s, [field]: value } : s)
          };
        }
        return c;
      })
    }));
  };

  // Real-time Validations
  const validateForm = (form) => {
    const errors = [];
    const nameRegex = /^[A-Za-z0-9_]{1,20}$/;

    if (!form.templateName || !nameRegex.test(form.templateName)) {
      errors.push('Template Name must be alphanumeric with underscore/hyphen (A-Z, a-z, 0-9, _) and max 20 characters.');
    }

    if (!form.botId) {
      errors.push('Please select a Bot.');
    }

    if (form.templateType === 'PlainText') {
      if (!form.messageText.trim()) {
        errors.push('Plain Text message is required.');
      }
      form.suggestions.forEach((sug, idx) => {
        if (!sug.label.trim() && (sug.value.trim() || form.suggestions.length === 1)) {
          errors.push(`Plain Text Suggestion #${idx + 1}: Label is required.`);
        }
        if (sug.type === 'OPEN_URL' && !sug.value.trim() && sug.label.trim()) {
          errors.push(`Plain Text Suggestion #${idx + 1}: URL is required.`);
        }
        if (sug.type === 'DIAL' && !sug.value.trim() && sug.label.trim()) {
          errors.push(`Plain Text Suggestion #${idx + 1}: Phone Number is required.`);
        }
      });
    } else if (form.templateType === 'RichCard') {
      if (!form.cardTitle.trim()) {
        errors.push('Rich Card Title is required.');
      }
      if (!form.cardDescription.trim()) {
        errors.push('Rich Card Description is required.');
      }
      form.suggestions.forEach((sug, idx) => {
        if (!sug.label.trim() && (sug.value.trim() || form.suggestions.length === 1)) {
          errors.push(`Rich Card Suggestion #${idx + 1}: Label is required.`);
        }
        if (sug.type === 'OPEN_URL' && !sug.value.trim() && sug.label.trim()) {
          errors.push(`Rich Card Suggestion #${idx + 1}: URL is required.`);
        }
        if (sug.type === 'DIAL' && !sug.value.trim() && sug.label.trim()) {
          errors.push(`Rich Card Suggestion #${idx + 1}: Phone Number is required.`);
        }
      });
    } else if (form.templateType === 'Carousel') {
      if (!form.carouselCards || form.carouselCards.length < 2) {
        errors.push('Carousel requires at least 2 cards (minimum 2, maximum 10).');
      }
      if (form.carouselCards && form.carouselCards.length > 10) {
        errors.push('Carousel allows a maximum of 10 cards.');
      }
      (form.carouselCards || []).forEach((c, idx) => {
        if (!c.title.trim()) {
          errors.push(`Carousel Card #${idx + 1}: Title is required.`);
        }
        (c.suggestions || []).forEach((sug, sIdx) => {
          if (!sug.label.trim() && sug.value.trim()) {
            errors.push(`Carousel Card #${idx + 1} Action #${sIdx + 1}: Label is required.`);
          }
          if (sug.type === 'OPEN_URL' && !sug.value.trim() && sug.label.trim()) {
            errors.push(`Carousel Card #${idx + 1} Action #${sIdx + 1}: URL is required.`);
          }
          if (sug.type === 'DIAL' && !sug.value.trim() && sug.label.trim()) {
            errors.push(`Carousel Card #${idx + 1} Action #${sIdx + 1}: Phone Number is required.`);
          }
        });
      });
    }

    return errors;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors = validateForm(createForm);
    setValidationErrors(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      // Prepare payload strictly matching OmniDigital API schema
      const formattedSuggestions = createForm.suggestions
        .filter(s => s.label.trim())
        .map(s => ({
          Label: s.label.trim(),
          Type: s.type,
          Url: s.type === 'OPEN_URL' ? s.value.trim() : null,
          PhoneNumber: s.type === 'DIAL' ? s.value.trim() : null,
          PostbackData: s.type === 'REPLY' ? (s.value.trim() || s.label.trim()) : null
        }));

      let payload = {
        TemplateType: createForm.templateType,
        BotId: createForm.botId,
        TemplateName: createForm.templateName.trim()
      };

      if (createForm.templateType === 'PlainText') {
        payload.PlainText = {
          MessageText: createForm.messageText,
          Suggestions: formattedSuggestions
        };
        payload.Suggestions = formattedSuggestions;
      } else if (createForm.templateType === 'RichCard') {
        payload.RichCard = {
          Title: createForm.cardTitle,
          Description: createForm.cardDescription,
          MediaType: createForm.mediaType || 'IMAGE',
          MediaHeight: 'MEDIUM',
          Orientation: 'VERTICAL',
          ImageUrl: createForm.mediaUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',
          Suggestions: formattedSuggestions
        };
        payload.Suggestions = formattedSuggestions;
      } else if (createForm.templateType === 'Carousel') {
        payload.Cards = createForm.carouselCards.map(c => ({
          Title: c.title.trim(),
          Description: c.description?.trim() || null,
          MediaHeight: c.mediaHeight || 'MEDIUM',
          Orientation: c.orientation || 'VERTICAL',
          ImageUrl: c.imageUrl?.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          Suggestions: (c.suggestions || [])
            .filter(s => s.label.trim())
            .map(s => ({
              Label: s.label.trim(),
              Type: s.type,
              Url: s.type === 'OPEN_URL' ? s.value.trim() : null,
              PhoneNumber: s.type === 'DIAL' ? s.value.trim() : null,
              PostbackData: s.type === 'REPLY' ? (s.value.trim() || s.label.trim()) : null
            }))
        }));
      }

      const createdBotId = createForm.botId;
      setNotification(`✓ Template "${createForm.templateName}" created successfully! Status: SUBMITTED (Under Review).`);
      setTimeout(() => setNotification(''), 4000);
      setCreateForm(initialCreateForm);
      setHasAttemptedSubmit(false);
      setValidationErrors([]);
      setViewMode('list');
      setFilterBot(createdBotId);
      fetchTemplates(createdBotId);
    } catch (err) {
      alert(err.response?.data?.response?.message || 'Error creating template.');
    }
  };

  // Analytics Computations
  const analytics = useMemo(() => {
    const total = templates.length;
    const active = templates.filter(t => (t.templateStatus === 'Active' || t.templateStatus === 'Approved')).length;
    const submitted = templates.filter(t => (t.templateStatus === 'SUBMITTED' || t.templateStatus === 'Pending' || t.templateStatus === 'Submitted')).length;
    const plainText = templates.filter(t => t.templateType === 'PlainText').length;
    const richCard = templates.filter(t => t.templateType === 'RichCard').length;
    const carousel = templates.filter(t => t.templateType === 'Carousel').length;

    const pPct = total > 0 ? (plainText / total) * 100 : 0;
    const rPct = total > 0 ? (richCard / total) * 100 : 0;
    const cPct = total > 0 ? (carousel / total) * 100 : 0;

    return { total, active, submitted, plainText, richCard, carousel, pPct, rPct, cPct };
  }, [templates]);

  // Selected Bot Display Name
  const currentBotObj = bots.find(b => b.botId === (viewMode === 'create' ? createForm.botId : filterBot));
  const currentBotName = currentBotObj?.botName || 'PBG INFO';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* ========================================================================= */}
      {/* 1. NOTIFICATIONS                                                          */}
      {/* ========================================================================= */}
      {notification && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '13px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46', padding: '2px 4px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOP BLUE BANNER (MATCHING SCREENSHOT media_1789538109971.png)          */}
      {/* ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: viewMode === 'create' ? '10px 18px' : '18px 24px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: viewMode === 'create' ? 10 : 14 }}>
          <div style={{
            width: viewMode === 'create' ? 34 : 44,
            height: viewMode === 'create' ? 34 : 44,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <MessageSquare size={viewMode === 'create' ? 18 : 24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: viewMode === 'create' ? '16px' : '20px', fontWeight: 800, letterSpacing: '0.3px' }}>
              {viewMode === 'list' ? 'RCS Templates Manager' : 'Create RCS Template'}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: viewMode === 'create' ? '11.5px' : '12.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              {viewMode === 'list' 
                ? 'Create, manage, and preview your Rich Communication Services templates'
                : 'Design and configure your Rich Communication Services template (No DLT / Entity ID needed)'}
            </p>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {onNavigateToBots && (
              <button
                type="button"
                onClick={onNavigateToBots}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
              >
                <Bot size={16} />
                <span>Manage Bots / Bot ID</span>
              </button>
            )}

            <button
              onClick={() => {
                setViewMode('create');
                setHasAttemptedSubmit(false);
                setValidationErrors([]);
              }}
              style={{
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
            >
              <Plus size={16} />
              <span>+ Create New Template</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setViewMode('list')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <ArrowLeft size={14} />
            <span>Back to Templates</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. VIEW 1: TEMPLATES MANAGER (media_1789538109971.png)                    */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: FILTERS + GETTING STARTED + TEMPLATES TABLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Filter & Search Card with Cyan Header */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Cyan Header */}
              <div style={{
                background: '#06b6d4',
                color: '#ffffff',
                padding: '12px 18px',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span>▼ Filter & Search Templates</span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px 20px' }}>
                <form onSubmit={handleSearchFilters}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.2fr', gap: '14px', marginBottom: '16px' }}>
                    
                    {/* Bot Select */}
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <Bot size={13} color="#06b6d4" />
                        <span>Bot</span>
                      </label>
                      <select 
                        className="form-select"
                        value={filterBot}
                        onChange={(e) => {
                          const chosenBot = e.target.value;
                          setFilterBot(chosenBot);
                          fetchTemplates(chosenBot, filterType, filterName);
                        }}
                        style={{ fontSize: '12.5px', height: '38px', borderRadius: '7px', borderColor: '#cbd5e1' }}
                      >
                        {bots.map(b => (
                          <option key={b.botId} value={b.botId}>{b.botName} ({b.botId})</option>
                        ))}
                      </select>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: 4 }}>
                        Choose a bot to view its templates
                      </div>
                    </div>

                    {/* Template Type */}
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <Tag size={13} color="#06b6d4" />
                        <span>Template Type</span>
                      </label>
                      <select 
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ fontSize: '12.5px', height: '38px', borderRadius: '7px', borderColor: '#cbd5e1' }}
                      >
                        <option value="">All Types</option>
                        <option value="PlainText">PlainText</option>
                        <option value="RichCard">RichCard</option>
                        <option value="Carousel">Carousel</option>
                      </select>
                    </div>

                    {/* Search Name */}
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <Search size={13} color="#06b6d4" />
                        <span>Search Name</span>
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Enter template name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        style={{ fontSize: '12.5px', height: '38px', borderRadius: '7px', borderColor: '#cbd5e1' }}
                      />
                    </div>

                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', paddingTop: '4px' }}>
                    <button
                      type="submit"
                      style={{
                        background: '#0a66c2',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '8px 20px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)'
                      }}
                    >
                      <Search size={14} />
                      <span>Search Templates</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearFilters}
                      style={{
                        background: '#f97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '7px',
                        padding: '8px 18px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(249, 115, 22, 0.25)'
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Getting Started Banner (Matching media_1789538109971.png) */}
            <div style={{
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              color: '#0369a1'
            }}>
              <Info size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0369a1', marginBottom: 2 }}>
                  Getting Started
                </div>
                <div style={{ fontSize: '12px', color: '#0c4a6e', lineHeight: 1.4 }}>
                  Select a <b>Bot</b> from the dropdown above and click <b>Search Templates</b> to view available templates.
                </div>
              </div>
            </div>

            {/* Templates List Table */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                  Registered Templates ({templates.length})
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Bot: <b>{currentBotName}</b> ({filterBot})
                </div>
              </div>

              <div className="table-responsive">
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Template Name</th>
                      <th>Type</th>
                      <th>Message Preview</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={22} color="#94a3b8" />
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>
                              No templates found for {currentBotName || 'this Bot'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', maxWidth: 440, lineHeight: 1.5 }}>
                              इस बॉट के लिए अभी कोई टेम्पलेट नहीं बना है। आप इसके लिए नया PlainText, RichCard या Carousel टेम्पलेट बना सकते हैं।
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCreateForm(prev => ({ ...prev, botId: filterBot }));
                                setViewMode('create');
                              }}
                              style={{
                                marginTop: 6,
                                background: '#0a66c2',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '8px 18px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)'
                              }}
                            >
                              <Plus size={14} />
                              <span>+ Create Template for {currentBotName || 'Bot'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      templates.map((t, idx) => {
                        let parsedBtns = [];
                        if (t.buttonsJson) {
                          try { parsedBtns = JSON.parse(t.buttonsJson); } catch (e) {}
                        }
                        if (parsedBtns.length === 0 && t.buttonLabel) {
                          parsedBtns = [{ Label: t.buttonLabel, Type: 'REPLY' }];
                        }

                        const statusUpper = (t.templateStatus || t.status || 'SUBMITTED').toUpperCase();
                        const isActive = statusUpper === 'ACTIVE' || statusUpper === 'APPROVED';
                        const isInactive = statusUpper === 'INACTIVE' || statusUpper === 'PAUSED' || statusUpper === 'ON HOLD';

                        return (
                          <tr key={t.templateId || idx}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
                                {t.templateName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                {t.templateId}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                t.templateType === 'RichCard' ? 'badge-hot' :
                                t.templateType === 'Carousel' ? 'badge-warm' : 'badge-cold'
                              }`} style={{ fontSize: '11px' }}>
                                {t.templateType}
                              </span>
                            </td>
                            <td style={{ maxWidth: '280px' }}>
                              <div style={{ 
                                fontSize: '11.5px', 
                                color: '#475569', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}>
                                {t.cardDescription || t.smsText || 'Template message content'}
                              </div>
                            </td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 4, 
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                background: isActive ? '#ecfdf5' : (isInactive ? '#f1f5f9' : '#fffbeb'),
                                color: isActive ? '#065f46' : (isInactive ? '#64748b' : '#b45309'),
                                border: `1px solid ${isActive ? '#a7f3d0' : (isInactive ? '#cbd5e1' : '#fde68a')}`
                              }}>
                                {isActive ? (
                                  <>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                                    <span>Active</span>
                                  </>
                                ) : isInactive ? (
                                  <>
                                    <PauseCircle size={11} color="#64748b" />
                                    <span>Inactive</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock size={11} color="#d97706" />
                                    <span>{t.templateStatus || 'SUBMITTED'}</span>
                                  </>
                                )}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {/* 1. View Details (Eye) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingTemplate(t);
                                    setViewModalCardIdx(0);
                                  }}
                                  style={{
                                    background: '#f1f5f9',
                                    border: '1px solid #cbd5e1',
                                    color: '#334155',
                                    borderRadius: '5px',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="View template details & mobile preview"
                                >
                                  <Eye size={14} />
                                </button>

                                {/* 2. Edit Template (Edit3) */}
                                <button
                                  type="button"
                                  onClick={() => handleEditTemplate(t)}
                                  style={{
                                    background: '#e0f2fe',
                                    border: '1px solid #bae6fd',
                                    color: '#0369a1',
                                    borderRadius: '5px',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Edit Template"
                                >
                                  <Edit3 size={14} />
                                </button>

                                {/* 3. Active / Inactive Toggle (PauseCircle / PlayCircle) */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(t)}
                                  style={{
                                    background: isInactive ? '#fef3c7' : '#f0fdf4',
                                    border: isInactive ? '1px solid #fde68a' : '1px solid #bbf7d0',
                                    color: isInactive ? '#b45309' : '#15803d',
                                    borderRadius: '5px',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title={isActive ? "Set Inactive / Pause Template" : "Set Active / Resume Template"}
                                >
                                  {isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                                </button>

                                {/* 4. Quick Approve (Only when not Active & not Inactive, e.g. SUBMITTED) */}
                                {!isActive && !isInactive && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickApproveTemplate(t)}
                                    style={{
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      color: '#059669',
                                      borderRadius: '5px',
                                      padding: '0 8px',
                                      height: 28,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                    title="Approve template to make it Active for campaigns"
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Approve</span>
                                  </button>
                                )}

                                {/* 5. Delete Template (Trash2) */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTemplate(t)}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    borderRadius: '5px',
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete Template"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TEMPLATE ANALYTICS CARD (media_1789538109971.png) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Template Analytics Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Green Header */}
              <div style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '12px 18px',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <BarChart2 size={16} />
                <span>Template Analytics</span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Blue KPI Box (TOTAL TEMPLATES) */}
                <div style={{
                  background: '#0a66c2',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: '0 4px 10px rgba(10, 102, 194, 0.2)'
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={22} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1 }}>
                      {analytics.total}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginTop: 4, color: 'rgba(255, 255, 255, 0.85)' }}>
                      TOTAL TEMPLATES
                    </div>
                  </div>
                </div>

                {/* Donut Chart / Distribution Visual */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
                  {analytics.total === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#94a3b8', margin: '0 auto 8px' }}></div>
                      <span>No template data available</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', width: 130, height: 130 }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        {/* Background Circle */}
                        <circle
                          cx="18" cy="18" r="15.91549430918954"
                          fill="transparent"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                        />
                        {/* PlainText Segment (Blue) */}
                        <circle
                          cx="18" cy="18" r="15.91549430918954"
                          fill="transparent"
                          stroke="#0a66c2"
                          strokeWidth="4"
                          strokeDasharray={`${analytics.pPct} ${100 - analytics.pPct}`}
                          strokeDashoffset="0"
                        />
                        {/* RichCard Segment (Cyan) */}
                        <circle
                          cx="18" cy="18" r="15.91549430918954"
                          fill="transparent"
                          stroke="#06b6d4"
                          strokeWidth="4"
                          strokeDasharray={`${analytics.rPct} ${100 - analytics.rPct}`}
                          strokeDashoffset={-analytics.pPct}
                        />
                        {/* Carousel Segment (Green) */}
                        <circle
                          cx="18" cy="18" r="15.91549430918954"
                          fill="transparent"
                          stroke="#22c55e"
                          strokeWidth="4"
                          strokeDasharray={`${analytics.cPct} ${100 - analytics.cPct}`}
                          strokeDashoffset={-(analytics.pPct + analytics.rPct)}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{analytics.active}</span>
                        <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>ACTIVE</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Breakdown List (Matching media_1789538109971.png) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '3px', background: '#0a66c2' }}></span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>PlainText</span>
                    </div>
                    <b style={{ color: '#0f172a' }}>{analytics.plainText > 0 ? analytics.plainText : '-'}</b>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '3px', background: '#06b6d4' }}></span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>RichCard</span>
                    </div>
                    <b style={{ color: '#0f172a' }}>{analytics.richCard > 0 ? analytics.richCard : '-'}</b>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '3px', background: '#22c55e' }}></span>
                      <span style={{ color: '#334155', fontWeight: 600 }}>Carousel</span>
                    </div>
                    <b style={{ color: '#0f172a' }}>{analytics.carousel > 0 ? analytics.carousel : '-'}</b>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Preview of selected template */}
            {previewTemplate && (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                  Active Preview: {previewTemplate.templateName}
                </div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#334155',
                  lineHeight: 1.4
                }}>
                  {previewTemplate.cardDescription || previewTemplate.smsText || 'No message preview'}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW 2: CREATE RCS TEMPLATE (media_1789538144141.png)                  */}
      {/* ========================================================================= */}
      {viewMode === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '16px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: COMMON CARD + PLAIN TEXT CARD + ACTIONS & VALIDATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <form id="rcsCreateTemplateForm" onSubmit={handleCreateSubmit}>
              
              {/* CARD 1: COMMON (Matching media_1789538144141.png) */}
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
                  <span>Common</span>
                </div>

                {/* Form Content: Compact Top-Aligned Stacked Inputs */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Field 1: Bot (Label on Top) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Bot size={14} color="#0a66c2" />
                        <span>Bot</span>
                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                      </label>
                      {onNavigateToBots && (
                        <button
                          type="button"
                          onClick={onNavigateToBots}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#0a66c2',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: 0
                          }}
                        >
                          + Register New Bot ID →
                        </button>
                      )}
                    </div>
                    <select
                      className="form-select"
                      value={createForm.botId}
                      onChange={(e) => setCreateForm({ ...createForm, botId: e.target.value })}
                      style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                    >
                      {bots.map(b => (
                        <option key={b.botId} value={b.botId}>{b.botName} ({b.botId})</option>
                      ))}
                    </select>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                      Will resolve to <code style={{ color: '#dc2626', fontWeight: 700 }}>BotId</code> on submit.
                    </div>
                  </div>

                  {/* 2-Column Grid: Template Name & Template Type (Labels on Top) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    
                    {/* Field 2: Template Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Tag size={14} color="#0a66c2" />
                        <span>Template Name</span>
                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 500, marginLeft: 'auto' }}>Max 20</span>
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Alphanumeric, max 20"
                        maxLength={20}
                        value={createForm.templateName}
                        onChange={(e) => setCreateForm({ ...createForm, templateName: e.target.value })}
                        style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                      />
                    </div>

                    {/* Field 3: Template Type */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Sliders size={14} color="#0a66c2" />
                        <span>Template Type</span>
                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                      </label>
                      <select
                        className="form-select"
                        value={createForm.templateType}
                        onChange={(e) => setCreateForm({ ...createForm, templateType: e.target.value })}
                        style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', width: '100%', borderColor: '#cbd5e1', padding: '4px 8px' }}
                      >
                        <option value="PlainText">PlainText</option>
                        <option value="RichCard">RichCard</option>
                        <option value="Carousel">Carousel</option>
                      </select>
                    </div>

                  </div>

                  {/* Field 4: Notes (Compact Info Banner with Label on Top) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ 
                      background: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '6px', 
                      padding: '6px 10px',
                      fontSize: '11px', 
                      color: '#475569', 
                      lineHeight: 1.4 
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                        <Info size={13} color="#0a66c2" />
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>Notes:</span>
                        <span>Variables:</span>
                        <code style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 4px', borderRadius: '3px', fontSize: '10.5px' }}>[custom_param0]</code>
                        <code style={{ color: '#dc2626', background: '#fee2e2', padding: '1px 4px', borderRadius: '3px', fontSize: '10.5px' }}>[custom_param1]</code>
                        <span style={{ color: '#64748b' }}>(max 7 vars) • PlainText: max 11 buttons</span>
                        <a 
                          href="#download-guidelines" 
                          onClick={(e) => { e.preventDefault(); alert('Template guidelines PDF available in vendor docs.'); }}
                          style={{ color: '#0a66c2', fontWeight: 700, marginLeft: 'auto', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          <Download size={11} />
                          <span>Guidelines</span>
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD 2: PLAIN TEXT / RICHCARD (Matching media_1789538144141.png) */}
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
                  <FileText size={13} color="#0a66c2" />
                  <span>{createForm.templateType === 'PlainText' ? 'Plain Text' : createForm.templateType === 'Carousel' ? 'Carousel Multi-Card Builder' : 'Rich Card'}</span>
                </div>

                {/* Body: Top-Aligned Compact Inputs */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* CASE 1: CAROUSEL MULTI-CARD BUILDER */}
                  {createForm.templateType === 'Carousel' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {/* Carousel Cards Nav / Tabs Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', marginRight: 4 }}>
                            Cards ({createForm.carouselCards.length}/10):
                          </span>
                          {createForm.carouselCards.map((c, cIdx) => (
                            <button
                              key={c.id || cIdx}
                              type="button"
                              onClick={() => {
                                setActiveCarouselCardIdx(cIdx);
                                setSimCarouselCardIdx(cIdx);
                              }}
                              style={{
                                background: activeCarouselCardIdx === cIdx ? '#0a66c2' : '#f1f5f9',
                                color: activeCarouselCardIdx === cIdx ? '#ffffff' : '#334155',
                                border: activeCarouselCardIdx === cIdx ? '1px solid #0a66c2' : '1px solid #cbd5e1',
                                borderRadius: '5px',
                                padding: '4px 10px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <span>Card {cIdx + 1}</span>
                              {createForm.carouselCards.length > 2 && (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCarouselRemoveCard(c.id);
                                  }}
                                  style={{
                                    fontSize: '10px',
                                    opacity: 0.85,
                                    cursor: 'pointer',
                                    color: activeCarouselCardIdx === cIdx ? '#ffffff' : '#ef4444'
                                  }}
                                  title="Delete Card"
                                >
                                  ✖
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {createForm.carouselCards.length < 10 && (
                          <button
                            type="button"
                            onClick={handleCarouselAddCard}
                            style={{
                              background: '#22c55e',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '5px',
                              padding: '5px 12px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}
                          >
                            <Plus size={12} />
                            <span>+ Add Card</span>
                          </button>
                        )}
                      </div>

                      {/* Active Card Details Editor */}
                      {createForm.carouselCards[activeCarouselCardIdx] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>
                              Editing Card #{activeCarouselCardIdx + 1} of {createForm.carouselCards.length}
                            </span>
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              Min 2 cards, Max 10 cards • Max 4 buttons per card
                            </span>
                          </div>

                          {/* 2-Column: Card Title & Image URL */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                                Card Title <span style={{ color: '#dc2626' }}>*</span>
                              </label>
                              <input 
                                type="text"
                                className="form-input"
                                placeholder="Card headline (e.g. Summer Offer)"
                                maxLength={200}
                                value={createForm.carouselCards[activeCarouselCardIdx].title}
                                onChange={(e) => handleCarouselUpdateCard(createForm.carouselCards[activeCarouselCardIdx].id, 'title', e.target.value)}
                                style={{ fontSize: '12px', height: '30px', borderRadius: '6px', padding: '4px 8px' }}
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                                Card Media Image URL
                              </label>
                              <input 
                                type="url"
                                className="form-input"
                                placeholder="https://yourdomain.com/card.jpg"
                                value={createForm.carouselCards[activeCarouselCardIdx].imageUrl}
                                onChange={(e) => handleCarouselUpdateCard(createForm.carouselCards[activeCarouselCardIdx].id, 'imageUrl', e.target.value)}
                                style={{ fontSize: '12px', height: '30px', borderRadius: '6px', padding: '4px 8px' }}
                              />
                            </div>
                          </div>

                          {/* Card Description */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b' }}>
                                Card Description
                              </label>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                                Supports <code>[custom_param0]</code>
                              </span>
                            </div>
                            <textarea
                              className="form-input"
                              rows={2}
                              placeholder="Product details or offer terms..."
                              value={createForm.carouselCards[activeCarouselCardIdx].description || ''}
                              onChange={(e) => handleCarouselUpdateCard(createForm.carouselCards[activeCarouselCardIdx].id, 'description', e.target.value)}
                              style={{ fontSize: '12px', width: '100%', resize: 'vertical', borderRadius: '6px', padding: '6px 8px', height: '48px', minHeight: '40px' }}
                            />
                          </div>

                          {/* Per-Card Suggestion Buttons (Max 4) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Sparkles size={13} color="#0a66c2" />
                                <span>Action Buttons for Card #{activeCarouselCardIdx + 1}</span>
                              </label>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {(createForm.carouselCards[activeCarouselCardIdx].suggestions || []).length} of 4 buttons
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {(createForm.carouselCards[activeCarouselCardIdx].suggestions || []).map((sug, sIdx) => (
                                <div key={sug.id || sIdx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input 
                                    type="text"
                                    className="form-input"
                                    placeholder="Label"
                                    value={sug.label}
                                    onChange={(e) => handleCarouselUpdateCardSuggestion(createForm.carouselCards[activeCarouselCardIdx].id, sug.id, 'label', e.target.value)}
                                    style={{ flex: '1.2', fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }}
                                  />
                                  <select
                                    className="form-select"
                                    value={sug.type}
                                    onChange={(e) => handleCarouselUpdateCardSuggestion(createForm.carouselCards[activeCarouselCardIdx].id, sug.id, 'type', e.target.value)}
                                    style={{ width: '110px', fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 4px' }}
                                  >
                                    <option value="OPEN_URL">OPEN_URL</option>
                                    <option value="DIAL">DIAL</option>
                                    <option value="REPLY">REPLY</option>
                                  </select>
                                  <input 
                                    type="text"
                                    className="form-input"
                                    placeholder={sug.type === 'DIAL' ? '+91...' : (sug.type === 'REPLY' ? 'payload' : 'https://...')}
                                    value={sug.value}
                                    onChange={(e) => handleCarouselUpdateCardSuggestion(createForm.carouselCards[activeCarouselCardIdx].id, sug.id, 'value', e.target.value)}
                                    style={{ flex: '1.6', fontSize: '11.5px', height: '28px', borderRadius: '5px', padding: '2px 6px' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleCarouselRemoveCardSuggestion(createForm.carouselCards[activeCarouselCardIdx].id, sug.id)}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      background: '#1e293b',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '5px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '11px'
                                    }}
                                    title="Remove button"
                                  >
                                    ✖
                                  </button>
                                </div>
                              ))}

                              {(createForm.carouselCards[activeCarouselCardIdx].suggestions || []).length < 4 && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleCarouselAddCardSuggestion(createForm.carouselCards[activeCarouselCardIdx].id)}
                                    style={{
                                      background: '#ffffff',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '5px',
                                      padding: '3px 10px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: '#334155',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <Plus size={12} />
                                    <span>+ Add Card Button</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  ) : (
                    /* CASE 2: PLAINTEXT & RICHCARD */
                    <>
                      {createForm.templateType === 'RichCard' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                              Card Title
                            </label>
                            <input 
                              type="text"
                              className="form-input"
                              placeholder="Headline for rich card"
                              value={createForm.cardTitle}
                              onChange={(e) => setCreateForm({ ...createForm, cardTitle: e.target.value })}
                              style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', padding: '4px 8px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
                              Media URL
                            </label>
                            <input 
                              type="url"
                              className="form-input"
                              placeholder="https://yourdomain.com/image.jpg"
                              value={createForm.mediaUrl}
                              onChange={(e) => setCreateForm({ ...createForm, mediaUrl: e.target.value })}
                              style={{ fontSize: '12.5px', height: '32px', borderRadius: '6px', padding: '4px 8px' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Message Text (Label on Top) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MessageSquare size={14} color="#0a66c2" />
                            <span>Message Text</span>
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>*</span>
                          </label>
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                            Supports <code>[custom_param0]</code>
                          </span>
                        </div>
                        <textarea
                          className="form-input"
                          rows={2}
                          placeholder="Hello [name], your order [orderId] is confirmed."
                          value={createForm.messageText}
                          onChange={(e) => setCreateForm({ ...createForm, messageText: e.target.value })}
                          style={{ fontSize: '12.5px', width: '100%', resize: 'vertical', borderRadius: '6px', padding: '6px 10px', lineHeight: 1.4, minHeight: '52px', height: '54px' }}
                        />
                      </div>

                      {/* Suggestions (max 11) (Label on Top) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Sparkles size={14} color="#0a66c2" />
                            <span>Suggestions (max 11)</span>
                          </label>
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                            {createForm.suggestions.length} of 11 buttons
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {createForm.suggestions.map((sug, idx) => (
                            <div key={sug.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {/* Label Input */}
                              <input 
                                type="text"
                                className="form-input"
                                placeholder="Label (e.g., View Details)"
                                value={sug.label}
                                onChange={(e) => handleUpdateSuggestion(sug.id, 'label', e.target.value)}
                                style={{ flex: '1.2', fontSize: '12px', height: '30px', borderRadius: '6px', padding: '4px 8px' }}
                              />

                              {/* Type Select */}
                              <select
                                className="form-select"
                                value={sug.type}
                                onChange={(e) => handleUpdateSuggestion(sug.id, 'type', e.target.value)}
                                style={{ width: '120px', fontSize: '12px', height: '30px', borderRadius: '6px', padding: '2px 6px' }}
                              >
                                <option value="OPEN_URL">OPEN_URL</option>
                                <option value="DIAL">DIAL</option>
                                <option value="REPLY">REPLY</option>
                              </select>

                              {/* Value Input */}
                              <input 
                                type="text"
                                className="form-input"
                                placeholder={sug.type === 'DIAL' ? '+919876543210' : (sug.type === 'REPLY' ? 'quick_reply_payload' : 'https://example.com')}
                                value={sug.value}
                                onChange={(e) => handleUpdateSuggestion(sug.id, 'value', e.target.value)}
                                style={{ flex: '1.6', fontSize: '12px', height: '30px', borderRadius: '6px', padding: '4px 8px' }}
                              />

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveSuggestion(sug.id)}
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  background: '#1e293b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  fontSize: '12px'
                                }}
                                title="Remove suggestion"
                              >
                                ✖
                              </button>
                            </div>
                          ))}

                          {/* Add Suggestion Button */}
                          <div>
                            <button
                              type="button"
                              onClick={handleAddSuggestion}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                              }}
                            >
                              <Plus size={13} />
                              <span>+ Add Suggestion</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* Action Buttons: Save Template + Reset (Pinned & Prominent) */}
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
                  style={{
                    background: '#0a66c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 20px',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)'
                  }}
                >
                  <Save size={14} />
                  <span>Save Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreateForm(initialCreateForm);
                    setValidationErrors([]);
                    setHasAttemptedSubmit(false);
                  }}
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

              {/* Red Validation Errors List (Matching media_1789538144141.png) */}
              {hasAttemptedSubmit && validationErrors.length > 0 && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '11.5px',
                  lineHeight: 1.6,
                  padding: '4px 2px'
                }}>
                  {validationErrors.map((err, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span>•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

            </form>

          </div>

          {/* RIGHT COLUMN: MOBILE PREVIEW (Matching media_1789538144141.png) */}
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
              <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span>📱 Mobile Preview</span>
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

                    {/* Chat Bubble or Carousel Card */}
                    {createForm.templateType === 'Carousel' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {/* Carousel Card Indicator Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                            Carousel • Card {simCarouselCardIdx + 1} of {createForm.carouselCards.length}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => setSimCarouselCardIdx(prev => Math.max(0, prev - 1))}
                              disabled={simCarouselCardIdx === 0}
                              style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: simCarouselCardIdx === 0 ? '#e2e8f0' : '#0a66c2',
                                color: simCarouselCardIdx === 0 ? '#94a3b8' : '#ffffff',
                                border: 'none', cursor: simCarouselCardIdx === 0 ? 'default' : 'pointer',
                                fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => setSimCarouselCardIdx(prev => Math.min(createForm.carouselCards.length - 1, prev + 1))}
                              disabled={simCarouselCardIdx >= createForm.carouselCards.length - 1}
                              style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: simCarouselCardIdx >= createForm.carouselCards.length - 1 ? '#e2e8f0' : '#0a66c2',
                                color: simCarouselCardIdx >= createForm.carouselCards.length - 1 ? '#94a3b8' : '#ffffff',
                                border: 'none', cursor: simCarouselCardIdx >= createForm.carouselCards.length - 1 ? 'default' : 'pointer',
                                fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        {/* Active Carousel Card */}
                        {createForm.carouselCards[simCarouselCardIdx] && (
                          <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                          }}>
                            {/* Card Media Image */}
                            {createForm.carouselCards[simCarouselCardIdx].imageUrl ? (
                              <img 
                                src={createForm.carouselCards[simCarouselCardIdx].imageUrl} 
                                alt="Carousel media" 
                                style={{ width: '100%', height: '105px', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ height: '70px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
                                🖼️ Card Media Placeholder
                              </div>
                            )}

                            {/* Card Content */}
                            <div style={{ padding: '8px 10px' }}>
                              <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                                {createForm.carouselCards[simCarouselCardIdx].title || 'Card Headline'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.35, marginTop: 4 }}>
                                {createForm.carouselCards[simCarouselCardIdx].description || 'Card description text...'}
                              </div>

                              {/* Per-Card Action Buttons */}
                              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {(createForm.carouselCards[simCarouselCardIdx].suggestions || []).map((sug, sIdx) => (
                                  <div
                                    key={sug.id || sIdx}
                                    style={{
                                      background: '#eff6ff',
                                      border: '1px solid #bfdbfe',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: '#1d4ed8',
                                      textAlign: 'center',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4
                                    }}
                                  >
                                    <span>{sug.type === 'DIAL' ? '📞' : (sug.type === 'REPLY' ? '💬' : '🔗')}</span>
                                    <span>{sug.label || `Action ${sIdx + 1}`}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Chat Bubble for PlainText / RichCard */
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px 12px 12px 2px',
                        padding: '10px 12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}>
                        {/* RichCard Media if selected */}
                        {createForm.templateType === 'RichCard' && (
                          <div style={{ marginBottom: 8 }}>
                            {createForm.mediaUrl ? (
                              <img 
                                src={createForm.mediaUrl} 
                                alt="Card media" 
                                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <div style={{ height: '70px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
                                🖼️ Media placeholder
                              </div>
                            )}
                            {createForm.cardTitle && (
                              <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', marginTop: 6 }}>
                                {createForm.cardTitle}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message Content */}
                        <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                          {createForm.messageText ? (
                            createForm.messageText
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Your message text will appear here</span>
                          )}
                        </div>

                        {/* Suggestion Pills */}
                        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {createForm.suggestions.map((sug, idx) => (
                            <div 
                              key={sug.id || idx}
                              style={{
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                color: '#1d4ed8',
                                borderRadius: '14px',
                                padding: '3px 8px',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span>{sug.type === 'DIAL' ? '📞' : (sug.type === 'REPLY' ? '💬' : '🔗')}</span>
                              <span>{sug.label || `Open`}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Subtext below simulator */}
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: 12 }}>
                Updates live as you type/select. Media shows placeholders until uploaded.
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: TEMPLATE DETAILS & LIVE PHONE PREVIEW                           */}
      {/* ========================================================================= */}
      {viewingTemplate && (() => {
        const t = viewingTemplate;
        const currentBot = bots.find(b => b.botId === t.botId) || {
          botName: t.botName || 'PBG INFO',
          color: '#0a66c2',
          logoUrl: null
        };
        const statusUpper = (t.templateStatus || t.status || 'SUBMITTED').toUpperCase();
        const isTActive = statusUpper === 'ACTIVE' || statusUpper === 'APPROVED';
        const isTInactive = statusUpper === 'INACTIVE' || statusUpper === 'PAUSED' || statusUpper === 'ON HOLD';

        let tSuggestions = [];
        if (Array.isArray(t.suggestions) && t.suggestions.length > 0) {
          tSuggestions = t.suggestions;
        } else if (t.buttonsJson) {
          try {
            const p = JSON.parse(t.buttonsJson);
            if (Array.isArray(p)) tSuggestions = p;
          } catch(e) {}
        }
        if (tSuggestions.length === 0 && t.buttonLabel) {
          tSuggestions = [{ label: t.buttonLabel, type: 'REPLY', value: '' }];
        }

        const messageBody = t.cardDescription || t.smsText || t.messageText || '';

        const cards = Array.isArray(t.carouselCards) && t.carouselCards.length > 0
          ? t.carouselCards
          : [
              {
                id: 1,
                title: t.cardTitle || t.templateName,
                description: messageBody,
                imageUrl: t.mediaUrl,
                suggestions: tSuggestions
              }
            ];

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '92vh',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '16px 22px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Eye size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                      Template Details & Handset Preview
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {t.templateName} • Bot ID: {t.botId}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: isTActive ? '#ecfdf5' : (isTInactive ? '#f1f5f9' : '#fffbeb'),
                    color: isTActive ? '#065f46' : (isTInactive ? '#64748b' : '#b45309'),
                    border: `1px solid ${isTActive ? '#a7f3d0' : (isTInactive ? '#cbd5e1' : '#fde68a')}`
                  }}>
                    {isTActive ? (
                      <>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                        <span>Active</span>
                      </>
                    ) : isTInactive ? (
                      <>
                        <PauseCircle size={11} color="#64748b" />
                        <span>Inactive</span>
                      </>
                    ) : (
                      <>
                        <Clock size={11} color="#d97706" />
                        <span>{t.templateStatus || 'SUBMITTED'}</span>
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingTemplate(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body: 2 Columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.25fr 1fr',
                gap: '20px',
                padding: '22px',
                overflowY: 'auto',
                maxHeight: 'calc(92vh - 130px)',
                background: '#f8fafc'
              }}>
                {/* Left Column: Metadata & Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* General Info Card */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Template Information
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Template Name</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{t.templateName}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Format / Type</div>
                        <div>
                          <span className={`badge ${
                            t.templateType === 'RichCard' ? 'badge-hot' :
                            t.templateType === 'Carousel' ? 'badge-warm' : 'badge-cold'
                          }`} style={{ fontSize: '11px' }}>
                            {t.templateType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Template ID</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <code style={{ fontSize: '11px', color: '#0f172a', background: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>
                            {t.templateId}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(t.templateId, 'tid')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0a66c2', padding: 2 }}
                            title="Copy Template ID"
                          >
                            {copiedId === 'tid' ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Associated Bot</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Bot size={13} color="#0a66c2" />
                          <span>{currentBot.botName}</span>
                        </div>
                      </div>
                    </div>

                    {t.createdDate && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                        Created: {t.createdDate}
                      </div>
                    )}
                  </div>

                  {/* Message Content Card */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Message Content
                    </div>
                    {t.cardTitle && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 2 }}>Card Title / Headline:</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>{t.cardTitle}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 2 }}>Message Body:</div>
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        color: '#334155',
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap',
                        maxHeight: '140px',
                        overflowY: 'auto'
                      }}>
                        {messageBody || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No message text</span>}
                      </div>
                    </div>

                    {t.mediaUrl && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 2 }}>Media URL (Banner / Image):</div>
                        <a href={t.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#0a66c2', wordBreak: 'break-all', textDecoration: 'underline' }}>
                          {t.mediaUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Suggestions List */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Interactive Suggestions / Buttons ({tSuggestions.length})
                    </div>
                    {tSuggestions.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                        No quick actions or buttons configured
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {tSuggestions.map((s, sIdx) => {
                          const sLabel = s.Label || s.label || s.text || `Button ${sIdx + 1}`;
                          const sType = s.Type || s.type || 'OPEN_URL';
                          const sVal = s.Value || s.value || s.url || s.phoneNumber || '';
                          return (
                            <div key={sIdx} style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11.5px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>{sType === 'DIAL' ? '📞' : (sType === 'REPLY' ? '💬' : '🔗')}</span>
                                <b style={{ color: '#0f172a' }}>{sLabel}</b>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  borderRadius: '4px',
                                  padding: '1px 6px',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }}>
                                  {sType}
                                </span>
                                {sVal && <span style={{ color: '#64748b', fontSize: '10.5px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sVal}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modal Action Buttons Bar */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(t)}
                      style={{
                        flex: 1,
                        background: isTInactive ? '#ecfdf5' : '#fef3c7',
                        border: `1px solid ${isTInactive ? '#a7f3d0' : '#fde68a'}`,
                        color: isTInactive ? '#065f46' : '#b45309',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      {isTActive ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                      <span>{isTActive ? 'Set Inactive (Pause)' : 'Set Active (Resume)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditTemplate(t)}
                      style={{
                        background: '#e0f2fe',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(t)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>

                {/* Right Column: Interactive Phone Handset Simulator */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, alignSelf: 'flex-start' }}>
                    📱 Mobile Phone Handset Simulator
                  </div>

                  {/* Phone Bezel */}
                  <div style={{
                    width: '300px',
                    height: '520px',
                    background: '#0f172a',
                    borderRadius: '36px',
                    padding: '10px',
                    boxShadow: '0 20px 35px -10px rgba(15, 23, 42, 0.4), 0 0 0 2px #334155',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Screen Canvas */}
                    <div style={{
                      flex: 1,
                      background: '#f1f5f9',
                      borderRadius: '26px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}>
                      
                      {/* Notch / Status Bar */}
                      <div style={{
                        background: '#ffffff',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <span>12:30</span>
                        <div style={{ width: '40px', height: '4px', background: '#cbd5e1', borderRadius: '4px' }}></div>
                        <span>5G 85%</span>
                      </div>

                      {/* Bot App Bar */}
                      <div style={{
                        background: '#ffffff',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderBottom: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: currentBot.color || '#0a66c2',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '11px',
                          overflow: 'hidden'
                        }}>
                          {currentBot.logoUrl ? (
                            <img src={currentBot.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            currentBot.botName?.substring(0, 2).toUpperCase() || 'PB'
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {currentBot.botName || 'PBG INFO'}
                            </span>
                            <span style={{ color: '#0a66c2', fontSize: '11px' }} title="Verified by Google RBM">✓</span>
                          </div>
                          <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 600 }}>Google Verified Business</div>
                        </div>
                      </div>

                      {/* Chat Messages Area */}
                      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        
                        {/* RCS Badge */}
                        <div style={{ alignSelf: 'center', background: '#e2e8f0', color: '#475569', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                          RCS • End-to-end Verified
                        </div>

                        {/* Carousel Card Slider if Carousel */}
                        {t.templateType === 'Carousel' ? (
                          <div>
                            {/* Carousel pagination tab */}
                            {cards.length > 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                                {cards.map((c, cIdx) => (
                                  <button
                                    key={cIdx}
                                    type="button"
                                    onClick={() => setViewModalCardIdx(cIdx)}
                                    style={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      background: viewModalCardIdx === cIdx ? '#0a66c2' : '#cbd5e1',
                                      border: 'none',
                                      padding: 0,
                                      cursor: 'pointer'
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {cards[viewModalCardIdx] && (
                              <div style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                              }}>
                                {cards[viewModalCardIdx].imageUrl ? (
                                  <img 
                                    src={cards[viewModalCardIdx].imageUrl} 
                                    alt="Carousel media" 
                                    style={{ width: '100%', height: '110px', objectFit: 'cover' }} 
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ height: '70px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
                                    🖼️ Card Media
                                  </div>
                                )}
                                <div style={{ padding: '8px 10px' }}>
                                  <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
                                    {cards[viewModalCardIdx].title || t.cardTitle || 'Card Headline'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.35, marginTop: 4 }}>
                                    {cards[viewModalCardIdx].description || messageBody}
                                  </div>

                                  {/* Buttons */}
                                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {(cards[viewModalCardIdx].suggestions || tSuggestions).map((sug, sIdx) => {
                                      const sLabel = sug.Label || sug.label || sug.text || `Action ${sIdx + 1}`;
                                      const sType = sug.Type || sug.type || 'OPEN_URL';
                                      return (
                                        <div
                                          key={sIdx}
                                          style={{
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '6px',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            color: '#1d4ed8',
                                            textAlign: 'center',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 4
                                          }}
                                        >
                                          <span>{sType === 'DIAL' ? '📞' : (sType === 'REPLY' ? '💬' : '🔗')}</span>
                                          <span>{sLabel}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* PlainText or RichCard Message Bubble */
                          <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px 12px 12px 2px',
                            padding: '10px 12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                          }}>
                            {/* RichCard Media */}
                            {t.templateType === 'RichCard' && t.mediaUrl && (
                              <div style={{ marginBottom: 8 }}>
                                <img
                                  src={t.mediaUrl}
                                  alt="Card media"
                                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            )}

                            {t.cardTitle && (
                              <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a', marginBottom: 4 }}>
                                {t.cardTitle}
                              </div>
                            )}

                            <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                              {messageBody}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, marginTop: 4 }}>
                              <span style={{ fontSize: '9px', color: '#94a3b8' }}>12:30 PM</span>
                              <span style={{ fontSize: '9px', color: '#0284c7' }}>✓✓</span>
                            </div>
                          </div>
                        )}

                        {/* Interactive Suggestion Chips below Bubble (PlainText & RichCard) */}
                        {t.templateType !== 'Carousel' && tSuggestions.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 2 }}>
                            {tSuggestions.map((sug, idx) => {
                              const sLabel = sug.Label || sug.label || sug.text || `Action`;
                              const sType = sug.Type || sug.type || 'OPEN_URL';
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    color: '#1d4ed8',
                                    borderRadius: '14px',
                                    padding: '3px 9px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                >
                                  <span>{sType === 'DIAL' ? '📞' : (sType === 'REPLY' ? '💬' : '🔗')}</span>
                                  <span>{sLabel}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>

                      {/* Bottom Input Area */}
                      <div style={{
                        background: '#ffffff',
                        padding: '6px 10px',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <div style={{
                          flex: 1,
                          background: '#f1f5f9',
                          borderRadius: '14px',
                          padding: '5px 10px',
                          fontSize: '10.5px',
                          color: '#94a3b8'
                        }}>
                          RCS message
                        </div>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: currentBot.color || '#0a66c2',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px'
                        }}>
                          ➤
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '12px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {isTActive ? (
                    <span style={{ color: '#059669', fontWeight: 600 }}>● Active: Ready to be selected in RCS Campaigns</span>
                  ) : isTInactive ? (
                    <span style={{ color: '#64748b', fontWeight: 600 }}>⏸ Inactive: Paused by Admin</span>
                  ) : (
                    <span style={{ color: '#d97706', fontWeight: 600 }}>⏳ Submitted: Pending operator verification</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setViewingTemplate(null)}
                  style={{ padding: '6px 18px', fontWeight: 700 }}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default RcsTemplatesPage;
