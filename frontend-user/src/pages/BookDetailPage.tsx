import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBooksStore } from '../store/booksStore';
import { fetchBookById } from '../services/books.service';
import type { Book } from '../services/books.service';
import BookCover from '../components/common/BookCover';
import BookCard from '../components/common/BookCard';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { books, purchases, isInWishlist, toggleWishlist, isOwned } = useBooksStore();

  const [book, setBook] = useState<Book | null | 'loading'>('loading');
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // First try from store cache, then fetch from DB if not found
  useEffect(() => {
    if (!id) { setBook(null); return; }
    const cached = books.find((b) => b.id === id);
    if (cached) { setBook(cached); return; }

    fetchBookById(id)
      .then((b) => setBook(b))
      .catch(() => setBook(null));
  }, [id, books]);

  if (book === 'loading') {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="auth-init-spinner" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>Book not found</h3>
          <p>This book may have been removed or is not yet published.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const owned = isOwned(book.id);
  const inWishlist = isInWishlist(book.id);
  const relatedBooks = books
    .filter((b) => b.id !== book.id && b.category === book.category)
    .slice(0, 6);

  const fullStars = Math.floor(book.average_rating);
  const hasHalf = book.average_rating - fullStars >= 0.3;

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n.toString();
  };

  const handleWishlist = async () => {
    if (!profile?.id) return;
    setWishlistLoading(true);
    try {
      await toggleWishlist(profile.id, book.id);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Combine all tags / meta into pills
  const allTags = [
    ...book.tags,
    book.category,
    book.language,
    book.total_pages ? `${book.total_pages} pages` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="page book-detail-v2">
      {/* Back */}
      <button className="book-detail-back" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* ── Hero split layout ────────────────────────────── */}
      <div className="bdv2-hero">
        {/* Left: text content */}
        <div className="bdv2-info">
          <h1 className="bdv2-title">{book.title}</h1>
          {book.author_name && (
            <div className="bdv2-author">{book.author_name}</div>
          )}

          {/* Tags / pills */}
          {allTags.length > 0 && (
            <div className="bdv2-tags">
              {allTags.map((tag) => (
                <span key={tag} className="bdv2-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Description */}
          {book.description && (
            <p className="bdv2-description">{book.description}</p>
          )}

          {/* Rating */}
          {book.average_rating > 0 && (
            <div className="bdv2-rating">
              <div className="book-detail-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`star ${i < fullStars ? '' : i === fullStars && hasHalf ? 'half' : 'empty'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="book-detail-rating-num">{book.average_rating.toFixed(2)}</span>
              {book.rating_count > 0 && (
                <span className="book-detail-rating-count">({formatCount(book.rating_count)} ratings)</span>
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="bdv2-cta">
            {owned ? (
              <button className="bdv2-btn-read" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Now
              </button>
            ) : book.is_free ? (
              <button className="bdv2-btn-read" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Free
              </button>
            ) : (
              <>
                <div className="bdv2-price-btn bdv2-price-ebook">
                  <span className="bdv2-price-label">E-book</span>
                  <span className="bdv2-price-value">₹{Math.round(book.price * 0.45)}</span>
                </div>
              </>
            )}

            <button
              className={`bdv2-wishlist-btn ${inWishlist ? 'active' : ''}`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: book cover */}
        <div className="bdv2-cover-col">
          {/* Decorative dots */}
          <div className="bdv2-dot bdv2-dot-1" />
          <div className="bdv2-dot bdv2-dot-2" />
          <div className="bdv2-dot bdv2-dot-3" />
          <BookCover book={book} className="bdv2-cover" />
        </div>
      </div>

      {/* ── You may like ─────────────────────────────────── */}
      {relatedBooks.length > 0 && (
        <div className="bdv2-related">
          <h2 className="bdv2-related-title">You may like</h2>
          <div className="recommendation-scroll">
            {relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
