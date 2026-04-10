import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { signOut } from '../../services/auth.service';

const navItems = [
  {
    to: '/',
    label: 'Home',
    end: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/explore',
    label: 'Search',
    end: false,
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    to: '/library',
    label: 'Library',
    end: false,
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    end: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AppLayout() {
  const { profile } = useAuthStore();
  const { role } = useUserStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive display name initial from real profile
  const displayInitial = profile?.full_name?.[0]?.toUpperCase() ?? profile?.username?.[0]?.toUpperCase() ?? '?';

  const authorNavItem = {
    to: '/author',
    label: 'Author',
    end: false,
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  };

  // Show author nav if DB role is AUTHOR or local store role is 'author'
  const isAuthor = profile?.role === 'AUTHOR' || role === 'author';
  const visibleNavItems = isAuthor ? [...navItems, authorNavItem] : navItems;

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="top-header-inner">
          <div className="top-header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Lehkha<span>bu</span>
          </div>
          <div className="top-header-actions">
            <NavLink to="/explore" className="top-header-btn" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </NavLink>

            {/* Avatar with dropdown */}
            <div className="user-menu-wrap">
              <button
                className="top-header-avatar"
                aria-label="User menu"
                onClick={() => setShowUserMenu((s) => !s)}
              >
                {displayInitial}
              </button>

              {showUserMenu && (
                <>
                  <div className="user-menu-backdrop" onClick={() => setShowUserMenu(false)} />
                  <div className="user-menu-dropdown">
                    <div className="user-menu-info">
                      <div className="user-menu-name">{profile?.full_name || profile?.username || 'Reader'}</div>
                      <div className="user-menu-email">{profile?.email}</div>
                    </div>
                    <div className="user-menu-divider" />
                    <button
                      className="user-menu-item"
                      onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </button>
                    <button
                      className="user-menu-item user-menu-item-danger"
                      onClick={handleSignOut}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="app-content"><Outlet /></main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
