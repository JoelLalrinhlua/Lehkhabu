import type { Book } from '../../types';

interface BookCoverProps {
  book: Book;
  className?: string;
  style?: React.CSSProperties;
}

export default function BookCover({ book, className = '', style }: BookCoverProps) {
  if (book.coverImage) {
    return (
      <div className={className} style={style}>
        <img src={book.coverImage} alt={book.title} loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        background: `linear-gradient(135deg, ${book.coverColors[0]}, ${book.coverColors[1]})`,
      }}
    >
      <div className="book-cover-gradient" style={{ color: book.coverTextColor }}>
        <span className="book-cover-title">{book.title}</span>
        <span className="book-cover-author">{book.author}</span>
      </div>
    </div>
  );
}
