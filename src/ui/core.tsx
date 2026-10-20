// Small component library (§6.4). Styling lives in styles.css.
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { colourOf, type Attrs } from '../engine/catalog';
import { buzz, inr, L, update, useStore, banner, toast } from '../store';

export const Logo = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="11" fill="#5A0F3F" />
    <path d="M10 26c4-9 7-9 10 0 3-9 6-9 10 0" stroke="#F2A93B" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="13" r="3.2" fill="#F2A93B" />
  </svg>
);

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// numbers that change count up/down over 300ms
export function useCountUp(target: number, ms = 300) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced() || from.current === target) { from.current = target; setV(target); return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      setV(a + (target - a) * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, ms]);
  return v;
}
export const Money = ({ value }: { value: number }) => <>{inr(useCountUp(value))}</>;

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'text' | 'soft'; size?: 'sm' | 'md'; full?: boolean };
export function Button({ variant = 'primary', size = 'md', full, className = '', onClick, ...rest }: BtnProps) {
  return <button {...rest} className={`btn ${variant} ${size}${full ? ' full' : ''} ${className}`} onClick={e => { buzz(); onClick?.(e); }} />;
}

export function LangPill() {
  const s = useStore();
  // messages already on screen are in the old language, so drop them
  return <button className="lang-pill" onClick={() => { toast.clear(); banner.clear(); update(d => { d.lang = d.lang === 'en' ? 'hi' : 'en'; }); }}
    aria-label={L(s, 'Switch to Hindi', 'अंग्रेज़ी में बदलें')}>{s.lang === 'en' ? 'हिं' : 'EN'}</button>;
}

export function AppBar({ title, onBack, right, sub }: { title?: ReactNode; sub?: ReactNode; onBack?: () => void; right?: ReactNode }) {
  const s = useStore();
  return (
    <header className="appbar">
      {onBack ? <button className="icon-btn" onClick={onBack} aria-label={L(s, 'Back', 'वापस')}><ArrowLeft size={22} /></button> : <Logo size={34} />}
      <div className="appbar-t">{title && <h1>{title}</h1>}{sub && <small>{sub}</small>}</div>
      {right}
      <LangPill />
    </header>
  );
}

const STAGES: [string, string][] = [['Discover', 'खोज'], ['Register', 'खाता'], ['Product', 'सामान'], ['Price', 'दाम'], ['Launch', 'लॉन्च'], ['Grow', 'बढ़ें']];
export function Stepper({ stage }: { stage: number }) {
  const s = useStore();
  return (
    <ol className="stepper" aria-label={L(s, `Step ${stage + 1} of 6`, `6 में से कदम ${stage + 1}`)}>
      {STAGES.map(([en, hi], i) => <li key={en} className={i < stage ? 'done' : i === stage ? 'on' : ''} aria-current={i === stage ? 'step' : undefined}><i />{s.lang === 'hi' ? hi : en}</li>)}
    </ol>
  );
}

export function Card({ children, tone, highlight, className = '', title, kicker, right }: { children?: ReactNode; tone?: 'pink' | 'peach' | 'green' | 'plum'; highlight?: boolean; className?: string; title?: ReactNode; kicker?: ReactNode; right?: ReactNode }) {
  return (
    <section className={`card ${tone ?? ''} ${highlight ? 'hl' : ''} ${className}`}>
      {(title || kicker || right) && <header className="card-h"><div>{kicker && <p className="kicker">{kicker}</p>}{title && <h2>{title}</h2>}</div>{right}</header>}
      {children}
    </section>
  );
}

export function MoneyTile({ label, value, caption, filled, toned = true, text }: { label: string; value?: number; caption?: ReactNode; filled?: boolean; toned?: boolean; text?: string }) {
  const tone = toned && value !== undefined ? (value < 0 ? 'loss' : 'gain') : '';
  return (
    <div className={`mtile ${filled ? 'filled' : ''} ${filled ? '' : tone}`}>
      <span>{label}</span>
      <b>{text ?? (value !== undefined ? <Money value={value} /> : '—')}</b>
      {caption && <small>{caption}</small>}
    </div>
  );
}

// `value` in rupees; `plain` shows it as given (a count or preformatted text)
export function ReceiptRow({ label, value, total, minus, plain }: { label: ReactNode; value: number | string; total?: boolean; minus?: boolean; plain?: boolean }) {
  const n = Number(value);
  const tone = plain ? '' : total ? (n < 0 ? 'loss' : 'gain') : minus ? 'loss' : '';
  return <div className={`rrow ${total ? 'total' : ''}`}><span>{label}</span><b className={tone}>{plain ? value : inr(minus ? -Math.abs(n) : n)}</b></div>;
}

export const Pill = ({ children, tone = 'plum' }: { children: ReactNode; tone?: 'plum' | 'gain' | 'loss' | 'saffron' | 'wa' }) => <span className={'pill ' + tone}>{children}</span>;

export function Chip({ on, children, onClick, label }: { on?: boolean; children: ReactNode; onClick?: () => void; label?: string }) {
  return <button className={'chip' + (on ? ' on' : '')} onClick={() => { buzz(); onClick?.(); }} aria-pressed={on} aria-label={label}>{children}</button>;
}

export function Segmented<T extends string>({ options, value, onChange, label }: { options: [T, string][]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map(([v, l]) => <button key={v} role="radio" aria-checked={value === v} className={value === v ? 'on' : ''} onClick={() => { buzz(); onChange(v); }}>{l}</button>)}
    </div>
  );
}

export interface OptionItem { id: string; label: string; icon?: string; swatch?: string; sub?: string }
export function OptionList({ items, value, onPick, label }: { items: OptionItem[]; value?: string; onPick: (id: string) => void; label: string }) {
  const swatches = items.some(i => i.swatch);
  return (
    <div className={swatches ? 'swatches' : 'olist'} role="radiogroup" aria-label={label}>
      {items.map(i => (
        <button key={i.id} role="radio" aria-checked={value === i.id} className={'opt' + (value === i.id ? ' on' : '')} onClick={() => { buzz(); onPick(i.id); }}>
          {i.swatch ? <span className="sw" style={{ background: i.swatch }} /> : <span className="oi" aria-hidden="true">{i.icon}</span>}
          <span className="ol">{i.label}{i.sub && <small>{i.sub}</small>}</span>
          <span className="ock" aria-hidden="true">{value === i.id && <Check size={18} strokeWidth={3} />}</span>
        </button>))}
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; className?: string }) {
  const s = useStore();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className={'sheet ' + className} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} onClick={e => e.stopPropagation()}>
        <div className="sheet-h"><i className="grab" /><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label={L(s, 'Close', 'बंद करें')}><X size={20} /></button></div>
        <div className="sheet-b">{children}</div>
      </div>
    </div>
  );
}

export function Toast() {
  const t = toast.use();
  if (!t) return null;
  return <div key={t.id} className="toast" role="status"><Check size={18} strokeWidth={3} />{t.text}</div>;
}

// WhatsApp-style notification that slides from the top when a new alert arrives
export function Banner({ onOpen }: { onOpen: () => void }) {
  const b = banner.use();
  if (!b) return null;
  return (
    <div role="status">
      <button key={b.id} className="wa-banner" onClick={onOpen}>
        <span className="wa-dot" aria-hidden="true">💬</span>
        <span><b>{b.text}</b>{b.sub && <small>{b.sub}</small>}</span>
      </button>
    </div>
  );
}

export function Skeleton({ rows = 3, tiles = 0 }: { rows?: number; tiles?: number }) {
  return (
    <div className="skel" aria-busy="true" aria-label="Loading">
      {tiles > 0 && <div className="skel-tiles">{Array.from({ length: tiles }, (_, i) => <i key={i} />)}</div>}
      {Array.from({ length: rows }, (_, i) => <span key={i} style={{ width: `${90 - i * 12}%` }} />)}
    </div>
  );
}
// shows a skeleton for ~400ms whenever `key` changes, so a calculation feels real
export function useCalculating(key: string, ms = 400) {
  const [busy, setBusy] = useState(true);
  useEffect(() => { if (reduced()) { setBusy(false); return; } setBusy(true); const t = setTimeout(() => setBusy(false), ms); return () => clearTimeout(t); }, [key, ms]);
  return busy;
}

export const StickyCTA = ({ children }: { children: ReactNode }) => <div className="sticky-cta">{children}</div>;

export function Thumb({ attrs, size = 64 }: { attrs: Attrs; size?: number }) {
  const [bg, fg] = colourOf(attrs);
  const dupatta = attrs.category === 'dupatta';
  return (
    <div className="thumb" style={{ background: bg, width: size, height: size * 1.2 }} aria-hidden="true">
      <svg viewBox="0 0 40 48" width={size * 0.6}>
        {dupatta ? <path d="M8 6h24l-4 36H12z" fill={fg} opacity=".85" /> : <path d="M12 4l8 4 8-4 8 8-6 6v26H10V18l-6-6z" fill={fg} opacity=".85" />}
        <path d="M16 22h8M15 28h10M16 34h8" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Empty({ art, text, action }: { art: ReactNode; text: ReactNode; action?: ReactNode }) {
  return <div className="empty">{art}<p>{text}</p>{action}</div>;
}
