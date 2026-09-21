import React, { useState, useMemo } from 'react';
import {
  Send,
  UploadCloud,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Clock,
  RefreshCw,
  Calendar,
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar, Pie } from 'react-chartjs-2';
import './RcsCampaignDashboard.css';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function RcsCampaignDashboardPage({ onNavigateToCampaigns, onNavigateToReports }) {
  // 1. Date Filters matching official screenshot (14-09-2026 to 21-09-2026)
  const [fromDate, setFromDate] = useState('2026-09-14');
  const [toDate, setToDate] = useState('2026-09-21');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. Interactive Status Filter Toggles (Green=Delivered, Red=Failed, Blue=Read, Yellow=Awaited)
  const [activeStatuses, setActiveStatuses] = useState({
    delivered: true,
    read: true,
    failed: true,
    awaited: true
  });

  const toggleStatus = (statusKey) => {
    setActiveStatuses((prev) => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // 3. Raw KPI Metrics Data (Synchronized with live campaigns: 26 total, 17 delivered, 8 read, 9 failed)
  const baseMetrics = {
    totalCampaigns: 26,
    totalSubmitted: 26,
    delivered: 17,
    read: 8,
    clicks: 0,
    failed: 9,
    awaited: 0
  };

  const [dynExtra, setDynExtra] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('rcs_dynamic_campaigns') || '[]');
      const extra = stored.filter(c => c.id !== 6457 && c.id !== 6422 && c.id !== 6416 && c.id !== 6324 && c.id !== 6320 && c.id !== 6318);
      let count = extra.length;
      let delivered = extra.reduce((sum, c) => sum + (c.total || 1), 0);
      return { count, delivered };
    } catch (_) {
      return { count: 0, delivered: 0 };
    }
  });

  React.useEffect(() => {
    const onCampCreated = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('rcs_dynamic_campaigns') || '[]');
        const extra = stored.filter(c => c.id !== 6457 && c.id !== 6422 && c.id !== 6416 && c.id !== 6324 && c.id !== 6320 && c.id !== 6318);
        let count = extra.length;
        let delivered = extra.reduce((sum, c) => sum + (c.total || 1), 0);
        setDynExtra({ count, delivered });
      } catch (_) {}
    };

    window.addEventListener('rcs_campaign_created', onCampCreated);
    return () => window.removeEventListener('rcs_campaign_created', onCampCreated);
  }, []);

  const metrics = useMemo(() => ({
    totalCampaigns: baseMetrics.totalCampaigns + dynExtra.count,
    totalSubmitted: baseMetrics.totalSubmitted + dynExtra.delivered,
    delivered: baseMetrics.delivered + dynExtra.delivered,
    read: baseMetrics.read + dynExtra.delivered,
    clicks: baseMetrics.clicks,
    failed: baseMetrics.failed,
    awaited: baseMetrics.awaited
  }), [dynExtra]);

  // 4. Delivery Status Overview (Donut Chart)
  const donutData = useMemo(() => {
    const labels = [];
    const data = [];
    const bgColors = [];
    const borderColors = [];

    if (activeStatuses.delivered) {
      labels.push('Delivered');
      data.push(metrics.delivered);
      bgColors.push('#10b981'); // Green
      borderColors.push('#059669');
    }
    if (activeStatuses.read) {
      labels.push('Read');
      data.push(metrics.read);
      bgColors.push('#0ea5e9'); // Blue
      borderColors.push('#0284c7');
    }
    if (activeStatuses.failed) {
      labels.push('Failed');
      data.push(metrics.failed);
      bgColors.push('#ef4444'); // Red
      borderColors.push('#dc2626');
    }
    if (activeStatuses.awaited) {
      labels.push('Awaited');
      data.push(metrics.awaited);
      bgColors.push('#f59e0b'); // Yellow
      borderColors.push('#d97706');
    }

    // Fallback if all toggled off
    if (data.length === 0) {
      return {
        labels: ['No Selection'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e2e8f0'],
            borderWidth: 0
          }
        ]
      };
    }

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 8
        }
      ]
    };
  }, [activeStatuses, metrics]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: false // Using custom interactive legend pills
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return ` ${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // 5. Engagement Metrics (Bar Chart)
  const barData = {
    labels: ['Clicks', 'Replies', 'Total Events'],
    datasets: [
      {
        label: 'Count',
        data: [0, 0, 0],
        backgroundColor: '#0284c7',
        borderRadius: 4,
        barThickness: 28
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' }
      },
      y: {
        min: 0,
        max: 1.0,
        ticks: {
          stepSize: 0.1,
          font: { size: 11 },
          color: '#64748b'
        },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  // 6. Campaign Performance Trend (Stacked Spline Area Chart) Day/Date-Wise
  const trendLabels = [
    '2026-09-14',
    '2026-09-15',
    '2026-09-16',
    '2026-09-17',
    '2026-09-18',
    '2026-09-19',
    '2026-09-20',
    '2026-09-21'
  ];

  const trendData = useMemo(() => {
    const datasets = [];

    // Delivered dataset (Green: 3 on Sept 14, 3 on Sept 15, 4 on Sept 16, 7 on Sept 18 = 17)
    if (activeStatuses.delivered) {
      datasets.push({
        label: 'Delivered',
        data: [3.0, 3.0, 4.0, 0, 7.0 + (dynExtra?.delivered || 0), 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        fill: true,
        tension: 0.4,
        pointRadius: [3, 3, 3, 0, 4, 0, 0, 0],
        pointBackgroundColor: '#10b981',
        order: 3
      });
    }

    // Read dataset (Blue: 1 on Sept 16, 7 on Sept 18 = 8)
    if (activeStatuses.read) {
      datasets.push({
        label: 'Read',
        data: [0, 0, 1.0, 0, 7.0, 0, 0, 0],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.85)',
        fill: true,
        tension: 0.4,
        pointRadius: [0, 0, 3, 0, 4, 0, 0, 0],
        pointBackgroundColor: '#0ea5e9',
        order: 2
      });
    }

    // Failed dataset (Red: 9 on Sept 15 = 9)
    if (activeStatuses.failed) {
      datasets.push({
        label: 'Failed',
        data: [0, 9.0, 0, 0, 0, 0, 0, 0],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        fill: true,
        tension: 0.4,
        pointRadius: [0, 5, 0, 0, 0, 0, 0, 0],
        pointBackgroundColor: '#ef4444',
        order: 1
      });
    }

    // Awaited dataset (Yellow: 0)
    if (activeStatuses.awaited) {
      datasets.push({
        label: 'Awaited',
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.85)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointBackgroundColor: '#f59e0b',
        order: 4
      });
    }

    return {
      labels: trendLabels,
      datasets
    };
  }, [activeStatuses, dynExtra]);

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false // Custom top legend pills
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: function (context) {
            return `Date: ${context[0].label}`;
          },
          label: function (context) {
            return ` ${context.dataset.label}: ${context.raw} messages`;
          },
          afterBody: function (context) {
            let sum = 0;
            context.forEach((item) => {
              sum += Number(item.raw) || 0;
            });
            return `\nTotal Active Volume: ${sum.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#f8fafc' },
        ticks: { font: { size: 11 }, color: '#64748b' }
      },
      y: {
        beginAtZero: true,
        max: 9,
        ticks: {
          stepSize: 1,
          font: { size: 11 },
          color: '#64748b'
        },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  // 7. Template Distribution (Pie Chart)
  const templateData = {
    labels: ['Plain Text', 'RichCard', 'Carousel'],
    datasets: [
      {
        data: [metrics.totalCampaigns, 0, 0],
        backgroundColor: ['#2563eb', '#1e3a8a', '#f59e0b'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  const templateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const val = context.raw || 0;
            const pct = val === metrics.totalCampaigns ? '100%' : '0%';
            return ` ${label}: ${val} (${pct})`;
          }
        }
      }
    }
  };

  // 8. Recent Activity Feed
  const recentActivities = [
    { id: 1, name: 'PBG_Account_Status', time: '10 mins ago' },
    { id: 2, name: 'PBG_Account_Status', time: '12 mins ago' },
    { id: 3, name: 'PBG_Account_Status', time: '19 hours ago' },
    { id: 4, name: 'PBG_Account_Status', time: '19 hours ago' },
    { id: 5, name: 'Festive_Offer_Launch', time: '20 hours ago' }
  ];

  return (
    <div className="rcs-dashboard-container">
      {/* 1. Header Banner */}
      <div className="rcs-dash-banner">
        <div className="rcs-dash-banner-left">
          <div className="rcs-dash-banner-icon">
            <Activity size={26} />
          </div>
          <div className="rcs-dash-banner-text">
            <h1>RCS Campaign Dashboard</h1>
            <p>Real-time insights and analytics for your RCS campaigns</p>
          </div>
        </div>
      </div>

      {/* 2. Date Filter Bar */}
      <div className="rcs-date-filter-bar">
        <div className="rcs-filter-group">
          <label className="rcs-filter-label">
            <Calendar size={13} /> FROM DATE
          </label>
          <div className="rcs-date-input-wrap">
            <input
              type="date"
              className="rcs-date-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
        </div>

        <div className="rcs-filter-group">
          <label className="rcs-filter-label">
            <Calendar size={13} /> TO DATE
          </label>
          <div className="rcs-date-input-wrap">
            <input
              type="date"
              className="rcs-date-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <button
          className={`rcs-btn-refresh-dash ${isRefreshing ? 'loading' : ''}`}
          onClick={handleRefresh}
        >
          <RefreshCw size={14} />
          <span>REFRESH DASHBOARD</span>
        </button>
      </div>

      {/* 3. Metric KPI Cards (Top 4, Bottom 3) */}
      <div className="rcs-kpi-grid-top">
        {/* TOTAL CAMPAIGNS */}
        <div className="rcs-kpi-card accent-blue">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">TOTAL CAMPAIGNS</span>
            <span className="rcs-kpi-value">{metrics.totalCampaigns}</span>
            <span className="rcs-kpi-trend trend-green">
              <ArrowUpRight size={13} /> 0% vs last period
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-blue">
            <Send size={22} />
          </div>
        </div>

        {/* TOTAL SUBMITTED */}
        <div className="rcs-kpi-card accent-purple">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">TOTAL SUBMITTED</span>
            <span className="rcs-kpi-value">{metrics.totalSubmitted}</span>
            <span className="rcs-kpi-trend trend-gray">
              Messages queued for delivery
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-purple">
            <UploadCloud size={22} />
          </div>
        </div>

        {/* MESSAGES DELIVERED */}
        <div className="rcs-kpi-card accent-green">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">MESSAGES DELIVERED</span>
            <span className="rcs-kpi-value">{metrics.delivered}</span>
            <span className="rcs-kpi-trend trend-green">
              <ArrowUpRight size={13} /> {metrics.totalSubmitted > 0 ? ((metrics.delivered / metrics.totalSubmitted) * 100).toFixed(1) : '0'}% delivery rate
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-green">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* MESSAGES READ */}
        <div className="rcs-kpi-card accent-cyan">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">MESSAGES READ</span>
            <span className="rcs-kpi-value">{metrics.read}</span>
            <span className="rcs-kpi-trend trend-green">
              <ArrowUpRight size={13} /> {metrics.delivered > 0 ? ((metrics.read / metrics.delivered) * 100).toFixed(2) : '0'}% read rate
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-cyan">
            <Eye size={22} />
          </div>
        </div>
      </div>

      <div className="rcs-kpi-grid-bottom">
        {/* TOTAL CLICKS */}
        <div className="rcs-kpi-card accent-amber">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">TOTAL CLICKS</span>
            <span className="rcs-kpi-value">{metrics.clicks}</span>
            <span className="rcs-kpi-trend trend-green">
              <ArrowUpRight size={13} /> 0% click rate
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-amber">
            <MousePointerClick size={22} />
          </div>
        </div>

        {/* FAILED MESSAGES */}
        <div className="rcs-kpi-card accent-red">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">FAILED MESSAGES</span>
            <span className="rcs-kpi-value">{metrics.failed}</span>
            <span className="rcs-kpi-trend trend-red">
              <ArrowDownRight size={13} /> {metrics.totalSubmitted > 0 ? ((metrics.failed / metrics.totalSubmitted) * 100).toFixed(1) : '0'}% failure rate
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-red">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* AWAITED MESSAGES */}
        <div className="rcs-kpi-card accent-red">
          <div className="rcs-kpi-card-info">
            <span className="rcs-kpi-title">AWAITED MESSAGES</span>
            <span className="rcs-kpi-value">{metrics.awaited}</span>
            <span className="rcs-kpi-trend trend-red">
              <ArrowDownRight size={13} /> 0% messages awaiting delivery
            </span>
          </div>
          <div className="rcs-kpi-icon-badge badge-red">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* 4. Chart Row 1: Delivery Status Overview & Engagement Metrics */}
      <div className="rcs-chart-row-split">
        {/* Donut Chart: Delivery Status Overview */}
        <div className="rcs-chart-card">
          <div className="rcs-chart-header">
            <div className="rcs-chart-title">
              <PieIcon size={18} />
              <span>Delivery Status Overview</span>
            </div>
            <button className="rcs-btn-chart-refresh" onClick={handleRefresh}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div style={{ height: '220px', position: 'relative' }}>
            <Doughnut data={donutData} options={donutOptions} />
          </div>

          {/* Interactive Legend with click toggle & mouseover */}
          <div className="rcs-interactive-legend">
            <div
              className={`rcs-legend-pill pill-delivered ${!activeStatuses.delivered ? 'inactive' : ''}`}
              onClick={() => toggleStatus('delivered')}
              title="Click to toggle Delivered status"
            >
              <span className="rcs-legend-dot"></span>
              <span>Delivered ({metrics.delivered})</span>
            </div>

            <div
              className={`rcs-legend-pill pill-read ${!activeStatuses.read ? 'inactive' : ''}`}
              onClick={() => toggleStatus('read')}
              title="Click to toggle Read status"
            >
              <span className="rcs-legend-dot"></span>
              <span>Read ({metrics.read})</span>
            </div>

            <div
              className={`rcs-legend-pill pill-failed ${!activeStatuses.failed ? 'inactive' : ''}`}
              onClick={() => toggleStatus('failed')}
              title="Click to toggle Failed status"
            >
              <span className="rcs-legend-dot"></span>
              <span>Failed ({metrics.failed})</span>
            </div>

            <div
              className={`rcs-legend-pill pill-awaited ${!activeStatuses.awaited ? 'inactive' : ''}`}
              onClick={() => toggleStatus('awaited')}
              title="Click to toggle Awaited status"
            >
              <span className="rcs-legend-dot"></span>
              <span>Awaited ({metrics.awaited})</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Engagement Metrics */}
        <div className="rcs-chart-card">
          <div className="rcs-chart-header">
            <div className="rcs-chart-title">
              <BarChart2 size={18} />
              <span>Engagement Metrics</span>
            </div>
            <button className="rcs-btn-chart-refresh" onClick={handleRefresh}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div style={{ height: '260px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* 5. Chart Row 2: Campaign Performance Trend (Full Width Area Chart) */}
      <div className="rcs-chart-card rcs-chart-full">
        <div className="rcs-chart-header">
          <div className="rcs-chart-title">
            <TrendingUp size={18} />
            <span>Campaign Performance Trend</span>
          </div>
          <button className="rcs-btn-chart-refresh" onClick={handleRefresh}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Top Interactive Legend Filter */}
        <div className="rcs-interactive-legend" style={{ justifyContent: 'center', marginBottom: '14px' }}>
          <div
            className={`rcs-legend-pill pill-delivered ${!activeStatuses.delivered ? 'inactive' : ''}`}
            onClick={() => toggleStatus('delivered')}
            title="Click to filter Delivered on graph"
          >
            <span className="rcs-legend-dot"></span>
            <span>Delivered</span>
          </div>

          <div
            className={`rcs-legend-pill pill-read ${!activeStatuses.read ? 'inactive' : ''}`}
            onClick={() => toggleStatus('read')}
            title="Click to filter Read on graph"
          >
            <span className="rcs-legend-dot"></span>
            <span>Read</span>
          </div>

          <div
            className={`rcs-legend-pill pill-failed ${!activeStatuses.failed ? 'inactive' : ''}`}
            onClick={() => toggleStatus('failed')}
            title="Click to filter Failed on graph"
          >
            <span className="rcs-legend-dot"></span>
            <span>Failed</span>
          </div>

          <div
            className={`rcs-legend-pill pill-awaited ${!activeStatuses.awaited ? 'inactive' : ''}`}
            onClick={() => toggleStatus('awaited')}
            title="Click to filter Awaited on graph"
          >
            <span className="rcs-legend-dot"></span>
            <span>Awaited</span>
          </div>
        </div>

        <div style={{ height: '300px', position: 'relative' }}>
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      {/* 6. Chart Row 3: Template Distribution & Recent Activity */}
      <div className="rcs-chart-row-split">
        {/* Template Distribution (Pie Chart) */}
        <div className="rcs-chart-card">
          <div className="rcs-chart-header">
            <div className="rcs-chart-title">
              <Layers size={18} />
              <span>Template Distribution</span>
            </div>
            <button className="rcs-btn-chart-refresh" onClick={handleRefresh}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div style={{ height: '220px' }}>
            <Pie data={templateData} options={templateOptions} />
          </div>

          <div className="rcs-interactive-legend">
            <div className="rcs-legend-pill" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <span className="rcs-legend-dot" style={{ background: '#2563eb' }}></span>
              <span>Plain Text (100%)</span>
            </div>
            <div className="rcs-legend-pill" style={{ background: '#f8fafc', color: '#64748b' }}>
              <span className="rcs-legend-dot" style={{ background: '#1e3a8a' }}></span>
              <span>RichCard (0%)</span>
            </div>
            <div className="rcs-legend-pill" style={{ background: '#fffbeb', color: '#b45309' }}>
              <span className="rcs-legend-dot" style={{ background: '#f59e0b' }}></span>
              <span>Carousel (0%)</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rcs-chart-card">
          <div className="rcs-chart-header">
            <div className="rcs-chart-title">
              <Clock size={18} />
              <span>Recent Activity</span>
            </div>
          </div>

          <div className="rcs-activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="rcs-activity-item">
                <div className="rcs-activity-icon">
                  <CheckCircle2 size={16} />
                </div>
                <div className="rcs-activity-content">
                  <div className="rcs-activity-title">
                    Campaign <strong>"{act.name}"</strong> launched
                  </div>
                  <div className="rcs-activity-time">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
