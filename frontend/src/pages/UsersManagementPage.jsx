import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  Search
} from 'lucide-react';

export const UsersManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Users & Resellers Hierarchy</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Manage subordinates, allocate dynamic service menus, and set wallet credits
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Parent Account</th>
                <th>Active Menus</th>
                <th>Voice Balance</th>
                <th>WhatsApp Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading accounts...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No subordinate accounts found. Click "Create New Account" to add one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username} • {u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 1 || u.role === 'SuperAdmin' ? 'badge-hot' :
                        u.role === 2 || u.role === 'Admin' ? 'badge-warm' :
                        u.role === 3 || u.role === 'Reseller' ? 'badge-dnd' : 'badge-cold'
                      }`}>
                        {u.roleName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {u.parentUserName || 'SuperAdmin'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {u.allowedMenusCount} Services Enabled
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{u.voiceCredits}</td>
                    <td style={{ fontWeight: 600 }}>{u.whatsAppCredits}</td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(u)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-cold">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Assign Menus Checkbox Modal Button */}
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenPermissions(u)}
                          title="Assign Dynamic Menus & Services"
                        >
                          <CheckSquare size={13} />
                          <span>Assign Menus</span>
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

      {/* CREATE NEW ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Create Subordinate Account</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name / Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required
                    placeholder="Rohan Sharma"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="rohan_tele"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <select 
                      className="form-select"
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      {currentUser?.role === 1 && <option value="2">Admin</option>}
                      {(currentUser?.role === 1 || currentUser?.role === 2) && <option value="3">Reseller</option>}
                      <option value="4">User / Telecaller</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required
                      placeholder="rohan@example.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      required
                      placeholder="••••••••"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="9876543210"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
