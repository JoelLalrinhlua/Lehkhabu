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

  return (
    <div className="page book-detail">
      {/* Back */}
      <button className="book-detail-back" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Hero */}
      <div className="book-detail-hero">
        <BookCover book={book} className="book-detail-cover" />

        <div className="book-detail-info">
          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="book-detail-tags">
              {book.tags.map((tag) => (
                <span key={tag} className="book-detail-tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Title & Author */}
          <h1 className="book-detail-title">{book.title}</h1>
          {book.author_name && (
            <div className="book-detail-author">by {book.author_name}</div>
          )}

          {/* Meta */}
          <div className="book-detail-meta-row">
            {book.language && (
              <span className="book-detail-meta-pill">{book.language}</span>
            )}
            {book.total_pages && (
              <span className="book-detail-meta-pill">{book.total_pages} pages</span>
            )}
            {book.category && (
              <span className="book-detail-meta-pill">{book.category}</span>
            )}
          </div>

          {/* Rating */}
          {book.average_rating > 0 && (
            <div className="book-detail-rating">
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

          {/* CTA */}
          <div className="book-detail-cta">
            {owned ? (
              <button className="btn-primary" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Now
              </button>
            ) : book.is_free ? (
              <button className="btn-primary" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Free
              </button>
            ) : (
              <button className="btn-primary" disabled title="Payments coming soon">
                🛒 Buy — ₹{book.price}
              </button>
            )}

            <button
              className={`btn-outline ${inWishlist ? 'btn-outline-active' : ''}`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {inWishlist ? '🔖 Wishlisted' : '🔖 Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="book-detail-description">
          <h3>About this Book</h3>
          <p>{book.description}</p>
        </div>
      )}

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="recommendation-section" style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2>You Might Also Like</h2>
          </div>
          <div className="recommendation-scroll">
            {relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
