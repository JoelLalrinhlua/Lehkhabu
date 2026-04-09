import { useState } from 'react';
import { Plus, Megaphone, XCircle, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { mockAnnouncements } from '../../store/mockData';
import type { Announcement } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

const typeStyles: Record<Announcement['type'], { label: string; color: string; dim: string }> = {
  promo:   { label: 'Promo',       color: 'var(--color-gold)',   dim: 'var(--color-gold-dim)' },
  info:    { label: 'Info',        color: 'var(--color-blue)',   dim: 'var(--color-blue-dim)' },
  warning: { label: 'Warning',     color: 'var(--color-orange)', dim: 'var(--color-orange-dim)' },
  update:  { label: 'Update',      color: 'var(--color-green)',  dim: 'var(--color-green-dim)' },
};

const audienceLabel: Record<Announcement['targetAudience'], string> = {
  all:     'All Users',
  premium: 'Premium Users',
  new:     'New Users',
};

const emptyAnn: Omit<Announcement, 'id' | 'createdAt'> = {
  title: '', message: '', type: 'info', active: true,
  targetAudience: 'all', expiresAt: undefined
};

export default function AnnouncementsPage() {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [editAnn, setEditAnn] = useState<Partial<Announcement> | null>(null);
  const [form, setForm] = useState<Omit<Announcement, 'id' | 'createdAt'>>(emptyAnn);

  function openCreate() {
    setEditAnn(null);
    setForm(emptyAnn);
    setShowModal(true);
  }

  function openEdit(ann: Announcement) {
    setEditAnn(ann);
    setForm({ title: ann.title, message: ann.message, type: ann.type, active: ann.active, targetAudience: ann.targetAudience, expiresAt: ann.expiresAt });
    setShowModal(true);
  }

  function save() {
    if (!form.title || !form.message) { addToast('Title and message are required.', 'error'); return; }
    if (editAnn?.id) {
      setAnnouncements(prev => prev.map(a => a.id === editAnn.id ? { ...a, ...form } : a));
      addToast('Announcement updated!', 'success');
    } else {
      const newAnn: Announcement = { id: `ann${Date.now()}`, createdAt: new Date().toISOString(), ...form };
      setAnnouncements(prev => [newAnn, ...prev]);
      addToast('Announcement created!', 'success');
    }
    setShowModal(false);
  }

  function toggleActive(id: string) {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    const ann = announcements.find(a => a.id === id);
    addToast(ann?.active ? 'Announcement hidden.' : 'Announcement published!', 'success');
  }

  function deleteAnn(id: string) {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    addToast('Announcement deleted.', 'error');
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Announcements</h1>
            <p>Create and manage platform-wide announcements shown to users.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openCreate} id="create-announcement-btn">
              <Plus size={16} /> New Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Active count */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        {[
          { label: 'Total', value: announcements.length, color: 'var(--text-primary)' },
          { label: 'Active', value: announcements.filter(a => a.active).length, color: 'var(--color-green)' },
          { label: 'Inactive', value: announcements.filter(a => !a.active).length, color: 'var(--text-muted)' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
        {announcements.length === 0 && (
          <div className="empty-state section-card">
            <Megaphone size={40} />
            <p>No announcements yet. Create one!</p>
          </div>
        )}
        {announcements.map((ann, i) => {
          const ts = typeStyles[ann.type];
          return (
            <div key={ann.id} className={`section-card animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
              style={{ opacity: ann.active ? 1 : 0.6, transition: 'opacity var(--dur-normal)' }}>
              <div className="section-card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                    {/* Type Icon */}
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: ts.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Megaphone size={18} style={{ color: ts.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{ann.title}</h3>
                        <span className="badge" style={{ background: ts.dim, color: ts.color }}>
                          {ts.label}
                        </span>
                        <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                          {audienceLabel[ann.targetAudience]}
                        </span>
                        {!ann.active && (
                          <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Hidden</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{ann.message}</p>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Created {format(new Date(ann.createdAt), 'MMM d, yyyy')}</span>
                        {ann.expiresAt && <span>Expires {format(new Date(ann.expiresAt), 'MMM d, yyyy')}</span>}
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn-icon" title={ann.active ? 'Hide' : 'Publish'}
                      onClick={() => toggleActive(ann.id)} id={`toggle-ann-${ann.id}`}
                      style={{ color: ann.active ? 'var(--color-gold)' : 'var(--text-muted)' }}>
                      {ann.active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button className="btn-icon" title="Edit" onClick={() => openEdit(ann)} id={`edit-ann-${ann.id}`}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn-icon" title="Delete"
                      style={{ background: 'var(--color-red-dim)', color: 'var(--color-red)', border: 'none' }}
                      onClick={() => deleteAnn(ann.id)} id={`delete-ann-${ann.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editAnn ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)} id="close-ann-modal"><XCircle size={16} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" placeholder="Announcement title…"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} id="ann-title-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" placeholder="Write the announcement message…" rows={3}
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                id="ann-message-input" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as Announcement['type'] }))}
                  id="ann-type-select">
                  <option value="info">Info</option>
                  <option value="promo">Promo</option>
                  <option value="warning">Warning</option>
                  <option value="update">Update</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select className="form-control" value={form.targetAudience}
                  onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value as Announcement['targetAudience'] }))}
                  id="ann-audience-select">
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="new">New Users</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expires At (optional)</label>
              <input type="date" className="form-control" value={form.expiresAt || ''}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || undefined }))}
                id="ann-expires-input" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
              <label className="form-label" style={{ margin: 0 }}>Publish immediately</label>
              <button className={`toggle${form.active ? ' on' : ''}`}
                onClick={() => setForm(f => ({ ...f, active: !f.active }))} id="ann-active-toggle">
                <div className="toggle-thumb" style={{ transform: form.active ? 'translateX(18px)' : 'none' }} />
              </button>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} id="save-announcement-btn">
                {editAnn ? 'Save Changes' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
