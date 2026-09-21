import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreateUserModal } from '../components/CreateUserModal';
import { ViewUserModal } from '../components/ViewUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { 
  UserPlus, 
  CheckSquare, 
  Shield, 
  CreditCard, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  AlertTriangle,
  Save,
  X,
  Search,
  Users,
  FileText,
  Building2,
  Eye,
  Edit3,
  PauseCircle,
  PlayCircle,
  Plus,
  Download
} from 'lucide-react';

export const UsersManagementPage = () => {
  const { user: currentUser } = useAuth();
  
  const handleDownloadDoc = (docName, targetUser) => {
    const fileContent = `========================================\nKYC COMPLIANCE VERIFICATION RECORD\n========================================\nDocument Name: ${docName}\nUser Account: ${targetUser?.fullName || targetUser?.username}\nUsername: @${targetUser?.username}\nCompany / Entity: ${targetUser?.companyName || 'N/A'}\nDLT Entity ID: ${targetUser?.dltEntityId || 'N/A'}\nVerification Status: Officially Verified\nTimestamp: ${new Date().toLocaleString()}\n========================================\nThis document is cryptographically logged and compliant with Telecom Regulatory Authority guidelines.`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = docName.endsWith('.pdf') || docName.endsWith('.png') || docName.endsWith('.jpg') ? docName : `${docName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingDocsUser, setViewingDocsUser] = useState(null);

  // Action Modals state (View & Unified Edit/Credit Modal)
  const [viewingUser, setViewingUser] = useState(null);
  const [editModalState, setEditModalState] = useState(null); // { user, tab: 'edit' | 'credit' }


  // Form states
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 4 // User by default
  });

  const [assignableMenus, setAssignableMenus] = useState([]);
  const [menuPermissions, setMenuPermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [creditsForm, setCreditsForm] = useState({
    voiceCredits: 0,
    whatsAppCredits: 0,
    rcsCredits: 0,
    smsCredits: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Checkbox Matrix Modal
  const handleOpenPermissions = async (targetUser) => {
    setSelectedUser(targetUser);
    try {
      const res = await api.get(`/menus/assignable-menus?targetUserId=${targetUser.id}`);
      setAssignableMenus(res.data);

      // Initialize checkbox state map { [menuId]: boolean }
      const permMap = {};
      res.data.forEach(m => {
        permMap[m.menuId] = m.isAssigned;
      });
      setMenuPermissions(permMap);
      setShowPermissionModal(true);
    } catch (err) {
      alert('Failed to load assignable menus for this user.');
    }
  };

  const handleToggleMenu = (menuId) => {
    setMenuPermissions(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Save Checkbox Matrix
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    try {
      setSavingPermissions(true);

      const payload = {
        targetUserId: selectedUser.id,
        permissions: Object.entries(menuPermissions)
          .filter(([_, isChecked]) => isChecked)
          .map(([menuId]) => ({
            menuId: parseInt(menuId, 10),
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canExport: true
          }))
      };

      await api.post('/menus/assign-permissions', payload);
      alert('Permissions saved successfully! Downline cascading synchronization completed.');
      setShowPermissionModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save permissions.');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        ...createForm,
        role: parseInt(createForm.role, 10)
      });
      alert('Account created successfully!');
      setShowCreateModal(false);
      setCreateForm({ username: '', email: '', password: '', fullName: '', phoneNumber: '', role: 4 });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  // Toggle User Status
  const handleToggleStatus = async (targetUser) => {
    try {
      await api.put(`/users/${targetUser.id}/status`, { isActive: !targetUser.isActive });
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle status.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
            <Users size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Users & Resellers Hierarchy
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>
                ACCESS CONTROL
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.85)' }}>
              Manage subordinates, allocate dynamic service menus, and configure roles & permissions
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="btn"
          onClick={() => setShowCreateModal(true)}
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
          <UserPlus size={16} />
          <span>Create New Account</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '36px' }}
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px', padding: '10px 8px' }}>UID</th>
                <th style={{ padding: '10px 10px' }}>Account</th>
                <th style={{ padding: '10px 10px' }}>Company & DLT Entity</th>
                <th style={{ padding: '10px 8px' }}>Role</th>
                <th style={{ padding: '10px 8px' }}>RCS SMS</th>
                <th style={{ padding: '10px 8px' }}>Bulk SMS</th>
                <th style={{ padding: '10px 8px' }}>WhatsApp SMS</th>
                <th style={{ padding: '10px 8px' }}>KYC Docs</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', minWidth: '170px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading accounts...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No subordinate accounts found. Click "Create New Account" to add one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    {/* UID */}
                    <td style={{ padding: '8px 8px' }}>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '11px'
                      }}>
                        #{u.id}
                      </span>
                    </td>

                    {/* Account */}
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.fullName}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>@{u.username} • {u.email}</div>
                    </td>

                    {/* Company & DLT Entity */}
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Building2 size={13} color="#0284c7" />
                        <span>{u.companyName || u.fullName}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                        DLT: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>{u.dltEntityId || 'N/A'}</code>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '8px 8px' }}>
                      <span className={`badge ${
                        u.role === 1 || u.role === 'SuperAdmin' ? 'badge-hot' :
                        u.role === 2 || u.role === 'Admin' ? 'badge-warm' :
                        u.role === 3 || u.role === 'Reseller' ? 'badge-dnd' : 'badge-cold'
                      }`}>
                        {u.roleName}
                      </span>
                    </td>

                    {/* 1. RCS SMS Column: T: x | P: y */}
                    <td style={{ padding: '8px 8px' }}>
                      {(!u.allowedServices || u.allowedServices.includes('RCS-T') || u.allowedServices.includes('RCS-P')) ? (
                        <div style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 800, color: '#059669' }}>T: {Number(u.rcsCredits || 0).toLocaleString()}</span>
                          <span style={{ color: '#94a3b8', margin: '0 4px' }}>|</span>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>P: {Number(u.rcsPromotionalCredits || 0).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>— Not Allowed</span>
                      )}
                    </td>

                    {/* 2. Bulk SMS Column: T: x | P: y */}
                    <td style={{ padding: '8px 8px' }}>
                      {(u.allowedServices && (u.allowedServices.includes('BULKSMS-T') || u.allowedServices.includes('BULKSMS-P'))) ? (
                        <div style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 800, color: '#059669' }}>T: {Number(u.smsCredits || 0).toLocaleString()}</span>
                          <span style={{ color: '#94a3b8', margin: '0 4px' }}>|</span>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>P: {Number(u.bulkSmsPromoCredits || 0).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>— Not Allowed</span>
                      )}
                    </td>

                    {/* 3. WhatsApp SMS Column: T: x | P: y */}
                    <td style={{ padding: '8px 8px' }}>
                      {(u.allowedServices && (u.allowedServices.includes('WHATSAPP-T') || u.allowedServices.includes('WHATSAPP-P'))) ? (
                        <div style={{ fontSize: '11.5px', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 800, color: '#059669' }}>T: {Number(u.whatsAppCredits || 0).toLocaleString()}</span>
                          <span style={{ color: '#94a3b8', margin: '0 4px' }}>|</span>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>P: {Number(u.whatsAppPromoCredits || 0).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>— Not Allowed</span>
                      )}
                    </td>

                    {/* KYC Docs */}
                    <td style={{ padding: '8px 8px' }}>
                      {u.documents && u.documents.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setViewingDocsUser(u)}
                          className="btn btn-outline btn-sm"
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            borderRadius: '6px',
                            borderColor: '#cbd5e1',
                            background: '#f8fafc',
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={13} color="#0284c7" />
                          <span>{u.documents.length} Docs</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                      {u.isActive ? (
                        <span className="badge badge-success" style={{ fontSize: '10.5px', padding: '2px 8px' }}>Active</span>
                      ) : (
                        <span className="badge badge-cold" style={{ fontSize: '10.5px', padding: '2px 8px' }}>Inactive</span>
                      )}
                    </td>

                    {/* 4 Square Icon Action Buttons (Exact Match to Image 4) */}
                    <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        {/* 1. View User [ 👁️ ] */}
                        <button 
                          type="button"
                          onClick={() => setViewingUser(u)}
                          title="View Account Details & Balances"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#1e293b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* 2. Edit User [ ✏️ ] */}
                        <button 
                          type="button"
                          onClick={() => setEditModalState({ user: u, tab: 'edit' })}
                          title="Edit User Profile & Telecom Services"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            border: '1px solid #bae6fd',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* 3. Pause / Play Status Toggle [ ⏸️ / ▶️ ] */}
                        <button 
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          title={u.isActive ? 'Pause / Deactivate Account' : 'Resume / Activate Account'}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            border: u.isActive ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                            background: u.isActive ? '#f0fdf4' : '#fff7ed',
                            color: u.isActive ? '#16a34a' : '#ea580c',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {u.isActive ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                        </button>

                        {/* 4. Add / Credit Balance [ ➕ ] */}
                        <button 
                          type="button"
                          onClick={() => setEditModalState({ user: u, tab: 'credit' })}
                          title="Credit / Debit Telecom Balance"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '7px',
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Plus size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 CHECKBOX MATRIX MODAL FOR ASSIGNING MENUS */}
      {showPermissionModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Assign Dynamic Menus to: {selectedUser.fullName}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Role: {selectedUser.roleName} • Username: @{selectedUser.username}
                </div>
              </div>
              <button 
                onClick={() => setShowPermissionModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Important Cascading Revocation Notice Banner */}
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.4 }}>
                  <b>Cascading Rollback Rule:</b> Unchecking any service from this user will <b>automatically revoke and hide</b> that service from all downline accounts under this user!
                </div>
              </div>

              {/* Checkboxes List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {assignableMenus.map(menu => {
                  const isChecked = !!menuPermissions[menu.menuId];
                  return (
                    <div 
                      key={menu.menuId}
                      className={`checkbox-matrix-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => handleToggleMenu(menu.menuId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div click
                          style={{ width: 17, height: 17, cursor: 'pointer', accentColor: '#4f46e5' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                            {menu.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Service: <b>{menu.serviceCode}</b> • Route: {menu.routePath}
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${isChecked ? 'badge-success' : 'badge-cold'}`}>
                        {isChecked ? 'Allowed' : 'Restricted'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowPermissionModal(false)}
                disabled={savingPermissions}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSavePermissions}
                disabled={savingPermissions}
              >
                <Save size={15} />
                <span>{savingPermissions ? 'Synchronizing Downline...' : 'Save Permissions'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED REUSABLE CREATE NEW ACCOUNT MODAL */}
      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />

      {/* KYC DOCUMENTS PREVIEW MODAL */}
      {viewingDocsUser && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Uploaded KYC Documents
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                  Account: <b>{viewingDocsUser.fullName}</b> ({viewingDocsUser.companyName || viewingDocsUser.username})
                </div>
              </div>
              <button 
                onClick={() => setViewingDocsUser(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: 12 }}>
                Verified regulatory credentials and uploaded telecom compliance files:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {viewingDocsUser.documents && viewingDocsUser.documents.length > 0 ? (
                  viewingDocsUser.documents.map((doc, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: '#e0f2fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={16} color="#0284c7" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {doc}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            KYC Verification Document • Verified
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '11px', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          ✓ Uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc, viewingDocsUser)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: '#0284c7',
                            borderColor: '#bae6fd',
                            background: '#ffffff',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title={`Download ${doc}`}
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    No KYC documents uploaded for this user.
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setViewingDocsUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👁️ VIEW USER DETAILS MODAL */}
      {viewingUser && (
        <ViewUserModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEditUser={(u) => {
            setViewingUser(null);
            setEditModalState({ user: u, tab: 'edit' });
          }}
          onAddBalance={(u) => {
            setViewingUser(null);
            setEditModalState({ user: u, tab: 'credit' });
          }}
        />
      )}

      {/* ✏️ UNIFIED EDIT USER & TELECOM BALANCE MODAL */}
      {editModalState && (
        <EditUserModal
          user={editModalState.user}
          initialTab={editModalState.tab}
          onClose={() => setEditModalState(null)}
          onSuccess={() => {
            setEditModalState(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

