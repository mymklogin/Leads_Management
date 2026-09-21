import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PieChart, 
  Calendar, 
  Download, 
  RefreshCw, 
  X,
  Send,
  Bot,
  CheckCircle2,
  Radio
} from 'lucide-react';

export const RcsMisReportPage = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [misMatrix, setMisMatrix] = useState([]);
  const [hourlyTotals, setHourlyTotals] = useState(Array(24).fill(0));
  const [overallTotal, setOverallTotal] = useState(0);
  const [monthCampaigns, setMonthCampaigns] = useState([]);
  const [modalDetails, setModalDetails] = useState(null);

  useEffect(() => {
    fetchMisReport();

    const onCampCreated = () => {
      fetchMisReport();
    };

    window.addEventListener('rcs_campaign_created', onCampCreated);
    return () => window.removeEventListener('rcs_campaign_created', onCampCreated);
  }, [selectedMonth, selectedYear]);

  const fetchMisReport = async (isManualSync = false) => {
    try {
      setLoading(true);
      const res = await api.get('/RCSApi/GetMisReport', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (res.data?.response) {
        const data = res.data.response;
        setMisMatrix(data.matrix || []);
        setHourlyTotals(data.hourlyTotals || Array(24).fill(0));
        setOverallTotal(data.totalDispatches || 0);
        setMonthCampaigns(data.campaigns || []);

        if (isManualSync) {
          setSyncMsg('✓ Synced with RCS Enterprise Live Gateway & Database Ledger');
          setTimeout(() => setSyncMsg(''), 4000);
        }
      }
    } catch (err) {
      console.error('Failed to fetch MIS report from backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cell click to open drill-down details modal
  const handleCellClick = (day, hour, count) => {
    if (count <= 0) return;
    const monthIndex = String(months.indexOf(selectedMonth) + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const prefix = `${selectedYear}-${monthIndex}-${dayStr}`;

    // Filter campaigns matching this specific day & hour
    const matching = monthCampaigns.filter(c => {
      const created = c.createdAt || c.CreatedAt || '';
      if (!created || !created.startsWith(prefix)) return false;
      const timePart = created.includes('T') ? created.split('T')[1] : created.split(' ')[1];
      if (!timePart) return false;
      const h = parseInt(timePart.split(':')[0], 10);
      return h === hour;
    });

    setModalDetails({
      title: `RCS Campaign Details - ${selectedMonth} ${day}, ${selectedYear} - Hour ${String(hour).padStart(2, '0')}:00`,
      campaigns: matching
    });
  };

  // Handle Day Total click to see all campaigns for that day
  const handleDayTotalClick = (day, total) => {
    if (total <= 0) return;
    const monthIndex = String(months.indexOf(selectedMonth) + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const prefix = `${selectedYear}-${monthIndex}-${dayStr}`;

    const matching = monthCampaigns.filter(c => {
      const created = c.createdAt || c.CreatedAt || '';
      return created && created.startsWith(prefix);
    });

    setModalDetails({
      title: `RCS Campaign Details - ${selectedMonth} ${day}, ${selectedYear} - All ${total} Dispatches`,
      campaigns: matching
    });
  };

  const exportToCsv = () => {
    let csv = `RCS Campaign MIS Report - ${selectedMonth} ${selectedYear}\n`;
    csv += 'DAY,' + Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).join(',') + ',DAY TOTAL\n';

    misMatrix.forEach(row => {
      csv += `${row.day},${row.hours.join(',')},${row.dayTotal}\n`;
    });

    csv += `TOTAL,${hourlyTotals.join(',')},${overallTotal}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RCS_MIS_Report_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto' }}>
      
      {/* Top Filter & Gateway Sync Bar */}
      <div style={{
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Select Period:</span>
            <select 
              className="form-control" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ fontSize: '12.5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff' }}
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Year:</span>
            <input 
              type="number" 
              className="form-control" 
              value={selectedYear} 
              onChange={e => setSelectedYear(Number(e.target.value))}
              min={2020}
              max={2030}
              style={{ fontSize: '12.5px', padding: '5px 10px', width: '80px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff' }}
            />
          </div>

          <button 
            type="button" 
            onClick={() => fetchMisReport(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: '12px', 
              fontWeight: 700,
              padding: '6px 14px',
              background: '#ffffff',
              color: '#0a66c2',
              border: '1px solid #0a66c2',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(10, 102, 194, 0.15)'
            }}
            title="Sync live campaign dispatches directly from RCS Gateway & DB"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Sync Live Gateway</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {syncMsg && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} color="#059669" />
              {syncMsg}
            </span>
          )}

          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', background: '#ffffff', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            Total Month Dispatches: <span style={{ color: '#0a66c2' }}>{overallTotal}</span>
          </div>

          <button 
            type="button" 
            onClick={exportToCsv}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 5, 
              fontSize: '12px', 
              fontWeight: 700,
              padding: '6px 14px',
              background: '#0a66c2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)'
            }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main MIS Matrix Table (Pixel-perfect matching reference image) */}
      <div style={{ 
        background: '#ffffff', 
        border: 'none', 
        borderRadius: '0', 
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
            <thead>
              {/* Row 1: Section Categories */}
              <tr style={{ background: '#1c2d42', color: '#ffffff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px' }}>
                <th rowSpan={2} style={{ padding: '8px 10px', borderRight: '1px solid #2d3f56', width: '50px', verticalAlign: 'middle' }}>
                  DAY
                </th>
                <th colSpan={24} style={{ padding: '7px 8px', borderRight: '1px solid #2d3f56' }}>
                  HOURS
                </th>
                <th rowSpan={2} style={{ padding: '8px 12px', width: '85px', verticalAlign: 'middle', borderLeft: '1px solid #2d3f56' }}>
                  DAY TOTAL
                </th>
              </tr>
              {/* Row 2: Hour Digits 00 to 23 */}
              <tr style={{ background: '#1c2d42', color: '#ffffff', fontSize: '11px', fontWeight: 700 }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <th key={i} style={{ padding: '6px 2px', borderRight: '1px solid #2d3f56', minWidth: '32px' }}>
                    {String(i).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {misMatrix.map((row) => {
                const hasActivity = row.dayTotal > 0;
                return (
                  <tr 
                    key={row.day} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      background: '#ffffff',
                      transition: 'background 0.1s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* Day Column */}
                    <td style={{ padding: '6px 4px', fontWeight: 800, color: '#0f172a', borderRight: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      {row.day}
                    </td>

                    {/* Hour Columns (00 - 23) */}
                    {row.hours.map((val, hIndex) => {
                      const isClickable = val > 0;
                      return (
                        <td 
                          key={hIndex} 
                          onClick={() => handleCellClick(row.day, hIndex, val)}
                          title={isClickable ? `Click to view ${val} campaign(s) on Day ${row.day} at Hour ${String(hIndex).padStart(2, '0')}:00` : ''}
                          style={{ 
                            padding: '6px 2px', 
                            borderRight: '1px solid #e2e8f0',
                            color: val > 0 ? '#0f172a' : '#94a3b8',
                            fontWeight: val > 0 ? 800 : 400,
                            background: val > 0 ? '#e0f2fe' : 'transparent',
                            cursor: isClickable ? 'pointer' : 'default',
                            transition: 'all 0.1s ease',
                            userSelect: isClickable ? 'none' : 'auto'
                          }}
                          onMouseEnter={e => {
                            if (isClickable) {
                              e.currentTarget.style.background = '#bae6fd';
                            }
                          }}
                          onMouseLeave={e => {
                            if (isClickable) {
                              e.currentTarget.style.background = '#e0f2fe';
                            }
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}

                    {/* Day Total Column */}
                    <td 
                      onClick={() => handleDayTotalClick(row.day, row.dayTotal)}
                      title={hasActivity ? `Click to view all ${row.dayTotal} campaign(s) for Day ${row.day}` : ''}
                      style={{ 
                        padding: '6px 8px', 
                        fontWeight: 800, 
                        color: hasActivity ? '#0f172a' : '#94a3b8', 
                        background: '#ffffff',
                        borderLeft: '1px solid #e2e8f0',
                        cursor: hasActivity ? 'pointer' : 'default',
                        transition: 'all 0.1s ease'
                      }}
                      onMouseEnter={e => {
                        if (hasActivity) {
                          e.currentTarget.style.background = '#f1f5f9';
                        }
                      }}
                      onMouseLeave={e => {
                        if (hasActivity) {
                          e.currentTarget.style.background = '#ffffff';
                        }
                      }}
                    >
                      {row.dayTotal}
                    </td>
                  </tr>
                );
              })}

              {/* Bottom Grand Totals Row */}
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                <td style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', background: '#e2e8f0' }}>TOTAL</td>
                {hourlyTotals.map((hTotal, hIdx) => (
                  <td 
                    key={hIdx} 
                    style={{ 
                      padding: '8px 2px', 
                      borderRight: '1px solid #e2e8f0',
                      color: hTotal > 0 ? '#0a66c2' : '#64748b'
                    }}
                  >
                    {hTotal}
                  </td>
                ))}
                <td style={{ padding: '8px 10px', background: '#0a66c2', color: '#ffffff', fontSize: '12px' }}>
                  {overallTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Details Drill-Down Modal */}
      {modalDetails && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setModalDetails(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '920px',
              boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '15.5px',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                {modalDetails.title}
              </h3>
              <button 
                onClick={() => setModalDetails(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  lineHeight: 1
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body Table */}
            <div style={{ padding: '16px 20px', overflowX: 'auto', maxHeight: '70vh' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '12.5px'
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: '#f8fafc'
                  }}>
                    <th style={{ padding: '10px 12px' }}>CAMPAIGN ID</th>
                    <th style={{ padding: '10px 12px' }}>CAMPAIGN NAME</th>
                    <th style={{ padding: '10px 12px' }}>BOT NAME</th>
                    <th style={{ padding: '10px 12px' }}>TEMPLATE</th>
                    <th style={{ padding: '10px 12px' }}>TYPE</th>
                    <th style={{ padding: '10px 12px' }}>RECIPIENTS</th>
                    <th style={{ padding: '10px 12px' }}>POSTED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {modalDetails.campaigns.map((camp, idx) => (
                    <tr 
                      key={camp.campaignId || camp.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px', fontWeight: 600, color: '#334155' }}>
                        {camp.campaignId || camp.id}
                      </td>
                      <td style={{ padding: '12px', color: '#1e293b', fontWeight: 600 }}>
                        {camp.campaignName || camp.name}
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {camp.botName || camp.bot}
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {camp.templateName || camp.template}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: '#0ea5e9',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.4px',
                          display: 'inline-block'
                        }}>
                          {(camp.templateType || camp.type || 'PLAINTEXT').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#334155', fontWeight: 600 }}>
                        {camp.totalMobiles || camp.total || camp.recipients || 1}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>
                        {camp.createdAt || camp.postedAt || '2026-09-18'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
