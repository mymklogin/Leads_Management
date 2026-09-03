import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PhoneCall, 
  Flame, 
  Clock, 
  Download, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  PhoneForwarded,
  Filter,
  Calendar
} from 'lucide-react';

export const VoiceObdPage = () => {
  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchSingleCallReports();
  }, [page, templateFilter, statusFilter, fromDate, toDate]);

  const fetchSingleCallReports = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize: 25,
        search: search || undefined,
        templateId: templateFilter ? parseInt(templateFilter, 10) : undefined,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };

      const res = await api.get('/leads', { params });
      setLeads(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Failed to load single call reports', err);
    } finally {
      setLoading(false);
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
        search: search || undefined,
        templateId: templateFilter ? parseInt(templateFilter, 10) : undefined,
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
      link.setAttribute('download', `single_obd_reports${dateSuffix}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export Single OBD reports CSV.');
    }
  };

  const hotLeadsCount = leads.filter(l => (l.leadStatus || '').toLowerCase().includes('hot')).length;
  const connectedCount = leads.filter(l => l.callDuration > 0).length;
  const avgDuration = leads.length > 0 
    ? Math.round(leads.reduce((a, b) => a + (b.callDuration || 0), 0) / leads.length) 
    : 0;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Single OBD Call Reports & Logs</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Detailed transaction records, customer DTMF answers, and webhook disposition reports
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={fetchSingleCallReports}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="btn btn-primary" onClick={handleExportCsv} title="Download CSV filtered by date range">
            <Download size={14} />
            <span>{fromDate || toDate ? 'Export Date-Wise CSV' : 'Export Single Calls CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="kpi-value">{totalCount}</div>
            <div className="kpi-label">Total Outbound Calls</div>
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
          <div className="kpi-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>{hotLeadsCount}</div>
            <div className="kpi-label">Super Hot Leads Captured</div>
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

      {/* Search & Date Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchSingleCallReports(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '34px' }}
                placeholder="Search by mobile or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: 11, top: 12, color: '#94a3b8' }} />
            </div>

            <select 
              className="form-select"
              value={templateFilter}
              onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Templates</option>
              <option value="0">Template 0: Simple Campaign</option>
              <option value="1">Template 1: DTMF Campaign</option>
              <option value="2">Template 2: Call Patch</option>
              <option value="3">Template 3: Custom IVR</option>
              <option value="4">Template 4: Nextar Multi-Level</option>
              <option value="5">Template 5: OTP Verification</option>
              <option value="7">Template 7: TTS Simple IVR</option>
              <option value="8">Template 8: TTS DTMF</option>
              <option value="9">Template 9: TTS Call Patch</option>
            </select>

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

            <button type="submit" className="btn btn-primary">Filter</button>
          </div>

          {/* Date-Wise Selection Controls */}
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

      {/* Reports Data Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Single OBD Call Detailed Execution Records</div>
          <span className="badge badge-success">{totalCount} Calls Found</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Target Mobile</th>
                <th>Classification Lead Status</th>
                <th>Template</th>
                <th>Duration</th>
                <th>DTMF Response</th>
                <th>Last Webhook Event</th>
                <th>CLI</th>
                <th>Execution Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading single call reports...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No single call reports matching current date and filter criteria.
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
                      <span className="badge badge-cold">Template {lead.templateId}</span>
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

        {/* Pagination Bar */}
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
