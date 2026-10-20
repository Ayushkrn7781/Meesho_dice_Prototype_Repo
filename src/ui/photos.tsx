// Product photos: picked from camera or gallery, shrunk on the phone to a small JPEG so they fit in local storage.
import { useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { buzz, L, useStore } from '../store';

const MAX_SIDE = 640;

export async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);   // transparent PNGs get a white background
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.72);
  } finally { URL.revokeObjectURL(url); }
}

export function PhotoPicker({ photos, onChange, max = 3 }: { photos: string[]; onChange: (p: string[]) => void; max?: number }) {
  const s = useStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr('');
    try {
      const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, max - photos.length);
      if (!imgs.length) throw new Error('not an image');
      const out = await Promise.all(imgs.map(shrink));
      buzz(); onChange([...photos, ...out].slice(0, max));
    } catch { setErr(L(s, "That file couldn't be read as a photo. Try another one.", 'यह फ़ाइल फ़ोटो की तरह नहीं खुली। दूसरी फ़ोटो चुनें।')); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <div className="photos">
      <div className="ph-grid">
        {photos.map((src, i) => (
          <figure key={i} className="ph-item">
            <img src={src} alt={L(s, `Product photo ${i + 1}`, `सामान की फ़ोटो ${i + 1}`)} />
            {i === 0 && <span className="ph-cover">{L(s, 'Cover', 'मुख्य')}</span>}
            <button className="ph-del" onClick={() => { buzz(); onChange(photos.filter((_, k) => k !== i)); }} aria-label={L(s, `Remove photo ${i + 1}`, `फ़ोटो ${i + 1} हटाएं`)}><X size={16} /></button>
          </figure>))}
        {photos.length < max && (
          <button className="ph-add" onClick={() => input.current?.click()} disabled={busy}>
            {photos.length ? <ImagePlus size={26} aria-hidden="true" /> : <Camera size={30} aria-hidden="true" />}
            <span>{busy ? L(s, 'Adding…', 'जुड़ रही है…') : photos.length ? L(s, 'Add more', 'और जोड़ें') : L(s, 'Add photo', 'फ़ोटो जोड़ें')}</span>
          </button>)}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={e => add(e.target.files)} aria-label={L(s, 'Choose product photos', 'सामान की फ़ोटो चुनें')} />
      {err && <p className="cta-warn" role="alert">{err}</p>}
      <p className="hint">{L(s, `${photos.length} of ${max} · Use a plain background and daylight. Real photos cut returns.`, `${max} में से ${photos.length} · सादा पीछे का हिस्सा और दिन की रोशनी रखें। असली फ़ोटो से रिटर्न घटते हैं।`)}</p>
    </div>
  );
}
