import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Flame, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  MessageSquare,
  Globe,
  Bot,
  User,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const LeadsCrmPage = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected Lead for Transcript Modal
  const [selectedTranscriptLead, setSelectedTranscriptLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, serviceFilter, inquiryFilter, fromDate, toDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        serviceRequired: serviceFilter || undefined,
        inquiryType: inquiryFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };

      const res = await api.get('/leads', { params });
      setLeads(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch leads', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const setDatePreset = (preset) => {
    const now = new Date();
    if (preset === 'today') {
      const today = now.toISOString().slice(0, 10);
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(now.toISOString().slice(0, 10));
    } else if (preset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      setFromDate(firstDay);
      setToDate(now.toISOString().slice(0, 10));
    } else if (preset === 'all') {
      setFromDate('');
      setToDate('');
    }
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      const params = {
        search: search || undefined,
        status: statusFilter || undefined,
        serviceRequired: serviceFilter || undefined,
        inquiryType: inquiryFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };

      const res = await api.get('/leads/export', { 
        params,
        responseType: 'blob' 
      });

      const dateSuffix = fromDate && toDate ? `_${fromDate}_to_${toDate}` : `_${new Date().toISOString().slice(0,10)}`;
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_crm_report${dateSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.patch(`/leads/${leadId}/status`, { status: newStatus });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, leadStatus: newStatus } : l));
    } catch (err) {
      alert('Failed to update lead status.');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('super hot') || s.includes('hot')) {
      return (
        <span className="badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
          <Flame size={12} color="#dc2626" />
          {status || 'Hot Lead'}
        </span>
      );
    }
    if (s.includes('warm') || s.includes('interested')) {
      return (
        <span className="badge" style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
          {status}
        </span>
      );
    }
    if (s.includes('qualified') || s.includes('converted')) {
      return (
        <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
          <CheckCircle2 size={12} color="#16a34a" />
          {status}
        </span>
      );
    }
    if (s.includes('dnd') || s.includes('not interested')) {
      return (
        <span className="badge" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 600, padding: '3px 8px', borderRadius: 4 }}>
          {status}
        </span>
      );
    }
    return (
      <span className="badge" style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
        {status || 'New'}
      </span>
    );
  };

  return (
    <div>
      {/* 1. TOP SUITE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '14px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Users size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Leads Management CRM & AI Inquiries
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                {totalCount} TOTAL LEADS
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Real-time omnichannel lead capture from AI Chat Assistant, Voice OBD IVR, RCS campaigns, and Webhooks
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            className="btn"
            onClick={fetchLeads}
            disabled={loading}
            style={{ 
              background: 'rgba(255, 255, 255, 0.18)', 
              color: '#ffffff', 
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '6px',
              padding: '7px 14px',
              fontWeight: 700, 
              fontSize: '12px',
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            type="button"
            className="btn"
            onClick={handleExportCsv}
            title="Download CSV filtered by the selected criteria"
            style={{ 
              background: '#ffffff', 
              color: '#0284c7', 
              border: 'none',
              borderRadius: '6px',
              padding: '7px 16px',
              fontWeight: 700, 
              fontSize: '12px',
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <Download size={14} />
            <span>{fromDate || toDate ? 'Export Filtered CSV' : 'Export All to CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '36px', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Search by Keyword (Name, Phone, Email, Location, Service)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
            </div>

            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="">All Lead Statuses</option>
              <option value="Super Hot">Super Hot Leads</option>
              <option value="Hot">Hot Leads</option>
              <option value="Warm">Warm Leads</option>
              <option value="Qualified">Qualified</option>
              <option value="New">New / Inbound</option>
              <option value="Not Interested">Not Interested</option>
            </select>

            <select 
              className="form-select"
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
              style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="">All Services</option>
              <option value="RCS">RCS Business Messaging</option>
              <option value="SMS">DLT Bulk SMS</option>
              <option value="WhatsApp">WhatsApp Business API</option>
              <option value="Voice">Smart Voice OBD / IVR</option>
              <option value="SMPP">Direct Telco SMPP Gateway</option>
            </select>

            <select 
              className="form-select"
              value={inquiryFilter}
              onChange={(e) => { setInquiryFilter(e.target.value); setPage(1); }}
              style={{ height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="">All Inquiry Types</option>
              <option value="Sales">Sales Inquiries</option>
              <option value="Support">Support Inquiries</option>
            </select>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ height: '38px', padding: '0 18px', fontWeight: 700, borderRadius: '6px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
            >
              Search
            </button>
          </div>

          {/* Date-Wise Selection Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
            <span style={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={15} color="#0284c7" />
              <span>Date Range:</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>From:</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '5px 8px', fontSize: '12px', width: '135px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>To:</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '5px 8px', fontSize: '12px', width: '135px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '4px' }}
                onClick={() => setDatePreset('today')}
              >
                Today
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '4px' }}
                onClick={() => setDatePreset('week')}
              >
                Last 7 Days
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '4px' }}
                onClick={() => setDatePreset('month')}
              >
                This Month
              </button>
              {(fromDate || toDate) && (
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  style={{ fontSize: '11px', padding: '4px 10px', color: '#dc2626', borderColor: '#fca5a5', borderRadius: '4px' }}
                  onClick={() => setDatePreset('all')}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 3. LEADS DATA TABLE */}
      <div className="card" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px' }}>Customer / Lead</th>
                <th>Contact Details</th>
                <th>Service Required</th>
                <th>Detected Location</th>
                <th>Source</th>
                <th>Status & Actions</th>
                <th>Date Captured</th>
                <th style={{ textAlign: 'center' }}>AI Transcript</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={18} className="spin" color="#0284c7" />
                      <span style={{ fontWeight: 600, color: '#475569' }}>Loading lead records...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '45px', color: '#64748b' }}>
                    <Users size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600 }}>No leads found matching your criteria.</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 4 }}>Try clearing the date filter or searching for a different keyword.</div>
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {/* Customer */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                          flexShrink: 0
                        }}>
                          {(lead.customerName || 'V').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            {lead.customerName || 'Online Visitor'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Ref #{lead.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>
                          <Phone size={13} color="#0284c7" />
                          <span>{lead.mobile || '-'}</span>
                          {lead.mobile && (
                            <div style={{ display: 'flex', gap: 4, marginLeft: 4 }}>
                              <a
                                href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                style={{ color: '#16a34a', display: 'flex', alignItems: 'center' }}
                              >
                                <Send size={12} />
                              </a>
                              <a
                                href={`tel:${lead.mobile}`}
                                title="Call Lead"
                                style={{ color: '#0284c7', display: 'flex', alignItems: 'center' }}
                              >
                                <Phone size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#64748b' }}>
                            <Mail size={12} />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Service & Inquiry Type */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '12.5px', color: '#334155' }}>
                          {lead.serviceRequired || 'Telecom Suite'}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          width: 'fit-content',
                          background: lead.inquiryType === 'Support' ? '#fef2f2' : '#eff6ff',
                          color: lead.inquiryType === 'Support' ? '#dc2626' : '#0284c7',
                          border: `1px solid ${lead.inquiryType === 'Support' ? '#fecaca' : '#bfdbfe'}`
                        }}>
                          {lead.inquiryType || 'Sales'} Inquiry
                        </span>
                      </div>
                    </td>

                    {/* Detected Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <MapPin size={13} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            {lead.city || 'Delhi NCR'}{lead.state ? `, ${lead.state}` : ''}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                            {lead.country || 'IN'} {lead.ipAddress ? `• ${lead.ipAddress}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: '1px solid #e2e8f0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {lead.leadSource?.includes('AI') ? <Bot size={11} color="#0284c7" /> : <Globe size={11} />}
                        {lead.leadSource || 'AI Assistant'}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {getStatusBadge(lead.leadStatus)}
                        <select
                          value={lead.leadStatus || 'Hot Lead'}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            fontSize: '10.5px',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="New">Mark New</option>
                          <option value="Hot Lead">Mark Hot Lead</option>
                          <option value="Warm Lead">Mark Warm Lead</option>
                          <option value="Qualified">Mark Qualified</option>
                          <option value="Contacted">Mark Contacted</option>
                          <option value="Not Interested">Mark Not Interested</option>
                        </select>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        <span>
                          {new Date(lead.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>

                    {/* AI Transcript */}
                    <td style={{ textAlign: 'center' }}>
                      {lead.chatTranscript ? (
                        <button
                          type="button"
                          onClick={() => setSelectedTranscriptLead(lead)}
                          className="btn btn-outline btn-sm"
                          style={{
                            fontSize: '11px',
                            padding: '4px 10px',
                            color: '#0284c7',
                            borderColor: '#bae6fd',
                            background: '#f0f9ff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            borderRadius: 6
                          }}
                        >
                          <MessageSquare size={12} />
                          <span>View Chat</span>
                        </button>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '11px' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{leads.length}</b> of <b>{totalCount}</b> total lead records
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ padding: '5px 12px', fontSize: '12px', borderRadius: 4 }}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage(page + 1)}
              style={{ padding: '5px 12px', fontSize: '12px', borderRadius: 4 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. AI CHAT TRANSCRIPT MODAL */}
      {selectedTranscriptLead && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: 600,
            borderRadius: 16,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              padding: '14px 20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare size={20} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px' }}>
                    AI Conversation Transcript • {selectedTranscriptLead.customerName || 'Visitor'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                    Ref #{selectedTranscriptLead.id} • {selectedTranscriptLead.mobile} • {selectedTranscriptLead.serviceRequired}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTranscriptLead(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Transcript Body */}
            <div style={{
              padding: '18px 20px',
              overflowY: 'auto',
              flex: 1,
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {selectedTranscriptLead.chatTranscript ? (
                selectedTranscriptLead.chatTranscript.split('\n').map((line, idx) => {
                  const isUser = line.startsWith('[USER]');
                  const text = line.replace(/^\[(USER|AI)\]:\s*/i, '');
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        background: isUser ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#ffffff',
                        color: isUser ? '#ffffff' : '#1e293b',
                        padding: '10px 14px',
                        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: '1.45'
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: 2, opacity: 0.8 }}>
                        {isUser ? 'VISITOR' : 'AI ASSISTANT'}
                      </div>
                      <div>{text}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                  No transcript recorded for this lead.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedTranscriptLead(null)}
                style={{ borderRadius: 6, padding: '6px 16px', fontSize: '12px' }}
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
