import { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, ChevronDown, ChevronUp, Search, BookOpen, User } from 'lucide-react';
import { mockApplications } from '../../store/mockData';
import type { AuthorApplication, ApplicationStatus } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending:  'var(--color-orange)',
  approved: 'var(--color-green)',
  rejected: 'var(--color-red)',
};
const STATUS_BG: Record<ApplicationStatus, string> = {
  pending:  'var(--color-orange-dim)',
  approved: 'var(--color-green-dim)',
  rejected: 'var(--color-red-dim)',
};
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending:  '⏳ Pending',
  approved: '✅ Approved',
  rejected: '❌ Rejected',
};

export default function ApplicationsPage() {
  const { addToast } = useToast();
  const [apps, setApps] = useState<AuthorApplication[]>(mockApplications);
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const filtered = apps.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = a.userName.toLowerCase().includes(search.toLowerCase()) ||
                        a.userEmail.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  function approve(id: string) {
    setApps(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'approved', reviewedAt: new Date().toISOString() } : a
    ));
    addToast('Application approved — user role upgraded to Author.', 'success');
    setExpanded(null);
  }

  function reject(id: string) {
    setApps(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNote: rejectNote || 'Does not meet our content guidelines.' } : a
    ));
    addToast('Application rejected.', 'error');
    setRejectModal(null);
    setRejectNote('');
    setExpanded(null);
  }

  const counts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Author Applications</h1>
            <p>Review and manage author applications from users on the platform.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Applications', value: counts.all,      color: 'var(--color-blue)',   dim: 'var(--color-blue-dim)'   },
          { label: 'Pending Review',     value: counts.pending,  color: 'var(--color-orange)', dim: 'var(--color-orange-dim)' },
          { label: 'Approved',           value: counts.approved, color: 'var(--color-green)',  dim: 'var(--color-green-dim)'  },
          { label: 'Rejected',           value: counts.rejected, color: 'var(--color-red)',    dim: 'var(--color-red-dim)'    },
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
          <input
            className="search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="apps-search"
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'var(--font-heading)',
                background: filter === f ? 'var(--color-gold)' : 'var(--bg-surface)',
                color: filter === f ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--color-gold)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all var(--dur-normal)',
                textTransform: 'capitalize',
              }}
            >
              {f} {f !== 'all' && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filtered.length === 0 && (
          <div className="section-card">
            <div className="section-card-body" style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div>No applications found.</div>
            </div>
          </div>
        )}

        {filtered.map((app, i) => {
          const isOpen = expanded === app.id;
          return (
            <div key={app.id} className={`section-card animate-fade-in-up stagger-${(i % 8) + 1}`}>
              {/* Application Header Row */}
              <div
                className="section-card-body"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setExpanded(isOpen ? null : app.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: app.avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '1rem',
                      flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}
                  >
                    {app.userName[0]}
                  </div>

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {app.userName}
                      </span>
                      <span
                        style={{
                          padding: '2px 10px', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.68rem', fontWeight: 700,
                          background: STATUS_BG[app.status],
                          color: STATUS_COLORS[app.status],
                          border: `1px solid ${STATUS_COLORS[app.status]}40`,
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {STATUS_LABEL[app.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{app.userEmail}</div>
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                        {app.books.length}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Books
                      </div>
                    </div>
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
                  {/* Bio */}
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <User size={14} color="var(--color-gold)" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-heading)' }}>
                        Author Bio
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7, background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      {app.bio}
                    </p>
                  </div>

                  {/* Submitted Books */}
                  <div style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <BookOpen size={14} color="var(--color-gold)" />
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-heading)' }}>
                        Submitted Books ({app.books.length})
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
                      {app.books.map(book => (
                        <div
                          key={book.id}
                          style={{
                            display: 'flex', gap: 12, alignItems: 'flex-start',
                            background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)', padding: '12px',
                          }}
                        >
                          {/* Mini cover */}
                          <div style={{
                            width: 40, height: 54,
                            borderRadius: '2px 5px 5px 2px',
                            background: book.coverColor,
                            flexShrink: 0, boxShadow: '2px 2px 6px rgba(0,0,0,0.25)',
                            display: 'flex', alignItems: 'flex-end',
                            justifyContent: 'center', padding: 3,
                          }}>
                            <span style={{ fontSize: '0.42rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
                              {book.title.slice(0, 5)}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>{book.title}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                              {book.genre} · {book.language} · {book.pages}p · ₹{book.price}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{book.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review note if rejected */}
                  {app.status === 'rejected' && app.reviewNote && (
                    <div style={{
                      background: 'rgba(239,68,68,0.07)',
                      borderLeft: '3px solid var(--color-red)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 16px',
                      marginBottom: 'var(--space-lg)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--color-red)' }}>Rejection Note:</strong> {app.reviewNote}
                    </div>
                  )}

                  {app.status === 'approved' && (
                    <div style={{
                      background: 'rgba(52,211,153,0.08)',
                      borderLeft: '3px solid var(--color-green)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 16px',
                      marginBottom: 'var(--space-lg)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      <strong style={{ color: 'var(--color-green)' }}>Approved</strong> on{' '}
                      {app.reviewedAt ? format(new Date(app.reviewedAt), 'PPP') : '—'}. User role upgraded to Author.
                    </div>
                  )}

                  {/* Action buttons — only for pending */}
                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                      <button
                        id={`reject-btn-${app.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 6 }}
                        onClick={e => { e.stopPropagation(); setRejectModal(app.id); }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        id={`approve-btn-${app.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ gap: 6, background: 'var(--color-green)', borderColor: 'var(--color-green)' }}
                        onClick={e => { e.stopPropagation(); approve(app.id); }}
                      >
                        <CheckCircle size={14} /> Approve & Promote
                      </button>
                    </div>
                  )}

                  {/* Re-review closed apps */}
                  {app.status !== 'pending' && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                      {app.status === 'rejected' && (
                        <button
                          id={`re-approve-btn-${app.id}`}
                          className="btn btn-primary btn-sm"
                          style={{ gap: 6, background: 'var(--color-green)', borderColor: 'var(--color-green)' }}
                          onClick={e => { e.stopPropagation(); approve(app.id); }}
                        >
                          <CheckCircle size={14} /> Override — Approve
                        </button>
                      )}
                      {app.status === 'approved' && (
                        <button
                          id={`revoke-btn-${app.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: 6 }}
                          onClick={e => { e.stopPropagation(); setRejectModal(app.id); }}
                        >
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
                  width: '100%', padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem', resize: 'vertical',
                  fontFamily: 'var(--font-body)', outline: 'none',
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { setRejectModal(null); setRejectNote(''); }}>
                Cancel
              </button>
              <button
                id="confirm-reject-btn"
                className="btn btn-primary btn-sm"
                style={{ background: 'var(--color-red)', borderColor: 'var(--color-red)', gap: 6 }}
                onClick={() => reject(rejectModal)}
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
