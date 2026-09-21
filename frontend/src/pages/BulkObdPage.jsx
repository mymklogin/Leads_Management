import React, { useState } from 'react';
import { 
  Radio, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Flame,
  Layers,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  Calendar
} from 'lucide-react';

export const BulkObdPage = () => {
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Bulk Batches Report Data
  const [batches, setBatches] = useState([
    {
      id: 'BATCH-2026-901',
      name: 'Diwali_Exclusive_Offer',
      templateId: 1,
      templateName: 'T1: DTMF Key Press Campaign',
      totalMobiles: 2500,
      connected: 1980,
      hotLeads: 412,
      warmLeads: 620,
      failed: 520,
      avgDuration: 42,
      status: 'Completed',
      dispatchedAt: '2026-09-01 14:30'
    },
    {
      id: 'BATCH-2026-899',
      name: 'Agent_Patch_Outbound',
      templateId: 2,
      templateName: 'T2: Live Agent Call Patch',
      totalMobiles: 1200,
      connected: 940,
      hotLeads: 285,
      warmLeads: 310,
      failed: 260,
      avgDuration: 68,
      status: 'Completed',
      dispatchedAt: '2026-08-31 11:15'
    },
    {
      id: 'BATCH-2026-892',
      name: 'TTS_Dynamic_Reminder',
      templateId: 7,
      templateName: 'T7: TTS Dynamic Voice IVR',
      totalMobiles: 3800,
      connected: 3120,
      hotLeads: 540,
      warmLeads: 890,
      failed: 680,
      avgDuration: 35,
      status: 'Completed',
      dispatchedAt: '2026-08-30 09:45'
    },
    {
      id: 'BATCH-2026-885',
      name: 'Nextar_Tier_Product_Survey',
      templateId: 4,
      templateName: 'T4: Nextar Multi-Level IVR',
      totalMobiles: 4500,
      connected: 3600,
      hotLeads: 620,
      warmLeads: 980,
      failed: 900,
      avgDuration: 52,
      status: 'Completed',
      dispatchedAt: '2026-08-28 16:20'
    },
    {
      id: 'BATCH-2026-879',
      name: 'Promotional_Audio_Broadcast',
      templateId: 0,
      templateName: 'T0: Simple Audio Broadcast',
      totalMobiles: 6000,
      connected: 4920,
      hotLeads: 840,
      warmLeads: 1250,
      failed: 1080,
      avgDuration: 28,
      status: 'Completed',
      dispatchedAt: '2026-08-25 10:00'
    }
  ]);

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
  };

  const downloadBatchReport = (batch) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "BatchId,CampaignName,TemplateId,TotalMobiles,Connected,HotLeads,WarmLeads,Failed,AvgDurationSeconds,Status,Date\n"
      + `${batch.id},${batch.name},${batch.templateId},${batch.totalMobiles},${batch.connected},${batch.hotLeads},${batch.warmLeads},${batch.failed},${batch.avgDuration},${batch.status},"${batch.dispatchedAt}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${batch.id}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadFilteredBatchesCsv = () => {
    let csv = "BatchId,CampaignName,TemplateId,TotalMobiles,Connected,HotLeads,WarmLeads,Failed,AvgDurationSeconds,Status,Date\n";
    filteredBatches.forEach(b => {
      csv += `${b.id},${b.name},${b.templateId},${b.totalMobiles},${b.connected},${b.hotLeads},${b.warmLeads},${b.failed},${b.avgDuration},${b.status},"${b.dispatchedAt}"\n`;
    });
    const dateSuffix = fromDate && toDate ? `_${fromDate}_to_${toDate}` : `_${new Date().toISOString().slice(0,10)}`;
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bulk_obd_batches_report${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchesTemplate = templateFilter === '' || b.templateId === parseInt(templateFilter, 10);
    const matchesStatus = statusFilter === '' || b.status === statusFilter;
    
    let matchesDate = true;
    if (fromDate) {
      matchesDate = matchesDate && b.dispatchedAt.slice(0, 10) >= fromDate;
    }
    if (toDate) {
      matchesDate = matchesDate && b.dispatchedAt.slice(0, 10) <= toDate;
    }

    return matchesSearch && matchesTemplate && matchesStatus && matchesDate;
  });

  const totalNumbers = filteredBatches.reduce((a, b) => a + b.totalMobiles, 0);
  const totalConnected = filteredBatches.reduce((a, b) => a + b.connected, 0);
  const totalHotLeads = filteredBatches.reduce((a, b) => a + b.hotLeads, 0);
  const avgConnRate = totalNumbers > 0 ? Math.round((totalConnected / totalNumbers) * 100) : 0;

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
            <Layers size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Bulk OBD Call Reports & Batch Analytics
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                BATCH TELEPHONY
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Consolidated batch execution metrics, duration analysis, and date-wise CSV export records
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button"
            className="btn" 
            onClick={downloadFilteredBatchesCsv} 
            title="Download CSV for current date selection"
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
            <span>{fromDate || toDate ? 'Export Date-Wise Batches (CSV)' : 'Export All Batches (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '20px' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="kpi-value">{filteredBatches.length}</div>
            <div className="kpi-label">Batches in Selection</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="kpi-value">{totalNumbers.toLocaleString()}</div>
            <div className="kpi-label">Total Contacts Dialed</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={22} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>
              {totalHotLeads.toLocaleString()}
            </div>
            <div className="kpi-label">Super Hot Leads Converted</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value">{avgConnRate}%</div>
            <div className="kpi-label">Average Connection Rate</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Date Range Controls */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '34px' }}
              placeholder="Search batch name or Batch ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: 11, top: 12, color: '#94a3b8' }} />
          </div>

          <select 
            className="form-select"
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
          >
            <option value="">All Templates</option>
            <option value="0">T0: Simple Audio Broadcast</option>
            <option value="1">T1: DTMF Key Press Campaign</option>
            <option value="2">T2: Live Agent Call Patch</option>
            <option value="4">T4: Nextar Multi-Level IVR</option>
            <option value="7">T7: TTS Dynamic Voice IVR</option>
          </select>

          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Date-Wise Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '13px' }}>
          <span style={{ fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} color="#4f46e5" />
            <span>Date Range:</span>
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
      </div>

      {/* Batch Reports Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Bulk Campaign Reports Execution Log</div>
          <span className="badge badge-success">{filteredBatches.length} Batches Found</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Campaign Name</th>
                <th>Template</th>
                <th>Total Mobiles</th>
                <th>Connected Rate</th>
                <th>Hot Leads Yield</th>
                <th>Avg Talk Time</th>
                <th>Status</th>
                <th>Execution Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No bulk campaign reports matching current date and criteria found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: '#4f46e5' }}>{b.id}</td>
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td>
                      <span className="badge badge-cold">{b.templateName}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.totalMobiles.toLocaleString()}</td>
                    <td>
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {b.connected.toLocaleString()} ({Math.round((b.connected / b.totalMobiles) * 100)}%)
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-hot">🔥 {b.hotLeads} Hot Leads</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{b.avgDuration}s</span>
                    </td>
                    <td>
                      <span className={`badge ${b.status === 'Completed' ? 'badge-success' : 'badge-warm'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{b.dispatchedAt}</td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => downloadBatchReport(b)}
                        title="Download CSV report for this batch"
                      >
                        <Download size={12} />
                        <span>CSV Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
