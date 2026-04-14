import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById } from '../services/books.service';
import type { Book } from '../services/books.service';

/* ── Theme & Font config ─────────────────────────────────────────── */
type Bg   = 'cream' | 'white' | 'sepia' | 'night' | 'forest';
type Font = 'playfair' | 'inter' | 'georgia';

const THEMES: Record<Bg, { page: string; text: string; muted: string; ui: string; border: string; spine: string }> = {
  cream:  { page: '#FDF6EC', text: '#2C1D0E', muted: '#9B7C5A', ui: 'rgba(253,246,236,0.97)', border: 'rgba(0,0,0,0.06)', spine: '#C4A882' },
  white:  { page: '#FFFFFF', text: '#1A1A1A', muted: '#888888', ui: 'rgba(255,255,255,0.97)', border: 'rgba(0,0,0,0.07)', spine: '#DDDDDD' },
  sepia:  { page: '#F8F0E3', text: '#3A2A1A', muted: '#9A7B5A', ui: 'rgba(248,240,227,0.97)', border: 'rgba(0,0,0,0.06)', spine: '#BEA882' },
  night:  { page: '#18182A', text: '#E2D9C5', muted: '#8080A0', ui: 'rgba(18,18,38,0.97)',    border: 'rgba(255,255,255,0.07)', spine: '#2A2842' },
  forest: { page: '#18261A', text: '#D5EDD8', muted: '#7A9E7E', ui: 'rgba(18,34,20,0.97)',    border: 'rgba(255,255,255,0.07)', spine: '#253828' },
};

const FONTS: Record<Font, { css: string; label: string }> = {
  playfair: { css: '"Playfair Display", Georgia, serif', label: 'Serif'   },
  georgia:  { css: 'Georgia, "Times New Roman", serif',  label: 'Classic' },
  inter:    { css: '"Inter", system-ui, sans-serif',      label: 'Modern'  },
};

const SIZES = [14, 16, 18, 20, 22] as const;

interface Cfg { bg: Bg; font: Font; size: number; }
const DEFAULT_CFG: Cfg = { bg: 'cream', font: 'playfair', size: 17 };

const TOOLBAR_H = 52; // px — fixed toolbar height

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null | 'loading'>('loading');
  const [bookLoadError, setBookLoadError] = useState(false);

  // Fetch the real book from Supabase
  useEffect(() => {
    if (!id) { setBook(null); return; }
    setBook('loading');
    fetchBookById(id)
      .then((b) => setBook(b))
      .catch(() => { setBook(null); setBookLoadError(true); });
  }, [id]);

  // Real Book from Supabase has no "content" array — it has a file_url instead
  // We use total_pages for progress display
  const totalPages = (book !== 'loading' && book) ? (book.total_pages ?? 1) : 1;
  const [spread, setSpread]         = useState(0);
  const [flipping, setFlipping]     = useState(false);
  const [showUI, setShowUI]         = useState(true);
  const [showSettings, setShowSett] = useState(false);
  const [cfg, setCfg]               = useState<Cfg>(DEFAULT_CFG);
  const [isDesktop, setIsDesktop]   = useState(() => window.innerWidth > 768);

  const uiTimer = useRef<ReturnType<typeof setTimeout>>();
  const touchX  = useRef(0);

  // Track viewport size
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const spreads = totalPages;
  const leftIdx  = spread;
  const rightIdx = spread + 1;

  /* ── UI helpers ─────────────────────────────────────────────────── */
  const bumpUI = useCallback(() => {
    setShowUI(true);
    clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => setShowUI(false), 5000);
  }, []);

  useEffect(() => {
    bumpUI();
    return () => clearTimeout(uiTimer.current);
  }, [bumpUI]);

  const nextSpread = useCallback(() => {
    if (flipping || spread >= spreads - 1) return;
    setFlipping(true);
    setTimeout(() => { setSpread(s => s + 1); setFlipping(false); }, 350);
  }, [flipping, spread, spreads]);

  const prevSpread = useCallback(() => {
    if (flipping || spread <= 0) return;
    setFlipping(true);
    setTimeout(() => { setSpread(s => s - 1); setFlipping(false); }, 350);
  }, [flipping, spread]);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSpread(); bumpUI(); }
      else if (e.key === 'ArrowLeft')              { e.preventDefault(); prevSpread(); bumpUI(); }
      else if (e.key === 'Escape')                 navigate(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [nextSpread, prevSpread, navigate, bumpUI]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 60) { dx < 0 ? nextSpread() : prevSpread(); bumpUI(); }
  };

  const upd = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setCfg(c => ({ ...c, [k]: v }));
  const isLast   = spread >= spreads - 1;
  const progress = spreads > 0 ? ((spread + 1) / spreads) * 100 : 0;

  // Loading state
  if (book === 'loading') return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>📖</div>
        <div style={{ fontFamily: 'Georgia, serif', color: '#5A3E2B' }}>Loading book…</div>
      </div>
    </div>
  );

  // Not found / error state
  if (!book) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE0', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>📖</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#5A3E2B' }}>
        {bookLoadError ? 'Failed to load book' : 'Book not found'}
      </div>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#C17817', color: '#fff', borderRadius: 99, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Go Home</button>
    </div>
  );

  // If the book has a file URL, embed it directly
  if (book.file_url) {
    const t = THEMES[cfg.bg];
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column', background: '#1a1a2e' }}>
        {/* Minimal toolbar */}
        <div style={{ height: TOOLBAR_H, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <button onClick={() => navigate(-1)} style={{ color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
          <span style={{ flex: 1, textAlign: 'center', color: '#eee', fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {book.title}
          </span>
        </div>
        {/* Embedded file viewer */}
        <iframe
          src={book.file_url}
          style={{ flex: 1, border: 'none', background: '#fff' }}
          title={book.title}
        />
      </div>
    );
  }

  // No file uploaded yet — show a placeholder reading experience
  const t   = THEMES[cfg.bg];
  const isDark = cfg.bg === 'night' || cfg.bg === 'forest';
  const fontCss = FONTS[cfg.font].css;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.page, flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: '3rem' }}>📄</div>
      <div style={{ fontFamily: fontCss, fontSize: '1.4rem', color: t.text, fontWeight: 600 }}>{book.title}</div>
      {book.author_name && <div style={{ color: t.muted, fontSize: '1rem' }}>by {book.author_name}</div>}
      <div style={{ color: t.muted, fontSize: '0.9rem', textAlign: 'center', maxWidth: 360, lineHeight: 1.6 }}>
        This book does not have a readable file uploaded yet.<br />Check back later or contact the author.
      </div>
      <button onClick={() => navigate(-1)} style={{ padding: '10px 28px', background: '#C17817', color: '#fff', borderRadius: 99, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer', marginTop: 8 }}>
        ← Go Back
      </button>
    </div>
  );
}

