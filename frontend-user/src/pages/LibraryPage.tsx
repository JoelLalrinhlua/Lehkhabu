import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { books } from '../data/books';
import BookCover from '../components/common/BookCover';
import BookCard from '../components/common/BookCard';

type Tab = 'shelves' | 'wishlist';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('shelves');

  const purchasedBooks = books.filter((b) => b.purchased);
  const wishlistBooks = books.filter((b) => !b.purchased);

  // Group purchased by category
  const shelves: Record<string, typeof books> = {};
  purchasedBooks.forEach((book) => {
    if (!shelves[book.category]) shelves[book.category] = [];
    shelves[book.category].push(book);
  });

  return (
    <div className="page">
      {/* Header */}
      <div className="library-header">
        <div className="library-subtitle">My Favourite</div>
        <h1 className="library-title">BOOKS</h1>
      </div>

      {/* Tabs */}
      <div className="library-tabs">
        <button
          className={`library-tab ${activeTab === 'shelves' ? 'active' : ''}`}
          onClick={() => setActiveTab('shelves')}
        >
          📚 My Shelves
          <span className="tab-badge">{purchasedBooks.length}</span>
        </button>
        <button
          className={`library-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          🔖 Wishlist
          <span className="tab-badge">{wishlistBooks.length}</span>
        </button>
      </div>

      {/* Shelves Tab */}
      {activeTab === 'shelves' && (
        <div className="animate-fade-in">
          {Object.entries(shelves).map(([category, shelfBooks], idx) => (
            <ShelfRow
              key={category}
              category={category}
              books={shelfBooks}
              index={idx}
              onBookClick={(id) => navigate(`/book/${id}`)}
            />
          ))}
          <button className="library-add-btn" onClick={() => navigate('/explore')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Browse More Books
          </button>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="wishlist-grid animate-fade-in">
          {wishlistBooks.map((book) => (
            <div key={book.id} className="wishlist-item" onClick={() => navigate(`/book/${book.id}`)}>
              <BookCover book={book} className="wishlist-cover" />
              <div className="wishlist-info">
                <div className="wishlist-title">{book.title}</div>
                <div className="wishlist-author">{book.author}</div>
                <div className="wishlist-meta">
                  <span className="wishlist-rating">★ {book.rating.toFixed(1)}</span>
                  <span className="wishlist-price">₹{book.price}</span>
                </div>
                <button
                  className="wishlist-buy-btn"
                  onClick={(e) => { e.stopPropagation(); navigate(`/book/${book.id}`); }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShelfRow({ category, books: shelfBooks, index, onBookClick }: {
  category: string;
  books: typeof books;
  index: number;
  onBookClick: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });

  return (
    <div className="shelf-section animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="shelf-header">
        <h3 className="shelf-name">{category}</h3>
        <div className="shelf-count">
          {shelfBooks.length} book{shelfBooks.length !== 1 ? 's' : ''}
          <div className="shelf-arrows">
            <button className="shelf-arrow" onClick={() => scroll('left')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="shelf-arrow" onClick={() => scroll('right')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="shelf-scroll" ref={scrollRef}>
        {shelfBooks.map((book) => (
          <div key={book.id} className="shelf-book" onClick={() => onBookClick(book.id)}>
            <BookCover book={book} className="shelf-book-cover" />
            <div className="shelf-book-title">{book.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
