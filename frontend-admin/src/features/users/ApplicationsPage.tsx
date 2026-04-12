import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Search, BookOpen, User, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchApplications, approveApplication, rejectApplication, type AdminApplication } from '../../services/users.service';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

const STATUS_COLORS: Record<AdminApplication['status'], string> = {
  PENDING:  'var(--color-orange)',
  APPROVED: 'var(--color-green)',
  REJECTED: 'var(--color-red)',
};
const STATUS_BG: Record<AdminApplication['status'], string> = {
  PENDING:  'var(--color-orange-dim)',
  APPROVED: 'var(--color-green-dim)',
  REJECTED: 'var(--color-red-dim)',
};
const STATUS_LABEL: Record<AdminApplication['status'], string> = {
  PENDING:  '⏳ Pending',
  APPROVED: '✅ Approved',
  REJECTED: '❌ Rejected',
};

// Fake reviewer ID — in a real system this comes from auth session
const REVIEWER_PLACEHOLDER = '00000000-0000-0000-0000-000000000001';
const AVATAR_COLORS = ['#C17817', '#4F8EF7', '#34D399', '#A78BFA', '#F87171', '#FB923C', '#22D3EE'];

export default function ApplicationsPage() {
  const { addToast } = useToast();
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminApplication['status'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications();
      setApps(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = apps.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = a.userName.toLowerCase().includes(search.toLowerCase()) ||
                        a.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: apps.length,
    PENDING: apps.filter(a => a.status === 'PENDING').length,
    APPROVED: apps.filter(a => a.status === 'APPROVED').length,
    REJECTED: apps.filter(a => a.status === 'REJECTED').length,
  };

  async function handleApprove(app: AdminApplication) {
    setMutatingId(app.id);
    try {
      await approveApplication(app.id, app.userId, REVIEWER_PLACEHOLDER);
      addToast(`${app.userName} approved — role upgraded to Author.`, 'success');
      setExpanded(null);
      await load();
    } catch (e: any) {
      addToast(e.message ?? 'Failed to approve application.', 'error');
    } finally {
      setMutatingId(null);
    }
  }

  async function handleReject(id: string) {
    setMutatingId(id);
    try {
      await rejectApplication(id, REVIEWER_PLACEHOLDER, rejectNote || undefined);
      addToast('Application rejected.', 'error');
      setRejectModal(null);
      setRejectNote('');
      setExpanded(null);
      await load();
    } catch (e: any) {
      addToast(e.message ?? 'Failed to reject application.', 'error');
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Author Applications</h1>
            <p>Review and manage author applications from users on the platform.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-apps-btn">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="announcement-banner" style={{ marginBottom: 'var(--space-md)', borderColor: 'var(--color-red)', background: 'rgba(239,68,68,0.06)' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-red)' }}>{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Applications', value: loading ? '…' : counts.all, color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
          { label: 'Pending Review', value: loading ? '…' : counts.PENDING, color: 'var(--color-orange)', dim: 'var(--color-orange-dim)' },
          { label: 'Approved', value: loading ? '…' : counts.APPROVED, color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
          { label: 'Rejected', value: loading ? '…' : counts.REJECTED, color: 'var(--color-red)', dim: 'var(--color-red-dim)' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>{s.value}</div>
            <div className="stat-card-glow" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search />
          <input className="search-input" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} id="apps-search" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                background: filter === f ? 'var(--color-gold)' : 'var(--bg-surface)',
                color: filter === f ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                cursor: 'pointer', transition: 'all var(--dur-normal)',
              }}>
              {f === 'all' ? 'All' : f} {f !== 'all' && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {loading && (
          <div className="section-card">
            <div className="section-card-body" style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
              Loading applications…
            </div>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="section-card">
            <div className="section-card-body" style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div>No applications found.</div>
            </div>
          </div>
        )}

        {filtered.map((app, i) => {
          const isOpen = expanded === app.id;
          const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div key={app.id} className={`section-card animate-fade-in-up stagger-${(i % 8) + 1}`}
              style={{ opacity: mutatingId === app.id ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              {/* Header Row */}
              <div className="section-card-body" style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setExpanded(isOpen ? null : app.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  {app.userAvatar ? (
                    <img src={app.userAvatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: avatarBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}>
                      {(app.userName ?? '?')[0]}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{app.userName}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: 'var(--radius-sm)',
                        fontSize: '0.68rem', fontWeight: 700,
                        background: STATUS_BG[app.status], color: STATUS_COLORS[app.status],
                        border: `1px solid ${STATUS_COLORS[app.status]}40`,
                      }}>
                        {STATUS_LABEL[app.status]}
                      </span>
                      <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{app.genre}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{app.userEmail}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {format(new Date(app.submittedAt), 'dd MMM yyyy')}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.7 }}>Submitted</div>
                    </div>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-lg)' }}>
                  {/* Motivation */}
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <User size={14} color="var(--color-gold)" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-heading)' }}>
                        Motivation
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      {app.motivation}
                    </p>
                  </div>

                  {/* Writing Sample */}
                  {app.writingSample && (
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <BookOpen size={14} color="var(--color-gold)" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-heading)' }}>
                          Writing Sample
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        {app.writingSample.slice(0, 600)}{app.writingSample.length > 600 ? '…' : ''}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {app.socialLinks && (
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Social Links</div>
                      <a href={app.socialLinks} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--color-blue)', fontSize: '0.85rem' }}>{app.socialLinks}</a>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {app.status === 'REJECTED' && app.adminNotes && (
                    <div style={{
                      background: 'rgba(239,68,68,0.07)', borderLeft: '3px solid var(--color-red)',
                      borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 'var(--space-lg)',
                      fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--color-red)' }}>Rejection Note:</strong> {app.adminNotes}
                    </div>
                  )}
                  {app.status === 'APPROVED' && (
                    <div style={{
                      background: 'rgba(52,211,153,0.08)', borderLeft: '3px solid var(--color-green)',
                      borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 'var(--space-lg)',
                      fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--color-green)' }}>Approved</strong> on{' '}
                      {app.reviewedAt ? format(new Date(app.reviewedAt), 'PPP') : '—'}. User role upgraded to Author.
                    </div>
                  )}

                  {/* Action Buttons */}
                  {app.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                      <button id={`reject-btn-${app.id}`} className="btn btn-secondary btn-sm"
                        disabled={mutatingId === app.id}
                        onClick={e => { e.stopPropagation(); setRejectModal(app.id); }}>
                        <XCircle size={14} /> Reject
                      </button>
                      <button id={`approve-btn-${app.id}`} className="btn btn-primary btn-sm"
                        disabled={mutatingId === app.id}
                        style={{ gap: 6, background: 'var(--color-green)', borderColor: 'var(--color-green)' }}
                        onClick={e => { e.stopPropagation(); handleApprove(app); }}>
                        <CheckCircle size={14} /> Approve & Promote
                      </button>
                    </div>
                  )}
                  {app.status !== 'PENDING' && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                      {app.status === 'REJECTED' && (
                        <button id={`re-approve-btn-${app.id}`} className="btn btn-primary btn-sm"
                          disabled={mutatingId === app.id}
                          style={{ gap: 6, background: 'var(--color-green)', borderColor: 'var(--color-green)' }}
                          onClick={e => { e.stopPropagation(); handleApprove(app); }}>
                          <CheckCircle size={14} /> Override — Approve
                        </button>
                      )}
                      {app.status === 'APPROVED' && (
                        <button id={`revoke-btn-${app.id}`} className="btn btn-secondary btn-sm"
                          disabled={mutatingId === app.id}
                          onClick={e => { e.stopPropagation(); setRejectModal(app.id); }}>
                          <XCircle size={14} /> Revoke Approval
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-backdrop" onClick={() => { setRejectModal(null); setRejectNote(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Reject Application</h3>
              <button className="btn-icon" id="close-reject-modal" onClick={() => { setRejectModal(null); setRejectNote(''); }}>
                <XCircle size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', lineHeight: 1.6 }}>
              Optionally provide a note to the applicant explaining the reason for rejection.
            </p>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                Rejection Note (optional)
              </label>
              <textarea
                id="reject-note-input"
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                rows={4}
                placeholder="e.g. The submitted content requires significant editing before it meets our standards…"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-subtle)', background: 'var(--bg-surface)',
                  color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { setRejectModal(null); setRejectNote(''); }}>Cancel</button>
              <button
                id="confirm-reject-btn"
                className="btn btn-primary btn-sm"
                disabled={!!mutatingId}
                style={{ background: 'var(--color-red)', borderColor: 'var(--color-red)', gap: 6 }}
                onClick={() => handleReject(rejectModal)}
              >
                <XCircle size={14} /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
