import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBooksStore } from '../store/booksStore';
import { fetchBookById } from '../services/books.service';
import { checkOwnership, claimFreeBook, purchaseBook } from '../services/purchases.service';
import type { Book } from '../services/books.service';
import BookCover from '../components/common/BookCover';
import BookCard from '../components/common/BookCard';
import { usePageMeta } from '../hooks/usePageMeta';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { books, isInWishlist, toggleWishlist } = useBooksStore();

  const [book, setBook] = useState<Book | null | 'loading'>('loading');
  const [owned, setOwned] = useState(false);
  const [ownershipChecked, setOwnershipChecked] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseDone, setPurchaseDone] = useState(false);

  useEffect(() => {
    if (!id) { setBook(null); return; }
    const cached = books.find((b) => b.id === id);
    if (cached) { setBook(cached); return; }
    fetchBookById(id).then(setBook).catch(() => setBook(null));
  }, [id, books]);

  // Check ownership after book loads
  useEffect(() => {
    if (!profile?.id || !id || book === 'loading' || !book) return;
    if (book.is_free) { setOwned(true); setOwnershipChecked(true); return; }
    checkOwnership(profile.id, id)
      .then(result => { setOwned(result); setOwnershipChecked(true); })
      .catch(() => setOwnershipChecked(true));
  }, [profile?.id, id, book]);

  const isLoaded = book !== 'loading' && book !== null;
  usePageMeta(isLoaded ? {
    title: book.title,
    description: book.description ?? `Read "${book.title}" on Lehkhabu.`,
    image: book.cover_image_url ?? undefined,
    url: `https://lehkhabu.com/book/${book.id}`,
    type: 'book',
  } : {});

  const handleWishlist = async () => {
    if (!profile?.id || !isLoaded) return;
    setWishlistLoading(true);
    try { await toggleWishlist(profile.id, book.id); }
    finally { setWishlistLoading(false); }
  };

  const handleClaim = useCallback(async () => {
    if (!profile?.id || !id || !isLoaded) return;
    setPurchasing(true); setPurchaseError(null);
    try {
      await claimFreeBook(profile.id, id);
      setOwned(true); setPurchaseDone(true);
      setTimeout(() => { setShowCheckout(false); setPurchaseDone(false); }, 1500);
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : 'Failed to claim book.');
    } finally { setPurchasing(false); }
  }, [profile?.id, id, isLoaded]);

  const handleBuy = useCallback(async () => {
    if (!profile?.id || !id || !isLoaded) return;
    setPurchasing(true); setPurchaseError(null);
    try {
      await purchaseBook(profile.id, id);
      setOwned(true); setPurchaseDone(true);
      setTimeout(() => { setShowCheckout(false); setPurchaseDone(false); }, 1500);
    } catch (e) {
      setPurchaseError(e instanceof Error ? e.message : 'Purchase failed.');
    } finally { setPurchasing(false); }
  }, [profile?.id, id, isLoaded]);

  if (book === 'loading') return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="auth-init-spinner" />
    </div>
  );

  if (!book) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">📖</div>
        <h3>Book not found</h3>
        <p>This book may have been removed or is not yet published.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  const inWishlist = isInWishlist(book.id);
  const relatedBooks = books.filter((b) => b.id !== book.id && b.category === book.category).slice(0, 6);
  const fullStars = Math.floor(book.average_rating);
  const hasHalf = book.average_rating - fullStars >= 0.3;
  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
  const allTags = [...book.tags, book.category, book.language, book.total_pages ? `${book.total_pages} pages` : null].filter(Boolean) as string[];

  return (
    <div className="page book-detail-v2">
      <button className="book-detail-back" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      <div className="bdv2-hero">
        <div className="bdv2-info">
          <h1 className="bdv2-title">{book.title}</h1>
          {book.author_name && <div className="bdv2-author">{book.author_name}</div>}

          {allTags.length > 0 && (
            <div className="bdv2-tags">
              {allTags.map((tag) => <span key={tag} className="bdv2-tag">{tag}</span>)}
            </div>
          )}

          {book.description && <p className="bdv2-description">{book.description}</p>}

          {book.average_rating > 0 && (
            <div className="bdv2-rating">
              <div className="book-detail-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`star ${i < fullStars ? '' : i === fullStars && hasHalf ? 'half' : 'empty'}`} viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="book-detail-rating-num">{book.average_rating.toFixed(2)}</span>
              {book.rating_count > 0 && <span className="book-detail-rating-count">({formatCount(book.rating_count)} ratings)</span>}
            </div>
          )}

          <div className="bdv2-cta">
            {owned && ownershipChecked ? (
              <button className="bdv2-btn-read" onClick={() => navigate(`/read/${book.id}`)}>
                📖 Read Now
              </button>
            ) : book.is_free ? (
              <button className="bdv2-btn-read" id="claim-free-btn" onClick={() => setShowCheckout(true)}>
                📖 Get for Free
              </button>
            ) : (
              <button className="bdv2-btn-read" id="buy-book-btn" onClick={() => setShowCheckout(true)}>
                🛒 Buy — ₹{book.price}
              </button>
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

        <div className="bdv2-cover-col">
          <div className="bdv2-dot bdv2-dot-1" /><div className="bdv2-dot bdv2-dot-2" /><div className="bdv2-dot bdv2-dot-3" />
          <BookCover book={book} className="bdv2-cover" />
        </div>
      </div>

      {relatedBooks.length > 0 && (
        <div className="bdv2-related">
          <h2 className="bdv2-related-title">You may like</h2>
          <div className="recommendation-scroll">
            {relatedBooks.map((b) => <BookCard key={b.id} book={b} />)}
          </div>
        </div>
      )}

      {/* ── Checkout Modal ───────────────────────────────── */}
      {showCheckout && (
        <div className="author-modal-backdrop" onClick={() => !purchasing && setShowCheckout(false)}>
          <div className="author-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="author-modal-header">
              <h3>{book.is_free ? '📖 Get This Book' : '🛒 Complete Purchase'}</h3>
              <button className="author-modal-close" onClick={() => !purchasing && setShowCheckout(false)}>✕</button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                <BookCover book={book} style={{ width: 56, height: 80, borderRadius: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{book.title}</div>
                  {book.author_name && <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{book.author_name}</div>}
                  <div style={{ marginTop: 8, fontWeight: 700, fontSize: '1.1rem', color: book.is_free ? 'var(--color-sage-dark)' : 'var(--color-terracotta)' }}>
                    {book.is_free ? 'FREE' : `₹${book.price}`}
                  </div>
                </div>
              </div>

              {purchaseDone ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--color-sage-dark)', fontWeight: 600 }}>
                  ✅ {book.is_free ? 'Book added to your library!' : 'Purchase successful! Book added to library.'}
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                    {book.is_free
                      ? 'This book is free. Claiming it will add it to your personal library so you can read it anytime.'
                      : 'Your purchase grants you permanent access to this book. You can read it anytime from your library.'}
                  </p>
                  {purchaseError && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                      ⚠️ {purchaseError}
                    </div>
                  )}
                  <button
                    id="confirm-purchase-btn"
                    className="btn-author-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={book.is_free ? handleClaim : handleBuy}
                    disabled={purchasing}
                  >
                    {purchasing ? '⏳ Processing…' : book.is_free ? '📖 Claim for Free' : `💳 Buy for ₹${book.price}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
