import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import './ProfilePage.css';

interface PublicProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  profile_bg_url: string | null;
  bio: string | null;
  role: string;
  social_links: Record<string, string> | null;
  is_public_library: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile } = useAuthStore();
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats (only if is_public_library is true)
  const [stats, setStats] = useState({ read: 0, reading: 0, want: 0 });

  const handleShare = async () => {
    if (!profile) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name || profile.username}'s Lehkhabu Profile`,
          url: url
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(url);
      alert('Profile link copied to clipboard!');
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, username, full_name, avatar_url, profile_bg_url, bio, role, social_links, is_public_library, created_at, followers_count, following_count')
          .eq('username', username)
          .single();

        if (userError || !user) throw new Error('User not found.');

        setProfile(user);

        if (user.is_public_library) {
          // Fetch public bookshelf counts
          const { data: shelfData } = await supabase
            .from('shelf_entries')
            .select('shelf')
            .eq('user_id', user.id);

          if (shelfData) {
            setStats({
              read: shelfData.filter((s: { shelf: string }) => s.shelf === 'READ').length,
              reading: shelfData.filter((s: { shelf: string }) => s.shelf === 'READING').length,
              want: shelfData.filter((s: { shelf: string }) => s.shelf === 'WANT_TO_READ').length,
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="page auth-loading-wrapper">
        <div className="auth-init-spinner" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Profile Not Found</h2>
        <p>{error || 'The user you are looking for does not exist.'}</p>
        <button className="settings-save-btn" onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>Go Back</button>
      </div>
    );
  }

  const isSelf = currentUserProfile?.username === profile.username;

  return (
    <div className="page modern-profile-page">
      {/* ── Header ────────────────────────────────────────────── */}
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
            {profile.role === 'AUTHOR' && <div className="avatar-author-badge">✍️</div>}
          </div>
          
          <div className="profile-header-info">
            <h1 className="profile-name">{profile.full_name || profile.username}</h1>
            <div className="profile-handle">@{profile.username}</div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            {profile.social_links?.twitter && (
              <a href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" style={{color: 'var(--text-secondary)'}}>
                𝕏 {profile.social_links.twitter}
              </a>
            )}
            {profile.social_links?.instagram && (
              <a href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{color: 'var(--text-secondary)'}}>
                📸 {profile.social_links.instagram}
              </a>
            )}
            {profile.social_links?.website && (
              <a href={profile.social_links.website} target="_blank" rel="noreferrer" style={{color: 'var(--text-secondary)'}}>
                🌐 Website
              </a>
            )}
          </div>

          {isSelf && (
            <button className="settings-save-btn" onClick={() => navigate('/profile/settings/profile')} style={{ padding: '8px 16px', marginTop: '16px' }}>
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="profile-sections-wrapper">
        {/* ── Library View ───────────────────────────────────────── */}
        {profile.is_public_library ? (
          <div>
            <h2 className="menu-group-title">Public Library</h2>
            <div className="profile-stats-grid" style={{ marginTop: '16px' }}>
              <div className="stat-card">
                <div className="stat-icon book-read-icon">📗</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.read}</div>
                  <div className="stat-label">Read</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon book-reading-icon">📖</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.reading}</div>
                  <div className="stat-label">Reading</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon book-want-icon">🔖</div>
                <div className="stat-info">
                  <div className="stat-number">{stats.want}</div>
                  <div className="stat-label">Want to Read</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="settings-card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            🔒 {profile.username}'s library is private.
          </div>
        )}
      </div>
    </div>
  );
}
