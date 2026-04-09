import { useNavigate, useParams } from 'react-router-dom';
import { books } from '../data/books';
import BookCover from '../components/common/BookCover';
import BookCard from '../components/common/BookCard';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const book = books.find((b) => b.id === id);
  if (!book) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>Book not found</h3>
          <p>The book you're looking for doesn't exist.</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const relatedBooks = books
    .filter((b) => b.id !== book.id && (b.category === book.category || b.tags.some((t) => book.tags.includes(t))))
    .slice(0, 6);

  const fullStars = Math.floor(book.rating);
  const hasHalf = book.rating - fullStars >= 0.3;

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n.toString();
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
          <div className="book-detail-tags">
            {book.tags.map((tag) => (
              <span key={tag} className="book-detail-tag">{tag}</span>
            ))}
          </div>

          {/* Title & Author */}
          <h1 className="book-detail-title">{book.title}</h1>
          <div className="book-detail-author">by {book.author}</div>

          {/* Rating */}
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
            <span className="book-detail-rating-num">{book.rating.toFixed(2)}</span>
            <span className="book-detail-rating-count">({formatCount(book.ratingCount)} ratings)</span>
          </div>

          {/* CTA */}
          <div className="book-detail-cta">
            {book.purchased ? (
              <button className="btn-primary" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Now
              </button>
            ) : (
              <button className="btn-primary">
                🛒 Buy — ₹{book.price}
              </button>
            )}
            <button className="btn-outline">Add to Shelf</button>
            <button className="btn-outline">Rate this Book</button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="book-detail-description">
        <h3>Book Description</h3>
        <p>{book.description}</p>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="recommendation-section" style={{ marginTop: 'var(--space-2xl)' }}>
          <div className="section-header">
            <h2>You Might Also Like</h2>
          </div>
          <div className="recommendation-scroll">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
