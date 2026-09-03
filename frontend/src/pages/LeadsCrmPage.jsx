import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Flame, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock,
  RefreshCw
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
  const [templateFilter, setTemplateFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter, templateFilter, fromDate, toDate]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        templateId: templateFilter ? parseInt(templateFilter, 10) : undefined,
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
        templateId: templateFilter ? parseInt(templateFilter, 10) : undefined,
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

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('super hot') || s.includes('hot')) {
      return <span className="badge badge-hot"><Flame size={11} style={{ display: 'inline', marginRight: 3 }} />{status}</span>;
    }
    if (s.includes('warm') || s.includes('interested')) {
      return <span className="badge badge-warm">{status}</span>;
    }
    if (s.includes('dnd')) {
      return <span className="badge badge-dnd">{status}</span>;
    }
    return <span className="badge badge-cold">{status || 'New'}</span>;
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Confirmed Leads & CRM Opportunities</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Real-time lead classification from ExpressIVR webhooks (Showing: <b>{totalCount}</b> leads)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-outline"
            onClick={fetchLeads}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleExportCsv}
            title="Download CSV filtered by the selected dates"
          >
            <Download size={15} />
            <span>{fromDate || toDate ? 'Export Date-Wise CSV' : 'Export to CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Date-Wise Selection Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '36px' }}
                placeholder="Search by mobile number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            </div>

            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Lead Statuses</option>
              <option value="Super Hot">Super Hot Leads</option>
              <option value="Hot">Hot Leads</option>
              <option value="Warm">Warm Leads</option>
              <option value="Not Interested">Not Interested (Key 2)</option>
              <option value="DND">DND (Key 9)</option>
            </select>

            <select 
              className="form-select"
              value={templateFilter}
              onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Templates (0 to 9)</option>
              <option value="0">T0: Simple Campaign</option>
              <option value="1">T1: DTMF Campaign</option>
              <option value="2">T2: Call Patch</option>
              <option value="3">T3: Custom Dynamic IVR</option>
              <option value="4">T4: Nextar Multi-Level</option>
              <option value="5">T5: OTP Verification</option>
              <option value="7">T7: TTS Simple IVR</option>
              <option value="8">T8: TTS DTMF Campaign</option>
              <option value="9">T9: TTS Call Patch</option>
            </select>

            <button type="submit" className="btn btn-primary">Search</button>
          </div>

          {/* Date-Wise Filter Controls */}
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

            {/* Date Quick Presets */}
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
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mobile Number</th>
                <th>Customer Name</th>
                <th>Classification</th>
                <th>Template</th>
                <th>Call Duration</th>
                <th>Key Pressed</th>
                <th>CLI</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={16} className="spin" />
                      <span>Loading lead records...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No leads found matching current date and filter criteria.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                        <Phone size={13} color="#64748b" />
                        <span>{lead.mobile}</span>
                      </div>
                    </td>
                    <td>{lead.customerName || <span style={{ color: '#94a3b8' }}>-</span>}</td>
                    <td>{getStatusBadge(lead.leadStatus)}</td>
                    <td>
                      <span className="badge badge-cold">
                        {lead.templateId !== null ? `Template ${lead.templateId}` : 'Direct OBD'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <Clock size={13} color="#64748b" />
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

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Showing <b>{leads.length}</b> of <b>{totalCount}</b> total records
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
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page * pageSize >= totalCount}
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
