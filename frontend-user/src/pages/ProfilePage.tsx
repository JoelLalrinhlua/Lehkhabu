import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useBooksStore } from '../store/booksStore';
import { signOut } from '../services/auth.service';
import { uploadAvatar, updateUserProfile } from '../services/profile.service';
import { useRef, useState } from 'react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, loadProfile } = useAuthStore();
  const { role, applicationStatus } = useUserStore();
  const { shelf, purchases } = useBooksStore();

  const isAuthor = profile?.role === 'AUTHOR' || role === 'author';

  // Shelf counts from real data
  const readCount = shelf.filter((s) => s.shelf === 'READ').length;
  const readingCount = shelf.filter((s) => s.shelf === 'READING').length;
  const wantCount = shelf.filter((s) => s.shelf === 'WANT_TO_READ').length;
  const purchaseCount = purchases.length;

  // Avatar upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleAvatarClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    setUploadError(null);
    try {
      const avatarUrl = await uploadAvatar(profile.id, file);
      await updateUserProfile(profile.id, { avatar_url: avatarUrl });
      // Reload profile to reflect new avatar
      if (profile.supabase_uid) await loadProfile(profile.supabase_uid);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startEdit = () => {
    setEditName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    setSaveError(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!profile) return;
    if (!editName.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateUserProfile(profile.id, {
        full_name: editName.trim(),
        bio: editBio.trim() || undefined,
      });
      if (profile.supabase_uid) await loadProfile(profile.supabase_uid);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="auth-init-spinner" />
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  });

  const daysLeft = Math.ceil(
    (new Date(new Date().getFullYear(), 11, 31).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="page">

      {/* ── Profile Header ───────────────────────────────────── */}
      <div className="profile-header">
        {/* Decorative book stack */}
        <div className="profile-book-stack">
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #E8A87C, #D4632E)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #85C1E9, #2E86C1)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #A9DFBF, #1E8449)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #F9E79F, #D4AC0D)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #D7BDE2, #7D3C98)' }} />
        </div>

        {/* Avatar with upload */}
        <div className="profile-avatar-wrap" onClick={handleAvatarClick} title="Change profile picture" role="button" tabIndex={0} aria-label="Change profile picture">
          {uploading && (
            <div className="profile-avatar-overlay">
              <div className="auth-init-spinner" style={{ width: 24, height: 24 }} />
            </div>
          )}
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
          {!uploading && (
            <div className="profile-avatar-edit-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                <path d="M12 20h9" strokeLinecap="round" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
          aria-label="Upload profile picture"
        />
        {uploadError && <div className="profile-upload-error">{uploadError}</div>}

        {/* Name / handle */}
        {!editing ? (
          <>
            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
            <div className="profile-handle">@{profile.username}</div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <button className="profile-edit-btn" onClick={startEdit}>Edit Profile</button>
          </>
        ) : (
          <div className="profile-edit-form">
            <input
              className="profile-edit-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              maxLength={80}
            />
            <textarea
              className="profile-edit-textarea"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Bio (optional)"
              rows={3}
              maxLength={300}
            />
            {saveError && <div className="profile-upload-error">{saveError}</div>}
            <div className="profile-edit-actions">
              <button className="profile-edit-cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
              <button className="profile-edit-save" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {isAuthor && (
          <div className="profile-role-badge">✍️ Author</div>
        )}
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">{readCount}</div>
          <div className="stat-label">Read</div>
        </div>
        <div className="stat-item stat-item-divider">
          <div className="stat-number">{readingCount}</div>
          <div className="stat-label">Reading</div>
        </div>
        <div className="stat-item stat-item-divider">
          <div className="stat-number">{wantCount}</div>
          <div className="stat-label">Want to Read</div>
        </div>
        <div className="stat-item stat-item-divider">
          <div className="stat-number">{purchaseCount}</div>
          <div className="stat-label">Purchased</div>
        </div>
      </div>

      {/* ── Bookshelves ──────────────────────────────────────── */}
      <div className="profile-section">
        <h2 className="profile-section-title">Your Bookshelves</h2>
        <div className="bookshelves-grid">
          <button className="bookshelf-card bookshelf-read" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📗</div>
            <div className="bookshelf-name">Read</div>
            <div className="bookshelf-count">({readCount})</div>
          </button>
          <button className="bookshelf-card bookshelf-want" onClick={() => navigate('/explore')}>
            <div className="bookshelf-icon">🔖</div>
            <div className="bookshelf-name">Want to Read</div>
            <div className="bookshelf-count">({wantCount})</div>
          </button>
          <button className="bookshelf-card bookshelf-reading" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📖</div>
            <div className="bookshelf-name">Currently Reading</div>
            <div className="bookshelf-count">({readingCount})</div>
          </button>
        </div>
      </div>

      {/* ── Reading Challenge ─────────────────────────────────── */}
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
                <div
                  className="challenge-fill"
                  style={{ width: `${Math.min(100, (readCount / 12) * 100)}%` }}
                />
              </div>
              <div className="challenge-stats">
                <span>{readCount} of 12 books</span>
                <span>{daysLeft} days left</span>
              </div>
            </div>
            <button className="challenge-edit" onClick={() => {}}>
              {readCount >= 12 ? '🎉 Goal Reached!' : 'Set Reading Goal'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Author / Application section ─────────────────────── */}
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

      {/* ── Account section ──────────────────────────────────── */}
      <div className="profile-section">
        <h2 className="profile-section-title">Account</h2>
        <div className="profile-account-card">
          <div className="profile-account-row">
            <span className="profile-account-label">Email</span>
            <span className="profile-account-value">{profile.email}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Username</span>
            <span className="profile-account-value">@{profile.username}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Member since</span>
            <span className="profile-account-value">{memberSince}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Email verified</span>
            <span className="profile-account-value" style={{ color: profile.is_email_verified ? 'var(--color-success)' : 'var(--color-gray-500)' }}>
              {profile.is_email_verified ? '✓ Verified' : 'Not verified'}
            </span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Role</span>
            <span className="profile-account-value">{profile.role}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Following</span>
            <span className="profile-account-value">{profile.following_count}</span>
          </div>
          <div className="profile-account-row">
            <span className="profile-account-label">Followers</span>
            <span className="profile-account-value">{profile.followers_count}</span>
          </div>
        </div>

        <button
          className="profile-signout-btn"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
