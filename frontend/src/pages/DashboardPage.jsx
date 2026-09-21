import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  PhoneCall, 
  PhoneForwarded, 
  Flame, 
  Clock, 
  TrendingUp, 
  Calendar, 
  BarChart2, 
  PieChart as PieIcon, 
  Send,
  ArrowUpRight
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js elements
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

export const DashboardPage = ({ onNavigateToLeads }) => {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock Date-Wise Data (Last 10 Days)
  const dailyLabels = ['Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31', 'Sep 01', 'Sep 02'];
  const dailyCalls = [120, 185, 240, 310, 290, 450, 420, 510, 580, 640];
  const dailyHotLeads = [18, 32, 45, 68, 59, 95, 88, 115, 130, 155];

  // Mock Month-Wise Data (Jan to Sep)
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyCalls = [2400, 3100, 4200, 5600, 6800, 8400, 9200, 11500, 13800];
  const monthlyHotLeads = [420, 560, 780, 1100, 1350, 1720, 1950, 2450, 2980];

  // Primary Trend Chart Data
  const trendChartData = {
    labels: viewMode === 'daily' ? dailyLabels : monthlyLabels,
    datasets: [
      {
        label: 'Total Calls Dialed',
        data: viewMode === 'daily' ? dailyCalls : monthlyCalls,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4
      },
      {
        label: 'Confirmed Hot Leads',
        data: viewMode === 'daily' ? dailyHotLeads : monthlyHotLeads,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }
    ]
  };

  // Status Distribution Doughnut Data
  const statusDoughnutData = {
    labels: ['Super Hot Leads', 'Warm Leads', 'General Connected', 'Not Interested (Key 2)', 'DND (Key 9)'],
    datasets: [
      {
        data: [
          analytics?.hotLeadsCount || 155,
          analytics?.warmLeadsCount || 230,
          analytics?.connectedCalls || 450,
          analytics?.notInterestedCount || 85,
          analytics?.dndCount || 42
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#64748b', '#a855f7'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Template-wise performance breakdown
  const templateBarData = {
    labels: ['T-0 Simple', 'T-1 DTMF', 'T-2 Patch', 'T-3 Custom', 'T-4 Nextar', 'T-7 TTS', 'T-8 TTS-DTMF', 'T-9 TTS-Patch'],
    datasets: [
      {
        label: 'Calls Processed',
        data: [420, 310, 180, 95, 210, 140, 160, 115],
        backgroundColor: '#6366f1',
        borderRadius: 6
      },
      {
        label: 'Hot Leads',
        data: [95, 82, 58, 24, 62, 38, 46, 39],
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter', size: 12 },
          color: '#475569',
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' }
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#64748b' }
      }
    }
  };

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
            <TrendingUp size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Real-Time Performance Overview
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                LIVE ANALYTICS
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Consolidated metrics for OBD calls and multi-service dispatches
            </p>
          </div>
        </div>

        {/* Date Wise / Month Wise Toggle Switch */}
        <div className="view-mode-toggle" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)', padding: '3px', borderRadius: '8px' }}>
          <button 
            type="button"
            className={`view-mode-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
            style={viewMode === 'daily' ? { background: '#ffffff', color: '#0284c7', fontWeight: 700, borderRadius: '6px' } : { color: '#ffffff', background: 'transparent' }}
          >
            <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} />
            Date-Wise (Daily)
          </button>
          <button 
            type="button"
            className={`view-mode-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
            style={viewMode === 'monthly' ? { background: '#ffffff', color: '#0284c7', fontWeight: 700, borderRadius: '6px' } : { color: '#ffffff', background: 'transparent' }}
          >
            <BarChart2 size={14} style={{ display: 'inline', marginRight: 6 }} />
            Month-Wise (Monthly)
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <PhoneCall size={24} />
          </div>
          <div>
            <div className="kpi-value">{analytics?.totalLeads || (viewMode === 'daily' ? '640' : '13.8K')}</div>
            <div className="kpi-label">Total Outbound Calls</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#d1fae5', color: '#059669' }}>
            <PhoneForwarded size={24} />
          </div>
          <div>
            <div className="kpi-value">{analytics?.connectedCalls || (viewMode === 'daily' ? '512' : '11.2K')}</div>
            <div className="kpi-label">
              Connected Calls ({analytics?.totalLeads ? Math.round((analytics.connectedCalls / analytics.totalLeads) * 100) : '80'}%)
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={24} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: '#dc2626' }}>
              {analytics?.hotLeadsCount || (viewMode === 'daily' ? '155' : '2,980')}
            </div>
            <div className="kpi-label">Confirmed Super Hot Leads</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-value">{analytics?.averageCallDurationSeconds || analytics?.averageDuration || '28'}s</div>
            <div className="kpi-label">Average Call Duration</div>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="charts-grid">
        {/* Main Trend Chart (Daily vs Monthly) */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                {viewMode === 'daily' ? 'Daily Call & Lead Acquisition Trend' : 'Monthly Growth & Volume Trend'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Comparing Total Calls vs Super Hot Leads generated
              </div>
            </div>
            <span className="badge badge-success">Live Sync</span>
          </div>

          <div style={{ height: 290 }}>
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>

        {/* Lead Status Breakdown Doughnut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Lead Disposition Split</div>
          </div>
          <div style={{ height: 290, position: 'relative' }}>
            <Doughnut 
              data={statusDoughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, font: { size: 11 } }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Secondary Row: Template-wise Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">OBD Template Performance (Templates 0 to 9)</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Comparative lead yield across DTMF, Call Patch, Nextar IVR, and TTS campaigns
            </div>
          </div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={onNavigateToLeads}
          >
            <span>View All Leads in CRM</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ height: 260 }}>
          <Bar data={templateBarData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
