import { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, UserCheck, BarChart3,
  Settings, Bell, Search, Menu, X, LogOut, ChevronDown,
  Megaphone, ShoppingCart, Star, Sliders, ClipboardList
} from 'lucide-react';
import { mockApplications } from '../../store/mockData';
import '../../App.css';

// ── Toast Context ──────────────────────────────────────────────
interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }
interface ToastCtx { addToast: (msg: string, type?: Toast['type']) => void; }
export const ToastContext = createContext<ToastCtx>({ addToast: () => {} });

export function useToast() { return useContext(ToastContext); }

// ── Nav Items ──────────────────────────────────────────────────
const pendingAppsCount = mockApplications.filter(a => a.status === 'pending').length;

const mainNav = [
  { to: '/',              label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/books',         label: 'Books',        icon: BookOpen,       badge: 2 },
  { to: '/authors',       label: 'Authors',      icon: Star },
  { to: '/users',         label: 'Users',        icon: Users },
  { to: '/applications',  label: 'Applications', icon: ClipboardList,  badge: pendingAppsCount || undefined },
  { to: '/orders',        label: 'Orders',       icon: ShoppingCart },
  { to: '/analytics',     label: 'Analytics',    icon: BarChart3 },
];
const managementNav = [
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/ui-settings',   label: 'User UI Control', icon: Sliders },
  { to: '/settings',      label: 'Settings',         icon: Settings },
];

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className={`sidebar-mobile-overlay show`} onClick={onClose} />}
      <aside className={`admin-sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BookOpen size={18} />
          </div>
          <span className="sidebar-logo-text">Lehkhabu</span>
          <span className="sidebar-logo-badge">ADMIN</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main</span>
          {mainNav.map(item => {
            const Icon = item.icon;
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge ? <span className="nav-link-badge">{item.badge}</span> : null}
              </NavLink>
            );
          })}

          <span className="sidebar-section-label" style={{ marginTop: 12 }}>Management</span>
          {managementNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm avatar-gold" style={{ fontSize: '0.78rem' }}>A</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Ringsenvy</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
            <ChevronDown size={14} className="sidebar-user-chevron" />
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Top Bar ────────────────────────────────────────────────────
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/books': 'Books',
    '/authors': 'Authors',
    '/users': 'Users',
    '/applications': 'Author Applications',
    '/orders': 'Orders',
    '/analytics': 'Analytics',
    '/announcements': 'Announcements',
    '/ui-settings': 'User UI Control',
    '/settings': 'Platform Settings',
  };
  const title = pageTitles[location.pathname] || 'Admin';

  useEffect(() => {
    const handler = () => setNotifOpen(false);
    if (notifOpen) document.addEventListener('click', handler, { once: true });
    return () => document.removeEventListener('click', handler);
  }, [notifOpen]);

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="btn-icon hide-desktop" onClick={onMenuClick} id="sidebar-toggle-btn">
          <Menu size={18} />
        </button>
        <div>
          <div className="topbar-page-title">{title}</div>
          <div className="topbar-breadcrumb hide-mobile">
            Admin <span>›</span> <span style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-search hide-mobile">
          <div className="search-box">
            <Search />
            <input className="search-input" placeholder="Quick search…" style={{ width: 200 }} />
          </div>
        </div>
        <div className="dropdown" style={{ position: 'relative' }} onClick={e => { e.stopPropagation(); setNotifOpen(v => !v); }}>
          <button className="notification-btn" id="notif-btn">
            <Bell size={17} />
            <span className="notif-dot" />
          </button>
          {notifOpen && (
            <div className="dropdown-menu" style={{ width: 300 }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '8px 12px 6px', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Notifications</div>
              {[
                { msg: '2 books pending review', time: '5m ago', color: 'var(--color-orange)' },
                { msg: 'New order from Mimi Chhangte', time: '1h ago', color: 'var(--color-green)' },
                { msg: 'Author Thanchhunga appealed rejection', time: '3h ago', color: 'var(--color-red)' },
              ].map((n, i) => (
                <div key={i} className="dropdown-item" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.msg}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-ghost btn-sm" id="topbar-signout-btn" style={{ gap: 6 }}>
          <LogOut size={15} />
          <span className="hide-mobile">Sign out</span>
        </button>
      </div>
    </header>
  );
}

// ── Toast Component ────────────────────────────────────────────
function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
          <div className="toast-icon">
            {t.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke={`var(--color-green)`} strokeWidth={2.5}><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            {t.type === 'error' && <svg viewBox="0 0 24 24" fill="none" stroke={`var(--color-red)`} strokeWidth={2.5}><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            {t.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke={`var(--color-blue)`} strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" strokeLinecap="round"/></svg>}
          </div>
          <span style={{ fontSize: '0.875rem' }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}><X size={14}/></button>
        </div>
      ))}
    </div>
  );
}

// ── Main Admin Layout ──────────────────────────────────────────
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="admin-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="admin-main">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <div className="admin-page">
            <Outlet />
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} remove={removeToast} />
    </ToastContext.Provider>
  );
}
