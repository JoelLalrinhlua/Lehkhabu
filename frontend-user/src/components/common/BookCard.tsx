import { useNavigate } from 'react-router-dom';
import type { Book } from '../../types';
import BookCover from './BookCover';

interface BookCardProps {
  book: Book;
  showRating?: boolean;
  large?: boolean;
}

export default function BookCard({ book, showRating = true, large = false }: BookCardProps) {
  const navigate = useNavigate();

  return (
    <div className={`book-card ${large ? 'book-card-lg' : ''}`} onClick={() => navigate(`/book/${book.id}`)}>
      <BookCover book={book} className={`book-card-cover ${large ? 'book-card-cover-lg' : ''}`} />
      <div className="book-card-title">{book.title}</div>
      <div className="book-card-author">{book.author}</div>
      {showRating && (
        <div className="book-card-rating">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {book.rating.toFixed(1)}
        </div>
      )}
    </div>
  );
}
