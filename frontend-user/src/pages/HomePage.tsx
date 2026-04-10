import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBooksStore } from '../store/booksStore';
import type { Book } from '../services/books.service';
import BookCover from '../components/common/BookCover';
import BookCard from '../components/common/BookCard';

const CATEGORY_COLORS: Record<string, string> = {
  Romance: '#E8845A', Fantasy: '#D4855F', Horror: '#7B5EA7',
  Historical: '#5D8A6C', Biography: '#4A7DAA', 'Young Adult': '#E9A84C',
  Science: '#5BA4A4', 'Self-Help': '#C97C3A', Psychology: '#6B7DB3',
  Design: '#D45F8A', Fiction: '#7A9E7E', Wellness: '#C88B4A',
  Novel: '#8B6A7A', Poetry: '#6A8BAF', Spiritual: '#7A9E7E',
  History: '#8B7355', Religious: '#7A6A8B', 'Short Stories': '#A07A5A',
};

const CATEGORY_ICONS: Record<string, string> = {
  Romance: '💕', Fantasy: '🐉', Horror: '👻', Historical: '🏛️',
  Biography: '👤', 'Young Adult': '⭐', Science: '🔬', 'Self-Help': '🧘',
  Psychology: '🧠', Design: '🎨', Fiction: '📖', Wellness: '🌿',
  Novel: '📕', Poetry: '🎭', Spiritual: '🙏', History: '📜',
  Religious: '⛪', 'Short Stories': '📝',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { books, booksLoading, booksError, loadBooks, shelf } = useBooksStore();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Reader';

  useEffect(() => {
    if (books.length === 0 && !booksLoading) {
      loadBooks();
    }
  }, []);

  const featuredBooks = books
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 5);

  const recommended = books.slice(0, 8);
  const popular = [...books].sort((a, b) => b.purchase_count - a.purchase_count).slice(0, 8);

  // Currently reading from user's shelf
  const currentlyReading = shelf
    .filter((s) => s.shelf === 'READING' && s.books)
    .slice(0, 1);

  // Unique categories from real books
  const categories = [...new Set(books.map((b) => b.category))].slice(0, 12);

  const goToFeatured = (idx: number) => {
    setFeaturedIdx(idx);
    if (carouselRef.current) {
      const card = carouselRef.current.children[idx] as HTMLElement;
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const toggleLike = (id: string) =>
    setLikedActivities((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  if (booksError) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Couldn't load books</h3>
          <p>{booksError}</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => loadBooks()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── Greeting ─────────────────────────────────────────────── */}
      <div className="home-greeting">
        <h1>Hi, <span>{firstName}!</span></h1>
        <button className="greeting-icon" onClick={() => navigate('/profile')} aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* ── Featured Books ─────────────────────────────────────────── */}
      {booksLoading ? (
        <div className="featured-skeleton">
          <div className="skeleton-card" />
        </div>
      ) : featuredBooks.length > 0 ? (
        <div className="featured-section">
          <div className="featured-carousel" ref={carouselRef}>
            {featuredBooks.map((book, idx) => (
              <div
                key={book.id}
                className={`featured-card ${idx === featuredIdx ? 'active' : ''}`}
              >
                <div className="featured-cover-col" onClick={() => navigate(`/book/${book.id}`)}>
                  <BookCover book={book} className="featured-cover" />
                </div>
                <div className="featured-info">
                  <div className="featured-label">✦ FEATURED</div>
                  <h2 className="featured-title">{book.title}</h2>
                  <div className="featured-author">{book.author_name}</div>
                  <div className="featured-stars">
                    {'★'.repeat(Math.floor(book.average_rating))}
                    {'☆'.repeat(5 - Math.floor(book.average_rating))}
                    <span>{book.average_rating.toFixed(1)}</span>
                  </div>
                  <div className="featured-actions">
                    <button
                      className="featured-view-btn"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      View Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="featured-dots">
            {featuredBooks.map((_, i) => (
              <button
                key={i}
                className={`featured-dot ${i === featuredIdx ? 'active' : ''}`}
                onClick={() => goToFeatured(i)}
                aria-label={`Go to featured book ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="home-empty-featured">
          <div className="empty-state-icon">📚</div>
          <p>No books published yet. Check back soon!</p>
          <button className="featured-view-btn" onClick={() => navigate('/explore')}>
            Browse All
          </button>
        </div>
      )}

      {/* ── Currently Reading ─────────────────────────────────────── */}
      {currentlyReading.length > 0 && currentlyReading[0].books && (
        <>
          <div className="section-header">
            <h2>Currently Reading</h2>
            <button onClick={() => navigate('/library')}>See all</button>
          </div>
          <div
            className="currently-reading-card"
            onClick={() => navigate(`/read/${currentlyReading[0].book_id}`)}
          >
            <BookCover book={currentlyReading[0].books as unknown as Book} className="cr-cover" />
            <div className="cr-info">
              <h3>{(currentlyReading[0].books as unknown as Book).title}</h3>
              <span className="author">by {(currentlyReading[0].books as unknown as Book).author_id}</span>
              <button
                className="cr-update-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/read/${currentlyReading[0].book_id}`);
                }}
              >
                Continue Reading →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Category Genre Pills ──────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="category-section">
          <div className="category-question">What would you like to read next?</div>
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className="book-genre-pill"
                style={{ '--book-color': CATEGORY_COLORS[cat] ?? '#C17817' } as React.CSSProperties}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat)}`)}
              >
                <div className="book-genre-cover">
                  <div className="book-genre-spine" />
                  <div className="book-genre-face">
                    <span className="book-genre-icon">{CATEGORY_ICONS[cat] ?? '📖'}</span>
                  </div>
                </div>
                <span className="book-genre-label">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ───────────────────────────────────────── */}
      {recommended.length > 0 && (
        <div className="recommendation-section">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <button onClick={() => navigate('/explore')}>See all</button>
          </div>
          <div className="recommendation-scroll">
            {recommended.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}

      {/* ── Popular ───────────────────────────────────────────────── */}
      {popular.length > 0 && (
        <div className="recommendation-section">
          <div className="section-header">
            <h2>Popular This Week</h2>
            <button onClick={() => navigate('/explore')}>See all</button>
          </div>
          <div className="recommendation-scroll recommendation-scroll-lg">
            {popular.map((b) => <BookCard key={b.id} book={b} large />)}
          </div>
        </div>
      )}

      {/* ── Empty state when no books exist ──────────────────────── */}
      {!booksLoading && books.length === 0 && (
        <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="empty-state-icon">📚</div>
          <h3>No books yet</h3>
          <p>Be the first to publish on Lehkhabu!</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/apply')}>
            Become an Author
          </button>
        </div>
      )}
    </div>
  );
}
