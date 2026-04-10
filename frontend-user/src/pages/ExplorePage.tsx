import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBooksStore } from '../store/booksStore';
import BookCard from '../components/common/BookCard';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { books, booksLoading, booksError, loadBooks } = useBooksStore();

  const initialCategory = searchParams.get('category') ?? null;
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    if (books.length === 0 && !booksLoading) {
      loadBooks();
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (activeCategory) params.category = activeCategory;
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory]);

  // Client-side filter (fast, works offline)
  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeCategory) result = result.filter((b) => b.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author_name ?? '').toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [books, searchQuery, activeCategory]);

  const categories = [...new Set(books.map((b) => b.category))].sort();

  const groupedByCategory = useMemo(() => {
    if (activeCategory || searchQuery) return null;
    const groups: Record<string, typeof books> = {};
    books.forEach((book) => {
      if (!groups[book.category]) groups[book.category] = [];
      groups[book.category].push(book);
    });
    return groups;
  }, [books, activeCategory, searchQuery]);

  return (
    <div className="page">
      {/* Search bar */}
      <div className="search-container">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Search books, authors, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={!!searchParams.get('q')}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--color-gray-500)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter pills */}
      {!booksLoading && categories.length > 0 && (
        <div className="category-pills" style={{ marginBottom: 'var(--space-xl)' }}>
          <button
            className={`category-pill ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            <span className="category-pill-icon">📚</span>
            <span className="category-pill-name">All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              <span className="category-pill-name">{cat}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {booksLoading && (
        <div className="explore-loading">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="book-card-skeleton" />
          ))}
        </div>
      )}

      {/* Error state */}
      {booksError && (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Couldn't load books</h3>
          <p>{booksError}</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => loadBooks()}>
            Retry
          </button>
        </div>
      )}

      {/* Filtered / search results */}
      {!booksLoading && !booksError && (activeCategory || searchQuery) && (
        <div className="explore-section animate-fade-in">
          <div className="section-header">
            <h2>
              {activeCategory ?? 'Search Results'}
              {searchQuery && ` — "${searchQuery}"`}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filteredBooks.length > 0 ? (
            <div className="explore-grid">
              {filteredBooks.map((book, i) => (
                <div key={book.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No books found</h3>
              <p>Try adjusting your search or browse different categories</p>
            </div>
          )}
        </div>
      )}

      {/* Browse by category (default view) */}
      {!booksLoading && !booksError && !activeCategory && !searchQuery && groupedByCategory && (
        Object.entries(groupedByCategory).map(([category, categoryBooks]) => (
          <div key={category} className="explore-section animate-fade-in-up">
            <div className="section-header">
              <h2>{category}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {categoryBooks.length} book{categoryBooks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="recommendation-scroll">
              {categoryBooks.map((book) => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        ))
      )}

      {/* No books at all */}
      {!booksLoading && !booksError && books.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>No books published yet</h3>
          <p>Check back soon for new stories from Mizo authors!</p>
        </div>
      )}
    </div>
  );
}
