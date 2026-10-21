// "Add your own product": a bottom sheet for anything outside the built-in kurti questions.
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Attrs } from '../engine/catalog';
import { attrsFromForm, formatListing, formFromAttrs, industryOf, INDUSTRIES, type CustomForm } from '../engine/custom';
import { buzz, inr, L, useStore } from '../store';
import { BottomSheet, Button, Chip } from '../ui/core';
import { RupeeStepper } from './common';

const empty = (): CustomForm => ({ industry: '', sub: '', name: '', material: '', colour: '', size: '', pack: 1, desc: '', cost: 0, median: 0 });

export function CustomProductSheet({ initial, onClose, onSave }: { initial?: Attrs; onClose: () => void; onSave: (a: Attrs) => void }) {
  const s = useStore();
  const [f, setF] = useState<CustomForm>(() => (initial?.custom ? formFromAttrs(initial) : empty()));
  const [step, setStep] = useState<'industry' | 'details' | 'preview'>(initial?.custom ? 'details' : 'industry');
  const [otherSub, setOtherSub] = useState(false);
  const set = <K extends keyof CustomForm>(k: K, v: CustomForm[K]) => setF(x => ({ ...x, [k]: v }));
  const ind = industryOf(f.industry);
  const ready = f.name.trim().length > 1 && f.cost > 0;
  const listing = formatListing(f, s.lang);
  const save = (formatted: boolean) => { buzz(); onSave(attrsFromForm(f, formatted)); };
  const subLabel = (en: string) => { const x = ind.subs.find(([e]) => e === en); return x ? L(s, x[0], x[1]) : en; };

  const title = step === 'industry' ? L(s, 'Which industry is it?', 'यह किस तरह का सामान है?')
    : step === 'details' ? L(s, 'Tell us about it', 'इसके बारे में बताइए') : L(s, 'Your listing, neatly formatted', 'आपकी लिस्टिंग, सही ढंग से');

  return (
    <BottomSheet open onClose={onClose} title={title} className="custom-sheet">
      {step === 'industry' && <>
        <p className="muted">{L(s, 'Pick the closest match. You can type the exact product next.', 'सबसे करीब वाला चुनें। अगले कदम में सही नाम लिख सकते हैं।')}</p>
        <div className="ind-grid" role="radiogroup" aria-label={L(s, 'Industry', 'उद्योग')}>
          {INDUSTRIES.map(i => (
            <button key={i.id} role="radio" aria-checked={f.industry === i.id} className={'ind' + (f.industry === i.id ? ' on' : '')}
              onClick={() => { buzz(); setF(x => ({ ...x, industry: i.id, sub: '', median: i.median })); setOtherSub(i.subs.length === 0); setStep('details'); }}>
              <span aria-hidden="true">{i.icon}</span>{L(s, i.en, i.hi)}
            </button>))}
        </div>
      </>}

      {step === 'details' && <div className="cform">
        <button className="ind-pick" onClick={() => setStep('industry')}>
          <span aria-hidden="true">{ind.icon}</span><b>{L(s, ind.en, ind.hi)}</b><small>{L(s, 'Change', 'बदलें')}</small>
        </button>
        {(ind.subs.length > 0) && <>
          <p className="field-l">{L(s, 'Type of product', 'सामान का प्रकार')}</p>
          <div className="chips-row">
            {ind.subs.map(([en, hi]) => <Chip key={en} on={!otherSub && f.sub === en} onClick={() => { setOtherSub(false); set('sub', en); }}>{L(s, en, hi)}</Chip>)}
            <Chip on={otherSub} onClick={() => { setOtherSub(true); set('sub', ''); }}>{L(s, 'Other…', 'कुछ और…')}</Chip>
          </div>
        </>}
        {otherSub && <label className="field">{L(s, 'Type (your words)', 'प्रकार (अपने शब्दों में)')}
          <input value={f.sub} onChange={e => set('sub', e.target.value)} placeholder={L(s, 'e.g. Table runner', 'जैसे: टेबल रनर')} /></label>}
        <label className="field">{L(s, 'Product name *', 'सामान का नाम *')}
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder={L(s, 'e.g. hand block printed cushion cover', 'जैसे: हाथ से छपा कुशन कवर')} /></label>
        <div className="two">
          <label className="field">{L(s, 'Material', 'मटीरियल')}<input value={f.material} onChange={e => set('material', e.target.value)} placeholder={L(s, 'Cotton', 'कॉटन')} /></label>
          <label className="field">{L(s, 'Colour', 'रंग')}<input value={f.colour} onChange={e => set('colour', e.target.value)} placeholder={L(s, 'Blue', 'नीला')} /></label>
        </div>
        <div className="two">
          <label className="field">{L(s, 'Size / variant', 'साइज़ / वेरिएंट')}<input value={f.size} onChange={e => set('size', e.target.value)} placeholder={L(s, '16 x 16 in', '16 x 16 इंच')} /></label>
          <label className="field">{L(s, 'Pack of', 'एक पैक में')}<input type="number" inputMode="numeric" min={1} value={f.pack} onChange={e => set('pack', Math.max(1, Number(e.target.value) || 1))} /></label>
        </div>
        <label className="field">{L(s, 'Short description', 'छोटा विवरण')}
          <textarea rows={3} value={f.desc} onChange={e => set('desc', e.target.value)} placeholder={L(s, 'What is it, who is it for, what makes it good?', 'यह क्या है, किसके लिए है, क्या खास है?')} /></label>
        <p className="field-l">{L(s, 'Your making / buying cost per piece *', 'एक पीस बनाने/खरीदने का खर्च *')}</p>
        <RupeeStepper value={f.cost} onChange={n => set('cost', n)} label={L(s, 'Cost per piece in rupees', 'एक पीस का खर्च, रुपये में')} />
        <p className="field-l">{L(s, 'Similar items usually sell for', 'मिलता-जुलता सामान आम तौर पर बिकता है')}</p>
        <RupeeStepper value={f.median} step={10} onChange={n => set('median', Math.max(50, n))} label={L(s, 'Typical price of similar items in rupees', 'मिलते-जुलते सामान का आम दाम, रुपये में')} />
        <p className="hint">{L(s, `Our estimate for ${ind.en.toLowerCase()} is ${inr(ind.median)} Change it if you know better.`, `${ind.hi} के लिए हमारा अंदाज़ा ${inr(ind.median)} है। आपको बेहतर पता हो तो बदलें।`)}</p>
        {!ready && <p className="cta-warn">{L(s, 'Add a name and your cost to continue.', 'आगे बढ़ने के लिए नाम और खर्च डालें।')}</p>}
        <div className="sheet-actions two-btn">
          <Button full disabled={!ready} onClick={() => setStep('preview')}><Sparkles size={20} aria-hidden="true" />{L(s, 'Format neatly', 'सही ढंग से सजाएं')}</Button>
          <Button full variant="ghost" disabled={!ready} onClick={() => save(false)}>{L(s, 'Add as entered', 'जैसा लिखा वैसा जोड़ें')}</Button>
        </div>
      </div>}

      {step === 'preview' && <>
        <p className="muted">{L(s, 'Same layout as every other product: clean title, details in a fixed order, a tidy description.', 'हर सामान जैसा एक ही ढांचा: साफ़ नाम, तय क्रम में जानकारी, सही विवरण।')}</p>
        <article className="listing-card">
          <div className="lc-top"><span className="lc-icon" aria-hidden="true">{ind.icon}</span>
            <div><small>{L(s, ind.en, ind.hi)}{f.sub ? ' › ' + subLabel(f.sub) : ''}</small><h3>{listing.title}</h3></div></div>
          <dl className="lc-rows">{listing.highlights.map(([k, v]) => <div key={k.en}><dt>{L(s, k.en, k.hi)}</dt><dd>{v}</dd></div>)}</dl>
          <p className="lc-desc">{listing.description}</p>
        </article>
        <div className="compare">
          <p className="field-l">{L(s, 'You typed', 'आपने लिखा')}</p>
          <p className="raw">“{f.name}”</p>
        </div>
        <div className="sheet-actions two-btn">
          <Button full onClick={() => save(true)}>{L(s, 'Add this product', 'यह सामान जोड़ें')}</Button>
          <Button full variant="ghost" onClick={() => setStep('details')}>{L(s, 'Back to edit', 'वापस बदलें')}</Button>
        </div>
      </>}
    </BottomSheet>
  );
}
