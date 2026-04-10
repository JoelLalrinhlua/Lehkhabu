import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import type { BookSubmission } from '../store/userStore';
import { useAuthStore } from '../store/authStore';

const GENRES = ['Fiction', 'Non-Fiction', 'History', 'Religious', 'Poetry', 'Novel', 'Short Stories', 'Spiritual', 'Travel', 'Biography', 'Academic', 'Children'];
const LANGUAGES = ['Mizo', 'English', 'Hmar', 'Chakma', 'Hindi'];

const COVER_COLORS = [
  { label: 'Amber', value: 'linear-gradient(135deg,#C17817,#8B4513)' },
  { label: 'Ocean', value: 'linear-gradient(135deg,#4F8EF7,#1E40AF)' },
  { label: 'Emerald', value: 'linear-gradient(135deg,#34D399,#065F46)' },
  { label: 'Violet', value: 'linear-gradient(135deg,#A78BFA,#5B21B6)' },
  { label: 'Sunset', value: 'linear-gradient(135deg,#FB923C,#9A3412)' },
  { label: 'Cyan', value: 'linear-gradient(135deg,#22D3EE,#0E7490)' },
  { label: 'Rose', value: 'linear-gradient(135deg,#F472B6,#9D174D)' },
];

const emptyBook = (): Omit<BookSubmission, 'id' | 'submittedAt'> => ({
  title: '',
  description: '',
  genre: '',
  language: '',
  price: 99,
  pages: 100,
  coverColor: COVER_COLORS[0].value,
});

export default function AuthorApplicationPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { applicationStatus, application, submitApplication, _approveApplication, _rejectApplication } = useUserStore();

  const [bio, setBio] = useState('');
  const [userName, setUserName] = useState(profile?.full_name ?? '');
  const [userEmail, setUserEmail] = useState(profile?.email ?? '');
  const [books, setBooks] = useState([emptyBook()]);
  const [step, setStep] = useState<'form' | 'review' | 'submitted'>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Already applied
  if (applicationStatus === 'approved') {
    return (
      <div className="page author-app-page">
        <div className="app-status-card app-status-approved">
          <div className="app-status-icon">✅</div>
          <h2>You're an Author!</h2>
          <p>Your application has been approved. Head to the Author tab to publish your books.</p>
          <button className="btn-author-primary" onClick={() => navigate('/author')}>
            Go to Author Dashboard →
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="page author-app-page">
        <div className="app-status-card app-status-pending">
          <div className="app-status-icon">⏳</div>
          <h2>Application Under Review</h2>
          <p>Your application was submitted on {new Date(application!.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
          <p className="app-status-sub">Our team will review your submission within 2–3 business days. We'll notify you once a decision is made.</p>
          <div className="app-status-books">
            <div className="app-status-books-label">Submitted Books ({application!.books.length})</div>
            {application!.books.map((b) => (
              <div key={b.id} className="app-status-book-item">
                <div className="app-status-book-cover" style={{ background: b.coverColor }} />
                <div>
                  <div className="app-status-book-title">{b.title}</div>
                  <div className="app-status-book-meta">{b.genre} · {b.language} · {b.pages}p · ₹{b.price}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Dev helper: simulate admin decision */}
          <div className="app-dev-actions">
            <span className="app-dev-label">🔧 Dev: Simulate Admin</span>
            <button className="app-dev-btn app-dev-approve" onClick={_approveApplication}>Approve</button>
            <button className="app-dev-btn app-dev-reject" onClick={() => _rejectApplication('Content does not meet our guidelines.')}>Reject</button>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <div className="page author-app-page">
        <div className="app-status-card app-status-rejected">
          <div className="app-status-icon">❌</div>
          <h2>Application Not Approved</h2>
          {application?.reviewNote && (
            <div className="app-reject-note">
              <strong>Note from reviewer:</strong> {application.reviewNote}
            </div>
          )}
          <p className="app-status-sub">You may revise and resubmit your application with updated content.</p>
          <button className="btn-author-primary" onClick={() => useUserStore.setState({ applicationStatus: 'none', application: null })}>
            Reapply
          </button>
        </div>
      </div>
    );
  }

  // ── Form validation ──────────────────────────────────────────
  function validate() {
    const e: Record<string, string> = {};
    if (!userName.trim()) e.userName = 'Name is required';
    if (!userEmail.trim()) e.userEmail = 'Email is required';
    if (!bio.trim() || bio.length < 30) e.bio = 'Bio must be at least 30 characters';
    books.forEach((b, i) => {
      if (!b.title.trim()) e[`book_${i}_title`] = 'Title required';
      if (!b.description.trim()) e[`book_${i}_desc`] = 'Description required';
      if (!b.genre) e[`book_${i}_genre`] = 'Genre required';
      if (!b.language) e[`book_${i}_lang`] = 'Language required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const finalBooks: BookSubmission[] = books.map((b, i) => ({
      ...b,
      id: `bs_${Date.now()}_${i}`,
      submittedAt: new Date().toISOString(),
    }));
    submitApplication({ userName, userEmail, bio, books: finalBooks });
  }

  function updateBook(index: number, field: string, value: string | number) {
    setBooks((prev) => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  }

  function addBook() {
    setBooks((prev) => [...prev, emptyBook()]);
  }

  function removeBook(index: number) {
    if (books.length === 1) return;
    setBooks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="page author-app-page">
      {/* Hero */}
      <div className="author-app-hero">
        <div className="author-app-hero-icon">✍️</div>
        <h1>Become an Author</h1>
        <p>Share your stories with the Lehkhabu community. Submit at least one book to start the review process.</p>
      </div>

      {/* Steps indicator */}
      <div className="author-app-steps">
        {['Your Details', 'Book Submissions', 'Review & Submit'].map((label, i) => (
          <div key={label} className={`author-app-step ${step === ['form', 'form', 'review'][i] || (step === 'review' && i === 2) ? (step === 'review' && i < 2 ? 'done' : 'active') : step === 'form' && i === 0 ? 'active' : ''}`}>
            <div className="author-app-step-num">{step === 'review' && i < 2 ? '✓' : i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {step === 'form' && (
        <div className="author-app-form">
          {/* Personal Info */}
          <section className="app-form-section">
            <h2 className="app-form-section-title">📋 Personal Info</h2>

            <div className="app-field">
              <label>Full Name</label>
              <input
                id="app-name"
                className={`app-input ${errors.userName ? 'app-input-error' : ''}`}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
              />
              {errors.userName && <span className="app-field-error">{errors.userName}</span>}
            </div>

            <div className="app-field">
              <label>Email Address</label>
              <input
                id="app-email"
                className={`app-input ${errors.userEmail ? 'app-input-error' : ''}`}
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
              />
              {errors.userEmail && <span className="app-field-error">{errors.userEmail}</span>}
            </div>

            <div className="app-field">
              <label>Author Bio <span className="app-field-hint">({bio.length}/500)</span></label>
              <textarea
                id="app-bio"
                className={`app-textarea ${errors.bio ? 'app-input-error' : ''}`}
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Tell us about yourself, your writing style, and what inspires you…"
                rows={4}
              />
              {errors.bio && <span className="app-field-error">{errors.bio}</span>}
            </div>
          </section>

          {/* Books */}
          <section className="app-form-section">
            <div className="app-section-header">
              <h2 className="app-form-section-title">📚 Book Submissions</h2>
              <span className="app-required-note">At least 1 required</span>
            </div>

            {books.map((book, i) => (
              <div key={i} className="app-book-card">
                <div className="app-book-card-header">
                  <span className="app-book-num">Book {i + 1}</span>
                  {books.length > 1 && (
                    <button className="app-book-remove" onClick={() => removeBook(i)}>Remove</button>
                  )}
                </div>

                {/* Cover preview */}
                <div className="app-book-cover-row">
                  <div className="app-book-cover-preview" style={{ background: book.coverColor }}>
                    <span>{book.title ? book.title.slice(0, 12) : 'Cover'}</span>
                  </div>
                  <div className="app-cover-colors">
                    {COVER_COLORS.map((c) => (
                      <button
                        key={c.label}
                        className={`app-color-swatch ${book.coverColor === c.value ? 'selected' : ''}`}
                        style={{ background: c.value }}
                        title={c.label}
                        onClick={() => updateBook(i, 'coverColor', c.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="app-field">
                  <label>Book Title</label>
                  <input
                    className={`app-input ${errors[`book_${i}_title`] ? 'app-input-error' : ''}`}
                    value={book.title}
                    onChange={(e) => updateBook(i, 'title', e.target.value)}
                    placeholder="e.g. Kalpana"
                  />
                  {errors[`book_${i}_title`] && <span className="app-field-error">{errors[`book_${i}_title`]}</span>}
                </div>

                <div className="app-field">
                  <label>Description</label>
                  <textarea
                    className={`app-textarea ${errors[`book_${i}_desc`] ? 'app-input-error' : ''}`}
                    value={book.description}
                    onChange={(e) => updateBook(i, 'description', e.target.value)}
                    placeholder="Brief synopsis of your book…"
                    rows={3}
                  />
                  {errors[`book_${i}_desc`] && <span className="app-field-error">{errors[`book_${i}_desc`]}</span>}
                </div>

                <div className="app-fields-row">
                  <div className="app-field">
                    <label>Genre</label>
                    <select
                      className={`app-select ${errors[`book_${i}_genre`] ? 'app-input-error' : ''}`}
                      value={book.genre}
                      onChange={(e) => updateBook(i, 'genre', e.target.value)}
                    >
                      <option value="">Select genre</option>
                      {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {errors[`book_${i}_genre`] && <span className="app-field-error">{errors[`book_${i}_genre`]}</span>}
                  </div>
                  <div className="app-field">
                    <label>Language</label>
                    <select
                      className={`app-select ${errors[`book_${i}_lang`] ? 'app-input-error' : ''}`}
                      value={book.language}
                      onChange={(e) => updateBook(i, 'language', e.target.value)}
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    {errors[`book_${i}_lang`] && <span className="app-field-error">{errors[`book_${i}_lang`]}</span>}
                  </div>
                </div>

                <div className="app-fields-row">
                  <div className="app-field">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      className="app-input"
                      value={book.price}
                      min={29}
                      max={999}
                      onChange={(e) => updateBook(i, 'price', Number(e.target.value))}
                    />
                  </div>
                  <div className="app-field">
                    <label>Pages</label>
                    <input
                      type="number"
                      className="app-input"
                      value={book.pages}
                      min={20}
                      max={2000}
                      onChange={(e) => updateBook(i, 'pages', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button className="app-add-book-btn" onClick={addBook}>
              + Add Another Book
            </button>
          </section>

          <button className="btn-author-primary" onClick={() => { if (validate()) setStep('review'); }}>
            Review Application →
          </button>
        </div>
      )}

      {step === 'review' && (
        <div className="author-app-form">
          <div className="app-review-header">
            <h2>Review Your Application</h2>
            <p>Make sure everything looks good before submitting.</p>
          </div>

          <div className="app-review-section">
            <div className="app-review-label">Author Details</div>
            <div className="app-review-row"><span>Name</span><strong>{userName}</strong></div>
            <div className="app-review-row"><span>Email</span><strong>{userEmail}</strong></div>
            <div className="app-review-bio">{bio}</div>
          </div>

          <div className="app-review-section">
            <div className="app-review-label">Books ({books.length})</div>
            {books.map((b, i) => (
              <div key={i} className="app-review-book">
                <div className="app-review-book-cover" style={{ background: b.coverColor }}>
                  <span>{b.title.slice(0, 6)}</span>
                </div>
                <div className="app-review-book-info">
                  <div className="app-review-book-title">{b.title}</div>
                  <div className="app-review-book-meta">{b.genre} · {b.language} · {b.pages} pages · ₹{b.price}</div>
                  <div className="app-review-book-desc">{b.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="app-review-actions">
            <button className="app-back-btn" onClick={() => setStep('form')}>← Edit</button>
            <button className="btn-author-primary" onClick={handleSubmit}>Submit Application ✓</button>
          </div>
        </div>
      )}
    </div>
  );
}
