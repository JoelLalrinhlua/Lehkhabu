import { useState, useMemo } from 'react';
import { books, categories } from '../data/books';
import BookCard from '../components/common/BookCard';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    let result = books;

    if (activeCategory) {
      result = result.filter((b) => b.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  const groupedByCategory = useMemo(() => {
    if (activeCategory || searchQuery) return null;

    const groups: Record<string, typeof books> = {};
    books.forEach((book) => {
      if (!groups[book.category]) groups[book.category] = [];
      groups[book.category].push(book);
    });
    return groups;
  }, [activeCategory, searchQuery]);

  return (
    <div className="page">
      {/* Search */}
      <div className="search-container">
        <div className="search-bar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search books, authors, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--color-gray-500)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
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
            key={cat.name}
            className={`category-pill ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() =>
              setActiveCategory(activeCategory === cat.name ? null : cat.name)
            }
          >
            <span className="category-pill-icon">{cat.icon}</span>
            <span className="category-pill-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {(activeCategory || searchQuery) ? (
        <div className="explore-section animate-fade-in">
          <div className="section-header">
            <h2>
              {activeCategory || 'Search Results'}
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
      ) : (
        /* Browse by Category */
        groupedByCategory && Object.entries(groupedByCategory).map(([category, categoryBooks]) => (
          <div key={category} className="explore-section animate-fade-in-up">
            <div className="section-header">
              <h2>{category}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {categoryBooks.length} book{categoryBooks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="recommendation-scroll">
              {categoryBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
