import { useState, useRef, useEffect } from 'react';
import { Save, Eye, EyeOff, Sliders, Layout, Type, Palette, Bell, Shield, ImageIcon, Upload } from 'lucide-react';
import { defaultUISettings } from '../../store/mockData';
import type { UISettings } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { uploadFeaturesBg, fetchAppSettings } from '../../services/settings.service';
import type { AppSettings } from '../../services/settings.service';

// ── Toggle Row ──────────────────────────────────────────────────
function ToggleRow({
  label, description, value, onChange, id
}: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 'var(--space-md)', padding: '14px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <button className={`toggle${value ? ' on' : ''}`} onClick={() => onChange(!value)} id={id}>
        <div className="toggle-thumb" style={{ transform: value ? 'translateX(18px)' : 'none' }} />
      </button>
    </div>
  );
}

// ── Input Row ────────────────────────────────────────────────────
function InputRow({
  label, description, value, onChange, type = 'text', id
}: {
  label: string; description?: string; value: string | number;
  onChange: (v: string) => void; type?: string; id: string
}) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
          {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{description}</div>}
        </div>
        <input
          type={type}
          id={id}
          className="form-control"
          style={{ width: 240, flexShrink: 0 }}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────
function SectionHead({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color: 'var(--color-gold)' }} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  );
}

export default function UISettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<UISettings>(defaultUISettings);
  const [previewMode, setPreviewMode] = useState(false);

  // Features BG state
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [bgUploading, setBgUploading] = useState(false);
  const [bgPreviewUrl, setBgPreviewUrl] = useState<string | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Load existing app settings on mount
  useEffect(() => {
    fetchAppSettings()
      .then((s) => {
        setAppSettings(s);
        setBgPreviewUrl(s.features_bg_image_url);
      })
      .catch(console.error);
  }, []);

  function update<K extends keyof UISettings>(key: K, value: UISettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function save() {
    addToast('UI settings saved and applied to user frontend!', 'success');
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBgUploading(true);
    try {
      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setBgPreviewUrl(localUrl);

      const publicUrl = await uploadFeaturesBg(file);
      setBgPreviewUrl(publicUrl);
      setAppSettings(prev => prev ? { ...prev, features_bg_image_url: publicUrl } : prev);
      addToast('Features background image updated successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
      // Revert preview on error
      setBgPreviewUrl(appSettings?.features_bg_image_url ?? null);
    } finally {
      setBgUploading(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>User UI Control</h1>
            <p>Manage what users see on the Lehkhabu reader app — banners, text, features and toggles.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => setPreviewMode(v => !v)} id="preview-toggle-btn">
              {previewMode ? <EyeOff size={15} /> : <Eye size={15} />}
              {previewMode ? 'Hide Preview' : 'Preview'}
            </button>
            <button className="btn btn-primary" onClick={save} id="save-ui-settings-btn">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Banner */}
      {previewMode && (
        <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-gold)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--color-gold), var(--color-purple))' }} />
            <div style={{ fontSize: '0.72rem', color: 'var(--color-gold)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 12 }}>
              📱 User App Preview
            </div>
            {/* Simulated User App Header */}
            <div style={{ background: '#FDF6EC', borderRadius: 'var(--radius-md)', padding: 'var(--space-lg)', color: '#1A1A1A', boxShadow: 'var(--shadow-md)' }}>
              {settings.announcementBannerActive && settings.announcementBannerText && (
                <div style={{ background: '#F5A623', color: '#fff', padding: '8px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 12, fontSize: '0.82rem', fontWeight: 500 }}>
                  📣 {settings.announcementBannerText}
                </div>
              )}
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#C17817', marginBottom: 4 }}>
                {settings.homeHeroText || 'Your Mizo Reading Universe'}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: 16 }}>
                {settings.homeSubText || 'Discover books written by your favourite Mizo authors.'}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                {settings.featuredSectionTitle || 'Featured Picks'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#C17817', '#4F8EF7', '#34D399'].map((c, i) => (
                  <div key={i} style={{ width: 44, height: 62, borderRadius: '3px 6px 6px 3px', background: c, boxShadow: '2px 2px 6px rgba(0,0,0,0.2)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 'var(--space-md)' }}>

        {/* Features Background Image */}
        <div className="section-card animate-fade-in-up stagger-1">
          <SectionHead icon={ImageIcon} title="Features Section Background" sub="Upload an image with overlay for the Featured Books section" />
          <div style={{ padding: 'var(--space-lg)' }}>
            <div
              className="features-bg-upload-zone"
              onClick={() => !bgUploading && bgInputRef.current?.click()}
              style={{ cursor: bgUploading ? 'not-allowed' : 'pointer' }}
              id="features-bg-drop-zone"
            >
              <input
                ref={bgInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBgUpload}
                style={{ display: 'none' }}
                disabled={bgUploading}
              />
              {bgUploading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--color-gold)' }}>
                  <div style={{ width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Uploading and compressing…
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <Upload size={28} />
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {bgPreviewUrl ? 'Click to replace image' : 'Click to upload background image'}
                  </div>
                  <div style={{ fontSize: '0.78rem' }}>JPEG, PNG or WebP · Max 20MB · Will be compressed to WebP</div>
                </div>
              )}
            </div>
            {bgPreviewUrl && (
              <div style={{ marginTop: 'var(--space-md)', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={bgPreviewUrl} alt="Features background preview" className="features-bg-preview" />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(26,26,26,0.55)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    Preview with overlay
                  </span>
                </div>
              </div>
            )}
            <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              The image is automatically compressed and cached. Changes appear on the user app immediately.
            </div>
          </div>
        </div>

        {/* Hero & Branding */}
        <div className="section-card animate-fade-in-up stagger-2">
          <SectionHead icon={Type} title="Hero & Branding" sub="Control the main landing text and featured section labels" />
          <div style={{ padding: '0 var(--space-lg)' }}>
            <InputRow id="hero-text" label="Hero Tagline" description="Main headline shown on the home screen"
              value={settings.homeHeroText} onChange={v => update('homeHeroText', v)} />
            <InputRow id="hero-sub" label="Hero Subtext" description="Subtitle/description below the tagline"
              value={settings.homeSubText} onChange={v => update('homeSubText', v)} />
            <InputRow id="featured-title" label="Featured Section Title" description="Title shown above the featured books grid"
              value={settings.featuredSectionTitle} onChange={v => update('featuredSectionTitle', v)} />
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="section-card animate-fade-in-up stagger-2">
          <SectionHead icon={Bell} title="Announcement Banner" sub="A banner strip shown at the top of the user app" />
          <div style={{ padding: '0 var(--space-lg)' }}>
            <ToggleRow id="ann-banner-active" label="Enable Announcement Banner"
              description="Show a banner strip to all users at the top of the app"
              value={settings.announcementBannerActive} onChange={v => update('announcementBannerActive', v)} />
            {settings.announcementBannerActive && (
              <InputRow id="ann-banner-text" label="Banner Message"
                description="Text displayed in the announcement banner"
                value={settings.announcementBannerText} onChange={v => update('announcementBannerText', v)} />
            )}
          </div>
        </div>

        {/* Layout Controls */}
        <div className="section-card animate-fade-in-up stagger-3">
          <SectionHead icon={Layout} title="Layout & Sections" sub="Control which UI sections are shown to users" />
          <div style={{ padding: '0 var(--space-lg)' }}>
            <ToggleRow id="hero-banner-enabled" label="Hero Banner Section"
              description="Show the visual banner on the home page"
              value={settings.heroBannerEnabled} onChange={v => update('heroBannerEnabled', v)} />
            <ToggleRow id="new-books-highlight" label="New Arrivals Section"
              description="Highlight recently added books on the home page"
              value={settings.newBooksHighlight} onChange={v => update('newBooksHighlight', v)} />
          </div>
        </div>

        {/* Platform Controls */}
        <div className="section-card animate-fade-in-up stagger-4">
          <SectionHead icon={Sliders} title="Platform Controls" sub="Functional toggles affecting user behavior" />
          <div style={{ padding: '0 var(--space-lg)' }}>
            <ToggleRow id="allow-registrations" label="Allow New Registrations"
              description="New users can create accounts on the platform"
              value={settings.allowRegistrations} onChange={v => update('allowRegistrations', v)} />
            <ToggleRow id="maintenance-mode" label="Maintenance Mode"
              description="Temporarily disable access to the user app with a maintenance page"
              value={settings.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
            <InputRow id="max-books" label="Max Books Per Library" type="number"
              description="Maximum number of books a user can own in their library"
              value={settings.maxBooksPerUser} onChange={v => update('maxBooksPerUser', parseInt(v) || 0)} />
          </div>
        </div>

        {/* Commerce */}
        <div className="section-card animate-fade-in-up stagger-5">
          <SectionHead icon={Palette} title="Commerce Settings" sub="Pricing, currency and platform revenue share" />
          <div style={{ padding: '0 var(--space-lg)' }}>
            <InputRow id="currency" label="Default Currency" description="Currency displayed to users (e.g. INR, USD)"
              value={settings.defaultCurrency} onChange={v => update('defaultCurrency', v)} />
            <InputRow id="platform-fee" label="Platform Fee %" type="number"
              description="Percentage of each sale kept by Lehkhabu before paying authors"
              value={settings.platformFeePercent} onChange={v => update('platformFeePercent', parseFloat(v) || 0)} />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="section-card animate-fade-in-up stagger-6" style={{ borderColor: 'rgba(248,113,113,0.2)' }}>
          <SectionHead icon={Shield} title="Danger Zone" sub="Irreversible or high-impact actions" />
          <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {[
                { label: 'Clear All User Sessions', sub: 'Force all users to log in again', id: 'clear-sessions-btn' },
                { label: 'Reset UI to Defaults', sub: 'Revert all settings above to factory defaults', id: 'reset-ui-btn' },
              ].map(action => (
                <div key={action.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--color-red-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-red)' }}>{action.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.sub}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" id={action.id}
                    onClick={() => addToast(`${action.label} executed.`, 'error')}>
                    Execute
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div style={{
        position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'flex-end',
        marginTop: 'var(--space-lg)'
      }}>
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-full)', padding: '10px 20px',
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(12px)'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Unsaved changes</span>
          <button className="btn btn-primary" onClick={save} id="save-ui-sticky-btn" style={{ borderRadius: 'var(--radius-full)' }}>
            <Save size={14} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
