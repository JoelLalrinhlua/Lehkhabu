import { useNavigate } from 'react-router-dom';
import { currentUser, readBooks, currentlyReadingBooks, wantToReadBooks } from '../data/user';
import { books } from '../data/books';

export default function ProfilePage() {
  const navigate = useNavigate();

  const challengeProgress = (currentUser.readingChallenge.completed / currentUser.readingChallenge.goal) * 100;
  const booksToGoal = currentUser.readingChallenge.goal - currentUser.readingChallenge.completed;

  return (
    <div className="page">
      {/* Profile Header with decorative books */}
      <div className="profile-header">
        <div className="profile-book-stack">
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #E8A87C, #D4632E)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #85C1E9, #2E86C1)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #A9DFBF, #1E8449)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #F9E79F, #D4AC0D)' }} />
          <div className="book-stack-item" style={{ background: 'linear-gradient(135deg, #D7BDE2, #7D3C98)' }} />
        </div>
        <div className="profile-avatar">{currentUser.name[0]}</div>
        <h1 className="profile-name">{currentUser.name}</h1>
        <div className="profile-handle">{currentUser.username}</div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-number">{currentUser.totalRead}</div>
          <div className="stat-label">Total Read</div>
        </div>
        <div className="stat-item stat-item-divider">
          <div className="stat-number">{currentUser.following}</div>
          <div className="stat-label">Following</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{currentUser.followers}</div>
          <div className="stat-label">Followers</div>
        </div>
      </div>

      {/* Bookshelves */}
      <div className="profile-section">
        <h2 className="profile-section-title">Your Bookshelves</h2>
        <div className="bookshelves-grid">
          <button className="bookshelf-card bookshelf-read" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📗</div>
            <div className="bookshelf-name">Read</div>
            <div className="bookshelf-count">({readBooks.length})</div>
          </button>
          <button className="bookshelf-card bookshelf-want" onClick={() => navigate('/explore')}>
            <div className="bookshelf-icon">🔖</div>
            <div className="bookshelf-name">Want to Read</div>
            <div className="bookshelf-count">({wantToReadBooks.length})</div>
          </button>
          <button className="bookshelf-card bookshelf-reading" onClick={() => navigate('/library')}>
            <div className="bookshelf-icon">📖</div>
            <div className="bookshelf-name">Currently Reading</div>
            <div className="bookshelf-count">({currentlyReadingBooks.length})</div>
          </button>
        </div>
      </div>

      {/* Reading Challenge */}
      <div className="profile-section">
        <div className="challenge-card">
          <h2 className="challenge-title">{currentUser.readingChallenge.year} Reading Challenge</h2>
          <div className="challenge-content">
            <div className="challenge-icon">📚</div>
            {booksToGoal > 0 ? (
              <div className="challenge-text">
                Read <strong>{booksToGoal} more book{booksToGoal !== 1 ? 's' : ''}</strong> to reach your goal of {currentUser.readingChallenge.goal}!
              </div>
            ) : (
              <div className="challenge-text">🎉 You've reached your reading goal!</div>
            )}
            <div className="challenge-progress">
              <div className="challenge-bar">
                <div className="challenge-fill" style={{ width: `${Math.min(challengeProgress, 100)}%` }} />
              </div>
              <div className="challenge-stats">
                <span>{currentUser.readingChallenge.completed} of {currentUser.readingChallenge.goal} books</span>
                <span>{currentUser.readingChallenge.daysLeft} days left</span>
              </div>
            </div>
            <button className="challenge-edit" onClick={() => {}}>Edit Challenge Goal</button>
          </div>
        </div>
      </div>

      {/* Recently Read */}
      <div className="profile-section">
        <h2 className="profile-section-title">Recently Read</h2>
        {readBooks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't finished any books yet. Keep reading! 📖</p>
        ) : (
          readBooks.slice(0, 4).map((book) => (
            <div
              key={book.id}
              className="activity-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <div className="activity-user">
                <div className="activity-avatar" style={{ background: 'linear-gradient(135deg, var(--color-terracotta), var(--color-amber))' }}>
                  {currentUser.name[0]}
                </div>
                <div className="activity-user-info">
                  <div className="activity-user-name">{book.title}</div>
                  <div className="activity-action">by {book.author} · {book.totalPages} pages</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--color-amber)', fontSize: '0.82rem', fontWeight: 600 }}>
                  ★ {book.rating.toFixed(1)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
