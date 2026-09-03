import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Layers, 
  Search, 
  RefreshCw, 
  FolderPlus, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const MenuManagementPage = () => {
  const { user } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // ALL, PARENT, SUBMENU

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'ADD' | 'EDIT' | null
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [deleteConfirmMenu, setDeleteConfirmMenu] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    menuKey: '',
    serviceCode: 'RCS',
    parentMenuId: '',
    routePath: '',
    sortOrder: 1,
    isActive: true,
    icon: 'fa-layer-group'
  });

  const availableServices = [
    { code: 'DASHBOARD', label: 'Dashboard' },
    { code: 'VOICE', label: 'Voice OBD Calls' },
    { code: 'RCS', label: 'RCS Messaging' },
    { code: 'WHATSAPP', label: 'WhatsApp Messaging' },
    { code: 'SMS', label: 'SMS Gateway' },
    { code: 'LEADS_CRM', label: 'Leads CRM' },
    { code: 'USER_MANAGEMENT', label: 'User Management' },
    { code: 'REPORTS', label: 'Reports & Analytics' }
  ];

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/Menus/all');
      setMenus(res.data || []);
    } catch (err) {
      console.error('Failed to load master menus', err);
      setErrorMsg('Failed to load menus from server.');
    } finally {
      setLoading(false);
    }
  };

  // Get list of parent menus (where parentMenuId is null)
  const parentMenus = menus.filter(m => !m.parentMenuId);

  const openAddModal = () => {
    setFormData({
      title: '',
      menuKey: '',
      serviceCode: 'RCS',
      parentMenuId: '',
      routePath: '/rcs/custom',
      sortOrder: 1,
      isActive: true,
      icon: 'fa-circle'
    });
    setModalMode('ADD');
    setErrorMsg('');
  };

  const openEditModal = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      title: menu.title,
      menuKey: menu.menuKey,
      serviceCode: menu.serviceCode,
      parentMenuId: menu.parentMenuId ? String(menu.parentMenuId) : '',
      routePath: menu.routePath,
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      icon: menu.icon || 'fa-circle'
    });
    setModalMode('EDIT');
    setErrorMsg('');
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.menuKey || !formData.routePath) {
      setErrorMsg('Please enter Title, Menu Key, and Route Path.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        title: formData.title.trim(),
        menuKey: formData.menuKey.trim().toUpperCase(),
        serviceCode: formData.serviceCode.trim().toUpperCase(),
        parentMenuId: formData.parentMenuId ? parseInt(formData.parentMenuId) : null,
        routePath: formData.routePath.trim(),
        sortOrder: parseInt(formData.sortOrder) || 0,
        isActive: formData.isActive,
        icon: formData.icon?.trim() || 'fa-circle'
      };

      if (modalMode === 'ADD') {
        await api.post('/Menus', payload);
        setSuccessMsg(`Menu "${formData.title}" created successfully!`);
      } else if (modalMode === 'EDIT' && selectedMenu) {
        await api.put(`/Menus/${selectedMenu.id}`, payload);
        setSuccessMsg(`Menu "${formData.title}" updated successfully!`);
      }

      setModalMode(null);
      fetchMenus();

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error saving menu', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save menu changes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMenu = async () => {
    if (!deleteConfirmMenu) return;
    try {
      setSubmitting(true);
      await api.delete(`/Menus/${deleteConfirmMenu.id}`);
      setSuccessMsg(`Menu "${deleteConfirmMenu.title}" deleted.`);
      setDeleteConfirmMenu(null);
      fetchMenus();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error deleting menu', err);
      alert(err.response?.data?.message || 'Failed to delete menu. It may have child submenus.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (menu) => {
    try {
      const payload = {
        title: menu.title,
        menuKey: menu.menuKey,
        serviceCode: menu.serviceCode,
        parentMenuId: menu.parentMenuId,
        routePath: menu.routePath,
        sortOrder: menu.sortOrder,
        isActive: !menu.isActive,
        icon: menu.icon
      };
      await api.put(`/Menus/${menu.id}`, payload);
      setMenus(prev => prev.map(m => m.id === menu.id ? { ...m, isActive: !m.isActive } : m));
    } catch (err) {
      alert('Failed to toggle menu status.');
    }
  };

  // Filtered menus
  const filteredMenus = menus.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.menuKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.routePath.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService = filterService === 'ALL' || m.serviceCode === filterService;
    const matchesType = 
      filterType === 'ALL' ? true :
      filterType === 'PARENT' ? !m.parentMenuId :
      filterType === 'SUBMENU' ? !!m.parentMenuId : true;

    return matchesSearch && matchesService && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Dynamic Menu Management & Configuration
            </h2>
            <span className="badge badge-primary" style={{ fontSize: '11px', fontWeight: 700 }}>
              SuperAdmin Control
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: 4 }}>
            Create new parent categories or submenus, reorder navigation hierarchy, and dynamically change menu names & linked pages.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={openAddModal}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={15} />
            <span>Add New Menu</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline"
            onClick={fetchMenus}
            style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #0a66c2' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Master Menus</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginTop: 4 }}>{menus.length}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Registered in Database</div>
        </div>

        <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parent Categories</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: 4 }}>{parentMenus.length}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Top-Level Services</div>
        </div>

        <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submenus / Pages</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>{menus.length - parentMenus.length}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Nested Dynamic Sub-items</div>
        </div>

        <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Menus</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>{menus.filter(m => m.isActive).length}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Currently Visible</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', margin: 0 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by Menu Title, Key (e.g. RCS_CAMPAIGNS), or Route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', borderRadius: '24px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
          </div>

          {/* Service Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Service:</span>
            <select 
              className="form-select" 
              style={{ fontSize: '12.5px', padding: '6px 12px', borderRadius: '20px', width: 'auto' }}
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="ALL">All Services</option>
              {availableServices.map(s => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Type:</span>
            <select 
              className="form-select" 
              style={{ fontSize: '12.5px', padding: '6px 12px', borderRadius: '20px', width: 'auto' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Levels</option>
              <option value="PARENT">Parent Categories Only</option>
              <option value="SUBMENU">Submenus Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menus Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', margin: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
            Registered Dynamic Menus ({filteredMenus.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Changes sync dynamically to user permission matrices and sidebars
          </span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Menu Name (Title)</th>
                <th>Menu Key</th>
                <th>Parent Category</th>
                <th>Service Code</th>
                <th>Linked Route / Dynamic Page</th>
                <th style={{ textAlign: 'center' }}>Sort</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    {loading ? 'Loading menus...' : 'No menus matched your search criteria.'}
                  </td>
                </tr>
              ) : (
                filteredMenus.map(m => {
                  const parentObj = menus.find(p => p.id === m.parentMenuId);
                  const isParent = !m.parentMenuId;

                  return (
                    <tr key={m.id} style={{ background: isParent ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ fontWeight: 700, color: '#64748b', fontSize: '12px' }}>#{m.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isParent ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: 22, 
                              height: 22, 
                              borderRadius: 4, 
                              background: '#e0f2fe', 
                              color: '#0a66c2', 
                              fontSize: '11px',
                              fontWeight: 800
                            }}>
                              📁
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', marginLeft: 8 }}>↳</span>
                          )}
                          <span style={{ fontWeight: isParent ? 800 : 600, color: isParent ? '#0a66c2' : '#1e293b', fontSize: '13.5px' }}>
                            {m.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <code style={{ 
                          background: '#f1f5f9', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11.5px', 
                          color: '#0f172a',
                          fontWeight: 600
                        }}>
                          {m.menuKey}
                        </code>
                      </td>
                      <td>
                        {parentObj ? (
                          <span className="badge badge-cold" style={{ fontSize: '11px' }}>
                            {parentObj.title}
                          </span>
                        ) : (
                          <span className="badge badge-primary" style={{ fontSize: '10.5px', fontWeight: 700 }}>
                            Root Category
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          {m.serviceCode}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                          {m.routePath}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#1e293b' }}>
                        {m.sortOrder}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(m)}
                          style={{
                            background: m.isActive ? '#ecfdf5' : '#f1f5f9',
                            color: m.isActive ? '#059669' : '#94a3b8',
                            border: `1px solid ${m.isActive ? '#a7f3d0' : '#e2e8f0'}`,
                            borderRadius: '12px',
                            padding: '2px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {m.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => openEditModal(m)}
                            title="Edit Menu Name, Key or Linked Page"
                            style={{ padding: '4px 10px' }}
                          >
                            <Edit3 size={13} color="#0a66c2" />
                            <span>Edit</span>
                          </button>

                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => setDeleteConfirmMenu(m)}
                            title="Delete Menu"
                            style={{ padding: '4px 8px', borderColor: '#fecaca', color: '#dc2626' }}
                          >
                            <Trash2 size={13} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MENU MODAL */}
      {modalMode && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px', width: '100%' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: '#e0f2fe',
                  color: '#0a66c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {modalMode === 'ADD' ? <FolderPlus size={20} /> : <Edit3 size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                    {modalMode === 'ADD' ? 'Add New Dynamic Menu' : `Edit Menu: ${selectedMenu?.title}`}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Configure menu name, key, service category, and linked dynamic page route.
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMenu}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {errorMsg && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    {errorMsg}
                  </div>
                )}

                {/* ROW 1: Menu Title (Name) */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Menu Name / Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. RCS Live Tracker, Custom Voice Report"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>This is the display title seen by users in the navigation sidebar.</span>
                </div>

                {/* ROW 2: Menu Key & Service Code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Menu Key (Unique ID) *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. RCS_LIVE_TRACKER"
                      value={formData.menuKey}
                      onChange={(e) => setFormData({ ...formData, menuKey: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Service Category *</label>
                    <select 
                      className="form-select"
                      value={formData.serviceCode}
                      onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
                    >
                      {availableServices.map(s => (
                        <option key={s.code} value={s.code}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ROW 3: Parent Category Selection */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Parent Menu (Optional)</label>
                  <select 
                    className="form-select"
                    value={formData.parentMenuId}
                    onChange={(e) => setFormData({ ...formData, parentMenuId: e.target.value })}
                  >
                    <option value="">None (Top-Level Parent Category)</option>
                    {parentMenus.filter(p => p.id !== selectedMenu?.id).map(p => (
                      <option key={p.id} value={p.id}>
                        📁 {p.title} ({p.serviceCode})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Select a parent if this is a submenu item under an existing service.</span>
                </div>

                {/* ROW 4: Linked Dynamic Route / Page */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Linked Route / Dynamic Page *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. /rcs/custom-tracker, /voice/report"
                    value={formData.routePath}
                    onChange={(e) => setFormData({ ...formData, routePath: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>The frontend route path or page identifier mapped to this menu.</span>
                </div>

                {/* ROW 5: Sort Order & Is Active */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700 }}>Sort Order</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    />
                  </div>

                  <div style={{ paddingTop: '22px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: '#0a66c2' }}
                      />
                      <span>Active & Visible in Sidebar</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#f8fafc' }}>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setModalMode(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ fontWeight: 700 }}
                >
                  {submitting ? 'Saving...' : (modalMode === 'ADD' ? 'Create Dynamic Menu' : 'Save Changes')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmMenu && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <AlertCircle size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
                Delete Menu?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Are you sure you want to delete <b>"{deleteConfirmMenu.title}"</b> (#{deleteConfirmMenu.id})? 
                This will also remove it from all user permission matrices.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setDeleteConfirmMenu(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ flex: 1, fontWeight: 700 }}
                onClick={handleDeleteMenu}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

