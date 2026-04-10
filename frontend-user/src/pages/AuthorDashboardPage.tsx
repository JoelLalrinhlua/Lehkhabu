import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import type { AuthorBookEntry } from '../store/userStore';

const GENRES = ['Fiction', 'Non-Fiction', 'History', 'Religious', 'Poetry', 'Novel', 'Short Stories', 'Spiritual', 'Travel', 'Biography', 'Academic', 'Children'];
const LANGUAGES = ['Mizo', 'English', 'Hmar', 'Chakma', 'Hindi'];

const emptyBook = () => ({
  title: '',
  description: '',
  genre: '',
  language: '',
  price: 99,
  pages: 100,
});

export default function AuthorDashboardPage() {
  const { authorBooks, publishBook } = useUserStore();
  const [showPublish, setShowPublish] = useState(false);
  const [form, setForm] = useState(emptyBook());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);

  const totalRevenue = authorBooks.reduce((s, b) => s + b.revenue, 0);
  const totalSales = authorBooks.reduce((s, b) => s + b.sales, 0);
  const avgRating = authorBooks.length > 0
    ? authorBooks.filter(b => b.rating > 0).reduce((s, b) => s + b.rating, 0) / (authorBooks.filter(b => b.rating > 0).length || 1)
    : 0;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.genre) e.genre = 'Genre is required';
    if (!form.language) e.language = 'Language is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePublish() {
    if (!validate()) return;
    publishBook(form);
    setForm(emptyBook());
    setShowPublish(false);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  }

  return (
    <div className="page author-dash-page">
      {/* Header */}
      <div className="author-dash-header">
        <div className="author-dash-badge">✍️ Author</div>
        <h1 className="author-dash-title">Author Dashboard</h1>
        <p className="author-dash-sub">Publish, manage and track your books on Lehkhabu.</p>
      </div>

      {/* Analytics Cards */}
      <div className="author-stats-grid">
        {[
          { label: 'Published Books', value: authorBooks.length, icon: '📚', color: 'var(--color-terracotta)' },
          { label: 'Total Sales', value: totalSales, icon: '🛒', color: 'var(--color-sage-dark)' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#C17817' },
          { label: 'Avg Rating', value: avgRating > 0 ? `${avgRating.toFixed(1)} ★` : '—', icon: '⭐', color: '#D4AC0D' },
        ].map((s) => (
          <div key={s.label} className="author-stat-card">
            <div className="author-stat-icon">{s.icon}</div>
            <div className="author-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="author-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Publish success toast */}
      {published && (
        <div className="author-publish-toast">
          🎉 Book published successfully!
        </div>
      )}

      {/* Publish Section */}
      <div className="author-section">
        <div className="author-section-header">
          <h2>Your Books</h2>
          <button className="btn-author-primary btn-sm" id="publish-new-btn" onClick={() => setShowPublish(true)}>
            + Publish New Book
          </button>
        </div>

        {authorBooks.length === 0 ? (
          <div className="author-empty-state">
            <div className="author-empty-icon">📖</div>
            <h3>No books published yet</h3>
            <p>Publish your first book and start reaching readers across the Mizo community.</p>
            <button className="btn-author-primary" onClick={() => setShowPublish(true)}>
              Publish Your First Book
            </button>
          </div>
        ) : (
          <div className="author-books-list">
            {authorBooks.map((book) => (
              <AuthorBookRow key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showPublish && (
        <div className="author-modal-backdrop" onClick={() => setShowPublish(false)}>
          <div className="author-modal" onClick={(e) => e.stopPropagation()}>
            <div className="author-modal-header">
              <h3>Publish New Book</h3>
              <button className="author-modal-close" onClick={() => setShowPublish(false)}>✕</button>
            </div>

            <div className="app-field">
              <label>Book Title</label>
              <input
                id="publish-title"
                className={`app-input ${errors.title ? 'app-input-error' : ''}`}
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Kalpana"
              />
              {errors.title && <span className="app-field-error">{errors.title}</span>}
            </div>

            <div className="app-field">
              <label>Description</label>
              <textarea
                id="publish-desc"
                className={`app-textarea ${errors.description ? 'app-input-error' : ''}`}
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief synopsis of your book…"
                rows={3}
              />
              {errors.description && <span className="app-field-error">{errors.description}</span>}
            </div>

            <div className="app-fields-row">
              <div className="app-field">
                <label>Genre</label>
                <select
                  className={`app-select ${errors.genre ? 'app-input-error' : ''}`}
                  value={form.genre}
                  onChange={(e) => setForm(f => ({ ...f, genre: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.genre && <span className="app-field-error">{errors.genre}</span>}
              </div>
              <div className="app-field">
                <label>Language</label>
                <select
                  className={`app-select ${errors.language ? 'app-input-error' : ''}`}
                  value={form.language}
                  onChange={(e) => setForm(f => ({ ...f, language: e.target.value }))}
                >
                  <option value="">Select…</option>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.language && <span className="app-field-error">{errors.language}</span>}
              </div>
            </div>

            <div className="app-fields-row">
              <div className="app-field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  className="app-input"
                  value={form.price}
                  min={29}
                  onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
              <div className="app-field">
                <label>Pages</label>
                <input
                  type="number"
                  className="app-input"
                  value={form.pages}
                  min={20}
                  onChange={(e) => setForm(f => ({ ...f, pages: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="author-modal-footer">
              <button className="app-back-btn" onClick={() => setShowPublish(false)}>Cancel</button>
              <button className="btn-author-primary" id="publish-submit-btn" onClick={handlePublish}>
                Publish Book 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorBookRow({ book }: { book: AuthorBookEntry }) {
  return (
    <div className="author-book-row">
      <div className="author-book-cover" style={{ background: book.coverColor }}>
        <span>{book.title.slice(0, 4)}</span>
      </div>
      <div className="author-book-info">
        <div className="author-book-title">{book.title}</div>
        <div className="author-book-meta">{book.genre} · {book.language} · {book.pages}p · ₹{book.price}</div>
        <div className="author-book-published">Published {new Date(book.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>
      <div className="author-book-stats">
        <div className="author-book-stat">
          <span className="author-book-stat-val">{book.sales}</span>
          <span className="author-book-stat-label">Sales</span>
        </div>
        <div className="author-book-stat">
          <span className="author-book-stat-val">₹{book.revenue.toLocaleString('en-IN')}</span>
          <span className="author-book-stat-label">Revenue</span>
        </div>
        <div className="author-book-stat">
          <span className="author-book-stat-val">{book.rating > 0 ? `${book.rating.toFixed(1)}★` : '—'}</span>
          <span className="author-book-stat-label">Rating</span>
        </div>
      </div>
    </div>
  );
}
