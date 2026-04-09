import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { books } from '../data/books';

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
  const book = books.find((b) => b.id === id);

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

  const total   = book?.content?.length ?? 0;
  // 2 pages per spread on desktop, 1 on mobile
  const spreads = isDesktop ? Math.ceil(total / 2) : total;
  const leftIdx  = isDesktop ? spread * 2 : spread;
  const rightIdx = isDesktop ? spread * 2 + 1 : spread;

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

  if (!book) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5EDE0', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>📖</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#5A3E2B' }}>Book not found</div>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#C17817', color: '#fff', borderRadius: 99, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>Go Home</button>
    </div>
  );

  const t   = THEMES[cfg.bg];
  const isDark = cfg.bg === 'night' || cfg.bg === 'forest';
  const fontCss = FONTS[cfg.font].css;

  /* ── Reusable page panel ─────────────────────────────────────────── */
  const PagePanel = ({ content, pgNum }: { content: string; pgNum: number }) => (
    <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', background: t.page, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        flex: 1, minHeight: 0, overflow: 'hidden',
        padding: isDesktop ? '40px 52px 32px' : '28px 24px 24px',
        display: 'flex', flexDirection: 'column',
        opacity: flipping ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}>
        <p style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          margin: 0,
          fontFamily: fontCss,
          fontSize: cfg.size,
          lineHeight: 1.85,
          color: t.text,
          letterSpacing: '0.01em',
          whiteSpace: 'pre-wrap',
        }}>
          {content}
        </p>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: t.muted, fontStyle: 'italic', opacity: 0.5 }}>
          {pgNum}
        </div>
      </div>
    </div>
  );

  /* ── Main render ──────────────────────────────────────────────────── */
  return (
    <div
      /* Root — full viewport, no scroll */
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        background: isDark ? t.page : '#D4C5AE',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onClick={() => { bumpUI(); setShowSett(false); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {/* ── Top Toolbar ──────────────────────────────────────────────── */}
      <div
        style={{
          height: TOOLBAR_H, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          background: t.ui, borderBottom: `1px solid ${t.border}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: showUI ? 1 : 0,
          transform: showUI ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          zIndex: 10,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(`/book/${book.id}`)}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.muted, cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = isDark ? '#ffffff18' : '#00000010')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13, color: t.text, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {book.title}
          </div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>
            {isDesktop
              ? `${leftIdx + 1}–${Math.min(rightIdx + 1, total)} of ${total}`
              : `Page ${spread + 1} of ${spreads}`
            }
          </div>
        </div>

        {/* Settings toggle */}
        <button
          onClick={e => { e.stopPropagation(); setShowSett(v => !v); }}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.muted, cursor: 'pointer',
            background: showSettings ? (isDark ? '#ffffff18' : '#00000010') : 'transparent',
            transition: 'background 0.2s',
          }}
          aria-label="Reading settings"
        >
          {/* Aa icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>
      </div>

      {/* ── Settings Panel (slides down from toolbar) ─────────────────── */}
      <div
        style={{
          position: 'absolute', top: TOOLBAR_H, left: 0, right: 0, zIndex: 20,
          background: t.ui, borderBottom: `1px solid ${t.border}`,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          transform: showSettings ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showSettings ? 1 : 0,
          pointerEvents: showSettings ? 'all' : 'none',
          padding: '16px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Background */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: t.muted, marginBottom: 10, fontFamily: '"Inter", sans-serif' }}>Background</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(Object.entries(THEMES) as [Bg, typeof THEMES[Bg]][]).map(([key, th]) => (
              <button
                key={key}
                title={key}
                onClick={() => upd('bg', key)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  background: th.page,
                  border: `2px solid ${cfg.bg === key ? '#C17817' : (isDark ? '#555' : '#CCC')}`,
                  boxShadow: cfg.bg === key ? '0 0 0 3px rgba(193,120,23,0.3)' : 'none',
                  transform: cfg.bg === key ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Font */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: t.muted, marginBottom: 10, fontFamily: '"Inter", sans-serif' }}>Font</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(Object.entries(FONTS) as [Font, typeof FONTS[Font]][]).map(([key, f]) => (
              <button
                key={key}
                onClick={() => upd('font', key)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: f.css, fontSize: 13, fontWeight: 600,
                  color: cfg.font === key ? '#C17817' : t.text,
                  border: `1.5px solid ${cfg.font === key ? '#C17817' : (isDark ? '#444' : '#DDD')}`,
                  background: cfg.font === key ? (isDark ? 'rgba(193,120,23,0.1)' : '#FFF3E0') : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: t.muted, marginBottom: 10, fontFamily: '"Inter", sans-serif' }}>
            Text Size — {cfg.size}px
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => upd('size', Math.max(13, cfg.size - 1))}
              style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${isDark ? '#444' : '#DDD'}`, color: t.text, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: 'transparent', flexShrink: 0 }}
            >A−</button>
            <input
              type="range" min={13} max={24} step={1} value={cfg.size}
              onChange={e => upd('size', +e.target.value)}
              style={{ flex: 1, accentColor: '#C17817', height: 4, cursor: 'pointer' }}
            />
            <button
              onClick={() => upd('size', Math.min(24, cfg.size + 1))}
              style={{ width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${isDark ? '#444' : '#DDD'}`, color: t.text, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: 'transparent', flexShrink: 0 }}
            >A+</button>
          </div>
        </div>
      </div>

      {/* ── Reading Area ──────────────────────────────────────────────── */}
      {/*
          This div is the ONLY content between the two toolbars.
          It takes ALL remaining height via flex: 1.
          It uses display:flex + flexDirection:row to place pages side-by-side.
          No CSS classes are used for layout here — all inline to prevent conflicts.
      */}
      <div
        style={{
          flex: 1,
          minHeight: 0,          /* critical: allows flex item to shrink */
          display: 'flex',
          flexDirection: 'row',  /* pages side by side */
          overflow: 'hidden',
          margin: isDesktop ? '16px 24px' : '8px 12px',
          borderRadius: isDesktop ? '6px 10px 10px 6px' : 8,
          boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        {/* Left page — desktop only */}
        {isDesktop && <PagePanel content={book.content[leftIdx] ?? ''} pgNum={leftIdx + 1} />}

        {/* Spine — desktop only */}
        {isDesktop && (
          <div style={{ width: 12, flexShrink: 0, background: t.spine, boxShadow: '-2px 0 8px rgba(0,0,0,0.12) inset, 2px 0 8px rgba(0,0,0,0.08) inset' }} />
        )}

        {/* Right page (or only page on mobile) */}
        {!isLast
          ? <PagePanel content={book.content[rightIdx] ?? ''} pgNum={Math.min(rightIdx + 1, total)} />
          : (
            /* End of book */
            <div style={{ flex: 1, background: t.page, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 }}>
              <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>✦</div>
              <div style={{ fontFamily: fontCss, fontSize: 22, fontWeight: 700, color: t.text }}>The End</div>
              <div style={{ fontSize: 13, color: t.muted, fontStyle: 'italic' }}>{book.title}</div>
              <button
                onClick={() => navigate(`/book/${book.id}`)}
                style={{ marginTop: 20, padding: '10px 28px', background: '#C17817', color: '#fff', borderRadius: 99, fontWeight: 600, fontFamily: '"Inter", sans-serif', fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(193,120,23,0.3)' }}
              >
                ← Back to Book
              </button>
            </div>
          )
        }

        {/* Invisible tap zones for prev/next */}
        <div
          onClick={e => { e.stopPropagation(); prevSpread(); bumpUI(); }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', cursor: spread > 0 ? 'pointer' : 'default', zIndex: 5 }}
        />
        <div
          onClick={e => { e.stopPropagation(); nextSpread(); bumpUI(); }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', cursor: spread < spreads - 1 ? 'pointer' : 'default', zIndex: 5 }}
        />
      </div>

      {/* ── Bottom Nav Bar ────────────────────────────────────────────── */}
      <div
        style={{
          height: TOOLBAR_H, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px',
          background: t.ui, borderTop: `1px solid ${t.border}`,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          opacity: showUI ? 1 : 0,
          transform: showUI ? 'translateY(0)' : 'translateY(100%)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          gap: 12,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Prev button */}
        <button
          onClick={() => { prevSpread(); bumpUI(); }}
          disabled={spread <= 0 || flipping}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
            fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13,
            color: spread <= 0 ? t.muted : t.text,
            opacity: spread <= 0 ? 0.35 : 1,
            transition: 'all 0.2s',
            background: 'transparent',
          }}
          onMouseEnter={e => { if (spread > 0) e.currentTarget.style.background = isDark ? '#ffffff12' : '#0000000a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          Prev
        </button>

        {/* Progress */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', minWidth: 0, maxWidth: 200 }}>
          <div style={{ fontSize: 11, color: t.muted, fontFamily: '"Inter", sans-serif' }}>
            {Math.round(progress)}%
          </div>
          <div style={{ width: '100%', height: 3, background: isDark ? '#333' : 'rgba(0,0,0,0.1)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#C17817', borderRadius: 99, transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={() => { nextSpread(); bumpUI(); }}
          disabled={spread >= spreads - 1 || flipping}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 99, cursor: 'pointer',
            fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 13,
            color: isLast ? t.muted : t.text,
            opacity: isLast ? 0.35 : 1,
            transition: 'all 0.2s',
            background: 'transparent',
          }}
          onMouseEnter={e => { if (!isLast) e.currentTarget.style.background = isDark ? '#ffffff12' : '#0000000a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      </div>
    </div>
  );
}
