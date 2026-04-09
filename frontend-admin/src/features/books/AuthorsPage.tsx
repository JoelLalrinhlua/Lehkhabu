import { useState } from 'react';
import { Search, Star, BookOpen, TrendingUp, CheckCircle, XCircle, MoreVertical, Eye, BadgeCheck, Trash2 } from 'lucide-react';
import { mockAuthors, mockBooks } from '../../store/mockData';
import type { Author } from '../../types';
import { useToast } from '../../components/layout/AdminLayout';
import { format } from 'date-fns';

export default function AuthorsPage() {
  const { addToast } = useToast();
  const [authorsData, setAuthorsData] = useState<Author[]>(mockAuthors);
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewAuthor, setViewAuthor] = useState<Author | null>(null);

  const filtered = authorsData.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleVerify(id: string) {
    setAuthorsData(prev => prev.map(a => a.id === id ? { ...a, verified: !a.verified } : a));
    const author = authorsData.find(a => a.id === id);
    addToast(author?.verified ? 'Verification removed.' : 'Author verified!', 'success');
    setOpenMenuId(null);
  }

  const colorMap = ['gold', 'blue', 'green', 'purple', 'red', 'cyan'];

  // Get books for a given author id
  const getBooksForAuthor = (authorId: string) =>
    mockBooks.filter(b => b.authorId === authorId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>Authors</h1>
            <p>Manage all authors, their books, and performance on the platform.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-md)' }}>
        {[
          { label: 'Total Authors', value: authorsData.length, color: 'var(--color-gold)', dim: 'var(--color-gold-dim)' },
          { label: 'Verified', value: authorsData.filter(a => a.verified).length, color: 'var(--color-green)', dim: 'var(--color-green-dim)' },
          { label: 'Total Books', value: authorsData.reduce((s, a) => s + a.totalBooks, 0), color: 'var(--color-blue)', dim: 'var(--color-blue-dim)' },
          { label: 'Total Revenue', value: `₹${(authorsData.reduce((s, a) => s + a.totalRevenue, 0) / 1000).toFixed(0)}K`, color: 'var(--color-purple)', dim: 'var(--color-purple-dim)' },
        ].map((s, i) => (
          <div key={s.label} className={`stat-card animate-fade-in-up stagger-${i + 1}`}>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.6rem' }}>{s.value}</div>
            <div className="stat-card-glow" style={{ background: s.color }} />
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div className="search-box">
          <Search />
          <input className="search-input" placeholder="Search authors…"
            value={search} onChange={e => setSearch(e.target.value)} id="authors-search" />
        </div>
      </div>

      {/* Author Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
        {filtered.map((author, i) => {
          const color = colorMap[i % colorMap.length];
          const books = getBooksForAuthor(author.id);
          return (
            <div key={author.id} className={`section-card animate-fade-in-up stagger-${(i % 8) + 1}`}
              style={{ cursor: 'pointer', transition: 'border-color var(--dur-normal)' }}
              onClick={() => setViewAuthor(author)}>
              <div className="section-card-body">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={`avatar avatar-lg avatar-${color}`} style={{ position: 'relative' }}>
                      {author.name[0]}
                      {author.verified && (
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: '50%', background: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle size={9} style={{ color: '#fff' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {author.name}
                        {author.verified && <span className="badge badge-active" style={{ fontSize: '0.6rem' }}>Verified</span>}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{author.email}</div>
                    </div>
                  </div>
                  <div className="dropdown" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button className="btn-icon" id={`author-menu-${author.id}`}
                      onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === author.id ? null : author.id); }}>
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === author.id && (
                      <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                        <div className="dropdown-item" onClick={() => { setViewAuthor(author); setOpenMenuId(null); }}>
                          <Eye size={13} /> View Details
                        </div>
                        <div className="dropdown-item" onClick={() => toggleVerify(author.id)}>
                          <BadgeCheck size={13} /> {author.verified ? 'Remove Verification' : 'Verify Author'}
                        </div>
                        <div className="dropdown-divider" />
                        <div className="dropdown-item danger"><Trash2 size={13} /> Remove Author</div>
                      </div>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{author.bio}</p>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
                  {[
                    { icon: BookOpen, label: 'Books', value: author.totalBooks, color: 'var(--color-blue)' },
                    { icon: TrendingUp, label: 'Sales', value: author.totalSales, color: 'var(--color-green)' },
                    { icon: Star, label: 'Rating', value: author.rating > 0 ? author.rating.toFixed(1) : '—', color: 'var(--color-gold)' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                        <Icon size={13} style={{ color: s.color, marginBottom: 2 }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Revenue */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Revenue</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                    ₹{author.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                {/* Books preview */}
                {books.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {books.slice(0, 3).map(b => (
                      <div key={b.id} style={{
                        height: 32, width: 22, borderRadius: '2px 4px 4px 2px',
                        background: b.coverColor, boxShadow: '1px 1px 4px rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ color: '#fff', fontSize: '0.42rem', fontWeight: 800, writingMode: 'vertical-rl' }}>{b.title.slice(0, 4)}</span>
                      </div>
                    ))}
                    {books.length > 3 && (
                      <div style={{ height: 32, display: 'flex', alignItems: 'center', paddingLeft: 4 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{books.length - 3} more</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Author Detail Modal */}
      {viewAuthor && (
        <div className="modal-backdrop" onClick={() => setViewAuthor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>Author Profile</h3>
              <button className="btn-icon" onClick={() => setViewAuthor(null)} id="close-author-modal"><XCircle size={16} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div className="avatar avatar-lg avatar-gold" style={{ width: 60, height: 60, fontSize: '1.4rem' }}>
                {viewAuthor.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {viewAuthor.name}
                  {viewAuthor.verified && <span className="badge badge-active">✓ Verified</span>}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{viewAuthor.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{viewAuthor.bio}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Total Books', value: viewAuthor.totalBooks },
                { label: 'Total Sales', value: viewAuthor.totalSales.toLocaleString() },
                { label: 'Rating', value: viewAuthor.rating > 0 ? `${viewAuthor.rating} ★` : '—' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{item.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Total Revenue', value: `₹${viewAuthor.totalRevenue.toLocaleString('en-IN')}` },
                { label: 'Member Since', value: format(new Date(viewAuthor.joinedAt), 'PPP') },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { toggleVerify(viewAuthor.id); setViewAuthor(null); }}>
                <BadgeCheck size={14} /> {viewAuthor.verified ? 'Remove Verification' : 'Verify Author'}
              </button>
              <button className="btn btn-primary" onClick={() => setViewAuthor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
