import { useState, type ReactNode } from 'react';
import { inr } from './store';

export const Logo = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <rect width="40" height="40" rx="11" fill="#5A0F3F" />
    <path d="M10 26c4-9 7-9 10 0 3-9 6-9 10 0" stroke="#F2A93B" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="20" cy="13" r="3.2" fill="#F2A93B" />
  </svg>
);

export function Card({ title, kicker, children, tone, right }: { title?: ReactNode; kicker?: string; children: ReactNode; tone?: 'pink' | 'peach' | 'green' | 'plum'; right?: ReactNode }) {
  return (
    <section className={'card' + (tone ? ' ' + tone : '')}>
      {(kicker || title || right) && <header className="card-h"><div>{kicker && <p className="kicker">{kicker}</p>}{title && <h2>{title}</h2>}</div>{right}</header>}
      {children}
    </section>
  );
}

export const Stat = ({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: 'good' | 'bad' }) => (
  <div className={'stat ' + (tone ?? '')}><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}</div>
);

export const Row = ({ k, v, tone, strong }: { k: ReactNode; v: ReactNode; tone?: 'good' | 'bad'; strong?: boolean }) => (
  <div className={'kv' + (strong ? ' strong' : '')}><span>{k}</span><b className={tone}>{v}</b></div>
);

export function Bars({ data, height = 160, fmt = (n: number) => inr(n) }: { data: { label: string; value: number; hi?: boolean }[]; height?: number; fmt?: (n: number) => string }) {
  const W = 320;
  const max = Math.max(1, ...data.map(d => Math.abs(d.value)));
  const hasNeg = data.some(d => d.value < 0);
  const zero = hasNeg ? height / 2 : height - 18;
  const span = hasNeg ? height / 2 - 20 : height - 36;
  const w = W / data.length;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label="bar chart">
      <line x1="0" x2={W} y1={zero} y2={zero} stroke="#d9c6d0" />
      {data.map((d, i) => {
        const h = (Math.abs(d.value) / max) * span;
        const y = d.value >= 0 ? zero - h : zero;
        return <g key={i}>
          <rect x={i * w + w * 0.18} y={y} width={w * 0.64} height={Math.max(h, 1)} rx="3" fill={d.value < 0 ? '#E0475E' : d.hi ? '#2E8B57' : '#8E2A6B'} />
          <text x={i * w + w / 2} y={height - 4} fontSize="10" textAnchor="middle" fill="#6b5763">{d.label}</text>
          <text x={i * w + w / 2} y={d.value >= 0 ? y - 4 : y + h + 11} fontSize={data.length > 6 ? 8 : 9.5} textAnchor="middle" fill="#2A1424" fontWeight="700">{fmt(d.value)}</text>
        </g>;
      })}
    </svg>
  );
}

export function Curve({ pts, mark, floor, floorLabel = 'breakeven' }: { pts: { x: number; y: number }[]; mark?: number; floor?: number; floorLabel?: string }) {
  const W = 320, H = 150, pad = 26;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(...ys);
  const X = (x: number) => pad + (x - x0) / (x1 - x0) * (W - pad - 18);
  const Y = (y: number) => H - 20 - (y - y0) / ((y1 - y0) || 1) * (H - 34);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="monthly profit by price">
      <line x1={pad} x2={W - 8} y1={Y(0)} y2={Y(0)} stroke="#d9c6d0" />
      {floor && floor > x0 && floor < x1 && <><line x1={X(floor)} x2={X(floor)} y1={10} y2={H - 20} stroke="#E0475E" strokeDasharray="4 3" /><text x={X(floor) + 3} y={18} fontSize="9" fill="#D63B5A">{floorLabel}</text></>}
      <path d={path} fill="none" stroke="#8E2A6B" strokeWidth="2.5" />
      {pts.map(p => <circle key={p.x} cx={X(p.x)} cy={Y(p.y)} r={p.x === mark ? 5 : 2.6} fill={p.x === mark ? '#F2A93B' : '#8E2A6B'} />)}
      {pts.map(p => <text key={'t' + p.x} x={X(p.x)} y={H - 6} fontSize="8.5" textAnchor="middle" fill="#6b5763">₹{p.x}</text>)}
    </svg>
  );
}

export const Pill = ({ children, tone = 'plum' }: { children: ReactNode; tone?: 'plum' | 'good' | 'bad' | 'warn' }) => <span className={'pill ' + tone}>{children}</span>;

// Voice input via the Web Speech API; renders nothing where the browser lacks it.
type Recognizer = { lang: string; interimResults: boolean; start(): void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void };
const SR = typeof window !== 'undefined' ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Recognizer) | undefined : undefined;
export function Mic({ lang, label, onText }: { lang: 'en' | 'hi'; label: string; onText: (t: string) => void }) {
  const [on, setOn] = useState(false);
  if (!SR) return null;
  const start = () => {
    try {
      const r = new SR(); r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; r.interimResults = false;
      r.onresult = e => onText(e.results[0][0].transcript);
      r.onend = r.onerror = () => setOn(false);
      r.start(); setOn(true);
    } catch { setOn(false); }
  };
  return <button type="button" className={'mic-b' + (on ? ' on' : '')} onClick={start} aria-label={label} title={label}>🎙️</button>;
}
