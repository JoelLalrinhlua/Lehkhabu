import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { books, categories } from '../data/books';
import { currentlyReadingBooks } from '../data/user';
import BookCard from '../components/common/BookCard';
import BookCover from '../components/common/BookCover';

const CATEGORY_COLORS: Record<string, string> = {
  Romance: '#E8845A', Fantasy: '#D4855F', Horror: '#7B5EA7',
  Historical: '#5D8A6C', Biography: '#4A7DAA', 'Young Adult': '#E9A84C',
  Science: '#5BA4A4', 'Self-Help': '#C97C3A', Psychology: '#6B7DB3',
  Design: '#D45F8A', Fiction: '#7A9E7E', Wellness: '#C88B4A',
};

const CATEGORY_ICONS: Record<string, string> = {
  Romance: '💕', Fantasy: '🐉', Horror: '👻', Historical: '🏛️',
  Biography: '👤', 'Young Adult': '⭐', Science: '🔬', 'Self-Help': '🧘',
  Psychology: '🧠', Design: '🎨', Fiction: '📖', Wellness: '🌿',
};

// Featured books: highest rated books with cover images
const featuredBooks = books
  .filter((b) => b.coverImage)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5);

export default function HomePage() {
  const navigate = useNavigate();
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set());
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const recommended = books.filter((b) => !b.purchased).slice(0, 8);
  const popular = [...books].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 8);

  const toggleLike = (id: string) =>
    setLikedActivities((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const goToFeatured = (idx: number) => {
    setFeaturedIdx(idx);
    if (carouselRef.current) {
      const card = carouselRef.current.children[idx] as HTMLElement;
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <div className="page">
      {/* ── Greeting ───────────────────────────────────────── */}
      <div className="home-greeting">
        <h1>Hi, <span>Joel!</span></h1>
        <button className="greeting-icon" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* ── Featured Books ─────────────────────────────────── */}
      <div className="featured-section">
        <div className="featured-carousel" ref={carouselRef}>
          {featuredBooks.map((book, idx) => (
            <div
              key={book.id}
              className={`featured-card ${idx === featuredIdx ? 'active' : ''}`}
            >
              {/* Cover side */}
              <div className="featured-cover-col" onClick={() => navigate(`/book/${book.id}`)}>
                <BookCover book={book} className="featured-cover" />
                {!book.purchased && (
                  <div className="featured-price">₹{book.price}</div>
                )}
              </div>

              {/* Info side */}
              <div className="featured-info">
                <div className="featured-label">✦ FEATURED</div>
                <h2 className="featured-title">{book.title}</h2>
                <div className="featured-author">{book.author}</div>
                <div className="featured-stars">
                  {'★'.repeat(Math.floor(book.rating))}{'☆'.repeat(5 - Math.floor(book.rating))}
                  <span>{book.rating.toFixed(2)}</span>
                </div>
                <div className="featured-actions">
                  <button
                    className="featured-view-btn"
                    onClick={() => navigate(`/book/${book.id}`)}
                  >
                    View Book
                  </button>
                  {book.purchased && (
                    <button
                      className="featured-read-btn"
                      onClick={() => navigate(`/read/${book.id}`)}
                    >
                      Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
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

      {/* ── Currently Reading ──────────────────────────────── */}
      {currentlyReadingBooks.length > 0 && (
        <>
          <div className="section-header">
            <h2>Currently Reading</h2>
            <button onClick={() => navigate('/library')}>See all</button>
          </div>
          <div
            className="currently-reading-card"
            onClick={() => navigate(`/read/${currentlyReadingBooks[0].id}`)}
          >
            <BookCover book={currentlyReadingBooks[0]} className="cr-cover" />
            <div className="cr-info">
              <h3>{currentlyReadingBooks[0].title}</h3>
              <span className="author">by {currentlyReadingBooks[0].author}</span>
              <div className="cr-progress">
                <div className="cr-progress-bar">
                  <div
                    className="cr-progress-fill"
                    style={{ width: `${Math.round(((currentlyReadingBooks[0].currentPage ?? 0) / currentlyReadingBooks[0].totalPages) * 100)}%` }}
                  />
                </div>
                <span>{Math.round(((currentlyReadingBooks[0].currentPage ?? 0) / currentlyReadingBooks[0].totalPages) * 100)}%</span>
              </div>
              <button className="cr-update-btn" onClick={(e) => { e.stopPropagation(); navigate(`/read/${currentlyReadingBooks[0].id}`); }}>
                Continue Reading →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Category Genre Pills ───────────────────────────── */}
      <div className="category-section">
        <div className="category-question">What would you like to read next?</div>
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="book-genre-pill"
              style={{ '--book-color': CATEGORY_COLORS[cat.name] ?? '#C17817' } as React.CSSProperties}
              onClick={() => navigate('/explore')}
            >
              <div className="book-genre-cover">
                <div className="book-genre-spine" />
                <div className="book-genre-face">
                  <span className="book-genre-icon">{CATEGORY_ICONS[cat.name] ?? cat.icon}</span>
                </div>
              </div>
              <span className="book-genre-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity ───────────────────────────────────────── */}
      <div className="activity-section">
        <div className="section-header"><h2>What's up on the Block</h2></div>
        {[books[6], books[3]].map((book, i) => (
          <div key={book.id} className="activity-card">
            <div className="activity-user">
              <div className="activity-avatar" style={{ background: i === 0 ? 'linear-gradient(135deg,#5D8A6C,#4A7DAA)' : 'linear-gradient(135deg,#C17817,#D4922F)' }}>
                {i === 0 ? 'LM' : 'KS'}
              </div>
              <div className="activity-user-info">
                <div className="activity-user-name">{i === 0 ? 'Leslie Moon' : 'Kai Santos'}</div>
                <div className="activity-action">{i === 0 ? 'rated & reviewed' : 'started reading'}</div>
              </div>
            </div>
            <div className="activity-book">
              <BookCover book={book} className="activity-book-cover" />
              <div className="activity-book-info">
                <h4>{book.title}</h4>
                <div className="author">by {book.author}</div>
              </div>
            </div>
            <div className="activity-actions">
              <button className="activity-btn" onClick={() => navigate(`/book/${book.id}`)}>View Book</button>
            </div>
            <button
              className={`activity-like ${likedActivities.has(String(i)) ? 'liked' : ''}`}
              onClick={() => toggleLike(String(i))}
            >
              <svg viewBox="0 0 24 24" fill={likedActivities.has(String(i)) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {likedActivities.has(String(i)) ? `${i + 2} Likes` : `${i + 1} Like${i > 0 ? 's' : ''}`}
            </button>
          </div>
        ))}
      </div>

      {/* ── Recommendations ────────────────────────────────── */}
      <div className="recommendation-section">
        <div className="section-header">
          <h2>Recommended for You</h2>
          <button onClick={() => navigate('/explore')}>See all</button>
        </div>
        <div className="recommendation-scroll">
          {recommended.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </div>

      {/* ── Popular This Week ──────────────────────────────── */}
      <div className="recommendation-section">
        <div className="section-header">
          <h2>Popular This Week</h2>
          <button onClick={() => navigate('/explore')}>See all</button>
        </div>
        <div className="recommendation-scroll recommendation-scroll-lg">
          {popular.map((b) => <BookCard key={b.id} book={b} large />)}
        </div>
      </div>
    </div>
  );
}
