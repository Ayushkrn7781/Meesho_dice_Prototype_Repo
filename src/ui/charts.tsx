// Hand-drawn SVG charts. Fixed viewBox, scaled by width only, so text never stretches.
import { inr } from '../store';

const C = { plum: '#8E2A6B', gain: '#1F8A55', loss: '#E0475E', saffron: '#F2A93B', axis: '#D9C6D0', muted: '#6B5763', ink: '#2A1424' };
const short = (n: number) => (Math.abs(n) >= 1000 ? (n < 0 ? '−₹' : '₹') + (Math.abs(n) / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : inr(n));

export function Bars({ data, label }: { data: { label: string; value: number; festive?: boolean }[]; label: string }) {
  const W = 340, H = 170;
  const max = Math.max(1, ...data.map(d => Math.abs(d.value)));
  const hasNeg = data.some(d => d.value < 0);
  const zero = hasNeg ? H / 2 : H - 22;
  const span = hasNeg ? H / 2 - 24 : H - 44;
  const w = W / Math.max(data.length, 1);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <line x1="0" x2={W} y1={zero} y2={zero} stroke={C.axis} />
      {data.map((d, i) => {
        const h = Math.max((Math.abs(d.value) / max) * span, 2);
        const y = d.value >= 0 ? zero - h : zero;
        const fill = d.value < 0 ? C.loss : d.festive ? C.gain : C.plum;
        return <g key={i}>
          <rect x={i * w + w * 0.2} y={y} width={w * 0.6} height={h} rx="4" fill={fill} />
          <text x={i * w + w / 2} y={H - 6} fontSize="11" textAnchor="middle" fill={C.muted}>{d.label}</text>
          <text x={i * w + w / 2} y={d.value >= 0 ? y - 5 : y + h + 12} fontSize="10.5" textAnchor="middle" fill={C.ink} fontWeight="700">{short(d.value)}</text>
        </g>;
      })}
    </svg>
  );
}

export function Curve({ pts, mark, floor, floorLabel, label }: { pts: { x: number; y: number }[]; mark?: number; floor?: number; floorLabel: string; label: string }) {
  const W = 340, H = 160, padL = 10, padR = 22;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
  const X = (x: number) => padL + 10 + ((x - x0) / ((x1 - x0) || 1)) * (W - padL - padR - 10);
  const Y = (y: number) => H - 24 - ((y - y0) / ((y1 - y0) || 1)) * (H - 40);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  const m = pts.find(p => p.x === mark);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <line x1={padL} x2={W - 8} y1={Y(0)} y2={Y(0)} stroke={C.axis} />
      {floor !== undefined && floor > x0 && floor < x1 && <>
        <line x1={X(floor)} x2={X(floor)} y1={10} y2={H - 24} stroke={C.loss} strokeDasharray="5 4" strokeWidth="1.5" />
        <text x={X(floor) + 5} y={H - 30} fontSize="10.5" fill="#B8324F" fontWeight="700" stroke="#fff" strokeWidth="3" paintOrder="stroke">{floorLabel}</text>
      </>}
      <path d={path} fill="none" stroke={C.plum} strokeWidth="2.6" strokeLinejoin="round" />
      {pts.map(p => <circle key={p.x} cx={X(p.x)} cy={Y(p.y)} r="2.8" fill={p.y < 0 ? C.loss : C.plum} />)}
      {m && <circle cx={X(m.x)} cy={Y(m.y)} r="7" fill={C.saffron} stroke="#fff" strokeWidth="2.5" />}
      {pts.map((p, i) => (i % 2 === 0 || pts.length <= 5) && <text key={'t' + p.x} x={X(p.x)} y={H - 6} fontSize="10.5" textAnchor="middle" fill={C.muted}>₹{p.x}</text>)}
    </svg>
  );
}
