import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PhoneCall, 
  Flame, 
  Clock, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Code,
  Layers,
  PhoneForwarded,
  Filter,
  BarChart2,
  Calendar,
  FileText
} from 'lucide-react';

export const TemplateReportPage = ({ templateId, title, description, badgeColor = 'badge-warm' }) => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [templateDef, setTemplateDef] = useState(null);

  useEffect(() => {
    fetchTemplateLeads();
    fetchTemplateDefinition();
  }, [templateId, page, statusFilter, fromDate, toDate]);

  const fetchTemplateLeads = async () => {
    try {
      setLoading(true);
      const params = {
        templateId,
        page,
        pageSize: 25,
        search: search || undefined,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };
      const res = await api.get('/leads', { params });
      setLeads(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Failed to load template leads', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateDefinition = async () => {
    try {
      const res = await api.get(`/campaigns/templates/${templateId}`);
      setTemplateDef(res.data);
    } catch (err) {
      console.error('Failed to load template definition', err);
    }
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
        templateId,
        search: search || undefined,
        status: statusFilter || undefined,
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
      link.setAttribute('download', `template_${templateId}_leads_report${dateSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    }
  };

  // Metrics for this template
  const hotLeadsCount = leads.filter(l => (l.leadStatus || '').toLowerCase().includes('hot')).length;
  const connectedCount = leads.filter(l => l.callDuration > 0).length;
  const avgDuration = leads.length > 0 
    ? Math.round(leads.reduce((acc, l) => acc + (l.callDuration || 0), 0) / leads.length) 
    : 0;

  return (
    <div>
      {/* 1. TOP BLUE BANNER (MATCHING SUITE STANDARDS) */}
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
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
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
            <FileText size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                {title}
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                TEMPLATE {templateId}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              {description}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button"
            className="btn"
            onClick={() => setShowConfig(!showConfig)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.18)', 
              color: '#ffffff', 
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontWeight: 700, 
              fontSize: '12px',
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <Code size={14} />
            <span>{showConfig ? 'Hide Payload Rules' : 'View Payload Spec'}</span>
          </button>

          <button 
            type="button"
            className="btn" 
            onClick={handleExportCsv} 
            title="Download CSV filtered by date selection"
            style={{ 
              background: '#ffffff', 
              color: '#0284c7', 
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
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
            <span>{fromDate || toDate ? 'Export Date-Wise CSV' : 'Export Template CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards for This Template */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="kpi-value">{totalCount}</div>
            <div className="kpi-label">Total Outbound Records</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{hotLeadsCount}</div>
            <div className="kpi-label">Super Hot Leads Converted</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
            <PhoneForwarded size={22} />
          </div>
          <div>
            <div className="kpi-value">
              {totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 100}%
            </div>
            <div className="kpi-label">Connection Success Rate</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value">{avgDuration}s</div>
            <div className="kpi-label">Average Call Duration</div>
          </div>
        </div>
      </div>

      {/* Template Specification Box (Collapsible) */}
      {showConfig && templateDef && (
        <div className="card" style={{ background: '#0f172a', color: '#38bdf8', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#94a3b8', fontSize: '12px' }}>
            <span>ExpressIVR Pre-Configured SingleCall Specification & Webhook Schema</span>
            <span>Target Webhook: /api/v1/GetRoutingInfo</span>
          </div>
          <pre style={{ margin: 0, fontSize: '12px', overflowX: 'auto', lineHeight: 1.5 }}>
            {JSON.stringify(templateDef.defaultPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* Filter & Leads Table strictly for this template */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchTemplateLeads(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '34px' }}
                placeholder="Search mobile number or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: 11, top: 12, color: '#94a3b8' }} />
            </div>

            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Super Hot">Super Hot Leads</option>
              <option value="Hot">Hot Leads</option>
              <option value="Warm">Warm Leads</option>
              <option value="Not Interested">Not Interested (Key 2)</option>
              <option value="DND">DND (Key 9)</option>
            </select>

            <button type="submit" className="btn btn-primary">Filter</button>
          </div>

          {/* Date-Wise Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={14} color="#4f46e5" />
              <span>Date Filter:</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#64748b' }}>From:</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '5px 8px', fontSize: '12px', width: '135px' }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#64748b' }}>To:</span>
              <input 
                type="date" 
                className="form-input" 
                style={{ padding: '5px 8px', fontSize: '12px', width: '135px' }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setDatePreset('today')}
              >
                Today
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setDatePreset('week')}
              >
                Last 7 Days
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setDatePreset('month')}
              >
                This Month
              </button>
              {(fromDate || toDate) && (
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  style={{ fontSize: '11px', padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }}
                  onClick={() => setDatePreset('all')}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Template {templateId} Verified Leads & Response Details ({totalCount} Records)
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipient Mobile</th>
                <th>Classification Lead Status</th>
                <th>Call Duration</th>
                <th>DTMF Key Pressed</th>
                <th>Event Type</th>
                <th>CLI</th>
                <th>Call Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading template reports...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No call records matching current date and filter criteria.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.mobile}</div>
                      {lead.customerName && <div style={{ fontSize: '11px', color: '#64748b' }}>{lead.customerName}</div>}
                    </td>
                    <td>
                      <span className={`badge ${
                        (lead.leadStatus || '').toLowerCase().includes('hot') ? 'badge-hot' :
                        (lead.leadStatus || '').toLowerCase().includes('warm') ? 'badge-warm' :
                        (lead.leadStatus || '').toLowerCase().includes('dnd') ? 'badge-dnd' : 'badge-cold'
                      }`}>
                        {lead.leadStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <Clock size={12} color="#64748b" />
                        <span>{lead.callDuration}s</span>
                      </div>
                    </td>
                    <td>
                      {lead.pressedDtmf ? (
                        <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Key: {lead.pressedDtmf}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{lead.lastEventType || 'HANGUP'}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{lead.cli || '9999900119'}</td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(lead.createdAt).toLocaleString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{leads.length}</b> of <b>{totalCount}</b> records
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>
              Page {page} of {Math.max(1, Math.ceil(totalCount / 25))}
            </span>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page * 25 >= totalCount}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
