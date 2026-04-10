import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { signOut } from '../services/auth.service';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { role, applicationStatus } = useUserStore();

  const isAuthor = profile?.role === 'AUTHOR' || role === 'author';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  if (!profile) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="auth-init-spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-book-stack">
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #E8A87C, #D4632E)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #85C1E9, #2E86C1)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #A9DFBF, #1E8449)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #F9E79F, #D4AC0D)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #D7BDE2, #7D3C98)' }} />
        </div>

        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="profile-avatar profile-avatar-img"
          />
        ) : (
          <div className="profile-avatar">
            {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        <h1 className="profile-name">{profile.full_name || profile.username}</h1>
        <div className="profile-handle">@{profile.username}</div>

        {profile.bio && (
          <p className="profile-bio">{profile.bio}</p>
        )}

        {isAuthor && (
          <div className="profile-role-badge">✍️ Author</div>
        )}
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">0</div>
          <div className="stat-label">Total Read</div>
        </div>
        <div className="stat-item stat-item-divider">
          <div className="stat-number">{profile.following_count}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{profile.followers_count}</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>

      {/* Bookshelves */}
      <div className="profile-section">
        <h2 className="profile-section-title">Your Bookshelves</h2>
        <div className="bookshelves-grid">
          <button className="bookshelf-card bookshelf-read" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📗</div>
            <div className="bookshelf-name">Read</div>
            <div className="bookshelf-count">(0)</div>
          </button>
          <button className="bookshelf-card bookshelf-want" onClick={() => navigate('/explore')}>
            <div className="bookshelf-icon">🔖</div>
            <div className="bookshelf-name">Want to Read</div>
            <div className="bookshelf-count">(0)</div>
          </button>
          <button className="bookshelf-card bookshelf-reading" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📖</div>
            <div className="bookshelf-name">Currently Reading</div>
            <div className="bookshelf-count">(0)</div>
          </button>
        </div>
      </div>

      {/* Reading Challenge */}
      <div className="profile-section">
        <div className="challenge-card">
          <h2 className="challenge-title">{new Date().getFullYear()} Reading Challenge</h2>
          <div className="challenge-content">
            <div className="challenge-icon">📚</div>
            <div className="challenge-text">
              Set a reading goal for this year and track your progress!
            </div>
            <div className="challenge-progress">
              <div className="challenge-bar">
                <div className="challenge-fill" style={{ width: '0%' }} />
              </div>
              <div className="challenge-stats">
                <span>0 of 12 books</span>
                <span>
                  {Math.ceil(
                    (new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days left
                </span>
              </div>
            </div>
            <button className="challenge-edit" onClick={() => {}}>
              Set Reading Goal
            </button>
          </div>
        </div>
      </div>

      {/* Author / Application section */}
      <div className="profile-section">
        {isAuthor ? (
          <div
            className="author-promo-card author-promo-approved"
            onClick={() => navigate('/author')}
            style={{ cursor: 'pointer' }}
          >
            <div className="author-promo-icon">✍️</div>
            <div className="author-promo-body">
              <div className="author-promo-title">Author Dashboard</div>
              <div className="author-promo-sub">Manage your books and track earnings</div>
            </div>
            <div className="author-promo-arrow">→</div>
          </div>
        ) : applicationStatus === 'pending' ? (
          <div
            className="author-promo-card author-promo-pending"
            onClick={() => navigate('/apply')}
            style={{ cursor: 'pointer' }}
          >
            <div className="author-promo-icon">⏳</div>
            <div className="author-promo-body">
              <div className="author-promo-title">Application Pending</div>
              <div className="author-promo-sub">Our team is reviewing your submission</div>
            </div>
            <div className="author-promo-arrow">→</div>
          </div>
        ) : applicationStatus === 'rejected' ? (
          <div
            className="author-promo-card author-promo-rejected"
            onClick={() => navigate('/apply')}
            style={{ cursor: 'pointer' }}
          >
            <div className="author-promo-icon">❌</div>
            <div className="author-promo-body">
              <div className="author-promo-title">Application Not Approved</div>
              <div className="author-promo-sub">Tap to revise and reapply</div>
            </div>
            <div className="author-promo-arrow">→</div>
          </div>
        ) : (
          <div
            className="author-promo-card author-promo-default"
            onClick={() => navigate('/apply')}
            style={{ cursor: 'pointer' }}
          >
            <div className="author-promo-icon">✍️</div>
            <div className="author-promo-body">
              <div className="author-promo-title">Become an Author</div>
              <div className="author-promo-sub">Share your stories with the Mizo community</div>
            </div>
            <div className="author-promo-arrow">→</div>
          </div>
        )}
      </div>

      {/* Account section */}
      <div className="profile-section">
        <h2 className="profile-section-title">Account</h2>
        <div className="profile-account-card">
          <div className="profile-account-row">
            <span className="profile-account-label">Email</span>
            <span className="profile-account-value">{profile.email}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Member since</span>
            <span className="profile-account-value">
              {new Date(profile.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
        </div>
        <button className="profile-signout-btn" onClick={handleSignOut}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
