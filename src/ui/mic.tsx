import { useState } from 'react';
import { Mic as MicIcon } from 'lucide-react';

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
  return <button type="button" className={'mic-b' + (on ? ' on' : '')} onClick={start} aria-label={label} title={label}><MicIcon size={20} /></button>;
}
