import { useState } from 'react';
import { Plus, Search, Filter, Eye, CheckCircle, XCircle, Star, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { mockBooks } from '../../store/mockData';
import type { Book, BookStatus } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

const statusTabs: { key: 'all' | BookStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'draft', label: 'Draft' },
];

type SortKey = 'title' | 'sales' | 'revenue' | 'submittedAt';

export default function BooksPage() {
  const { addToast } = useToast();
  const [booksData, setBooksData] = useState<Book[]>(mockBooks);
  const [activeTab, setActiveTab] = useState<'all' | BookStatus>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('revenue');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewBook, setViewBook] = useState<Book | null>(null);

  // Filtering & Sorting
  const filtered = booksData
    .filter(b => activeTab === 'all' || b.status === activeTab)
    .filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.genre.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'sales') return b.sales - a.sales;
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

  const tabCounts = statusTabs.map(t => ({
    ...t,
    count: t.key === 'all' ? booksData.length : booksData.filter(b => b.status === t.key).length
  }));

  function approve(id: string) {
    setBooksData(prev => prev.map(b => b.id === id ? { ...b, status: 'approved' } : b));
    addToast('Book approved successfully!', 'success');
    setOpenMenuId(null);
  }
  function reject(id: string) {
    setBooksData(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
    addToast('Book rejected.', 'error');
    setOpenMenuId(null);
  }
  function toggleFeatured(id: string) {
    setBooksData(prev => prev.map(b => b.id === id ? { ...b, featured: !b.featured } : b));
    const book = booksData.find(b => b.id === id);
    addToast(book?.featured ? 'Book removed from featured.' : 'Book set as featured!', 'success');
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
            <button className="btn btn-primary" id="add-book-btn">
              <Plus size={16} /> Add Book
            </button>
          </div>
        </div>
      </div>

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
                  borderRadius: 'var(--radius-full)', padding: '1px 6px'
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <Search />
          <input
            className="search-input"
            placeholder="Search books, authors, genres…"
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
          <option value="revenue">Sort: Revenue</option>
          <option value="sales">Sort: Sales</option>
          <option value="title">Sort: Title</option>
          <option value="submittedAt">Sort: Date</option>
        </select>
      </div>

      {/* Table */}
      <div className="section-card animate-fade-in">
        <div className="table-wrapper" style={{ border: 'none' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <Filter size={40} />
              <p>No books match your filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Genre</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Submitted</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(book => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
                        <div style={{
                          width: 34, height: 48, borderRadius: '3px 6px 6px 3px',
                          background: book.coverColor, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)'
                        }}>
                          <span style={{ color: '#fff', fontSize: '0.52rem', fontWeight: 800 }}>
                            {book.title.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}
                               className="truncate" title={book.title}>{book.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{book.author}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{book.language} · {book.pages}p</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{book.genre}</td>
                    <td><span className={`badge badge-${book.status}`}>{book.status}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-gold)', fontWeight: 600 }}>₹{book.price}</td>
                    <td>
                      {book.rating > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.82rem' }}>
                          <Star size={12} fill="currentColor" /> {book.rating}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{book.sales.toLocaleString()}</td>
                    <td style={{ color: 'var(--color-green)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {book.revenue > 0 ? `₹${book.revenue.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {format(new Date(book.submittedAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <button
                        className="toggle"
                        style={{ flexShrink: 0 }}
                        onClick={() => toggleFeatured(book.id)}
                        id={`featured-toggle-${book.id}`}
                      >
                        <div className={`toggle${book.featured ? ' on' : ''}`} style={{ width: 36, height: 20 }}>
                          <div className="toggle-thumb" style={{ width: 14, height: 14, top: 2, left: book.featured ? undefined : 2, ...(book.featured ? { transform: 'translateX(16px)' } : {}) }} />
                        </div>
                      </button>
                    </td>
                    <td>
                      <div className="dropdown" style={{ position: 'relative' }}>
                        <button
                          className="btn-icon"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === book.id ? null : book.id); }}
                          id={`book-menu-${book.id}`}
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenuId === book.id && (
                          <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-item" onClick={() => { setViewBook(book); setOpenMenuId(null); }}>
                              <Eye size={14} /> View Details
                            </div>
                            <div className="dropdown-item" onClick={() => {}}>
                              <Edit2 size={14} /> Edit Book
                            </div>
                            {book.status === 'pending' && (
                              <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-item" onClick={() => approve(book.id)} style={{ color: 'var(--color-green)' }}>
                                  <CheckCircle size={14} /> Approve
                                </div>
                                <div className="dropdown-item danger" onClick={() => reject(book.id)}>
                                  <XCircle size={14} /> Reject
                                </div>
                              </>
                            )}
                            {book.status === 'rejected' && (
                              <>
                                <div className="dropdown-divider" />
                                <div className="dropdown-item" onClick={() => approve(book.id)} style={{ color: 'var(--color-green)' }}>
                                  <CheckCircle size={14} /> Re-approve
                                </div>
                              </>
                            )}
                            <div className="dropdown-divider" />
                            <div className="dropdown-item danger">
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
        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn" disabled id="page-prev">←</button>
          {[1,2,3].map(n => (
            <button key={n} className={`page-btn${n === 1 ? ' active' : ''}`} id={`page-${n}`}>{n}</button>
          ))}
          <button className="page-btn" id="page-next">→</button>
        </div>
      </div>

      {/* Book Detail Modal */}
      {viewBook && (
        <div className="modal-backdrop" onClick={() => setViewBook(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>Book Details</h3>
              <button className="btn-icon" onClick={() => setViewBook(null)} id="close-book-modal"><XCircle size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
              <div style={{
                width: 72, height: 100, borderRadius: '4px 8px 8px 4px',
                background: viewBook.coverColor, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '4px 4px 16px rgba(0,0,0,0.5)'
              }}>
                <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', padding: 4 }}>{viewBook.title.slice(0, 4)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{viewBook.title}</h2>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{viewBook.author}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className={`badge badge-${viewBook.status}`}>{viewBook.status}</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{viewBook.genre}</span>
                  <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{viewBook.language}</span>
                  {viewBook.featured && <span className="badge badge-featured">★ Featured</span>}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{viewBook.description}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
              {[
                { label: 'Price', value: `₹${viewBook.price}`, mono: true },
                { label: 'Pages', value: viewBook.pages, mono: false },
                { label: 'Sales', value: viewBook.sales.toLocaleString(), mono: true },
                { label: 'Revenue', value: `₹${viewBook.revenue.toLocaleString('en-IN')}`, mono: true },
                { label: 'Rating', value: viewBook.rating > 0 ? `${viewBook.rating} ★ (${viewBook.reviews} reviews)` : 'No reviews yet', mono: false },
                { label: 'ISBN', value: viewBook.isbn || '—', mono: true },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: item.mono ? 'var(--font-mono)' : undefined }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              {viewBook.status === 'pending' && (
                <>
                  <button className="btn btn-danger" onClick={() => { reject(viewBook.id); setViewBook(null); }}>Reject</button>
                  <button className="btn btn-primary" onClick={() => { approve(viewBook.id); setViewBook(null); }}>Approve Book</button>
                </>
              )}
              {viewBook.status !== 'pending' && (
                <button className="btn btn-secondary" onClick={() => setViewBook(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
