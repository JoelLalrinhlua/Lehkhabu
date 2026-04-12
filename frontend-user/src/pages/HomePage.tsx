import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBooksStore } from '../store/booksStore';
import type { Book, ShelfEntry } from '../services/books.service';
import BookCover from '../components/common/BookCover';

/* ── Tiny reusable heart button ─────────────────────────── */
function HeartBtn({
  bookId,
  userId,
}: {
  bookId: string;
  userId: string | undefined;
}) {
  const { isInWishlist, toggleWishlist } = useBooksStore();
  const [loading, setLoading] = useState(false);
  const active = isInWishlist(bookId);

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || loading) return;
    setLoading(true);
    try { await toggleWishlist(userId, bookId); }
    finally { setLoading(false); }
  };

  return (
    <button
      className={`hb-heart${active ? ' hb-heart--active' : ''}`}
      onClick={handle}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      disabled={loading}
    >
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/* ── 3-D Grid Book Card ─────────────────────────────────── */
function GridBookCard({ book, userId }: { book: Book; userId: string | undefined }) {
  const navigate = useNavigate();
  return (
    <div className="hb-book-card" onClick={() => navigate(`/book/${book.id}`)}>
      <div className="hb-book-card-top">
        <span className="hb-read-now">READ NOW</span>
        <HeartBtn bookId={book.id} userId={userId} />
      </div>
      <div className="hb-book-3d-wrap">
        <BookCover book={book} className="hb-book-3d-cover" />
      </div>
      <div className="hb-book-info">
        {book.average_rating > 0 && (
          <div className="hb-book-rating">
            <svg viewBox="0 0 24 24" fill="#F5A623" width="11" height="11">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {book.average_rating.toFixed(1)}
          </div>
        )}
        <div className="hb-book-title">{book.title}</div>
        <div className="hb-book-author">by {book.author_name}</div>
      </div>
    </div>
  );
}

/* ── Horizontal scroll book strip ───────────────────────── */
function BookStrip({ books, userId }: { books: Book[]; userId: string | undefined }) {
  const navigate = useNavigate();
  return (
    <div className="hb-strip">
      {books.map((book) => (
        <div key={book.id} className="hb-strip-card" onClick={() => navigate(`/book/${book.id}`)}>
          <div className="hb-strip-cover-wrap">
            <BookCover book={book} className="hb-strip-cover" />
            <div className="hb-strip-heart-wrap">
              <HeartBtn bookId={book.id} userId={userId} />
            </div>
          </div>
          <div className="hb-strip-title">{book.title}</div>
          <div className="hb-strip-author">{book.author_name}</div>
          {book.average_rating > 0 && (
            <div className="hb-book-rating" style={{ marginTop: 2 }}>
              <svg viewBox="0 0 24 24" fill="#F5A623" width="10" height="10">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {book.average_rating.toFixed(1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Continue Reading card ──────────────────────────────── */
function ContinueReadingCard({ entry, book }: { entry: ShelfEntry; book: Book }) {
  const navigate = useNavigate();
  const progress = 40; // placeholder — real progress comes from readingProgress

  return (
    <div
      className="hb-cr-row"
      onClick={() => navigate(`/read/${entry.book_id}`)}
    >
      <div className="hb-cr-cover-wrap">
        <BookCover book={book} className="hb-cr-cover" />
      </div>
      <div className="hb-cr-info">
        <span className="hb-read-now" style={{ marginBottom: 3 }}>CONTINUE READING</span>
        <div className="hb-cr-title">{book.title}</div>
        <div className="hb-cr-sub">by {book.author_name}</div>
        <div className="hb-cr-bar">
          <div className="hb-cr-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="hb-cr-progress-label">{progress}% completed</div>
      </div>
      <div className="hb-cr-chevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

/* ── Main HomePage ──────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { books, booksLoading, loadBooks, shelf } = useBooksStore();

  const userId = profile?.supabase_uid;
  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Reader';

  useEffect(() => {
    if (books.length === 0 && !booksLoading) loadBooks();
  }, []);

  /* Derived data ─────────────────────────────────────── */
  // Hero: top-rated book
  const heroBook = [...books].sort((a, b) => b.average_rating - a.average_rating)[0];

  // Recommended: rotate through books offset from hero
  const recommended = books.filter(b => b.id !== heroBook?.id).slice(0, 10);

  // Popular: by purchase count
  const popular = [...books]
    .sort((a, b) => b.purchase_count - a.purchase_count)
    .filter(b => b.id !== heroBook?.id)
    .slice(0, 6);

  // Currently Reading
  const readingEntries = shelf.filter(s => s.shelf === 'READING' && s.books).slice(0, 3);

  // New Arrivals (latest created_at)
  const newArrivals = [...books]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 8);

  /* Section header helper ────────────────────────────── */
  const SectionHeader = ({
    title,
    onSeeAll,
  }: {
    title: string;
    onSeeAll?: () => void;
  }) => (
    <div className="hb-section-header">
      <span>{title}</span>
      {onSeeAll && <button onClick={onSeeAll}>See all</button>}
    </div>
  );

  return (
    <div className="hb-page">

      {/* ── Greeting ────────────────────────────────────── */}
      <div className="hb-greeting">
        <div>
          <div className="hb-greeting-sub">Good reading, 📖</div>
          <h1 className="hb-greeting-name">{firstName}!</h1>
        </div>
      </div>

      {/* ── Hero / Popular card ──────────────────────────── */}
      {booksLoading ? (
        <div className="hb-hero-skeleton" />
      ) : heroBook ? (
        <div className="hb-hero-card" onClick={() => navigate(`/book/${heroBook.id}`)}>
          <div className="hb-hero-info">
            <div className="hb-hero-badge">🔥 Popular Right Now</div>
            <h2 className="hb-hero-title">{heroBook.title}</h2>
            <div className="hb-hero-author">
              {heroBook.author_name}
              {heroBook.published_year ? ` · ${heroBook.published_year}` : ''}
            </div>
            {heroBook.average_rating > 0 && (
              <div className="hb-hero-stars">
                {'★'.repeat(Math.round(heroBook.average_rating))}
                {'☆'.repeat(5 - Math.round(heroBook.average_rating))}
                <span>{heroBook.average_rating.toFixed(1)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                className="hb-hero-btn"
                onClick={(e) => { e.stopPropagation(); navigate(`/book/${heroBook.id}`); }}
              >
                Read More →
              </button>
              <div onClick={e => e.stopPropagation()}>
                <HeartBtn bookId={heroBook.id} userId={userId} />
              </div>
            </div>
          </div>
          <div className="hb-hero-book-wrap">
            <BookCover book={heroBook} className="hb-hero-cover" />
          </div>
        </div>
      ) : null}

      {/* ── Continue Reading ─────────────────────────────── */}
      {readingEntries.length > 0 && (
        <div className="hb-continue-section">
          <SectionHeader title="Continue Reading 📖" onSeeAll={() => navigate('/library')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {readingEntries.map((entry) => {
              const book = entry.books as unknown as Book;
              if (!book) return null;
              return <ContinueReadingCard key={entry.book_id} entry={entry} book={book} />;
            })}
          </div>
        </div>
      )}

      {/* ── Recommended for You ──────────────────────────── */}
      {!booksLoading && recommended.length > 0 && (
        <div>
          <SectionHeader title="Recommended for You ✨" onSeeAll={() => navigate('/explore')} />
          <BookStrip books={recommended.slice(0, 8)} userId={userId} />
        </div>
      )}

      {/* ── Popular Books Grid ───────────────────────────── */}
      {!booksLoading && popular.length > 0 && (
        <div>
          <SectionHeader title="Popular This Week 🏆" onSeeAll={() => navigate('/explore')} />
          <div className="hb-grid">
            {popular.map((book) => (
              <GridBookCard key={book.id} book={book} userId={userId} />
            ))}
          </div>
        </div>
      )}

      {/* ── New Arrivals ─────────────────────────────────── */}
      {!booksLoading && newArrivals.length > 0 && (
        <div>
          <SectionHeader title="New Arrivals 🆕" onSeeAll={() => navigate('/explore')} />
          <BookStrip books={newArrivals.slice(0, 8)} userId={userId} />
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {!booksLoading && books.length === 0 && (
        <div className="hb-empty">
          <div style={{ fontSize: '3rem' }}>📚</div>
          <h3>No books yet</h3>
          <p>Be the first to publish on Lehkhabu!</p>
          <button className="hb-hero-btn" style={{ marginTop: 16 }} onClick={() => navigate('/explore')}>
            Explore Library
          </button>
        </div>
      )}

      {/* bottom spacing for nav */}
      <div style={{ height: 24 }} />
    </div>
  );
}
