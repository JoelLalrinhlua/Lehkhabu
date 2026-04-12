import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useBooksStore } from '../store/booksStore';
import { signOut } from '../services/auth.service';
import { useState } from 'react';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { role, applicationStatus } = useUserStore();
  const { shelf, purchases } = useBooksStore();

  const isAuthor = profile?.role === 'AUTHOR' || role === 'author';

  // Shelf counts
  const readCount = shelf.filter((s) => s.shelf === 'READ').length;
  const readingCount = shelf.filter((s) => s.shelf === 'READING').length;
  const wantCount = shelf.filter((s) => s.shelf === 'WANT_TO_READ').length;
  const purchaseCount = purchases.length;

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      window.location.href = '/auth';
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Lehkhabu Profile`,
          url: url
        });
      } catch (err) {
        // Handle cancel seamlessly
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Profile link copied to clipboard!');
    }
  };

  if (!profile) {
    return (
      <div className="page auth-loading-wrapper">
        <div className="auth-init-spinner" />
      </div>
    );
  }

  const daysLeft = Math.ceil(
    (new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  const readingGoal = 12; // Example static goal, could be dynamic

  return (
    <div className="page modern-profile-page">
      
      {/* ── Modern Profile Header ────────────────────────────── */}
      <div className="modern-profile-header">
        <div 
          className="profile-header-bg"
          style={profile.profile_bg_url ? {
            backgroundImage: `url(${profile.profile_bg_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : undefined}
        >
          {!profile.profile_bg_url && (
            <>
              <div className="header-blob bg-blob-1"></div>
              <div className="header-blob bg-blob-2"></div>
            </>
          )}

          {/* Share Button Overlay */}
          <button className="cover-share-btn" onClick={handleShare} aria-label="Share Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
        
        <div className="profile-header-content">
          <div className="profile-header-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {isAuthor && <div className="avatar-author-badge">✍️</div>}
          </div>
          
          <div className="profile-header-info">
            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
            <div className="profile-handle">@{profile.username}</div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────── */}
      <div className="profile-stats-grid">
        <div className="stat-card" onClick={() => navigate('/library')}>
          <div className="stat-icon book-read-icon">📗</div>
          <div className="stat-info">
            <div className="stat-number">{readCount}</div>
            <div className="stat-label">Read</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/library')}>
          <div className="stat-icon book-reading-icon">📖</div>
          <div className="stat-info">
            <div className="stat-number">{readingCount}</div>
            <div className="stat-label">Reading</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/library')}>
          <div className="stat-icon book-want-icon">🔖</div>
          <div className="stat-info">
            <div className="stat-number">{wantCount}</div>
            <div className="stat-label">Want to Read</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/library')}>
          <div className="stat-icon book-purchased-icon">🛍️</div>
          <div className="stat-info">
            <div className="stat-number">{purchaseCount}</div>
            <div className="stat-label">Purchased</div>
          </div>
        </div>
      </div>

      <div className="profile-sections-wrapper">
        
        {/* ── Application / Author Card ──────────────────────── */}
        <div className="profile-section">
          {isAuthor ? (
            <div className="action-card action-author" onClick={() => navigate('/author')}>
              <div className="action-card-bg"></div>
              <div className="action-card-content">
                <div className="action-card-icon">✍️</div>
                <div className="action-card-text">
                  <h3>Author Dashboard</h3>
                  <p>Manage your published books and track lifetime earnings</p>
                </div>
                <div className="action-card-arrow">→</div>
              </div>
            </div>
          ) : applicationStatus === 'pending' ? (
             <div className="action-card action-pending" onClick={() => navigate('/apply')}>
               <div className="action-card-content">
                 <div className="action-card-icon">⏳</div>
                 <div className="action-card-text">
                   <h3>Application Pending</h3>
                   <p>Our team is currently reviewing your author submission</p>
                 </div>
                 <div className="action-card-arrow">→</div>
               </div>
             </div>
          ) : applicationStatus === 'rejected' ? (
             <div className="action-card action-rejected" onClick={() => navigate('/apply')}>
               <div className="action-card-content">
                 <div className="action-card-icon">❌</div>
                 <div className="action-card-text">
                   <h3>Application Not Approved</h3>
                   <p>Tap here to revise your details and reapply to become an author</p>
                 </div>
                 <div className="action-card-arrow">→</div>
               </div>
             </div>
          ) : (
             <div className="action-card action-apply" onClick={() => navigate('/apply')}>
               <div className="action-card-content">
                 <div className="action-card-icon">🌟</div>
                 <div className="action-card-text">
                   <h3>Become an Author</h3>
                   <p>Share your stories with the exclusive Mizo reader community</p>
                 </div>
                 <div className="action-card-arrow">→</div>
               </div>
             </div>
          )}
        </div>

        {/* ── Settings Menu ──────────────────────────────────── */}
        <div className="profile-menu-group">
          <h2 className="menu-group-title">Settings</h2>
          <div className="menu-list">
            
            <button className="menu-item" onClick={() => navigate('/profile/settings/profile')}>
              <div className="menu-item-icon profile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="menu-item-content">
                <div className="menu-item-title">Profile Settings</div>
                <div className="menu-item-sub">Change name, bio, and avatar</div>
              </div>
              <div className="menu-item-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <button className="menu-item" onClick={() => navigate('/profile/settings/account')}>
              <div className="menu-item-icon account-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="menu-item-content">
                <div className="menu-item-title">Account Settings</div>
                <div className="menu-item-sub">Email, username, and security</div>
              </div>
              <div className="menu-item-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

          </div>
        </div>
        
        {/* ── Reading Challenge ──────────────────────────────── */}
        <div className="profile-menu-group">
          <h2 className="menu-group-title">Activity</h2>
          <div className="menu-list">
            
            <div className="reading-challenge-widget">
              <div className="rc-header">
                <div className="rc-title-wrap">
                  <span className="rc-icon">🎯</span>
                  <div className="rc-title">
                    <h4>{new Date().getFullYear()} Reading Challenge</h4>
                    <p>{readCount} of {readingGoal} books read</p>
                  </div>
                </div>
                <div className="rc-days-left">{daysLeft} days left</div>
              </div>
              <div className="rc-progress-bar">
                <div 
                  className="rc-progress-fill" 
                  style={{ width: `${Math.min(100, (readCount / readingGoal) * 100)}%` }}
                ></div>
              </div>
            </div>
            
          </div>
        </div>

        {/* ── Sign Out ────────────────────────────────────────── */}
        <div className="profile-signout-wrapper" style={{ marginTop: '24px', padding: '0 16px 32px' }}>
          <button
            className="settings-signout-btn"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#ececec', color: '#e74c3c', fontWeight: '600', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>

      </div>
    </div>
  );
}
