import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { 
  Bot, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  ShieldAlert, 
  Check, 
  AlertCircle, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  PauseCircle, 
  PlayCircle, 
  Ban, 
  ExternalLink, 
  Globe, 
  Phone, 
  Mail, 
  Building, 
  RefreshCw, 
  X,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const RcsBotsPage = ({ onNavigateToCampaign, onNavigateToAddTemplate }) => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [botActionMsg, setBotActionMsg] = useState('');
  const [copiedText, setCopiedText] = useState('');

  // Tab View: 'BOTS_TABLE' vs 'TEMPLATE_EXPLORER'
  const [activeSubTab, setActiveSubTab] = useState('BOTS_TABLE');

  // Enterprise Table Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMessageType, setFilterMessageType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals States
  const [showAddBotModal, setShowAddBotModal] = useState(false);
  const [viewingBot, setViewingBot] = useState(null);
  const [editingBot, setEditingBot] = useState(null);
  const [statusBot, setStatusBot] = useState(null);
  const [deletingBot, setDeletingBot] = useState(null);

  // Edit Bot Form State
  const [editForm, setEditForm] = useState({
    botName: '',
    brandName: '',
    description: '',
    webhookUrl: '',
    color: '#0a66c2',
    contactPhone: '',
    contactEmail: '',
    websiteUrl: '',
    contactPerson: ''
  });

  // Status Change State
  const [newStatusChoice, setNewStatusChoice] = useState('Verified');
  const [statusReason, setStatusReason] = useState('');

  // New Bot Form State (User-defined dynamic inputs)
  const initialNewBotState = {
    botId: '',
    name: '',
    messageType: 'Transactional',
    brandname: '',
    desc: '',
    number: '',
    email: '',
    website: '',
    termsUrl: '',
    privacyUrl: '',
    logoImageUrl: '',
    bannerImageUrl: '',
    colorCode: '#0a66c2',
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactMobile: '',
    dltEntityId: '',
    gstUrl: '',
    panUrl: '',
    subaggregator: ''
  };
  const [newBotForm, setNewBotForm] = useState(initialNewBotState);
  const [botCreating, setBotCreating] = useState(false);
  const [botCreateError, setBotCreateError] = useState('');

  // Quick Autofill sample template details for quick testing
  const autofillApprovedPbgEntity = () => {
    setNewBotForm({
      botId: '3c4fa9a066274cd2',
      name: 'PBG INFO',
      messageType: 'Transactional',
      brandname: 'PBG INFO TECH PVT LTD',
      desc: 'Official Verified Brand Bot for PBG Account Updates & Critical Service Alerts',
      number: '+91 9876543210',
      email: 'support@rcsflow.io',
      website: 'https://rcsflow.io',
      termsUrl: 'https://rcsflow.io/terms',
      privacyUrl: 'https://rcsflow.io/privacy',
      logoImageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=512',
      bannerImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1024',
      colorCode: '#0a66c2',
      contactName: 'PBG Authorized Signatory',
      contactDesignation: 'Director - Compliance',
      contactEmail: 'support@rcsflow.io',
      contactMobile: '+91 9876543210',
      dltEntityId: '1201161304403738311',
      gstUrl: '',
      panUrl: '',
      subaggregator: 'Direct Carrier Link'
    });
  };

  // Carrier Template Explorer State
  const [selectedBotIdForTemplates, setSelectedBotIdForTemplates] = useState('');
  const [templates, setTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState('All');
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    fetchBots();
  }, []);

  useEffect(() => {
    if (selectedBotIdForTemplates) {
      fetchBotTemplates(selectedBotIdForTemplates, templateSearch, templateTypeFilter);
    }
  }, [selectedBotIdForTemplates, templateTypeFilter]);

  const fetchBots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/RCSApi/GetBots');
      if (res.data?.response?.bots) {
        setBots(res.data.response.bots);
        if (res.data.response.bots.length > 0 && !selectedBotIdForTemplates) {
          setSelectedBotIdForTemplates(res.data.response.bots[0].botId);
        }
      }
    } catch (err) {
      console.error('Failed to load RCS bots', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBotTemplates = async (bId, nameFilter, typeFilter) => {
    try {
      setTemplatesLoading(true);
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
      setTemplatesLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2500);
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = bots.length;
    const verified = bots.filter(b => b.status === 'Verified').length;
    const onHold = bots.filter(b => b.status === 'On Hold' || b.status === 'Suspended').length;
    const transactional = bots.filter(b => b.messageType === 'Transactional' || !b.messageType).length;
    const promotional = bots.filter(b => b.messageType === 'Promotional').length;
    return { total, verified, onHold, transactional, promotional };
  }, [bots]);

  // Filtered & Paginated Bots
  const filteredBots = useMemo(() => {
    return bots.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (b.botName && b.botName.toLowerCase().includes(q)) || 
        (b.botId && b.botId.toLowerCase().includes(q)) || 
        (b.brandName && b.brandName.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q));

      const matchesType = filterMessageType === 'All' || 
        (b.messageType && b.messageType.toLowerCase() === filterMessageType.toLowerCase());

      const matchesStatus = filterStatus === 'All' || 
        (b.status && b.status.toLowerCase() === filterStatus.toLowerCase());

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bots, searchQuery, filterMessageType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredBots.length / pageSize));
  const paginatedBots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBots.slice(start, start + pageSize);
  }, [filteredBots, currentPage, pageSize]);

  // Create Bot Submit
  const handleCreateBot = async (e) => {
    e.preventDefault();
    if (!newBotForm.name.trim()) {
      setBotCreateError('Bot Display Name is required.');
      return;
    }
    setBotCreating(true);
    setBotCreateError('');

    try {
      const payload = {
        bot_id: newBotForm.botId?.trim() || undefined,
        name: newBotForm.name.trim(),
        bot_type: 'A2P',
        brandname: newBotForm.brandname.trim() || newBotForm.name.trim(),
        desc: newBotForm.desc.trim() || `Official ${newBotForm.name.trim()} RCS brand agent`,
        number: newBotForm.number.trim() ? [newBotForm.number.trim()] : [],
        plab: ['Main Desk'],
        email: newBotForm.email.trim() ? [newBotForm.email.trim()] : [],
        elab: ['Support'],
        website: newBotForm.website ? [newBotForm.website.trim()] : undefined,
        terms_url: newBotForm.termsUrl.trim() || undefined,
        privacy_url: newBotForm.privacyUrl.trim() || undefined,
        message_type: newBotForm.messageType,
        logoimageurlrcs: newBotForm.logoImageUrl.trim(),
        bannerimageurlrcs: newBotForm.bannerImageUrl.trim() || undefined,
        colorCode: newBotForm.colorCode,
        dlt_entity_id: newBotForm.dltEntityId?.trim() || undefined,
        extra_details: {
          fullname: newBotForm.contactName.trim() || 'Authorized Manager',
          designation: newBotForm.contactDesignation.trim() || 'Operations Head',
          emailid: newBotForm.contactEmail.trim() || newBotForm.email.trim() || '',
          mobile: newBotForm.contactMobile.trim() || newBotForm.number.trim() || '',
          gst: newBotForm.gstUrl?.trim() || undefined,
          pan: newBotForm.panUrl?.trim() || undefined,
          subaggregator: newBotForm.subaggregator?.trim() || 'Direct'
        }
      };

      const res = await api.post('/RCSApi/CreateBot', payload);
      if (res.data?.status === 'OK' || res.data?.Status === 'OK') {
        setShowAddBotModal(false);
        const assignedBotId = res.data?.response?.botId || res.data?.Response?.BotId || 'new_bot';
        setBotActionMsg(`✓ Bot "${newBotForm.name}" registered successfully! Unique BotId: ${assignedBotId}`);
        fetchBots();
        setNewBotForm(initialNewBotState);
        setTimeout(() => setBotActionMsg(''), 6000);
      } else {
        setBotCreateError(res.data?.response?.message || res.data?.Response?.Message || 'Failed to register bot.');
      }
    } catch (err) {
      setBotCreateError(err.response?.data?.response?.message || err.message || 'Error registering bot.');
    } finally {
      setBotCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (bot) => {
    setEditingBot(bot);
    setEditForm({
      botId: bot.botId || '',
      botName: bot.botName || '',
      brandName: bot.brandName || '',
      dltEntityId: bot.dltEntityId || '',
      description: bot.description || '',
      webhookUrl: bot.webhookUrl || '',
      color: bot.color || '#0a66c2',
      contactPhone: bot.contactPhone || '',
      contactEmail: bot.contactEmail || '',
      websiteUrl: bot.websiteUrl || '',
      contactPerson: bot.contactPerson || ''
    });
  };

  // Submit Edit Bot
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBot) return;

    try {
      const payload = {
        botId: editingBot.botId,
        botName: editForm.botName,
        brandName: editForm.brandName,
        description: editForm.description,
        webhookUrl: editForm.webhookUrl,
        color: editForm.color,
        contactPhone: editForm.contactPhone,
        contactEmail: editForm.contactEmail,
        websiteUrl: editForm.websiteUrl,
        contactPerson: editForm.contactPerson
      };

      const res = await api.put('/RCSApi/UpdateBot', payload);
      if (res.data?.status === 'OK') {
        setBotActionMsg(`✓ Bot "${editForm.botName}" updated successfully.`);
        setEditingBot(null);
        fetchBots();
        setTimeout(() => setBotActionMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.response?.message || 'Failed to update bot.');
    }
  };

  // Open Status Change Modal (Approve, Hold, Reject)
  const handleOpenStatus = (bot) => {
    setStatusBot(bot);
    setNewStatusChoice(bot.status || 'Verified');
    setStatusReason('');
  };

  // Submit Status Change
  const handleSaveStatus = async () => {
    if (!statusBot) return;

    try {
      const payload = {
        botId: statusBot.botId,
        status: newStatusChoice,
        reason: statusReason
      };

      const res = await api.post('/RCSApi/UpdateBotStatus', payload);
      if (res.data?.status === 'OK') {
        setBotActionMsg(`✓ Bot "${statusBot.botName}" status changed to "${newStatusChoice}".`);
        setStatusBot(null);
        fetchBots();
        setTimeout(() => setBotActionMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.response?.message || 'Failed to update bot status.');
    }
  };

  // Delete Bot
  const handleConfirmDelete = async () => {
    if (!deletingBot) return;

    try {
      const res = await api.delete(`/RCSApi/DeleteBot/${deletingBot.botId}`);
      if (res.data?.status === 'OK') {
        setBotActionMsg(`✓ Bot "${deletingBot.botName}" (${deletingBot.botId}) deleted successfully.`);
        setDeletingBot(null);
        fetchBots();
        setTimeout(() => setBotActionMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.response?.message || 'Failed to delete bot.');
    }
  };

  const handleQuickApprove = async (bot) => {
    try {
      const res = await api.post('/RCSApi/UpdateBotStatus', {
        botId: bot.botId,
        status: 'Verified',
        reason: 'Verified and approved with Google RBM'
      });
      if (res.data?.status === 'OK') {
        setBotActionMsg(`✓ Bot "${bot.botName}" approved and verified successfully! It is now available in Templates & Campaigns.`);
        fetchBots();
        setTimeout(() => setBotActionMsg(''), 6000);
      }
    } catch (err) {
      alert(err.response?.data?.response?.message || 'Failed to approve bot.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
      case 'Approved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#065f46', fontSize: '11px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
            <span>Verified</span>
          </span>
        );
      case 'Submitted':
      case 'SUBMITTED':
      case 'Pending':
      case 'Pending Approval':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', fontSize: '11px', fontWeight: 700, border: '1px solid #fde68a' }}>
            <Clock size={11} color="#d97706" />
            <span>SUBMITTED</span>
          </span>
        );
      case 'On Hold':
      case 'Suspended':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: 700, border: '1px solid #fde68a' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>On Hold (Blocked)</span>
          </span>
        );
      case 'Rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: '12px', background: '#fef2f2', color: '#991b1b', fontSize: '11px', fontWeight: 700, border: '1px solid #fecaca' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: '12px', background: '#fffbeb', color: '#b45309', fontSize: '11px', fontWeight: 700, border: '1px solid #fde68a' }}>
            <Clock size={11} color="#d97706" />
            <span>{status || 'Pending Approval'}</span>
          </span>
        );
    }
  };

  const getTrafficTypeBadge = (type) => {
    if (type === 'Promotional') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700 }}>
          <span>Promotional</span>
          <span style={{ fontSize: '9.5px', opacity: 0.8 }}>(9am-9pm)</span>
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 700 }}>
        <span>Transactional</span>
        <span style={{ fontSize: '9.5px', opacity: 0.8 }}>(24x7)</span>
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '12px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px' }}>
                Enterprise RCS Bots & Directory
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                LIVE RESELLER GATEWAY
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Manage brand bot identities, control traffic routes, view carrier compliance details, and execute admin status actions.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={fetchBots}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '7px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title="Refresh bot directory"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddBotModal(true)}
            style={{
              background: '#0a66c2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(10, 102, 194, 0.35)'
            }}
          >
            <Plus size={15} />
            <span>+ Register New Bot</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {botActionMsg && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{botActionMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RESELLER KPI STRIP                                                     */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        
        {/* Total Bots */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Bots</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>{kpis.total}</div>
          </div>
        </div>

        {/* Verified / Active */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Verified / Active</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#065f46' }}>{kpis.verified}</div>
          </div>
        </div>

        {/* On Hold / Blocked */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PauseCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>On Hold / Blocked</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#b45309' }}>{kpis.onHold}</div>
          </div>
        </div>

        {/* Transactional vs Promotional */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Traffic Routes</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              <span>{kpis.transactional} Txn (24x7)</span> • <span style={{ color: '#d97706' }}>{kpis.promotional} Promo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('BOTS_TABLE')}
          style={{
            background: activeSubTab === 'BOTS_TABLE' ? '#0a66c2' : '#f1f5f9',
            color: activeSubTab === 'BOTS_TABLE' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Bot size={14} />
          <span>Registered Bots Directory ({filteredBots.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('TEMPLATE_EXPLORER')}
          style={{
            background: activeSubTab === 'TEMPLATE_EXPLORER' ? '#0a66c2' : '#f1f5f9',
            color: activeSubTab === 'TEMPLATE_EXPLORER' ? '#ffffff' : '#475569',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <FileCode size={14} />
          <span>Carrier Templates Explorer</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ENTERPRISE DATA TABLE                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'BOTS_TABLE' && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          
          {/* Table Search & Filter Toolbar */}
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: '260px' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 9 }} />
                <input
                  type="text"
                  placeholder="Search Bot Name, Brand, or 16-hex BotId..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    fontSize: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Message Type Filter */}
              <select
                value={filterMessageType}
                onChange={(e) => {
                  setFilterMessageType(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
              >
                <option value="All">All Types</option>
                <option value="Transactional">Transactional (24x7)</option>
                <option value="Promotional">Promotional (9am-9pm)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
              >
                <option value="All">All Status</option>
                <option value="Verified">Verified</option>
                <option value="Submitted">Submitted</option>
                <option value="On Hold">On Hold (Blocked)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Rows Per Page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#64748b' }}>
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>records</span>
            </div>

          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '10px 14px' }}>Bot & Brand</th>
                  <th style={{ padding: '10px 14px' }}>Unique Bot ID</th>
                  <th style={{ padding: '10px 14px' }}>Traffic Type</th>
                  <th style={{ padding: '10px 14px' }}>Google RBM Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Templates</th>
                  <th style={{ padding: '10px 14px' }}>Registered</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBots.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      <Bot size={32} color="#cbd5e1" style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>No bots found matching your search.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedBots.map((b, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr 
                        key={b.botId} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0', 
                          background: isEven ? '#ffffff' : '#fafafa',
                          transition: 'background 0.1s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = isEven ? '#ffffff' : '#fafafa'}
                      >
                        {/* 1. Bot & Brand */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: '8px',
                              background: b.color || '#0a66c2',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                              flexShrink: 0
                            }}>
                              {b.logoUrl ? (
                                <img src={b.logoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                              ) : (
                                b.botName?.charAt(0) || 'B'
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                                {b.botName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {b.brandName || 'Verified Brand Entity'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Bot ID */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f8fafc', padding: '3px 8px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                            <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0a66c2', fontSize: '11.5px' }}>
                              {b.botId}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.botId, `id-${b.botId}`)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: copiedText === `id-${b.botId}` ? '#059669' : '#64748b' }}
                              title="Copy Bot ID"
                            >
                              {copiedText === `id-${b.botId}` ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        {/* 3. Traffic Type */}
                        <td style={{ padding: '10px 14px' }}>
                          {getTrafficTypeBadge(b.messageType)}
                        </td>

                        {/* 4. Google RBM Status */}
                        <td style={{ padding: '10px 14px' }}>
                          {getStatusBadge(b.status)}
                        </td>

                        {/* 5. Templates Count */}
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#f1f5f9',
                            color: '#0f172a',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11.5px'
                          }}>
                            {b.templateCount ?? templates.filter(t => t.botId === b.botId).length}
                          </span>
                        </td>

                        {/* 6. Registered Date */}
                        <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '11.5px' }}>
                          {b.createdDate || '2026-09-15'}
                        </td>

                        {/* 7. Admin Action Buttons */}
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setViewingBot(b)}
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
                              title="View full bot & KYC details"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Edit Bot */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(b)}
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
                              title="Edit Bot metadata"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Status Manager (Hold / Block / Approve) */}
                            <button
                              type="button"
                              onClick={() => handleOpenStatus(b)}
                              style={{
                                background: b.status === 'On Hold' || b.status === 'Suspended' ? '#fef3c7' : '#f0fdf4',
                                border: b.status === 'On Hold' || b.status === 'Suspended' ? '1px solid #fde68a' : '1px solid #bbf7d0',
                                color: b.status === 'On Hold' || b.status === 'Suspended' ? '#b45309' : '#15803d',
                                borderRadius: '5px',
                                width: 28,
                                height: 28,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Admin Status Control: Hold, Block, or Approve"
                            >
                              {b.status === 'On Hold' || b.status === 'Suspended' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                            </button>

                            {/* Quick Approve Button for Pending / Submitted Bots */}
                            {(b.status === 'Submitted' || b.status === 'SUBMITTED' || b.status === 'Pending' || b.status === 'Pending Approval') && (
                              <button
                                type="button"
                                onClick={() => handleQuickApprove(b)}
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
                                title="Approve Bot: Verify and allow templates & campaigns"
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Add Template Shortcut (Only for Verified / Approved bots) */}
                            {onNavigateToAddTemplate && (b.status === 'Verified' || b.status === 'Approved') && (
                              <button
                                type="button"
                                onClick={onNavigateToAddTemplate}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  color: '#0a66c2',
                                  borderRadius: '5px',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                                title="Add Template for this Bot"
                              >
                                <Plus size={14} />
                              </button>
                            )}

                            {/* Delete Bot */}
                            <button
                              type="button"
                              onClick={() => setDeletingBot(b)}
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
                              title="Delete Bot"
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

          {/* Table Pagination Bar */}
          <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Showing <b>{filteredBots.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</b> to <b>{Math.min(currentPage * pageSize, filteredBots.length)}</b> of <b>{filteredBots.length}</b> bots
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span style={{ fontSize: '12px', fontWeight: 700, padding: '0 8px', color: '#0f172a' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CARRIER TEMPLATES EXPLORER                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'TEMPLATE_EXPLORER' && (
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #cbd5e1', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Carrier Templates by Bot</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Filter approved templates tied to specific bots for multi-client deployment.</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Bot Selector */}
              <select
                value={selectedBotIdForTemplates}
                onChange={(e) => setSelectedBotIdForTemplates(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {bots.map(b => (
                  <option key={b.botId} value={b.botId}>{b.botName} ({b.botId})</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={templateTypeFilter}
                onChange={(e) => setTemplateTypeFilter(e.target.value)}
                style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="All">All Formats</option>
                <option value="PlainText">PlainText</option>
                <option value="RichCard">RichCard</option>
                <option value="Carousel">Carousel</option>
              </select>
            </div>
          </div>

          {/* Templates Grid Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Template Name</th>
                  <th style={{ padding: '8px 12px' }}>Format</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Message Preview</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      No templates found for this bot.
                    </td>
                  </tr>
                ) : (
                  templates.map(t => (
                    <tr key={t.templateId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {t.templateName}
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{t.templateId}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                          {t.templateType}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ color: t.templateStatus === 'Active' ? '#059669' : '#dc2626', fontWeight: 700 }}>
                          ● {t.templateStatus || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#475569', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.cardDescription || t.smsText || 'Template message content'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(t.templateId, `tid-${t.templateId}`)}
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          {copiedText === `tid-${t.templateId}` ? 'Copied' : 'Copy ID'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: VIEW FULL BOT DETAILS                                           */}
      {/* ========================================================================= */}
      {viewingBot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '640px', maxHeight: '90vh', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: viewingBot.color || '#0a66c2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{viewingBot.botName}</div>
                  <code style={{ fontSize: '11px', color: '#0a66c2' }}>{viewingBot.botId}</code>
                </div>
              </div>
              <button type="button" onClick={() => setViewingBot(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px' }}>
              
              {/* Profile Card Banner */}
              <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Google RBM Verified Profile</span>
                  {getStatusBadge(viewingBot.status)}
                </div>
                <p style={{ color: '#475569', margin: '0 0 10px 0' }}>{viewingBot.description || 'Verified carrier bot for rich interactive alerts & offers.'}</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {getTrafficTypeBadge(viewingBot.messageType)}
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Accent Color: <b style={{ color: viewingBot.color }}>{viewingBot.color}</b></span>
                </div>
              </div>

              {/* Unique Bot ID & Compliance Details */}
              <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Unique Carrier Bot ID
                  </div>
                  <code style={{ fontSize: '14px', fontWeight: 800, color: '#0a66c2', fontFamily: 'monospace' }}>
                    {viewingBot.botId}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewingBot.botId);
                    setBotActionMsg(`✓ Copied Bot ID: ${viewingBot.botId}`);
                    setTimeout(() => setBotActionMsg(''), 3000);
                  }}
                  style={{
                    background: '#0a66c2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <Copy size={13} />
                  <span>Copy Bot ID</span>
                </button>
              </div>

              {/* Compliance & Contact Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>Brand Legal Name</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewingBot.brandName || 'Not specified'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>Contact Phone</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewingBot.contactPhone || 'N/A'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>Official Domain Email</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewingBot.contactEmail || 'N/A'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: 2 }}>KYC Representative</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {viewingBot.contactPerson || 'Authorized Representative'}
                    {viewingBot.contactDesignation && <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}> ({viewingBot.contactDesignation})</span>}
                  </div>
                </div>
              </div>

              {/* Legal & Compliance Links */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Compliance & Legal URLs (Google Verified Domain)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: '11.5px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px' }}>Website: </span>
                    {viewingBot.websiteUrl ? (
                      <a href={viewingBot.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'underline' }}>Visit Link ↗</a>
                    ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px' }}>Terms: </span>
                    {viewingBot.termsUrl ? (
                      <a href={viewingBot.termsUrl} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service ↗</a>
                    ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px' }}>Privacy: </span>
                    {viewingBot.privacyUrl ? (
                      <a href={viewingBot.privacyUrl} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy ↗</a>
                    ) : <span style={{ color: '#94a3b8' }}>N/A</span>}
                  </div>
                </div>
              </div>

              {/* Government Documents & TRAI DLT */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Government Verification & Telecom TRAI Compliance</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8, fontSize: '11.5px', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>TRAI DLT Principal Entity ID:</span>
                    <code style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, background: '#f1f5f9', padding: '2px 5px', borderRadius: '3px' }}>
                      {viewingBot.dltEntityId || 'N/A'}
                    </code>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>GST Certificate:</span>
                    {viewingBot.gstUrl ? (
                      <a href={viewingBot.gstUrl} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>📄 View GST (PDF) ↗</a>
                    ) : <span style={{ color: '#94a3b8' }}>Not uploaded</span>}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>PAN Card:</span>
                    {viewingBot.panUrl ? (
                      <a href={viewingBot.panUrl} target="_blank" rel="noreferrer" style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}>📄 View PAN (PDF) ↗</a>
                    ) : <span style={{ color: '#94a3b8' }}>Not uploaded</span>}
                  </div>
                </div>
              </div>

              {/* Webhook & URLs */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Inbound RCS Webhook URL</div>
                <code style={{ fontSize: '11.5px', color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                  {viewingBot.webhookUrl || 'https://yourdomain.com/rcs-webhook'}
                </code>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewingBot(null)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EDIT BOT                                                        */}
      {/* ========================================================================= */}
      {editingBot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '560px', maxHeight: '90vh', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Edit Bot: {editingBot.botName}</div>
              <button type="button" onClick={() => setEditingBot(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Unique Bot ID (Read-only reference) */}
              <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Unique Bot ID (Permanent Identifier)</div>
                  <code style={{ fontSize: '13px', fontWeight: 800, color: '#0a66c2', fontFamily: 'monospace' }}>
                    {editingBot.botId}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(editingBot.botId);
                    setBotActionMsg(`✓ Copied Bot ID: ${editingBot.botId}`);
                    setTimeout(() => setBotActionMsg(''), 3000);
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Copy ID
                </button>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Bot Display Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.botName}
                  onChange={(e) => setEditForm({ ...editForm, botName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Brand Entity Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.brandName}
                    onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>TRAI DLT Entity ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.dltEntityId || ''}
                    onChange={(e) => setEditForm({ ...editForm, dltEntityId: e.target.value })}
                    placeholder="e.g. 1201161304403738311"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Webhook URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={editForm.webhookUrl}
                  onChange={(e) => setEditForm({ ...editForm, webhookUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 4 }}>Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.contactEmail}
                    onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ padding: '12px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingBot(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: STATUS MANAGER (APPROVE / HOLD / REJECT)                         */}
      {/* ========================================================================= */}
      {statusBot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Admin Status Control: {statusBot.botName}</div>
              <button type="button" onClick={() => setStatusBot(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12.5px' }}>
              <p style={{ color: '#475569', margin: 0 }}>
                Change operational status for <b>{statusBot.botName}</b> (<code>{statusBot.botId}</code>).
              </p>

              {/* Status Radio Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                
                {/* 1. Verified / Active */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: '8px', border: newStatusChoice === 'Verified' ? '2px solid #10b981' : '1px solid #e2e8f0', background: newStatusChoice === 'Verified' ? '#ecfdf5' : '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="botStatus"
                    value="Verified"
                    checked={newStatusChoice === 'Verified'}
                    onChange={() => setNewStatusChoice('Verified')}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#065f46' }}>✓ Verified / Active</div>
                    <div style={{ fontSize: '11px', color: '#047857' }}>Bot is fully operational. Campaigns and templates can be dispatched.</div>
                  </div>
                </label>

                {/* 2. On Hold / Blocked */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: '8px', border: newStatusChoice === 'On Hold' ? '2px solid #f59e0b' : '1px solid #e2e8f0', background: newStatusChoice === 'On Hold' ? '#fffbeb' : '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="botStatus"
                    value="On Hold"
                    checked={newStatusChoice === 'On Hold'}
                    onChange={() => setNewStatusChoice('On Hold')}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#b45309' }}>⏸️ On Hold / Blocked (Admin Kill-Switch)</div>
                    <div style={{ fontSize: '11px', color: '#92400e' }}>Freezes this bot immediately. All new campaigns will be blocked.</div>
                  </div>
                </label>

                {/* 3. Rejected */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: '8px', border: newStatusChoice === 'Rejected' ? '2px solid #ef4444' : '1px solid #e2e8f0', background: newStatusChoice === 'Rejected' ? '#fef2f2' : '#ffffff', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="botStatus"
                    value="Rejected"
                    checked={newStatusChoice === 'Rejected'}
                    onChange={() => setNewStatusChoice('Rejected')}
                    style={{ marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#991b1b' }}>❌ Rejected</div>
                    <div style={{ fontSize: '11px', color: '#7f1d1d' }}>Rejects the bot application due to policy violation or incomplete KYC.</div>
                  </div>
                </label>

              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Action Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Account balance overdue, KYC verification failed"
                  className="form-input"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  style={{ fontSize: '12px' }}
                />
              </div>

            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setStatusBot(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveStatus}>
                Update Status
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: DELETE CONFIRMATION                                             */}
      {/* ========================================================================= */}
      {deletingBot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '420px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', padding: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Delete Bot?</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>This action cannot be undone.</div>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Are you sure you want to delete <b>{deletingBot.botName}</b> (<code>{deletingBot.botId}</code>)? 
              Any campaign or template linked to this bot will need to be reassigned.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeletingBot(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-sm" style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700 }} onClick={handleConfirmDelete}>
                Yes, Delete Bot
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: REGISTER NEW RCS BOT (4-SECTION GOOGLE SPEC)                    */}
      {/* ========================================================================= */}
      {showAddBotModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '680px', maxHeight: '92vh', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bot size={20} color="#0a66c2" />
                  <span>Register Verified RCS Brand Bot</span>
                  <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#065f46', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>Google RBM & TRAI Compliant</span>
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>
                  Submits official verification request to Google RBM and Telecom Carriers via POST /CreateBot
                </p>
              </div>
              <button type="button" onClick={() => setShowAddBotModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Autofill & Compliance Guide Banner */}
            <div style={{ padding: '10px 22px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                <span style={{ fontWeight: 800, color: '#dc2626' }}>● Required:</span> Name, Type, Brand, Desc, Phone, Email, Logo, KYC Signatory
                <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                <span style={{ fontWeight: 800, color: '#64748b' }}>○ Optional:</span> DLT ID, GST, PAN, Website, Terms, Privacy
              </div>
              <button
                type="button"
                onClick={autofillApprovedPbgEntity}
                style={{
                  background: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(10, 102, 194, 0.3)'
                }}
              >
                ⚡ Autofill Approved PBG Entity Details
              </button>
            </div>

            <form onSubmit={handleCreateBot} style={{ padding: '16px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {botCreateError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  ⚠️ {botCreateError}
                </div>
              )}

              {/* Section 1: Bot Identity */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>1. Bot Identity & Traffic Routing</div>
                  <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>Required</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Bot Display Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PBG INFO"
                      value={newBotForm.name}
                      onChange={e => setNewBotForm({ ...newBotForm, name: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>
                      Unique Bot ID (Optional - Auto-generated if blank)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3c4fa9a066274cd2"
                      value={newBotForm.botId || ''}
                      onChange={e => setNewBotForm({ ...newBotForm, botId: e.target.value })}
                      style={{ fontSize: '12px', height: '32px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Brand Legal Entity Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. PBG INFO TECH PVT LTD"
                      value={newBotForm.brandname}
                      onChange={e => setNewBotForm({ ...newBotForm, brandname: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Message Type *</label>
                    <select
                      className="form-select"
                      value={newBotForm.messageType}
                      onChange={e => setNewBotForm({ ...newBotForm, messageType: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    >
                      <option value="Transactional">Transactional (24x7, OTP/Alerts, No DND)</option>
                      <option value="Promotional">Promotional (9am-9pm, Offers, TRAI DND scrub)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Brand Purpose Description *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Purpose (e.g. Account alerts & updates)"
                    value={newBotForm.desc}
                    onChange={e => setNewBotForm({ ...newBotForm, desc: e.target.value })}
                    required
                    style={{ fontSize: '12px', height: '32px' }}
                  />
                </div>
              </div>

              {/* Section 2: Visual Branding & Hero Banner */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>2. Visual Branding & Google Profile Assets</div>
                  <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>Logo Required</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Square Logo URL (512x512) *</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourdomain.com/logo.png"
                      value={newBotForm.logoImageUrl}
                      onChange={e => setNewBotForm({ ...newBotForm, logoImageUrl: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Theme Accent Color (Optional)</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="color"
                        value={newBotForm.colorCode}
                        onChange={e => setNewBotForm({ ...newBotForm, colorCode: e.target.value })}
                        style={{ width: 34, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        value={newBotForm.colorCode}
                        onChange={e => setNewBotForm({ ...newBotForm, colorCode: e.target.value })}
                        style={{ flex: 1, fontSize: '12px', height: '32px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>Landscape Hero Banner URL (Optional, 1024x512 / 1440x448)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://yourdomain.com/banner.jpg"
                    value={newBotForm.bannerImageUrl}
                    onChange={e => setNewBotForm({ ...newBotForm, bannerImageUrl: e.target.value })}
                    style={{ fontSize: '12px', height: '32px' }}
                  />
                </div>
              </div>

              {/* Section 3: Official Compliance & Legal Links */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>3. Compliance & Legal Links (Google Domain Verification)</div>
                  <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>Optional / Recommended</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>Brand Official Website</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourbrand.com"
                      value={newBotForm.website}
                      onChange={e => setNewBotForm({ ...newBotForm, website: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>Terms & Conditions URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourbrand.com/terms"
                      value={newBotForm.termsUrl}
                      onChange={e => setNewBotForm({ ...newBotForm, termsUrl: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>Privacy Policy URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourbrand.com/privacy"
                      value={newBotForm.privacyUrl}
                      onChange={e => setNewBotForm({ ...newBotForm, privacyUrl: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Authorized KYC Representative */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>4. Authorized KYC Signatory (Mandatory for Google Review)</div>
                  <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>Required</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Signatory Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Ramesh Kumar"
                      value={newBotForm.contactName}
                      onChange={e => setNewBotForm({ ...newBotForm, contactName: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Designation / Job Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Director / IT Head"
                      value={newBotForm.contactDesignation}
                      onChange={e => setNewBotForm({ ...newBotForm, contactDesignation: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Contact Mobile *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile"
                      value={newBotForm.contactMobile}
                      onChange={e => setNewBotForm({ ...newBotForm, contactMobile: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: 3 }}>Corporate Domain Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@yourbrand.com"
                      value={newBotForm.contactEmail}
                      onChange={e => setNewBotForm({ ...newBotForm, contactEmail: e.target.value })}
                      required
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Government Documents & TRAI DLT */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0a66c2' }}>5. Government Documents & Telecom TRAI Compliance</div>
                  <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: 700, padding: '1px 6px', borderRadius: '3px' }}>Optional</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>TRAI DLT Principal Entity ID (19 Digits)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1201161304403738311"
                      value={newBotForm.dltEntityId}
                      onChange={e => setNewBotForm({ ...newBotForm, dltEntityId: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>Sub-aggregator Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. RCS Flow"
                      value={newBotForm.subaggregator}
                      onChange={e => setNewBotForm({ ...newBotForm, subaggregator: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>GST Certificate PDF URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourdomain.com/docs/gst.pdf"
                      value={newBotForm.gstUrl}
                      onChange={e => setNewBotForm({ ...newBotForm, gstUrl: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 3 }}>PAN Certificate PDF URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://yourdomain.com/docs/pan.pdf"
                      value={newBotForm.panUrl}
                      onChange={e => setNewBotForm({ ...newBotForm, panUrl: e.target.value })}
                      style={{ fontSize: '12px', height: '32px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '10px 0 0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowAddBotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={botCreating}>
                  {botCreating ? 'Submitting to Carrier...' : 'Submit Bot for Google Verification'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
