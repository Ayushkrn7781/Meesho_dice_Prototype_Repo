// Flat illustrations in the app palette, and a CSS confetti burst.
import { useMemo } from 'react';

export const SellerArt = ({ size = 180 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="92" fill="#FDECEF" />
    <rect x="40" y="150" width="120" height="10" rx="5" fill="#ECDDE5" />
    <path d="M70 150v-46c0-18 14-30 30-30s30 12 30 30v46z" fill="#8E2A6B" />
    <circle cx="100" cy="58" r="18" fill="#E8B48A" />
    <path d="M82 54c2-14 34-14 36 0-8-6-28-6-36 0z" fill="#2A1424" />
    <path d="M86 96h28l-4 24H90z" fill="#F2A93B" opacity=".9" />
    <rect x="118" y="112" width="40" height="34" rx="4" fill="#F2A93B" />
    <path d="M118 124h40M138 112v34" stroke="#C4821F" strokeWidth="3" />
    <circle cx="58" cy="70" r="12" fill="#F2A93B" /><text x="58" y="75" fontSize="14" textAnchor="middle" fill="#5A0F3F" fontWeight="800">₹</text>
  </svg>
);

export const ParcelArt = ({ size = 140 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" aria-hidden="true">
    <path d="M80 20l52 24v62l-52 26-52-26V44z" fill="#F2A93B" />
    <path d="M80 20l52 24-52 24-52-24z" fill="#F8C771" />
    <path d="M80 68v64" stroke="#C4821F" strokeWidth="3" />
    <path d="M54 32l52 24v20" stroke="#fff" strokeWidth="6" fill="none" opacity=".75" />
    <circle cx="124" cy="118" r="20" fill="#1F8A55" /><path d="M115 118l6 6 12-12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CoinArt = ({ size = 120 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
    <ellipse cx="60" cy="96" rx="40" ry="8" fill="#ECDDE5" />
    <circle cx="60" cy="56" r="38" fill="#F2A93B" /><circle cx="60" cy="56" r="29" fill="#F8C771" />
    <text x="60" y="68" fontSize="34" textAnchor="middle" fill="#5A0F3F" fontWeight="800">₹</text>
  </svg>
);

export const ChartArt = ({ size = 120 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="52" fill="#FDECEF" />
    <rect x="30" y="64" width="12" height="24" rx="3" fill="#8E2A6B" /><rect x="50" y="48" width="12" height="40" rx="3" fill="#8E2A6B" />
    <rect x="70" y="38" width="12" height="50" rx="3" fill="#1F8A55" /><path d="M28 50l22-14 20 8 22-16" stroke="#F2A93B" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// confetti burst; hidden entirely for prefers-reduced-motion via CSS
export function Confetti({ count = 60 }: { count?: number }) {
  const bits = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100, delay: (i % 12) * 0.08, dur: 1.8 + ((i * 7) % 10) / 10,
    color: ['#F2A93B', '#E0475E', '#FFFFFF', '#8E2A6B', '#1F8A55'][i % 5], rot: (i * 53) % 360, w: 6 + (i % 3) * 3,
  })), [count]);
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => <i key={i} style={{ left: `${b.left}%`, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s`, transform: `rotate(${b.rot}deg)`, width: b.w }} />)}
    </div>
  );
}
