import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Wallet, 
  Users, 
  Download, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Flame,
  Calendar,
  Shield,
  X
} from 'lucide-react';

export const RcsOverviewBalancePage = () => {
  // Live System Balances
  const [rcsBalance, setRcsBalance] = useState(104997);
  const [smsBalance, setSmsBalance] = useState(100000);
  const [showModal, setShowModal] = useState(false);

  // Users List
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [manageServiceType, setManageServiceType] = useState('RCS'); // 'RCS' or 'SMS'
  const [manageActionType, setManageActionType] = useState('Credit'); // 'Credit' or 'Revoke'
  const [manageCredits, setManageCredits] = useState(5000);
  const [managePricePerCredit, setManagePricePerCredit] = useState(0.20);
  const [manageNotes, setManageNotes] = useState('Client Monthly Balance Allotment');
  const [manageLoading, setManageLoading] = useState(false);
  const [manageSuccessMsg, setManageSuccessMsg] = useState('');
  const [manageErrorMsg, setManageErrorMsg] = useState('');

  // Ledger & Audit Report States
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState(''); // Default to All Users
  const [filterActionType, setFilterActionType] = useState('All');
  const [filterServiceType, setFilterServiceType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchBalances();
    fetchUsers();
    fetchLedger('');
  }, []);

  // Format UTC date string to Local Indian Time (IST)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
      const d = new Date(utcStr);
      if (isNaN(d.getTime())) return dateStr.replace('T', ' ').substring(0, 16);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr.replace('T', ' ').substring(0, 16);
    }
  };

  const fetchBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      if (res.data?.response) {
        setRcsBalance(res.data.response.rcsBalance);
        setSmsBalance(res.data.response.smsBalance);
      }
    } catch (err) {
      console.error('Failed to load RCS balance', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/RCSApi/GetUsers');
      if (res.data?.users) {
        setUsers(res.data.users);
        if (res.data.users.length > 0 && !selectedUserId) {
          setSelectedUserId(res.data.users[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load users list', err);
    }
  };

  const fetchLedger = async (targetUserOverride) => {
    try {
      setLedgerLoading(true);
      const params = {};
      const uId = targetUserOverride !== undefined ? targetUserOverride : filterUserId;
      if (uId) params.targetUserId = uId;
      if (filterServiceType && filterServiceType !== 'All') params.serviceType = filterServiceType;
      if (filterActionType && filterActionType !== 'All') params.actionType = filterActionType;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.get('/RCSApi/GetBalanceLedger', { params });
      if (res.data?.response) {
        setLedgerTransactions(res.data.response.transactions || []);
        setLedgerSummary(res.data.response.summary || null);
      }
    } catch (err) {
      console.error('Failed to load balance ledger', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  // User-Wise Credit / Revoke Balance Handler
  const handleManageUserBalanceSubmit = async (e) => {
    if (e) e.preventDefault();
    setManageLoading(true);
    setManageSuccessMsg('');
    setManageErrorMsg('');

    const targetUser = users.find(u => u.id === parseInt(selectedUserId, 10));
    const currentBal = targetUser ? (manageServiceType === 'RCS' ? targetUser.rcsCredits : targetUser.smsCredits) : 0;
    const creditsNum = parseFloat(manageCredits) || 0;

    if (creditsNum <= 0) {
      setManageErrorMsg('Please enter a valid credit amount greater than 0.');
      setManageLoading(false);
      return;
    }

    if (manageActionType === 'Revoke' && creditsNum > currentBal) {
      setManageErrorMsg(`Cannot revoke ${creditsNum.toLocaleString()} credits. User only has ${currentBal.toLocaleString()} available.`);
      setManageLoading(false);
      return;
    }

    try {
      const payload = {
        targetUserId: parseInt(selectedUserId, 10),
        serviceType: manageServiceType,
        actionType: manageActionType,
        credits: creditsNum,
        pricePerCredit: parseFloat(managePricePerCredit) || 0,
        notes: manageNotes.trim() || (manageActionType === 'Credit' ? 'Balance Added' : 'Balance Debited')
      };

      const res = await api.post('/RCSApi/ManageUserBalance', payload);
      if (res.data?.status === 'OK') {
        const uName = targetUser?.username || `User #${selectedUserId}`;
        setManageSuccessMsg(
          manageActionType === 'Credit'
            ? `Successfully credited ${creditsNum.toLocaleString()} ${manageServiceType} credits for ${uName}!`
            : `Successfully revoked ${creditsNum.toLocaleString()} ${manageServiceType} credits from ${uName}!`
        );

        setShowModal(false);
        setFilterUserId('');
        fetchBalances();
        fetchUsers();
        fetchLedger('');

        setTimeout(() => setManageSuccessMsg(''), 6000);
      } else {
        setManageErrorMsg(res.data?.message || 'Transaction could not be processed.');
      }
    } catch (err) {
      setManageErrorMsg(err.response?.data?.message || 'Failed to update user balance.');
    } finally {
      setManageLoading(false);
    }
  };

  // CSV Export for Ledger
  const handleExportLedgerCsv = () => {
    const params = new URLSearchParams();
    if (filterUserId) params.append('targetUserId', filterUserId);
    if (filterServiceType && filterServiceType !== 'All') params.append('serviceType', filterServiceType);
    if (filterActionType && filterActionType !== 'All') params.append('actionType', filterActionType);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    window.open(`/api/RCSApi/ExportLedgerCsv?${params.toString()}`, '_blank');
  };

  // Date Presets
  const handleDatePreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const d = formatDate(today);
      setFromDate(d);
      setToDate(d);
    } else if (preset === 'last7') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setFromDate(formatDate(past));
      setToDate(formatDate(today));
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDate(firstDay));
      setToDate(formatDate(today));
    } else if (preset === 'clear') {
      setFromDate('');
      setToDate('');
    }
  };

  const targetUserObj = users.find(u => u.id === parseInt(selectedUserId, 10)) || users[0];
  const currentUserBalance = targetUserObj ? (manageServiceType === 'RCS' ? targetUserObj.rcsCredits : targetUserObj.smsCredits) : 0;
  const creditsNum = parseFloat(manageCredits) || 0;
  const isRevoke = manageActionType === 'Revoke';
  const hasInsufficientBalance = isRevoke && creditsNum > currentUserBalance;
  const balanceAfter = isRevoke ? Math.max(0, currentUserBalance - creditsNum) : (currentUserBalance + creditsNum);

  // The Exact Simple Form component used both on-page and in the popup modal
  const renderSimpleBalanceForm = (isModal = false) => (
    <form onSubmit={handleManageUserBalanceSubmit}>
      {/* Target User */}
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
          Select User to Credit / Revoke
        </label>
        <select 
          className="form-select"
          style={{ fontSize: '13px', padding: '8px 10px' }}
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
            setManageErrorMsg('');
          }}
          required
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              #{u.id} - {u.username} ({u.role}) | Current: {manageServiceType === 'RCS' ? u.rcsCredits.toLocaleString() : u.smsCredits.toLocaleString()} {manageServiceType}
            </option>
          ))}
        </select>
      </div>

      {/* Service & Action */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Wallet Service
          </label>
          <select 
            className="form-select"
            style={{ fontSize: '13px', padding: '8px 10px' }}
            value={manageServiceType}
            onChange={(e) => {
              setManageServiceType(e.target.value);
              setManageErrorMsg('');
            }}
          >
            <option value="RCS">RCS Credits</option>
            <option value="SMS">SMS Fallback</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Action
          </label>
          <select 
            className="form-select"
            style={{ 
              fontSize: '13px', 
              padding: '8px 10px', 
              fontWeight: 700, 
              color: isRevoke ? '#dc2626' : '#059669',
              borderColor: isRevoke ? '#f87171' : '#86efac' 
            }}
            value={manageActionType}
            onChange={(e) => {
              setManageActionType(e.target.value);
              setManageErrorMsg('');
            }}
          >
            <option value="Credit">➕ Credit (Balance Dena)</option>
            <option value="Revoke">➖ Debit (Balance Wapas Lena)</option>
          </select>
        </div>
      </div>

      {/* ROW: CURRENT AVAILABLE BALANCE (DISABLED/HIDE) & DEBIT / CREDIT AMOUNT BESIDE IT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {/* Left Box: Current Available Balance (Disabled / ReadOnly / "Hide") */}
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#64748b' }}>
            Current Available Balance
          </label>
          <input 
            type="text" 
            className="form-input" 
            value={`${currentUserBalance.toLocaleString()} ${manageServiceType} Credits`}
            disabled
            readOnly
            style={{ 
              fontSize: '13px', 
              fontWeight: 800, 
              padding: '8px 10px',
              background: '#f1f5f9',
              color: '#475569',
              cursor: 'not-allowed',
              border: '1px solid #cbd5e1'
            }}
          />
        </div>

        {/* Right Box: Debit Amount (or Credit Amount) */}
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: isRevoke ? '#dc2626' : '#059669' }}>
            {isRevoke ? 'Debit Amount (Deduct)' : 'Credit Amount (Add)'}
          </label>
          <input 
            type="number" 
            className="form-input" 
            style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              padding: '8px 10px',
              borderColor: isRevoke ? '#f87171' : '#86efac'
            }}
            value={manageCredits}
            onChange={(e) => {
              setManageCredits(e.target.value);
              setManageErrorMsg('');
            }}
            min="1"
            placeholder={isRevoke ? "Enter debit amount..." : "Enter credit amount..."}
            required
          />
        </div>
      </div>

      {/* Rate & Total Value (Both for Credit and Debit) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Rate (₹ / credit)
          </label>
          <input 
            type="number" 
            step="0.01" 
            className="form-input" 
            style={{ fontSize: '14px', fontWeight: 700, padding: '8px 10px' }}
            value={managePricePerCredit}
            onChange={(e) => setManagePricePerCredit(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: isRevoke ? '#dc2626' : '#059669' }}>
            {isRevoke ? 'Total Debit Value' : 'Total Billed Value'}
          </label>
          <div style={{ 
            background: isRevoke ? '#fef2f2' : '#f0fdf4', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontWeight: 800, 
            fontSize: '15px', 
            color: isRevoke ? '#dc2626' : '#059669', 
            border: isRevoke ? '1px solid #fecaca' : '1px solid #bbf7d0',
            height: '38px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isRevoke ? '-' : '+'}₹{(creditsNum * (parseFloat(managePricePerCredit) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Operation Preview or Insufficient Warning on Debit */}
      {isRevoke && (
        <div style={{ 
          background: hasInsufficientBalance ? '#fef2f2' : '#f8fafc', 
          padding: '9px 14px', 
          borderRadius: '8px', 
          border: hasInsufficientBalance ? '1px solid #fecaca' : '1px solid #e2e8f0', 
          marginBottom: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span style={{ fontSize: '12px', color: hasInsufficientBalance ? '#991b1b' : '#64748b' }}>
            {hasInsufficientBalance ? '⚠️ Insufficient Balance:' : 'Operation Preview:'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: hasInsufficientBalance ? '#dc2626' : '#0f172a' }}>
            {hasInsufficientBalance 
              ? `Cannot debit ${creditsNum.toLocaleString()} (Available: ${currentUserBalance.toLocaleString()})`
              : `Debiting ${creditsNum.toLocaleString()} Credits ➔ New Balance: ${(currentUserBalance - creditsNum).toLocaleString()}`
            }
          </span>
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '14px', flexWrap: 'wrap' }}>
        {[5000, 10000, 50000, 100000].map(amt => (
          <button 
            key={amt} 
            type="button" 
            className="btn btn-outline btn-sm" 
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              setManageCredits(amt);
              setManageErrorMsg('');
            }}
          >
            +{amt.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Remarks */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
          Remarks / Note
        </label>
        <input 
          type="text" 
          className="form-input" 
          style={{ fontSize: '13px', padding: '8px 10px' }}
          value={manageNotes}
          onChange={(e) => setManageNotes(e.target.value)}
          placeholder="e.g. Monthly Quota Allotment, Adjustment"
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {isModal && (
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ flex: 1 }} 
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className={`btn ${!isRevoke ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            flex: isModal ? 1.5 : 1, 
            width: isModal ? 'auto' : '100%',
            padding: '11px',
            fontSize: '14px',
            fontWeight: 800,
            borderColor: isRevoke ? '#ef4444' : '#0a66c2',
            color: isRevoke ? '#dc2626' : '#ffffff',
            background: !isRevoke ? '#0a66c2' : undefined
          }} 
          disabled={manageLoading || creditsNum <= 0 || hasInsufficientBalance}
        >
          {manageLoading ? 'Processing...' : (
            hasInsufficientBalance ? (
              `Cannot Debit (Max: ${currentUserBalance.toLocaleString()})`
            ) : isRevoke ? (
              `➖ Debit ${creditsNum.toLocaleString()} ${manageServiceType} Now`
            ) : (
              `➕ Credit ${creditsNum.toLocaleString()} ${manageServiceType} Now`
            )
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Top Header & Overview Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            RCS Overview & Balance Ledger
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
            Manage user balances with full audit logging and transparent statement reports.
          </p>
        </div>

        {/* Live Wallet Balances & Open Modal Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            background: '#eef2ff', 
            border: '1px solid #c7d2fe', 
            padding: '5px 14px', 
            borderRadius: '8px', 
            fontSize: '12px' 
          }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6366f1', display: 'block', fontWeight: 700 }}>
              Live RCS Balance
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>{rcsBalance.toLocaleString()} Credits</span>
          </div>

          <div style={{ 
            background: '#fefce8', 
            border: '1px solid #fde047', 
            padding: '5px 14px', 
            borderRadius: '8px', 
            fontSize: '12px' 
          }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#ca8a04', display: 'block', fontWeight: 700 }}>
              Live SMS Fallback
            </span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#713f12' }}>{smsBalance.toLocaleString()} Credits</span>
          </div>

          {/* Dedicated Popup Modal Trigger Button */}
          <button 
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontWeight: 700 }}
            onClick={() => setShowModal(true)}
            title="Open Credit / Revoke Popup Modal"
          >
            <Wallet size={15} />
            <span>➕ Credit / Revoke Balance</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {manageSuccessMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '13px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{manageSuccessMsg}</span>
          </div>
          <button type="button" onClick={() => setManageSuccessMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {manageErrorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '13px' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span>{manageErrorMsg}</span>
          </div>
          <button type="button" onClick={() => setManageErrorMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXACT SIMPLE POPUP-STYLE FORM (EMBEDDED CLEANLY AS A 500PX COMPACT CARD) */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '500px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* The Exact Simple Popup Form (Embedded directly on page) */}
        <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${isRevoke ? '#ef4444' : '#4f46e5'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wallet size={16} color="#4f46e5" />
              <span>Manage User Balance (Credit / Revoke)</span>
            </div>
            <span className={`badge ${isRevoke ? 'badge-dnd' : 'badge-success'}`} style={{ fontSize: '10px' }}>
              {isRevoke ? 'Revoke Mode' : 'Credit Mode'}
            </span>
          </div>

          {renderSimpleBalanceForm(false)}
        </div>

        {/* Right Column: Platform Totals on Top + Selected User Live Passbook Below */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. Overall Platform Totals (Admin / System) */}
          <div>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: 800, 
              color: '#475569', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px', 
              marginBottom: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6 
            }}>
              <Shield size={14} color="#6366f1" />
              <span>Overall Platform Totals (All Users & Admin)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                  <ArrowUpRight size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Credited</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {ledgerSummary?.totalCredited?.toLocaleString() || '2,45,000'}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <ArrowDownLeft size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Revoked / Debited</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {ledgerSummary?.totalRevoked?.toLocaleString() || '18,000'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #6366f1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Billed Value</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    ₹{(ledgerSummary?.totalBilledValue ?? 41400).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04', flexShrink: 0 }}>
                  <Flame size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Campaigns Consumed</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {ledgerSummary?.totalCampaignUsed?.toLocaleString() || '3'} Credits
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Selected User Live Impact (Passbook Preview) */}
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #cbd5e1', 
            padding: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={15} color="#0a66c2" />
                <span>Selected User Live Details: <b style={{ color: '#0a66c2' }}>{targetUserObj?.username || 'User'}</b> (#{targetUserObj?.id})</span>
              </div>
              <span className="badge badge-cold" style={{ fontSize: '10px', fontWeight: 700 }}>
                {manageServiceType} Wallet
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {/* Current Available Balance */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Current Available Balance
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                  {currentUserBalance.toLocaleString()} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{manageServiceType}</span>
                </div>
              </div>

              {/* Credit / Debit Amount */}
              <div style={{ 
                background: isRevoke ? '#fef2f2' : '#f0fdf4', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: isRevoke ? '1px solid #fecaca' : '1px solid #bbf7d0',
                borderLeft: `4px solid ${isRevoke ? '#ef4444' : '#10b981'}` 
              }}>
                <div style={{ fontSize: '10px', color: isRevoke ? '#991b1b' : '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isRevoke ? 'Debit Amount (Deduct)' : 'Credit Amount (Add)'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isRevoke ? '#dc2626' : '#059669', marginTop: 2 }}>
                  {isRevoke ? `-${creditsNum.toLocaleString()}` : `+${creditsNum.toLocaleString()}`} <span style={{ fontSize: '11px', fontWeight: 600 }}>{manageServiceType}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* New Balance After Operation */}
              <div style={{ 
                background: hasInsufficientBalance ? '#fff1f2' : '#f0f7ff', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                border: hasInsufficientBalance ? '1px solid #fecdd3' : '1px solid #bfdbfe',
                borderLeft: `4px solid ${hasInsufficientBalance ? '#e11d48' : '#0a66c2'}` 
              }}>
                <div style={{ fontSize: '10px', color: hasInsufficientBalance ? '#9f1239' : '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  New Balance After
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: hasInsufficientBalance ? '#e11d48' : '#0a66c2', marginTop: 2 }}>
                  {hasInsufficientBalance ? (
                    <span style={{ fontSize: '12px' }}>⚠️ Insufficient (Max: {currentUserBalance.toLocaleString()})</span>
                  ) : (
                    `${balanceAfter.toLocaleString()} ${manageServiceType}`
                  )}
                </div>
              </div>

              {/* Transaction Billed / Debit Value */}
              <div style={{ background: isRevoke ? '#fef2f2' : '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: isRevoke ? '1px solid #fecaca' : '1px solid #bbf7d0', borderLeft: `4px solid ${isRevoke ? '#ef4444' : '#10b981'}` }}>
                <div style={{ fontSize: '10px', color: isRevoke ? '#991b1b' : '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isRevoke ? 'Total Debit Value' : 'Total Billed Value'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isRevoke ? '#dc2626' : '#059669', marginTop: 2 }}>
                  {isRevoke ? '-' : '+'}₹{(creditsNum * (parseFloat(managePricePerCredit) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. TRANSACTION AUDIT REPORT & STATEMENT TABLE                             */}
      {/* ========================================================================= */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title">Balance Transaction Audit Ledger & Report</div>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Complete audit history with Indian Local Time (IST), user details, and live balances.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => fetchLedger()}
              title="Refresh Audit Ledger"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>

            <button 
              className="btn btn-primary btn-sm"
              onClick={handleExportLedgerCsv}
              title="Download statement as CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Live Filter Bar (Auto-updates on select) */}
        <div style={{ padding: '10px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* User Filter */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '5px 8px' }}
              value={filterUserId}
              onChange={(e) => {
                setFilterUserId(e.target.value);
                fetchLedger(e.target.value);
              }}
            >
              <option value="">👤 All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>User: {u.username} (#{u.id})</option>
              ))}
            </select>
          </div>

          {/* Operation Filter */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '5px 8px' }}
              value={filterActionType}
              onChange={(e) => {
                setFilterActionType(e.target.value);
              }}
            >
              <option value="All">All Operations</option>
              <option value="Credit">➕ Credits Only (+)</option>
              <option value="Revoke">➖ Revokes Only (-)</option>
              <option value="CampaignUsage">Campaign Usage</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '5px 8px' }}
              value={filterServiceType}
              onChange={(e) => {
                setFilterServiceType(e.target.value);
              }}
            >
              <option value="All">All Services (RCS + SMS)</option>
              <option value="RCS">RCS Only</option>
              <option value="SMS">SMS Only</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>From:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ fontSize: '11px', padding: '4px 6px' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>To:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ fontSize: '11px', padding: '4px 6px' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: 3 }}>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => { handleDatePreset('today'); }}>Today</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => { handleDatePreset('last7'); }}>7 Days</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => { handleDatePreset('month'); }}>Month</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => { handleDatePreset('clear'); }}>Clear</button>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            style={{ fontSize: '11px', padding: '5px 12px' }}
            onClick={() => fetchLedger()}
          >
            Apply
          </button>
        </div>

        {/* Transaction Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn Code</th>
                <th>Date & Time (IST)</th>
                <th>User</th>
                <th>Wallet</th>
                <th>Operation</th>
                <th>Credits Amount</th>
                <th>Rate</th>
                <th>Total Value</th>
                <th>Performed By</th>
                <th>Note / Remarks</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {ledgerTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    {ledgerLoading ? 'Loading audit records...' : 'No balance transactions found for the selected filter.'}
                  </td>
                </tr>
              ) : (
                ledgerTransactions.map(t => (
                  <tr key={t.id}>
                    <td>
                      <code style={{ color: '#4f46e5', fontWeight: 700, fontSize: '11px' }}>{t.transactionCode}</code>
                    </td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.username}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>User ID: #{t.userId}</div>
                    </td>
                    <td>
                      <span className={`badge ${t.serviceType === 'RCS' ? 'badge-hot' : 'badge-warm'}`} style={{ fontSize: '10px' }}>
                        {t.serviceType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        t.actionType === 'Credit' ? 'badge-success' :
                        t.actionType === 'Revoke' ? 'badge-dnd' : 'badge-cold'
                      }`} style={{ fontSize: '10px' }}>
                        {t.actionType === 'Credit' ? '➕ Credit' :
                         t.actionType === 'Revoke' ? '➖ Debit' : 'Usage'}
                      </span>
                    </td>
                    <td style={{ 
                      fontWeight: 800, 
                      fontSize: '13px',
                      color: t.credits > 0 ? '#059669' : '#dc2626' 
                    }}>
                      {t.credits > 0 ? `+${t.credits.toLocaleString()}` : t.credits.toLocaleString()}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>
                      {t.pricePerCredit > 0 ? `₹${t.pricePerCredit.toFixed(2)}` : (t.actionType === 'CampaignUsage' ? '—' : '₹0.20')}
                    </td>
                    <td style={{ 
                      fontWeight: 800, 
                      fontSize: '12px', 
                      color: t.actionType === 'Credit' ? '#059669' : (t.actionType === 'Revoke' ? '#dc2626' : '#ea580c') 
                    }}>
                      {t.totalAmount > 0 
                        ? `${t.actionType === 'Revoke' ? '-' : '+'}₹${t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` 
                        : (t.pricePerCredit > 0 
                            ? `${t.actionType === 'Revoke' ? '-' : '+'}₹${(Math.abs(t.credits) * t.pricePerCredit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                            : '—')
                      }
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {t.performedByUsername || 'SuperAdmin'}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b', maxWidth: '180px' }} title={t.notes}>
                      {t.notes || '-'}
                    </td>
                    <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                      {t.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXACT POPUP MODAL (Opens when clicking the top button)                     */}
      {/* ========================================================================= */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={18} color="#4f46e5" />
                <span>Manage User Balance (Credit / Revoke)</span>
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => setShowModal(false)}
                style={{ border: 'none', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {renderSimpleBalanceForm(true)}
          </div>
        </div>
      )}

    </div>
  );
};
