import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import { CreateUserModal } from '../components/CreateUserModal';
import { 
  Wallet, 
  Users, 
  Download, 
  RefreshCw, 
  PlusCircle, 
  UserPlus,
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Flame,
  Calendar,
  Shield,
  X,
  ChevronDown,
  Search
} from 'lucide-react';

export const RcsOverviewBalancePage = () => {
  // Live Gateway Balances across 4 Distinct Telecom Service Wallets with Zero-Lag Instant Hydration
  const [adminBalances, setAdminBalances] = useState(() => {
    try {
      const cachedAdmin = localStorage.getItem('rcs_overview_admin_balances');
      if (cachedAdmin) return JSON.parse(cachedAdmin);
      const cachedLive = localStorage.getItem('rcs_live_balances');
      if (cachedLive) {
        const p = JSON.parse(cachedLive);
        return {
          rcsT: p.rcsT ?? 57,
          rcsP: p.rcsP ?? 109,
          bulkSmsT: p.sms ?? 100,
          bulkSmsP: p.sms ?? 100,
          whatsAppT: 0,
          whatsAppP: 0
        };
      }
    } catch (_) {}
    return {
      rcsT: 57,
      rcsP: 109,
      bulkSmsT: 100,
      bulkSmsP: 100,
      whatsAppT: 0.0,
      whatsAppP: 0.0
    };
  });

  const [rcsBalance, setRcsBalance] = useState(() => (adminBalances.rcsT ?? 57) + (adminBalances.rcsP ?? 109));
  const [rcsTxnBalance, setRcsTxnBalance] = useState(() => adminBalances.rcsT ?? 57);
  const [rcsPromoBalance, setRcsPromoBalance] = useState(() => adminBalances.rcsP ?? 109);
  const [smsBalance, setSmsBalance] = useState(() => adminBalances.bulkSmsT ?? 100);

  const [gatewayStatus, setGatewayStatus] = useState({
    name: 'RCS Enterprise Live Cloud',
    connected: true
  });

  // User List & Selection
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userComboboxOpen, setUserComboboxOpen] = useState(false);
  const pendingRequest = useRef(null);
  const submitting = useRef(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // New Inline User Form
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 4 // Client
  });
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  // 2-Step Dropdowns: Platform + Traffic Type
  const [selectedPlatform, setSelectedPlatform] = useState('RCS'); // 'RCS', 'SMS', 'WHATSAPP'
  const [selectedRoute, setSelectedRoute] = useState('Transactional'); // 'Transactional', 'Promotional'
  const [manageActionType, setManageActionType] = useState('Credit'); // 'Credit', 'Revoke'
  const [manageCredits, setManageCredits] = useState(0);
  const [managePricePerCredit, setManagePricePerCredit] = useState(0.20);
  const [manageNotes, setManageNotes] = useState('Client Balance Allotment');
  const [manageLoading, setManageLoading] = useState(false);
  const [manageSuccessMsg, setManageSuccessMsg] = useState('');
  const [manageErrorMsg, setManageErrorMsg] = useState('');

  // 2-Step Dynamic Wallet Service Resolution (RCS SMS, Bulk SMS, WhatsApp SMS + Transactional, Promotional)
  const resolveWalletService = (plat, rt) => {
    if (plat === 'RCS') return rt === 'Transactional' ? 'RCS-T' : 'RCS-P';
    if (plat === 'SMS') return rt === 'Transactional' ? 'BULKSMS-T' : 'BULKSMS-P';
    if (plat === 'WHATSAPP') return rt === 'Transactional' ? 'WHATSAPP-T' : 'WHATSAPP-P';
    return 'RCS-T';
  };

  const manageServiceType = resolveWalletService(selectedPlatform, selectedRoute);


  // Ledger & Audit Report States (Combobox + 2-Step Dropdowns + Action + Date Range)
  const [ledgerTransactions, setLedgerTransactions] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState(() => {
    try {
      const cached = localStorage.getItem('rcs_overview_ledger_summary');
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return null;
  });
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [filterUserId, setFilterUserId] = useState(''); // Default to All Users
  const [filterUserSearch, setFilterUserSearch] = useState(''); // Type/search user in ledger combobox
  const [filterUserComboboxOpen, setFilterUserComboboxOpen] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All'); // All, RCS, SMS, WHATSAPP
  const [filterRoute, setFilterRoute] = useState('All'); // All, Transactional, Promotional
  const [filterActionType, setFilterActionType] = useState('All');
  const [filterServiceType, setFilterServiceType] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalsSuiteTab, setTotalsSuiteTab] = useState('RCS'); // 'RCS', 'SMS', 'WHATSAPP'

  useEffect(() => {
    fetchBalances();
    fetchUsers();
    fetchLedger('');
  }, []);

  // Format UTC date string to Local Indian Time (IST)
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const utcStr = /(?:Z|[+-]\d{2}:\d{2})$/i.test(dateStr) ? dateStr : dateStr + 'Z';
      const d = new Date(utcStr);
      if (isNaN(d.getTime())) return dateStr.replace('T', ' ').substring(0, 16);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
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

  const getUserBalanceForService = (targetUser, sType) => {
    if (!targetUser) return 0;
    const st = (sType || 'RCS-T').toUpperCase();
    if (st === 'BULKSMS-P') return targetUser.bulkSmsPromotionalCredits ?? 0;
    if (st === 'WHATSAPP-P') return targetUser.whatsAppPromotionalCredits ?? 0;
    if (st.includes('SMS') || st.includes('BULKSMS')) {
      return targetUser.smsCredits ?? 0;
    }
    if (st.includes('WHATSAPP')) {
      return targetUser.whatsAppCredits ?? 0;
    }
    if (st === 'RCS-P' || st.includes('PROMO') || st.includes('PROMOTIONAL')) {
      return targetUser.rcsPromoCredits ?? targetUser.rcsPromotionalCredits ?? 0;
    }
    return targetUser.rcsCredits ?? 0;
  };

  const getAdminBalanceForService = (sType) => {
    const st = (sType || 'RCS-T').toUpperCase();
    if (st === 'RCS-T' || st === 'RCS_TRANSACTIONAL') return adminBalances.rcsT ?? 0;
    if (st === 'RCS-P' || st === 'RCS_PROMOTIONAL') return adminBalances.rcsP ?? 0;
    if (st === 'BULKSMS-T' || st === 'SMS_TRANSACTIONAL' || st === 'SMS') return adminBalances.bulkSmsT ?? 0;
    if (st === 'BULKSMS-P' || st === 'SMS_PROMOTIONAL') return adminBalances.bulkSmsP ?? 0;
    if (st === 'WHATSAPP-T' || st === 'WHATSAPP_TRANSACTIONAL') return adminBalances.whatsAppT ?? 0.0;
    if (st === 'WHATSAPP-P' || st === 'WHATSAPP_PROMOTIONAL' || st === 'WHATSAPP') return adminBalances.whatsAppP ?? 0.0;
    return adminBalances.rcsT ?? 0;
  };

  const fetchBalances = async () => {
    try {
      const res = await api.get('/RCSApi/CheckRcsBalance');
      const data = res.data?.response || res.data?.Response;
      if (data) {
        const rT = data.rcsTransactionalBalance ?? (data.AdminBalances?.rcsT ?? 0);
        const rP = data.rcsPromotionalBalance ?? (data.AdminBalances?.rcsP ?? 0);
        const sT = data.bulkSmsTransactionalBalance ?? data.smsBalance ?? 0;
        const sP = data.bulkSmsPromotionalBalance ?? 0;
        const wT = data.whatsAppTransactionalBalance ?? 0.0;
        const wP = data.whatsAppPromotionalBalance ?? 0.0;

        setRcsBalance(rT + rP);
        setRcsTxnBalance(rT);
        setRcsPromoBalance(rP);
        setSmsBalance(sT);
        const newAdminBals = {
          rcsT: rT,
          rcsP: rP,
          bulkSmsT: sT,
          bulkSmsP: sP,
          whatsAppT: wT,
          whatsAppP: wP
        };
        setAdminBalances(newAdminBals);
        try {
          localStorage.setItem('rcs_overview_admin_balances', JSON.stringify(newAdminBals));
          localStorage.setItem('rcs_live_balances', JSON.stringify({ rcsT: rT, rcsP: rP, sms: sT }));
        } catch (_) {}
        setGatewayStatus({
          name: data.gateway || data.Gateway || 'RCS Enterprise Live Cloud',
          connected: data.connected !== undefined ? data.connected : true
        });

        // Dispatch sync event for top navbar Header
        window.dispatchEvent(new CustomEvent('rcs_balance_updated', { detail: { rcsT: rT, rcsP: rP, newBalance: rT } }));
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

      }
    } catch (err) {
      console.error('Failed to load users list', err);
    }
  };

  const fetchLedger = async (targetUserOverride, resetFilters = false) => {
    try {
      setLedgerLoading(true);
      const params = {};
      const uId = targetUserOverride !== undefined ? targetUserOverride : filterUserId;
      if (uId) params.targetUserId = uId;
      if (!resetFilters && filterUserSearch) params.searchUser = filterUserSearch;
      if (!resetFilters && filterPlatform && filterPlatform !== 'All') params.platform = filterPlatform;
      if (!resetFilters && filterRoute && filterRoute !== 'All') params.route = filterRoute;
      if (!resetFilters && filterActionType && filterActionType !== 'All') params.actionType = filterActionType;
      if (!resetFilters && fromDate) params.fromDate = fromDate;
      if (!resetFilters && toDate) params.toDate = toDate;

      const res = await api.get('/RCSApi/GetBalanceLedger', { params });
      const sum = res.data?.response?.summary || res.data?.summary || null;
      const txs = res.data?.response?.transactions || res.data?.transactions || [];
      setLedgerTransactions(txs);
      if (sum) {
        setLedgerSummary(sum);
        try {
          localStorage.setItem('rcs_overview_ledger_summary', JSON.stringify(sum));
        } catch (_) {}
      }
    } catch (err) {
      setLedgerTransactions([]);
      setManageErrorMsg('Unable to load database audit history. Please refresh.');
    } finally {
      setLedgerLoading(false);
    }
  };

  // Instant Live Filtering for Audit Ledger (Zero-Lag Frontend Filtering)
  const displayedTransactions = useMemo(() => {
    return (ledgerTransactions || []).filter(t => {
      // User ID or User Search
      if (filterUserId && t.userId?.toString() !== filterUserId.toString()) {
        return false;
      }
      if (filterUserSearch.trim()) {
        const q = filterUserSearch.trim().toLowerCase().replace('#', '');
        const match = (t.username || '').toLowerCase().includes(q) ||
                      (t.userId || '').toString() === q ||
                      (t.performedByUsername || '').toLowerCase().includes(q) ||
                      (t.transactionCode || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      // Platform / Channel filter
      if (filterPlatform && filterPlatform !== 'All') {
        const st = (t.serviceType || '').toUpperCase();
        if (filterPlatform === 'RCS' && !st.includes('RCS')) return false;
        if (filterPlatform === 'SMS' && !st.includes('SMS') && !st.includes('BULKSMS')) return false;
        if (filterPlatform === 'WHATSAPP' && !st.includes('WHATSAPP')) return false;
      }

      // Route filter
      if (filterRoute && filterRoute !== 'All') {
        const st = (t.serviceType || '').toUpperCase();
        if (filterRoute === 'Transactional' && !st.endsWith('-T') && !st.includes('TRANSACTIONAL')) return false;
        if (filterRoute === 'Promotional' && !st.endsWith('-P') && !st.includes('PROMOTIONAL')) return false;
      }

      // Action / Operation filter
      if (filterActionType && filterActionType !== 'All') {
        const act = (t.actionType || '').toLowerCase();
        if (filterActionType === 'Credit' && act !== 'credit' && act !== 'allocation') return false;
        if (filterActionType === 'Revoke' && act !== 'revoke') return false;
        if (filterActionType === 'Usage' && act !== 'usage' && act !== 'campaignusage') return false;
      }

      // Date range filter
      if (fromDate) {
        const txDate = new Date(t.createdAt).toISOString().slice(0, 10);
        if (txDate < fromDate) return false;
      }
      if (toDate) {
        const txDate = new Date(t.createdAt).toISOString().slice(0, 10);
        if (txDate > toDate) return false;
      }

      return true;
    });
  }, [ledgerTransactions, filterUserId, filterUserSearch, filterPlatform, filterRoute, filterActionType, fromDate, toDate]);

  // User-Wise Credit / Revoke Balance Handler with Strict Admin/User Capping
  const handleManageUserBalanceSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting.current) return;
    setManageLoading(true);
    setManageSuccessMsg('');
    setManageErrorMsg('');

    const targetUser = users.find(u => u.id === parseInt(selectedUserId, 10));
    if (!targetUser || targetUser.isActive === false || ![targetUser.username?.toLowerCase(), String(targetUser.id), '#' + targetUser.id].includes(userSearchInput.trim().toLowerCase())) {
      setManageErrorMsg('Please select an existing active user. Invalid User ID / Username.');
      setManageLoading(false);
      return;
    }
    const currentBal = getUserBalanceForService(targetUser, manageServiceType);
    const adminBal = getAdminBalanceForService(manageServiceType);
    const creditsNum = parseFloat(manageCredits) || 0;

    if (creditsNum <= 0) {
      setManageErrorMsg('Please enter a valid credit amount greater than 0.');
      setManageLoading(false);
      return;
    }

    if (manageActionType === 'Credit' && creditsNum > adminBal) {
      setManageErrorMsg(`Limit Exceeded: Admin ke paas sirf ${adminBal.toLocaleString()} ${manageServiceType} balance hai. Maximum credit limit ${adminBal.toLocaleString()} hai!`);
      setManageLoading(false);
      return;
    }

    if (manageActionType === 'Revoke' && creditsNum > currentBal) {
      setManageErrorMsg(`Limit Exceeded: User ke paas sirf ${currentBal.toLocaleString()} ${manageServiceType} balance hai. Maximum revoke limit ${currentBal.toLocaleString()} hai!`);
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

      const fingerprint = JSON.stringify(payload);
      if (pendingRequest.current?.fingerprint !== fingerprint) pendingRequest.current = { fingerprint, id: '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16)) };
      payload.requestId = pendingRequest.current.id;
      submitting.current = true;
      const res = await api.post('/RCSApi/ManageUserBalance', payload);
      if (res.data?.status === 'OK') {
        pendingRequest.current = null;
        const uName = targetUser?.username || `User #${selectedUserId}`;
        setManageSuccessMsg(
          manageActionType === 'Credit'
            ? `Successfully credited ${creditsNum.toLocaleString()} ${manageServiceType} credits for ${uName}!`
            : `Successfully revoked ${creditsNum.toLocaleString()} ${manageServiceType} credits from ${uName}!`
        );

        setShowModal(false);
        setFilterUserId('');
        setFilterUserSearch('');
        setFilterPlatform('All'); setFilterRoute('All'); setFilterActionType('All'); setFromDate(''); setToDate('');
        await Promise.all([fetchBalances(), fetchUsers(), fetchLedger('', true)]);

        setTimeout(() => setManageSuccessMsg(''), 6000);
      } else {
        setManageErrorMsg(res.data?.message || 'Transaction could not be processed.');
      }
    } catch (err) {
      setManageErrorMsg(err.response?.data?.message || 'Failed to update user balance.');
    } finally {
      submitting.current = false;
      setManageLoading(false);
    }
  };

  // Quick Inline User Creation
  const handleCreateNewUser = async (e) => {
    if (e) e.preventDefault();
    setCreateUserLoading(true);
    setCreateUserError('');
    try {
      const res = await api.post('/users', newUserForm);
      if (res.data || res.status === 200 || res.status === 201) {
        setShowCreateUserModal(false);
        const createdName = newUserForm.username;
        setNewUserForm({
          username: '',
          fullName: '',
          email: '',
          password: '',
          phoneNumber: '',
          role: 4
        });
        setManageSuccessMsg(`New User "${createdName}" successfully created! You can now allot balance.`);
        await fetchUsers();
        if (res.data?.id) { setSelectedUserId(res.data.id); setUserSearchInput(createdName); }
        setTimeout(() => setManageSuccessMsg(''), 6000);
      }
    } catch (err) {
      setCreateUserError(err.response?.data?.message || 'Failed to create user. Please check credentials and try again.');
    } finally {
      setCreateUserLoading(false);
    }
  };

  // CSV Export for Ledger
  const handleExportLedgerCsv = () => {
    try {
      const rows = displayedTransactions;
      const escape = value => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
      const csv = [['Txn Code', 'Date & Time (IST)', 'User', 'User ID', 'Wallet', 'Operation', 'Credits', 'Rate', 'Total Value', 'Performed By', 'Remarks', 'Balance Before', 'Balance After'],
        ...rows.map(t => [t.transactionCode, formatDateTime(t.createdAt), t.username, t.userId, t.serviceType, t.actionType,
          t.credits, t.pricePerCredit, t.totalAmount, t.performedByUsername, t.notes, t.balanceAfter - t.credits, t.balanceAfter])]
        .map(row => row.map(escape).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = `balance-ledger-IST-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setManageErrorMsg('Unable to export database audit history.'); }
  };

  // Date Presets
  const handleDatePreset = (preset) => {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const today = new Date(day + 'T00:00:00Z');
    if (preset === 'clear') { setFromDate(''); setToDate(''); return; }
    const first = new Date(today);
    if (preset === 'last7') first.setUTCDate(first.getUTCDate() - 6);
    if (preset === 'month') first.setUTCDate(1);
    setFromDate(first.toISOString().slice(0, 10)); setToDate(day);
  };

  const subClients = users.filter(u => u.isActive !== false && u.id !== 1 && u.role !== 1 && u.roleName !== 'SuperAdmin');
  const targetUserObj = users.find(u => u.id === parseInt(selectedUserId, 10));
  const adminAvail = getAdminBalanceForService(manageServiceType);
  const currentUserBalance = getUserBalanceForService(targetUserObj, manageServiceType);
  const creditsNum = parseFloat(manageCredits) || 0;
  const isRevoke = manageActionType === 'Revoke';
  
  // Strict Validation Flags
  const hasExceededAdminBalance = !isRevoke && creditsNum > adminAvail;
  const hasInsufficientBalance = isRevoke && creditsNum > currentUserBalance;
  const isActionDisabled = !targetUserObj || targetUserObj.isActive === false || manageLoading || creditsNum <= 0 || hasExceededAdminBalance || hasInsufficientBalance;
  const balanceAfter = isRevoke ? Math.max(0, currentUserBalance - creditsNum) : (currentUserBalance + creditsNum);

  // Platform Per-Service Calculations for Requested Cards
  const rcsTTxns = (ledgerTransactions || []).filter(t => (t.serviceType || '').toUpperCase().includes('RCS-T') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');
  const rcsPTxns = (ledgerTransactions || []).filter(t => (t.serviceType || '').toUpperCase().includes('RCS-P') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');
  const bulkTTxns = (ledgerTransactions || []).filter(t => ((t.serviceType || '').toUpperCase().includes('BULKSMS-T') || (t.serviceType || '').toUpperCase() === 'SMS') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');
  const bulkPTxns = (ledgerTransactions || []).filter(t => (t.serviceType || '').toUpperCase().includes('BULKSMS-P') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');
  const waTTxns = (ledgerTransactions || []).filter(t => (t.serviceType || '').toUpperCase().includes('WHATSAPP-T') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');
  const waPTxns = (ledgerTransactions || []).filter(t => (t.serviceType || '').toUpperCase().includes('WHATSAPP-P') && t.userId !== 1 && t.username?.toLowerCase() !== 'admin');

  const rcsTRevoked = Math.abs(rcsTTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));
  const rcsPRevoked = Math.abs(rcsPTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));
  const rcsTCredited = rcsTTxns.filter(t => (t.actionType === 'Credit' || t.actionType === 'Allocation') && t.credits > 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0);
  const rcsPCredited = rcsPTxns.filter(t => (t.actionType === 'Credit' || t.actionType === 'Allocation') && t.credits > 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0);

  const bulkTRevoked = Math.abs(bulkTTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));
  const bulkPRevoked = Math.abs(bulkPTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));
  const waTRevoked = Math.abs(waTTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));
  const waPRevoked = Math.abs(waPTxns.filter(t => t.actionType === 'Revoke' || t.credits < 0).reduce((acc, t) => acc + (parseFloat(t.credits) || 0), 0));

  const rcsTAdminUsed = (ledgerTransactions || []).filter(t => (t.userId === 1 || t.username?.toLowerCase() === 'admin') && (t.serviceType || '').toUpperCase().includes('RCS-T') && (t.actionType === 'Usage' || t.actionType === 'CampaignUsage')).reduce((acc, t) => acc + Math.abs(parseFloat(t.credits) || 0), 0);
  const rcsPAdminUsed = (ledgerTransactions || []).filter(t => (t.userId === 1 || t.username?.toLowerCase() === 'admin') && (t.serviceType || '').toUpperCase().includes('RCS-P') && (t.actionType === 'Usage' || t.actionType === 'CampaignUsage')).reduce((acc, t) => acc + Math.abs(parseFloat(t.credits) || 0), 0);
  const bulkTAdminUsed = (ledgerTransactions || []).filter(t => (t.userId === 1 || t.username?.toLowerCase() === 'admin') && ((t.serviceType || '').toUpperCase().includes('BULKSMS-T') || (t.serviceType || '').toUpperCase() === 'SMS') && (t.actionType === 'Usage' || t.actionType === 'CampaignUsage')).reduce((acc, t) => acc + Math.abs(parseFloat(t.credits) || 0), 0);
  const bulkPAdminUsed = (ledgerTransactions || []).filter(t => (t.userId === 1 || t.username?.toLowerCase() === 'admin') && (t.serviceType || '').toUpperCase().includes('BULKSMS-P') && (t.actionType === 'Usage' || t.actionType === 'CampaignUsage')).reduce((acc, t) => acc + Math.abs(parseFloat(t.credits) || 0), 0);

  // Dynamic values connected to live gateway and ledger
  const mainRcsT = adminBalances.rcsT ?? 0;
  const mainRcsP = adminBalances.rcsP ?? 0;
  const availRcsT = ledgerSummary?.rcsT?.currentAvailable ?? Math.max(0, mainRcsT - rcsTCredited + rcsTRevoked - rcsTAdminUsed);
  const availRcsP = ledgerSummary?.rcsP?.currentAvailable ?? Math.max(0, mainRcsP - rcsPCredited + rcsPRevoked - rcsPAdminUsed);
  const revokedRcsTStr = rcsTRevoked > 0 ? `-${rcsTRevoked}` : '0';
  const revokedRcsPStr = rcsPRevoked > 0 ? `-${rcsPRevoked}` : '0';

  // The Exact Simple Form component used both on-page and in the popup modal
  const renderSimpleBalanceForm = (isModal = false) => (
    <form onSubmit={handleManageUserBalanceSubmit}>
      {/* Target User & Quick Create */}
      <div className="form-group" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', margin: 0 }}>
            Select User to Credit / Revoke
          </label>
          <button 
            type="button"
            onClick={() => setShowCreateUserModal(true)}
            style={{ 
              background: '#eff6ff', 
              color: '#0284c7', 
              border: '1px solid #bfdbfe', 
              borderRadius: '5px', 
              padding: '2px 8px', 
              fontSize: '11px', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <UserPlus size={12} />
            <span>+ Create New User</span>
          </button>
        </div>

        {/* Single Searchable User ID Dropdown (Combobox) */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search or select User ID (e.g. manoj, rahul)..."
              value={userSearchInput}
              onChange={(e) => {
                const val = e.target.value;
                setUserSearchInput(val);
                setSelectedUserId(null);
                setManageSuccessMsg('');
                setUserComboboxOpen(true);
                const q = val.trim().toLowerCase();
                const matched = users.find(u => 
                  u.id !== 1 && u.role !== 1 && u.roleName !== 'SuperAdmin' && (
                    u.username?.toLowerCase() === q ||
                    u.id.toString() === q.replace('#', '') ||
                    false
                  )
                );
                if (matched) {
                  setSelectedUserId(matched.id);
                  setManageErrorMsg('');
                } else {
                  setManageErrorMsg('Invalid User ID / Username. Select an existing active user.');
                }
              }}
              onFocus={() => setUserComboboxOpen(true)}
              style={{ fontSize: '13px', padding: '8px 36px 8px 12px', fontWeight: 700 }}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setUserComboboxOpen(prev => !prev)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#64748b'
              }}
              title="Toggle user list"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Combobox Dropdown Menu */}
          {userComboboxOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #cbd5e1',
                maxHeight: '220px',
                overflowY: 'auto',
                zIndex: 100
              }}
            >
              {users
                .filter(u => u.id !== 1 && u.role !== 1 && u.roleName !== 'SuperAdmin')
                .filter(u => {
                  if (!userSearchInput.trim()) return true;
                  const q = userSearchInput.trim().toLowerCase();
                  return u.username?.toLowerCase().includes(q) ||
                         u.id.toString().includes(q.replace('#', '')) ||
                         u.fullName?.toLowerCase().includes(q) ||
                         u.companyName?.toLowerCase().includes(q);
                })
                .map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setUserSearchInput(u.username);
                      setUserComboboxOpen(false);
                      setManageErrorMsg('');
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: u.id === selectedUserId ? 700 : 500,
                      color: u.id === selectedUserId ? '#0284c7' : '#0f172a',
                      background: u.id === selectedUserId ? '#f0f9ff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = u.id === selectedUserId ? '#f0f9ff' : 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{u.username}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>• {u.companyName || u.fullName}</span>
                    </div>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      UID: #{u.id}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 2-Step Telecom Service Dropdowns & Action ("jayda dram nhi rhega") */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.3fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Platform / Channel
          </label>
          <select 
            className="form-select"
            style={{ fontSize: '12px', padding: '8px 10px', fontWeight: 700 }}
            value={selectedPlatform}
            onChange={(e) => {
              setSelectedPlatform(e.target.value);
              setManageErrorMsg('');
            }}
          >
            <option value="RCS">RCS SMS</option>
            <option value="SMS">Bulk SMS</option>
            <option value="WHATSAPP">WhatsApp SMS</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Route / Traffic Type
          </label>
          <select 
            className="form-select"
            style={{ fontSize: '12px', padding: '8px 10px', fontWeight: 700 }}
            value={selectedRoute}
            onChange={(e) => {
              setSelectedRoute(e.target.value);
              setManageErrorMsg('');
            }}
          >
            <option value="Transactional">Transactional</option>
            <option value="Promotional">Promotional</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
            Action
          </label>
          <select 
            className="form-select"
            style={{ 
              fontSize: '12px', 
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


      {/* VISUAL HINT & DUAL BALANCE LIMIT BOX */}
      <div style={{
        background: isRevoke ? '#fef2f2' : '#f0fdf4',
        border: `1px solid ${isRevoke ? '#fecaca' : '#bbf7d0'}`,
        borderRadius: '8px',
        padding: '10px 12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '3px solid #10b981' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#166534' }}>
              🟢 Admin Live Gateway Balance
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#15803d', marginTop: 2 }}>
              {adminAvail.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600 }}>{manageServiceType}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#15803d', marginTop: 2 }}>
              Max Credit Limit: <b>{adminAvail.toLocaleString()}</b>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', borderLeft: '3px solid #ef4444' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#991b1b' }}>
              🔵 User Available Balance
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#b91c1c', marginTop: 2 }}>
              {currentUserBalance.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600 }}>{manageServiceType}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#b91c1c', marginTop: 2 }}>
              Max Revoke Limit: <b>{currentUserBalance.toLocaleString()}</b>
            </div>
          </div>
        </div>

        {/* Real-time Hint Text */}
        <div style={{ fontSize: '11px', color: isRevoke ? '#991b1b' : '#166534', marginTop: 6, fontWeight: 600 }}>
          💡 <b>Hint:</b> {isRevoke 
            ? `User se maximum ${currentUserBalance.toLocaleString()} ${manageServiceType} wapas (revoke) liya ja sakta hai.`
            : `Admin gateway balance me se maximum ${adminAvail.toLocaleString()} ${manageServiceType} hi transfer/credit ho sakta hai.`
          }
        </div>

        {/* Validation Errors */}
        {hasExceededAdminBalance && (
          <div style={{ marginTop: 6, padding: '5px 8px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#dc2626', fontSize: '11px', fontWeight: 800 }}>
            ❌ Limit Exceeded: Admin ke paas sirf {adminAvail.toLocaleString()} {manageServiceType} balance hai. Maximum credit limit {adminAvail.toLocaleString()} hai!
          </div>
        )}

        {hasInsufficientBalance && (
          <div style={{ marginTop: 6, padding: '5px 8px', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#dc2626', fontSize: '11px', fontWeight: 800 }}>
            ❌ Limit Exceeded: User ke paas sirf {currentUserBalance.toLocaleString()} {manageServiceType} balance hai. Maximum revoke limit {currentUserBalance.toLocaleString()} hai!
          </div>
        )}
      </div>

      {/* ROW: CURRENT USER BALANCE & CREDIT/DEBIT AMOUNT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: '#64748b' }}>
            User Balance in {manageServiceType}
          </label>
          <input 
            type="text" 
            className="form-input" 
            value={`${currentUserBalance.toLocaleString()} ${manageServiceType}`}
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

        <div>
          <label className="form-label" style={{ fontWeight: 700, fontSize: '12px', color: isRevoke ? '#dc2626' : '#059669' }}>
            {isRevoke ? 'Debit Amount (Deduct)' : 'Credit Amount (Transfer)'}
          </label>
          <input 
            type="number" 
            className="form-input" 
            style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              padding: '8px 10px',
              borderColor: (hasExceededAdminBalance || hasInsufficientBalance) ? '#ef4444' : (isRevoke ? '#f87171' : '#86efac')
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

      {/* Rate & Total Value */}
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

      {/* Smart Presets */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Presets:</span>
        {[10, 25, 50, 85, 100].map(amt => {
          const isExceeded = !isRevoke && amt > adminAvail;
          return (
            <button 
              key={amt} 
              type="button" 
              disabled={isExceeded}
              className="btn btn-outline btn-sm" 
              style={{ 
                fontSize: '11px', 
                padding: '3px 8px',
                opacity: isExceeded ? 0.4 : 1,
                cursor: isExceeded ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                setManageCredits(amt);
                setManageErrorMsg('');
              }}
            >
              +{amt.toLocaleString()}
            </button>
          );
        })}
        {/* Max Available Button */}
        <button
          type="button"
          className="btn btn-sm"
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            background: isRevoke ? '#fef2f2' : '#ecfdf5',
            color: isRevoke ? '#dc2626' : '#059669',
            border: `1px solid ${isRevoke ? '#fca5a5' : '#86efac'}`,
            fontWeight: 800,
            cursor: 'pointer'
          }}
          onClick={() => {
            const maxVal = isRevoke ? currentUserBalance : adminAvail;
            setManageCredits(maxVal);
            setManageErrorMsg('');
          }}
        >
          ⚡ Max ({isRevoke ? currentUserBalance.toLocaleString() : adminAvail.toLocaleString()})
        </button>
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
            borderColor: (hasExceededAdminBalance || hasInsufficientBalance) ? '#ef4444' : (isRevoke ? '#ef4444' : '#0a66c2'),
            color: (hasExceededAdminBalance || hasInsufficientBalance) ? '#dc2626' : (isRevoke ? '#dc2626' : '#ffffff'),
            background: (hasExceededAdminBalance || hasInsufficientBalance) ? '#fee2e2' : (!isRevoke ? '#0a66c2' : undefined),
            opacity: isActionDisabled ? 0.6 : 1,
            cursor: isActionDisabled ? 'not-allowed' : 'pointer'
          }} 
          disabled={isActionDisabled}
        >
          {manageLoading ? 'Processing...' : (
            hasExceededAdminBalance ? (
              `Cannot Credit (Admin Limit: ${adminAvail.toLocaleString()})`
            ) : hasInsufficientBalance ? (
              `Cannot Debit (User Limit: ${currentUserBalance.toLocaleString()})`
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
      
      {/* 1. TOP BLUE BANNER (MATCHING SUITE STANDARDS) */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '12px 20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
        flexWrap: 'wrap',
        gap: 12
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
            <Wallet size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                RCS Overview & Balance Ledger
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                LIVE RESELLER WALLET
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Manage user balances with full audit logging, gateway sync, and transparent ledger statements
            </p>
          </div>
        </div>

        {/* Live Wallet Balances & Open Modal Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* RCS Live Gateway Live Status */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', display: 'block', fontWeight: 700 }}>
                Live Gateway
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff' }}>RCS Cloud</span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              RCS-T
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.rcsT.toLocaleString()}</span>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              RCS-P
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.rcsP.toLocaleString()}</span>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              BULKSMS-T
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.bulkSmsT.toLocaleString()}</span>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              BULKSMS-P
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.bulkSmsP.toLocaleString()}</span>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              WhatsApp-T
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.whatsAppT.toLocaleString()}</span>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            fontSize: '11px',
            backdropFilter: 'blur(4px)',
            color: '#fff'
          }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', display: 'block', fontWeight: 700 }}>
              WhatsApp-P
            </span>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>{adminBalances.whatsAppP.toLocaleString()}</span>
          </div>

          {/* Dedicated Popup Modal Trigger Button */}
          <button 
            type="button"
            onClick={() => {
              setManageSuccessMsg('');
              setManageErrorMsg('');
              setShowModal(true);
            }}
            style={{ 
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px', 
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
            title="Open Credit / Revoke Popup Modal"
          >
            <Wallet size={15} />
            <span>➕ Credit / Revoke</span>
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

        {/* Right Column: Overall Platform Totals (All Users & Admin) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            border: '1px solid #cbd5e1', 
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            {/* Header & Suite Switcher Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 800, 
                color: '#0f172a', 
                letterSpacing: '0.3px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6 
              }}>
                <Shield size={16} color="#6366f1" />
                <span>Overall Platform Totals (All Users & Admin)</span>
              </div>

              {/* Suite Switcher Tabs */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => setTotalsSuiteTab('RCS')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: totalsSuiteTab === 'RCS' ? '#0284c7' : 'transparent',
                    color: totalsSuiteTab === 'RCS' ? '#ffffff' : '#64748b'
                  }}
                >
                  📱 RCS Suite
                </button>
                <button
                  type="button"
                  onClick={() => setTotalsSuiteTab('SMS')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: totalsSuiteTab === 'SMS' ? '#0284c7' : 'transparent',
                    color: totalsSuiteTab === 'SMS' ? '#ffffff' : '#64748b'
                  }}
                >
                  💬 Bulk SMS
                </button>
                <button
                  type="button"
                  onClick={() => setTotalsSuiteTab('WHATSAPP')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: totalsSuiteTab === 'WHATSAPP' ? '#0284c7' : 'transparent',
                    color: totalsSuiteTab === 'WHATSAPP' ? '#ffffff' : '#64748b'
                  }}
                >
                  🟢 WhatsApp
                </button>
              </div>
            </div>

            {/* 6 Grid Cards for RCS Suite (Exact Match to User Requirement) */}
            {totalsSuiteTab === 'RCS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Row 1: RCS-T (Transactional) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {/* Card 1: Main Balance RCS-T */}
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0284c7' }}></span>
                      Main Balance RCS-T
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {mainRcsT.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>RCS-T</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: 2 }}>Master Transactional Quota</div>
                  </div>

                  {/* Card 2: Current Available Balance RCS-T */}
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                      Current Available Balance RCS-T
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>
                      {availRcsT.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>RCS-T</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#15803d', marginTop: 2 }}>🟢 Live Gateway Available</div>
                  </div>

                  {/* Card 3: Total Revoked / Debited RCS-T */}
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
                      Total Revoked / Debited RCS-T
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>
                      {revokedRcsTStr} <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 700 }}>RCS-T</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#991b1b', marginTop: 2 }}>🔴 Total Debited from Users</div>
                  </div>
                </div>

                {/* Row 2: RCS-P (Promotional) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {/* Card 4: Main Balance RCS-P */}
                  <div style={{ background: '#f5f3ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ fontSize: '10px', color: '#6d28d9', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }}></span>
                      Main Balance RCS-P
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
                      {mainRcsP.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>RCS-P</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: 2 }}>Master Promotional Quota</div>
                  </div>

                  {/* Card 5: Current Available Balance RCS-P */}
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                      Current Available Balance RCS-P
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>
                      {availRcsP.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>RCS-P</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#15803d', marginTop: 2 }}>🟢 Live Gateway Available</div>
                  </div>

                  {/* Card 6: Total Revoked / Debited RCS-P */}
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
                      Total Revoked / Debited RCS-P
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>
                      {revokedRcsPStr} <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 700 }}>RCS-P</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#991b1b', marginTop: 2 }}>🔴 Total Debited from Users</div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk SMS Suite Tab */}
            {totalsSuiteTab === 'SMS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase' }}>Main Balance BULKSMS-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{adminBalances.bulkSmsT.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>SMS</span></div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Current Available BULKSMS-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>{adminBalances.bulkSmsT.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d' }}>SMS</span></div>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}>Total Revoked BULKSMS-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>{bulkTRevoked > 0 ? `-${bulkTRevoked}` : '0'} <span style={{ fontSize: '12px', color: '#b91c1c' }}>SMS</span></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f5f3ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ fontSize: '10px', color: '#6d28d9', fontWeight: 800, textTransform: 'uppercase' }}>Main Balance BULKSMS-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{adminBalances.bulkSmsP.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>SMS</span></div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Current Available BULKSMS-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>{adminBalances.bulkSmsP.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d' }}>SMS</span></div>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}>Total Revoked BULKSMS-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>{bulkPRevoked > 0 ? `-${bulkPRevoked}` : '0'} <span style={{ fontSize: '12px', color: '#b91c1c' }}>SMS</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Suite Tab */}
            {totalsSuiteTab === 'WHATSAPP' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase' }}>Main Balance WhatsApp-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{adminBalances.whatsAppT.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>WA</span></div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Current Available WhatsApp-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>{adminBalances.whatsAppT.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d' }}>WA</span></div>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}>Total Revoked WhatsApp-T</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>{waTRevoked > 0 ? `-${waTRevoked}` : '0'} <span style={{ fontSize: '12px', color: '#b91c1c' }}>WA</span></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#f5f3ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ fontSize: '10px', color: '#6d28d9', fontWeight: 800, textTransform: 'uppercase' }}>Main Balance WhatsApp-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>{adminBalances.whatsAppP.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b' }}>WA</span></div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Current Available WhatsApp-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: 4 }}>{adminBalances.whatsAppP.toLocaleString()} <span style={{ fontSize: '12px', color: '#15803d' }}>WA</span></div>
                  </div>
                  <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 800, textTransform: 'uppercase' }}>Total Revoked WhatsApp-P</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', marginTop: 4 }}>{waPRevoked > 0 ? `-${waPRevoked}` : '0'} <span style={{ fontSize: '12px', color: '#b91c1c' }}>WA</span></div>
                  </div>
                </div>
              </div>
            )}
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

        {/* Live Filter Bar (Combobox + 2-Step Dropdowns + Operation + Date Pickers) */}
        <div style={{ padding: '12px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* User Combobox (Type / Search / Select or All Users) */}
          <div style={{ position: 'relative', width: '220px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 8, color: '#94a3b8' }} />
              <input 
                type="text"
                className="form-input"
                style={{ fontSize: '12px', padding: '6px 26px 6px 26px', fontWeight: 600, height: '34px' }}
                placeholder="Search user (mnaoj, rahul)..."
                value={filterUserSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterUserSearch(val);
                  setFilterUserComboboxOpen(true);
                  if (!val.trim()) {
                    setFilterUserId('');
                  } else {
                    const q = val.trim().toLowerCase().replace('#', '');
                    const matched = users.find(u => 
                      u.username?.toLowerCase() === q ||
                      u.id.toString() === q ||
                      false
                    );
                    if (matched) setFilterUserId(matched.id);
                  }
                }}
                onFocus={() => setFilterUserComboboxOpen(true)}
              />
              {filterUserSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterUserSearch('');
                    setFilterUserId('');
                    setFilterUserComboboxOpen(false);
                  }}
                  style={{ position: 'absolute', right: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Combobox Dropdown */}
            {filterUserComboboxOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #cbd5e1',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 200
                }}
              >
                <div
                  onClick={() => {
                    setFilterUserId('');
                    setFilterUserSearch('');
                    setFilterUserComboboxOpen(false);
                  }}
                  style={{
                    padding: '7px 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: !filterUserId ? 700 : 500,
                    color: !filterUserId ? '#0284c7' : '#0f172a',
                    background: !filterUserId ? '#f0f9ff' : 'transparent',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  👤 <b>All Users (Show All)</b>
                </div>
                {users
                  .filter(u => {
                    if (!filterUserSearch.trim()) return true;
                    const q = filterUserSearch.trim().toLowerCase().replace('#', '');
                    return u.username?.toLowerCase().includes(q) ||
                           u.id.toString().includes(q) ||
                           u.fullName?.toLowerCase().includes(q) ||
                           u.companyName?.toLowerCase().includes(q);
                  })
                  .map(u => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setFilterUserId(u.id);
                        setFilterUserSearch(u.username);
                        setFilterUserComboboxOpen(false);
                      }}
                      style={{
                        padding: '7px 10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: u.id === filterUserId ? 700 : 500,
                        color: u.id === filterUserId ? '#0284c7' : '#0f172a',
                        background: u.id === filterUserId ? '#f0f9ff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{u.username}</span>
                      <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        #{u.id}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 2-Step Telecom Dropdowns (Exact Match to Payment Manage) */}
          {/* Platform / Channel */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '6px 10px', fontWeight: 700, height: '34px' }}
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
            >
              <option value="All">🌐 All Channels</option>
              <option value="RCS">📱 RCS SMS</option>
              <option value="SMS">💬 Bulk SMS</option>
              <option value="WHATSAPP">🟢 WhatsApp SMS</option>
            </select>
          </div>

          {/* Route / Traffic Type */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '6px 10px', fontWeight: 700, height: '34px' }}
              value={filterRoute}
              onChange={(e) => setFilterRoute(e.target.value)}
            >
              <option value="All">🔄 All Routes</option>
              <option value="Transactional">Transactional</option>
              <option value="Promotional">Promotional</option>
            </select>
          </div>

          {/* Operation Filter */}
          <div>
            <select 
              className="form-select"
              style={{ fontSize: '12px', padding: '6px 10px', fontWeight: 700, height: '34px' }}
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
            >
              <option value="All">📋 All Operations</option>
              <option value="Credit">➕ Credits Only (+)</option>
              <option value="Revoke">➖ Revokes Only (-)</option>
              <option value="Usage">📊 Campaign Usage</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>From:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ fontSize: '11px', padding: '5px 6px', height: '34px' }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>To:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ fontSize: '11px', padding: '5px 6px', height: '34px' }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', gap: 3 }}>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '4px 6px', height: '34px' }} onClick={() => handleDatePreset('today')}>Today</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '4px 6px', height: '34px' }} onClick={() => handleDatePreset('last7')}>7 Days</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '4px 6px', height: '34px' }} onClick={() => handleDatePreset('month')}>Month</button>
            <button type="button" className="btn btn-outline btn-sm" style={{ fontSize: '10px', padding: '4px 6px', height: '34px' }} onClick={() => {
              handleDatePreset('clear');
              setFilterUserSearch('');
              setFilterUserId('');
              setFilterPlatform('All');
              setFilterRoute('All');
              setFilterActionType('All');
            }}>Clear All</button>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            style={{ fontSize: '11px', padding: '6px 14px', height: '34px', fontWeight: 800 }}
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
                <th>Balance Before</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                    {ledgerLoading ? 'Loading audit records...' : 'No balance transactions found for the selected filter.'}
                  </td>
                </tr>
              ) : (
                displayedTransactions.map(t => (
                  <tr key={t.id || t.transactionCode}>
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
                      <span className="badge" style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: t.serviceType?.includes('RCS-T') ? '#e0f2fe' :
                                    t.serviceType?.includes('RCS-P') ? '#eff6ff' :
                                    t.serviceType?.includes('BULKSMS-T') ? '#ecfdf5' :
                                    t.serviceType?.includes('BULKSMS-P') ? '#f0fdf4' :
                                    t.serviceType?.includes('WHATSAPP') ? '#dcfce7' : '#f1f5f9',
                        color: t.serviceType?.includes('RCS-T') ? '#0369a1' :
                               t.serviceType?.includes('RCS-P') ? '#1d4ed8' :
                               t.serviceType?.includes('BULKSMS-T') ? '#047857' :
                               t.serviceType?.includes('BULKSMS-P') ? '#15803d' :
                               t.serviceType?.includes('WHATSAPP') ? '#166534' : '#475569',
                        border: `1px solid ${
                          t.serviceType?.includes('RCS-T') ? '#bae6fd' :
                          t.serviceType?.includes('RCS-P') ? '#bfdbfe' :
                          t.serviceType?.includes('BULKSMS-T') ? '#a7f3d0' :
                          t.serviceType?.includes('BULKSMS-P') ? '#bbf7d0' :
                          t.serviceType?.includes('WHATSAPP') ? '#86efac' : '#cbd5e1'
                        }`
                      }}>
                        {t.serviceType || 'RCS-T'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        t.actionType === 'Credit' ? 'badge-success' :
                        t.actionType === 'Revoke' ? 'badge-dnd' : 'badge-cold'
                      }`} style={{ fontSize: '10px' }}>
                        {t.actionType === 'Credit' ? '➕ Credit' :
                         t.actionType === 'Revoke' ? '➖ Revoke' : t.actionType}
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
                      {`₹${Number(t.pricePerCredit || 0).toFixed(4)}`}
                    </td>
                    <td style={{ 
                      fontWeight: 800, 
                      fontSize: '12px', 
                      color: t.actionType === 'Credit' ? '#059669' : (t.actionType === 'Revoke' ? '#dc2626' : '#ea580c') 
                    }}>
                      {`${t.totalAmount < 0 ? '-' : t.totalAmount > 0 ? '+' : ''}₹${Math.abs(t.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <span className="badge badge-subtle">{t.performedByUsername || 'admin'}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.notes}>
                      {t.notes || '-'}
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                      {(t.balanceAfter !== undefined && t.credits !== undefined) ? (t.balanceAfter - t.credits).toLocaleString() : '-'}
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {t.balanceAfter !== undefined ? t.balanceAfter.toLocaleString() : '-'}
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
            width: '500px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={18} color="#4f46e5" />
                <span>Manage User Balance (Credit / Revoke)</span>
              </div>
              <button 
                type="button"
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

      {/* ========================================================================= */}
      {/* UNIFIED CREATE NEW USER POPUP MODAL                                       */}
      {/* ========================================================================= */}
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={(newUser) => {
          fetchUsers();
          if (newUser?.id) {
            setSelectedUserId(newUser.id);
          }
        }}
      />

    </div>
  );
};
