import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layers, Plus, Trash2, Edit3, Save, RotateCcw, ArrowUp, ArrowDown, 
  ChevronRight, ChevronDown, Check, X, Sliders, Globe, Server, 
  ShieldCheck, Hash, MessageSquare, Send, MousePointer, BarChart3, 
  Bot, FileCode, PlusCircle, Calendar, PieChart, Database, Wallet, 
  Code, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Key, 
  ExternalLink, Move
} from 'lucide-react';

const ICON_OPTIONS = [
  { name: 'LayoutDashboard', label: 'Dashboard', icon: Layers },
  { name: 'MessageSquare', label: 'Chat / RCS', icon: MessageSquare },
  { name: 'Send', label: 'SMS / Send', icon: Send },
  { name: 'MousePointer', label: 'Clicker', icon: MousePointer },
  { name: 'Zap', label: 'Gateway / Telco', icon: Sliders },
  { name: 'Server', label: 'Server / SMPP', icon: Server },
  { name: 'Globe', label: 'Domain / CNAME', icon: Globe },
  { name: 'ShieldCheck', label: 'Security / IP', icon: ShieldCheck },
  { name: 'Hash', label: 'DLT / Hash', icon: Hash },
  { name: 'BarChart3', label: 'Reports', icon: BarChart3 },
  { name: 'PieChart', label: 'Analytics / MIS', icon: PieChart },
  { name: 'Database', label: 'Database', icon: Database },
  { name: 'Wallet', label: 'Billing / Wallet', icon: Wallet },
  { name: 'Bot', label: 'Bots', icon: Bot },
  { name: 'FileCode', label: 'Templates / Code', icon: FileCode },
  { name: 'Code', label: 'HTTP / API', icon: Code },
  { name: 'Key', label: '2FA / Security', icon: Key },
  { name: 'HelpCircle', label: 'Help / Support', icon: HelpCircle },
  { name: 'Sliders', label: 'Settings', icon: Sliders }
];

const getIconComponent = (iconName) => {
  const match = ICON_OPTIONS.find(i => i.name.toLowerCase() === (iconName || '').toLowerCase());
  return match ? match.icon : Layers;
};

export function MenuManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menus, setMenus] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [expandedParents, setExpandedParents] = useState({});

  // Modal State for Add / Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetParentId, setTargetParentId] = useState(null); // null = top level parent, string = sub-menu under parent
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    menuKey: '',
    routePath: '',
    icon: 'Layers',
    sortOrder: 1,
    isActive: true,
    badgeText: '',
    badgeColor: '#22c55e'
  });

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/DynamicMenus/tree');
      if (res.data.success) {
        setMenus(res.data.menus || []);
        // Expand all parents by default for easy visual editing
        const exp = {};
        (res.data.menus || []).forEach(m => { exp[m.id] = true; });
        setExpandedParents(exp);
      }
    } catch (err) {
      console.error('Failed to load menu tree:', err);
      setSaveError('Failed to load dynamic menus from backend.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Modal to Add Parent Menu
  const handleOpenAddParent = () => {
    setIsEditMode(false);
    setTargetParentId(null);
    setEditingId(null);
    setForm({
      title: '',
      menuKey: '',
      routePath: '/custom',
      icon: 'Layers',
      sortOrder: menus.length + 1,
      isActive: true,
      badgeText: '',
      badgeColor: '#22c55e'
    });
    setShowModal(true);
  };

  // Open Modal to Add Submenu under specific parent
  const handleOpenAddSubmenu = (parent) => {
    setIsEditMode(false);
    setTargetParentId(parent.id);
    setEditingId(null);
    const subCount = parent.SubMenus ? parent.SubMenus.length : (parent.subMenus ? parent.subMenus.length : 0);
    setForm({
      title: '',
      menuKey: '',
      routePath: `${parent.routePath || '/custom'}/sub`,
      icon: 'ChevronRight',
      sortOrder: subCount + 1,
      isActive: true,
      badgeText: '',
      badgeColor: '#22c55e'
    });
    setShowModal(true);
  };

  // Open Modal to Edit Existing Menu/Submenu
  const handleOpenEdit = (item, parentId = null) => {
    setIsEditMode(true);
    setTargetParentId(parentId);
    setEditingId(item.id);
    setForm({
      title: item.title,
      menuKey: item.menuKey,
      routePath: item.routePath || '',
      icon: item.icon || 'Layers',
      sortOrder: item.sortOrder || 1,
      isActive: item.isActive !== false,
      badgeText: item.badgeText || '',
      badgeColor: item.badgeColor || '#22c55e'
    });
    setShowModal(true);
  };

  // Save Modal Form (In Memory Tree)
  const handleModalSubmit = (e) => {
    e.preventDefault();
    const updatedTree = JSON.parse(JSON.stringify(menus));

    if (isEditMode) {
      // Edit existing
      if (!targetParentId) {
        // Top level parent
        const idx = updatedTree.findIndex(m => m.id === editingId);
        if (idx !== -1) {
          updatedTree[idx] = { ...updatedTree[idx], ...form };
        }
      } else {
        // Submenu
        const parent = updatedTree.find(m => m.id === targetParentId);
        if (parent) {
          const subs = parent.subMenus || parent.SubMenus || [];
          const subIdx = subs.findIndex(s => s.id === editingId);
          if (subIdx !== -1) {
            subs[subIdx] = { ...subs[subIdx], ...form };
          }
        }
      }
    } else {
      // Create new
      const newId = 'menu-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newItem = {
        id: newId,
        ...form,
        parentId: targetParentId,
        subMenus: []
      };

      if (!targetParentId) {
        updatedTree.push(newItem);
      } else {
        const parent = updatedTree.find(m => m.id === targetParentId);
        if (parent) {
          if (!parent.subMenus && !parent.SubMenus) parent.subMenus = [];
          const list = parent.subMenus || parent.SubMenus;
          list.push(newItem);
        }
      }
    }

    setMenus(updatedTree);
    setShowModal(false);
    setSaveSuccess('Menu updated in visual tree. Click "Save Menu Tree" to persist permanently.');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  // Delete Menu or Submenu
  const handleDelete = (id, parentId = null) => {
    if (!window.confirm('Are you sure you want to remove this menu item?')) return;
    const updatedTree = JSON.parse(JSON.stringify(menus));

    if (!parentId) {
      const filtered = updatedTree.filter(m => m.id !== id);
      setMenus(filtered);
    } else {
      const parent = updatedTree.find(m => m.id === parentId);
      if (parent) {
        const subs = parent.subMenus || parent.SubMenus || [];
        parent.subMenus = subs.filter(s => s.id !== id);
        parent.SubMenus = parent.subMenus;
      }
      setMenus(updatedTree);
    }
  };

  // Move Menu Up / Down
  const handleMoveParent = (index, direction) => {
    const updatedTree = [...menus];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updatedTree.length) return;

    const temp = updatedTree[index];
    updatedTree[index] = updatedTree[targetIdx];
    updatedTree[targetIdx] = temp;

    // Refresh sortOrder
    updatedTree.forEach((m, idx) => { m.sortOrder = idx + 1; });
    setMenus(updatedTree);
  };

  const handleMoveSub = (parentIndex, subIndex, direction) => {
    const updatedTree = JSON.parse(JSON.stringify(menus));
    const parent = updatedTree[parentIndex];
    const subs = parent.subMenus || parent.SubMenus || [];
    const targetIdx = subIndex + direction;
    if (targetIdx < 0 || targetIdx >= subs.length) return;

    const temp = subs[subIndex];
    subs[subIndex] = subs[targetIdx];
    subs[targetIdx] = temp;

    subs.forEach((s, idx) => { s.sortOrder = idx + 1; });
    parent.subMenus = subs;
    parent.SubMenus = subs;

    setMenus(updatedTree);
  };

  // Toggle Active Status
  const handleToggleActive = (item, parentId = null) => {
    const updatedTree = JSON.parse(JSON.stringify(menus));
    if (!parentId) {
      const parent = updatedTree.find(m => m.id === item.id);
      if (parent) parent.isActive = !parent.isActive;
    } else {
      const parent = updatedTree.find(m => m.id === parentId);
      if (parent) {
        const subs = parent.subMenus || parent.SubMenus || [];
        const sub = subs.find(s => s.id === item.id);
        if (sub) sub.isActive = !sub.isActive;
      }
    }
    setMenus(updatedTree);
  };

  // Save Full Tree to Backend API
  const handleSaveTree = async () => {
    try {
      setSaving(true);
      setSaveError('');
      const res = await axios.post('/api/DynamicMenus/save-tree', {
        menus: menus
      });

      if (res.data.success) {
        setSaveSuccess('100% Dynamic Menu Tree saved successfully! Sidebar is updated live.');
        // Trigger global event so Sidebar updates immediately without full page reload
        window.dispatchEvent(new Event('lead_mgmt_menus_updated'));
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save menu tree.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all menus and submenus to standard telecom defaults? Any custom menus will be reset.')) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/DynamicMenus/reset-defaults');
      if (res.data.success) {
        setMenus(res.data.menus || []);
        window.dispatchEvent(new Event('lead_mgmt_menus_updated'));
        setSaveSuccess('Menus reset to standard telecom defaults.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError('Failed to reset menus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Sleek Enterprise Blue Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
        borderRadius: '12px',
        padding: '14px 22px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Sliders size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
                Dynamic Menu & Sub-Menu Management Hub
              </h1>
              <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.4px' }}>
                100% DYNAMIC & REAL-TIME
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Create parent menu categories, add submenus, customize icons, re-order navigation, and bind target routes.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenAddParent}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
            }}
          >
            <Plus size={15} /> Add Parent Category
          </button>

          <button
            onClick={handleSaveTree}
            disabled={saving}
            style={{
              background: '#22c55e',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
            }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Menu Tree
          </button>

          <button
            onClick={handleResetDefaults}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#15803d', fontWeight: 700, fontSize: '13.5px' }}>
          <CheckCircle2 size={20} /> {saveSuccess}
        </div>
      )}
      {saveError && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', fontWeight: 700, fontSize: '13.5px' }}>
          <AlertCircle size={20} /> {saveError}
        </div>
      )}

      {/* Dynamic Menu Tree Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {menus.map((parent, pIdx) => {
          const ParentIcon = getIconComponent(parent.icon);
          const isExpanded = expandedParents[parent.id] !== false;
          const subMenus = parent.subMenus || parent.SubMenus || [];

          return (
            <div 
              key={parent.id} 
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Parent Category Header Row */}
              <div style={{
                background: '#f8fafc',
                borderBottom: isExpanded && subMenus.length > 0 ? '1px solid #e2e8f0' : 'none',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => toggleExpand(parent.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', display: 'flex', alignItems: 'center' }}
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ParentIcon size={18} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                        {parent.title}
                      </span>
                      {parent.badgeText && (
                        <span style={{ background: parent.badgeColor || '#22c55e', color: '#fff', fontSize: '9.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          {parent.badgeText}
                        </span>
                      )}
                      {!parent.isActive && (
                        <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '9.5px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                          DISABLED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <span>Key: <code style={{ color: '#0284c7' }}>{parent.menuKey}</code></span>
                      <span>Route: <code style={{ color: '#475569' }}>{parent.routePath || '—'}</code></span>
                      <span>Submenus: <strong style={{ color: '#0f172a' }}>{subMenus.length}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Parent Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleOpenAddSubmenu(parent)}
                    style={{
                      background: '#e0f2fe',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} /> Add Submenu
                  </button>

                  <button
                    onClick={() => handleMoveParent(pIdx, -1)}
                    disabled={pIdx === 0}
                    title="Move Up"
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: pIdx === 0 ? 'not-allowed' : 'pointer', color: pIdx === 0 ? '#cbd5e1' : '#475569' }}
                  >
                    <ArrowUp size={13} />
                  </button>

                  <button
                    onClick={() => handleMoveParent(pIdx, 1)}
                    disabled={pIdx === menus.length - 1}
                    title="Move Down"
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: pIdx === menus.length - 1 ? 'not-allowed' : 'pointer', color: pIdx === menus.length - 1 ? '#cbd5e1' : '#475569' }}
                  >
                    <ArrowDown size={13} />
                  </button>

                  <button
                    onClick={() => handleToggleActive(parent)}
                    title={parent.isActive ? 'Disable Menu' : 'Enable Menu'}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: parent.isActive ? '1px solid #86efac' : '1px solid #cbd5e1',
                      background: parent.isActive ? '#f0fdf4' : '#f8fafc',
                      color: parent.isActive ? '#15803d' : '#64748b',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {parent.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(parent)}
                    title="Edit Category"
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(parent.id)}
                    title="Delete Category"
                    style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Submenus List */}
              {isExpanded && subMenus.length > 0 && (
                <div style={{ padding: '10px 18px 14px 44px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subMenus.map((sub, sIdx) => {
                    const SubIcon = getIconComponent(sub.icon);

                    return (
                      <div
                        key={sub.id || sIdx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '6px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SubIcon size={14} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                              {sub.title}
                              {!sub.isActive && (
                                <span style={{ marginLeft: 6, background: '#fee2e2', color: '#991b1b', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '3px' }}>
                                  OFF
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              Route: <code style={{ color: '#0284c7' }}>{sub.routePath || '—'}</code> • Key: <code>{sub.menuKey}</code>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleMoveSub(pIdx, sIdx, -1)}
                            disabled={sIdx === 0}
                            title="Move Up"
                            style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: sIdx === 0 ? 'not-allowed' : 'pointer', color: sIdx === 0 ? '#cbd5e1' : '#475569' }}
                          >
                            <ArrowUp size={12} />
                          </button>

                          <button
                            onClick={() => handleMoveSub(pIdx, sIdx, 1)}
                            disabled={sIdx === subMenus.length - 1}
                            title="Move Down"
                            style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: sIdx === subMenus.length - 1 ? 'not-allowed' : 'pointer', color: sIdx === subMenus.length - 1 ? '#cbd5e1' : '#475569' }}
                          >
                            <ArrowDown size={12} />
                          </button>

                          <button
                            onClick={() => handleToggleActive(sub, parent.id)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: sub.isActive ? '1px solid #86efac' : '1px solid #cbd5e1',
                              background: sub.isActive ? '#f0fdf4' : '#fff',
                              color: sub.isActive ? '#15803d' : '#64748b',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {sub.isActive ? 'Active' : 'Off'}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(sub, parent.id)}
                            style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#475569' }}
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            onClick={() => handleDelete(sub.id, parent.id)}
                            style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#dc2626' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Menu Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#ffffff', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {isEditMode ? 'Edit Menu Item' : (targetParentId ? 'Add New Sub-Menu' : 'Add New Parent Category')}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleModalSubmit} style={{ padding: '22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Menu Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WHATSAPP BOX"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Menu Key (Navigation ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WHATSAPP_BOX"
                    value={form.menuKey}
                    onChange={e => setForm({ ...form, menuKey: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Route URL Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /whatsapp"
                    value={form.routePath}
                    onChange={e => setForm({ ...form, routePath: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Choose Icon
                  </label>
                  <select
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label} ({opt.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW or PRO"
                    value={form.badgeText}
                    onChange={e => setForm({ ...form, badgeText: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="menuActive"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="menuActive" style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                  Enable Menu in Sidebar (Active)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  {isEditMode ? 'Update Item' : 'Add to Tree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
