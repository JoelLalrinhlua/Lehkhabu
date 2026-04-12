import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Star, MoreVertical, Trash2, Eye, XCircle, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchBooks, updateBookStatus, deleteBook, type AdminBook } from '../../services/books.service';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

type StatusFilter = 'all' | AdminBook['status'];
type SortKey = 'title' | 'purchaseCount' | 'averageRating' | 'createdAt' | 'price';

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'PENDING_REVIEW', label: 'Pending' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'ARCHIVED', label: 'Archived' },
];

const COVER_COLORS = [
  'linear-gradient(135deg,#C17817,#8B4513)',
  'linear-gradient(135deg,#4F8EF7,#1E40AF)',
  'linear-gradient(135deg,#34D399,#065F46)',
  'linear-gradient(135deg,#A78BFA,#5B21B6)',
  'linear-gradient(135deg,#FB923C,#9A3412)',
  'linear-gradient(135deg,#22D3EE,#0E7490)',
  'linear-gradient(135deg,#F472B6,#9D174D)',
  'linear-gradient(135deg,#FBBF24,#92400E)',
];

function bookColor(book: AdminBook, idx: number) {
  if (book.coverColorPrimary) return book.coverColorPrimary;
  return COVER_COLORS[idx % COVER_COLORS.length];
}

function statusBadge(status: AdminBook['status']) {
  const map: Record<AdminBook['status'], string> = {
    PUBLISHED: 'approved',
    PENDING_REVIEW: 'pending',
    REJECTED: 'rejected',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
  };
  return map[status] ?? 'pending';
}

export default function BooksPage() {
  const { addToast } = useToast();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('createdAt');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewBook, setViewBook] = useState<AdminBook | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const filtered = books
    .filter(b => activeTab === 'all' || b.status === activeTab)
    .filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'purchaseCount') return b.purchaseCount - a.purchaseCount;
      if (sortBy === 'averageRating') return b.averageRating - a.averageRating;
      if (sortBy === 'price') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const tabCounts = statusTabs.map(t => ({
    ...t,
    count: t.key === 'all' ? books.length : books.filter(b => b.status === t.key).length,
  }));

  async function handleStatus(bookId: string, status: AdminBook['status']) {
    setMutatingId(bookId);
    try {
      await updateBookStatus(bookId, status);
      const labels: Record<AdminBook['status'], string> = {
        PUBLISHED: 'Book approved and published!',
        REJECTED: 'Book rejected.',
        ARCHIVED: 'Book archived.',
        DRAFT: 'Book reverted to draft.',
        PENDING_REVIEW: 'Book set to pending.',
      };
      addToast(labels[status] ?? 'Updated!', status === 'PUBLISHED' ? 'success' : 'error');
      await load();
      if (viewBook?.id === bookId) setViewBook(null);
    } catch {
      addToast('Failed to update book status.', 'error');
    } finally {
      setMutatingId(null);
      setOpenMenuId(null);
    }
  }

  async function handleDelete(bookId: string) {
    if (!confirm('Are you sure you want to delete this book? This cannot be undone.')) return;
    setMutatingId(bookId);
    try {
      await deleteBook(bookId);
      addToast('Book deleted.', 'error');
      await load();
    } catch {
      addToast('Failed to delete book.', 'error');
    } finally {
      setMutatingId(null);
      setOpenMenuId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Books</h1>
            <p>Manage all submitted and published books on the platform.</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={load} id="refresh-books-btn">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="announcement-banner" style={{ marginBottom: 'var(--space-md)', borderColor: 'var(--color-red)', background: 'rgba(239,68,68,0.06)' }}>
          <AlertCircle size={16} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-red)' }}>{error}</span>
          <button className="btn btn-secondary btn-sm" onClick={load}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
        <div className="filter-tabs">
          {tabCounts.map(t => (
            <button
              key={t.key}
              className={`filter-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
              id={`tab-${t.key}`}
            >
              {t.label}
              {t.count > 0 && (
                <span style={{
                  marginLeft: 4, fontSize: '0.68rem', fontWeight: 700,
                  background: activeTab === t.key ? 'var(--color-gold-dim)' : 'var(--bg-elevated)',
                  color: activeTab === t.key ? 'var(--color-gold)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-full)', padding: '1px 6px',
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search />
          <input
            className="search-input"
            placeholder="Search books, authors, categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="books-search"
          />
        </div>
        <select
          className="form-control"
          style={{ width: 'auto', padding: '8px 12px' }}
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          id="books-sort"
        >
          <option value="createdAt">Sort: Newest</option>
          <option value="purchaseCount">Sort: Sales</option>
          <option value="averageRating">Sort: Rating</option>
          <option value="price">Sort: Price</option>
          <option value="title">Sort: Title</option>
        </select>
      </div>

      {/* Table */}
      <div className="section-card animate-fade-in">
        <div className="table-wrapper" style={{ border: 'none' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading books…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Filter size={40} />
              <p>No books match your filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, idx) => (
                  <tr key={book.id} style={{ opacity: mutatingId === book.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
                        <div style={{
                          width: 34, height: 48, borderRadius: '3px 6px 6px 3px',
                          background: bookColor(book, idx), flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                        }}>
                          {book.coverImageUrl
                            ? <img src={book.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            : <span style={{ color: '#fff', fontSize: '0.52rem', fontWeight: 800 }}>{book.title.slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}
                            className="truncate" title={book.title}>{book.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{book.author}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{book.language} {book.totalPages ? `· ${book.totalPages}p` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{book.category}</td>
                    <td><span className={`badge badge-${statusBadge(book.status)}`}>{book.status.replace('_', ' ')}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: book.isFree ? 'var(--color-green)' : 'var(--color-gold)', fontWeight: 600 }}>
                      {book.isFree ? 'FREE' : `₹${book.price}`}
                    </td>
                    <td>
                      {book.averageRating > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.82rem' }}>
                          <Star size={12} fill="currentColor" /> {book.averageRating.toFixed(1)}
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({book.ratingCount})</span>
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{book.purchaseCount.toLocaleString()}</td>
                    <td style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {book.purchaseCount > 0 ? `₹${(book.price * book.purchaseCount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(book.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div className="dropdown" style={{ position: 'relative' }}>
                        <button
                          className="btn-icon"
                          onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === book.id ? null : book.id); }}
                          id={`book-menu-${book.id}`}
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenuId === book.id && (
                          <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-item" onClick={() => { setViewBook(book); setOpenMenuId(null); }}>
                              <Eye size={14} /> View Details
                            </div>
                            {book.status === 'PENDING_REVIEW' && (
                              <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-item" onClick={() => handleStatus(book.id, 'PUBLISHED')} style={{ color: 'var(--color-green)' }}>
                                  <CheckCircle size={14} /> Approve & Publish
                                </div>
                                <div className="dropdown-item danger" onClick={() => handleStatus(book.id, 'REJECTED')}>
                                  <XCircle size={14} /> Reject
                                </div>
                              </>
                            )}
                            {book.status === 'REJECTED' && (
                              <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-item" onClick={() => handleStatus(book.id, 'PUBLISHED')} style={{ color: 'var(--color-green)' }}>
                                  <CheckCircle size={14} /> Re-approve
                                </div>
                              </>
                            )}
                            {book.status === 'PUBLISHED' && (
                              <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-item danger" onClick={() => handleStatus(book.id, 'ARCHIVED')}>
                                  <XCircle size={14} /> Archive
                                </div>
                              </>
                            )}
                            <div className="dropdown-divider" />
                            <div className="dropdown-item danger" onClick={() => handleDelete(book.id)}>
                              <Trash2 size={14} /> Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Book Detail Modal */}
      {viewBook && (
        <div className="modal-backdrop" onClick={() => setViewBook(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h3>Book Details</h3>
              <button className="btn-icon" onClick={() => setViewBook(null)} id="close-book-modal"><XCircle size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
              <div style={{
                width: 72, height: 100, borderRadius: '4px 8px 8px 4px',
                background: viewBook.coverColorPrimary ?? COVER_COLORS[0], flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '4px 4px 16px rgba(0,0,0,0.5)',
              }}>
                {viewBook.coverImageUrl
                  ? <img src={viewBook.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  : <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', padding: 4 }}>{viewBook.title.slice(0, 4)}</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{viewBook.title}</h2>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>by {viewBook.author}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className={`badge badge-${statusBadge(viewBook.status)}`}>{viewBook.status.replace('_', ' ')}</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{viewBook.category}</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{viewBook.language}</span>
                  {viewBook.isFree && <span className="badge badge-approved">FREE</span>}
                </div>
                {viewBook.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewBook.description}</p>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Price', value: viewBook.isFree ? 'FREE' : `₹${viewBook.price}` },
                { label: 'Pages', value: viewBook.totalPages ?? '—' },
                { label: 'Sales', value: viewBook.purchaseCount.toLocaleString() },
                { label: 'Revenue', value: viewBook.purchaseCount > 0 ? `₹${(viewBook.price * viewBook.purchaseCount).toLocaleString('en-IN')}` : '—' },
                { label: 'Rating', value: viewBook.averageRating > 0 ? `${viewBook.averageRating.toFixed(1)} ★ (${viewBook.ratingCount} reviews)` : 'No reviews yet' },
                { label: 'ISBN', value: viewBook.isbn ?? '—' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            {viewBook.tags?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {viewBook.tags.map(tag => (
                    <span key={tag} className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-footer">
              {viewBook.status === 'PENDING_REVIEW' && (
                <>
                  <button className="btn btn-danger" disabled={mutatingId === viewBook.id}
                    onClick={() => handleStatus(viewBook.id, 'REJECTED')}>Reject</button>
                  <button className="btn btn-primary" disabled={mutatingId === viewBook.id}
                    onClick={() => handleStatus(viewBook.id, 'PUBLISHED')}>Approve & Publish</button>
                </>
              )}
              {viewBook.status === 'REJECTED' && (
                <button className="btn btn-primary" disabled={mutatingId === viewBook.id}
                  onClick={() => handleStatus(viewBook.id, 'PUBLISHED')}>Re-approve</button>
              )}
              {viewBook.status === 'PUBLISHED' && (
                <button className="btn btn-danger btn-sm" disabled={mutatingId === viewBook.id}
                  onClick={() => handleStatus(viewBook.id, 'ARCHIVED')}>Archive</button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewBook(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
