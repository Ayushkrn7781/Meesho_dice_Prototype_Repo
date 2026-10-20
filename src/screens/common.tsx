// Pieces shared by several screens.
import { useState } from 'react';
import { Minus, PencilLine, Plus } from 'lucide-react';
import { activeSteps, iconFor, isCustom, labelOf, STEPS, SWATCH, titleFor, type Attrs } from '../engine/catalog';
import { industryOf } from '../engine/custom';
import { econ } from '../engine/model';
import { applyAlert, inputsOf, isFestive, nextWeek } from '../engine/sim';
import { active, banner, buzz, getState, inr, L, toast, update, useStore, type Alert, type AppState, type Product } from '../store';
import { Button, Card, Chip, OptionList, Pill, Thumb } from '../ui/core';
import { CustomProductSheet } from './CustomProduct';

const QUESTIONS: Record<string, [string, string]> = {
  category: ['What do you sell?', 'आप क्या बेचते हैं?'],
  style: ['Which style?', 'कौन सा स्टाइल?'],
  fabric: ['Which fabric?', 'कौन सा कपड़ा?'],
  work: ['What work is on it?', 'इस पर कैसा काम है?'],
  sleeve: ['How long are the sleeves?', 'बाजू कितनी लंबी है?'],
  neck: ['What kind of neck?', 'गला कैसा है?'],
  colour: ['Main colour?', 'मुख्य रंग कौन सा है?'],
  sizes: ['Which sizes do you make?', 'कौन से साइज़ बनाते हैं?'],
};

// One question at a time. Answered questions show as chips; tapping one re-opens it.
export function QuestionFlow({ attrs, onChange }: { attrs: Attrs; onChange: (a: Attrs, complete: boolean) => void }) {
  const s = useStore();
  const [sheet, setSheet] = useState(false);
  const sheetEl = sheet && <CustomProductSheet initial={attrs} onClose={() => setSheet(false)} onSave={a => { setSheet(false); onChange(a, true); }} />;
  if (isCustom(attrs)) {
    const ind = industryOf(attrs.industry);
    return (
      <div className="qflow">
        <Card highlight className="prod-sum">
          <Thumb attrs={attrs} size={56} />
          <div><b>{titleFor(attrs)[s.lang]}</b><small>{ind.icon} {L(s, ind.en, ind.hi)}{attrs.sub ? ' › ' + attrs.sub : ''} · {attrs.fmt ? L(s, 'formatted', 'सजाया गया') : L(s, 'as entered', 'जैसा लिखा')}</small></div>
        </Card>
        <div className="row-actions">
          <Button size="sm" variant="ghost" onClick={() => setSheet(true)}><PencilLine size={18} aria-hidden="true" />{L(s, 'Edit details', 'जानकारी बदलें')}</Button>
          <Button size="sm" variant="text" onClick={() => onChange({}, false)}>{L(s, 'Choose from list instead', 'सूची से चुनें')}</Button>
        </div>
        {sheetEl}
      </div>
    );
  }
  const steps = activeSteps(attrs);
  const idx = steps.findIndex(st => !attrs[st.key]);
  const answered = steps.filter(st => attrs[st.key]);
  const reopen = (key: string) => {
    const next: Attrs = {};
    for (const st of steps) { if (st.key === key) break; if (attrs[st.key]) next[st.key] = attrs[st.key]; }
    onChange(next, false);
  };
  const pick = (key: string, id: string) => {
    const next: Attrs = { ...attrs, [key]: id };
    const done = activeSteps(next).every(st => next[st.key]);
    onChange(next, done);
  };
  return (
    <div className="qflow">
      {answered.length > 0 && <div className="chips-row" aria-label={L(s, 'Your answers (tap to change)', 'आपके जवाब (बदलने के लिए दबाएं)')}>
        {answered.map(st => <Chip key={st.key} onClick={() => reopen(st.key)} label={L(s, `Change ${st.label.en}`, `${st.label.hi} बदलें`)}>{iconFor(attrs[st.key])} {labelOf(st.key, attrs[st.key], attrs, s.lang)} ✎</Chip>)}
      </div>}
      {idx >= 0 && (() => {
        const st = steps[idx];
        const q = QUESTIONS[st.key] ?? [st.label.en, st.label.hi];
        return (
          <div className="question" key={st.key}>
            <div className="qprog"><span>{L(s, `${idx + 1} of ${steps.length}`, `${steps.length} में से ${idx + 1}`)}</span><i><b style={{ width: `${(idx / steps.length) * 100}%` }} /></i></div>
            <h2 className="qtitle">{L(s, q[0], q[1])}</h2>
            <OptionList label={L(s, q[0], q[1])} items={st.options(attrs).map(o => ({ id: o.id, label: o[s.lang], icon: iconFor(o.id), swatch: st.key === 'colour' ? SWATCH[o.id] : undefined }))} onPick={id => pick(st.key, id)} />
            {idx === 0 && <button className="add-own" onClick={() => { buzz(); setSheet(true); }}>
              <Plus size={22} aria-hidden="true" /><span><b>{L(s, 'Add your own product', 'अपना सामान जोड़ें')}</b><small>{L(s, 'Décor, home basics, footwear, jewellery and more', 'सजावट, घर का सामान, जूते, ज्वेलरी और बहुत कुछ')}</small></span>
            </button>}
          </div>
        );
      })()}
      {sheetEl}
    </div>
  );
}

// the same "Product details" rows for every product, built-in or custom, so listings read alike
export function ProductInfo({ attrs }: { attrs: Attrs }) {
  const s = useStore();
  let rows: [string, string][];
  if (isCustom(attrs)) {
    const ind = industryOf(attrs.industry);
    rows = [
      [L(s, 'Category', 'श्रेणी'), `${L(s, ind.en, ind.hi)}${attrs.sub ? ' › ' + attrs.sub : ''}`],
      [L(s, 'Material', 'मटीरियल'), attrs.material], [L(s, 'Colour', 'रंग'), attrs.colour], [L(s, 'Size', 'साइज़'), attrs.size],
      [L(s, 'Pack of', 'पैक में'), attrs.pack || '1'],
    ];
  } else {
    const get = (k: string) => (attrs[k] ? labelOf(k, attrs[k], attrs, s.lang) : '');
    rows = [
      [L(s, 'Category', 'श्रेणी'), `${L(s, "Women's fashion", 'महिलाओं के कपड़े')} › ${get('category')}`],
      [L(s, 'Material', 'मटीरियल'), get('fabric')], [L(s, 'Colour', 'रंग'), get('colour')], [L(s, 'Size', 'साइज़'), get('sizes')],
      [L(s, 'Pack of', 'पैक में'), '1'],
      ...(['style', 'work', 'sleeve', 'neck'] as const).filter(k => attrs[k]).map(k => [STEPS.find(x => x.key === k)!.label[s.lang], get(k)] as [string, string]),
    ];
  }
  const desc = isCustom(attrs) ? attrs.desc : '';
  return (
    <Card title={L(s, 'Product details', 'सामान की जानकारी')}>
      <dl className="lc-rows">{rows.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      {desc && <p className="lc-desc">{desc}</p>}
    </Card>
  );
}

// apparel gets size-chart wording; everything else gets photos-and-dimensions wording
export const isApparel = (a: Attrs) => !isCustom(a) || !!industryOf(a.industry).apparel;

export function RupeeStepper({ value, onChange, label, step = 5, min = 0 }: { value: number; onChange: (n: number) => void; label: string; step?: number; min?: number }) {
  const s = useStore();
  return (
    <div className="rstep">
      <button onClick={() => { buzz(); onChange(Math.max(min, value - step)); }} aria-label={L(s, `Decrease by ${step}`, `${step} कम करें`)}><Minus size={22} /></button>
      <label>{step === 5 && <em aria-hidden="true">₹</em>}
        <input type="number" inputMode="numeric" value={value || ''} onChange={e => onChange(Math.max(min, Number(e.target.value) || 0))} aria-label={label} />
      </label>
      <button onClick={() => { buzz(); onChange(value + step); }} aria-label={L(s, `Increase by ${step}`, `${step} बढ़ाएं`)}><Plus size={22} /></button>
    </div>
  );
}

// ---- alerts copy (§10.6) ----
export function alertText(s: AppState, p: Product, a: Alert) {
  const inp = inputsOf(p);
  switch (a.kind) {
    case 'rival': {
      const loss = -econ(a.price!, inp).c;
      return { t: L(s, `A rival dropped to ${inr(a.price!)}`, `एक दूसरे सेलर ने दाम ${inr(a.price!)} कर दिया`),
        b: L(s, `Matching would lose you ${inr(loss)} per order. Wait 48 hours: most price cuts reverse.`, `बराबर करने पर हर ऑर्डर पर ${inr(loss)} का घाटा होगा। 48 घंटे रुकिए, ज़्यादातर दाम वापस बढ़ जाते हैं।`),
        stake: loss, yes: L(s, 'Hold my price', 'मेरा दाम रखें'), no: L(s, 'Ignore', 'छोड़ें') };
    }
    case 'festive': return { t: L(s, 'Diwali demand is rising 🪔', 'दिवाली की मांग बढ़ रही है 🪔'),
      b: L(s, `Raise to ${inr(a.price!)} for 3 weeks. Failed deliveries rise to 28%, so your minimum rises too.`, `3 हफ़्ते के लिए दाम ${inr(a.price!)} करें। त्योहार में 28% पार्सल वापस आते हैं, इसलिए आपका कम से कम दाम भी बढ़ता है।`),
      stake: econ(a.price!, inp, undefined, { rto: 0.28 }).c - econ(p.price, inp, undefined, { rto: 0.28 }).c, yes: L(s, `Set ${inr(a.price!)}`, `${inr(a.price!)} करें`), no: L(s, 'Keep current', 'अभी वाला रखें') };
    case 'returns': {
      const save = econ(p.price, { ...inp, sizeChart: true }).c - econ(p.price, inp).c;
      if (!isApparel(p.attrs)) return { t: L(s, 'Returns are too high', 'रिटर्न ज़्यादा आ रहे हैं'),
        b: L(s, `“Not as shown” is the top reason. Real photos and exact dimensions cut returns 10% → 7% and lower your minimum. You keep ${inr(save)} more per order.`, `“जैसा दिखाया वैसा नहीं” सबसे बड़ा कारण है। असली फ़ोटो और सही नाप से रिटर्न 10% से 7% होंगे और कम से कम दाम घटेगा। हर ऑर्डर पर ${inr(save)} ज़्यादा बचेंगे।`),
        stake: save, yes: L(s, 'Add photos & size', 'फ़ोटो और नाप जोड़ें'), no: L(s, 'Later', 'बाद में') };
      return { t: L(s, 'Returns are too high', 'रिटर्न ज़्यादा आ रहे हैं'),
        b: L(s, `“Size didn't fit” is the top reason. A size chart and real photos cut returns 10% → 7% and lower your minimum. You keep ${inr(save)} more per order.`, `“साइज़ नहीं आया” सबसे बड़ा कारण है। साइज़ चार्ट और असली फ़ोटो से रिटर्न 10% से 7% होंगे और कम से कम दाम घटेगा। हर ऑर्डर पर ${inr(save)} ज़्यादा बचेंगे।`),
        stake: save, yes: L(s, 'Add size chart', 'साइज़ चार्ट जोड़ें'), no: L(s, 'Later', 'बाद में') };
    }
    case 'post_festive': return { t: L(s, 'Festive weeks are over', 'त्योहार के हफ़्ते खत्म'),
      b: L(s, `Go back to ${inr(a.price!)}, your best everyday price.`, `${inr(a.price!)} पर वापस आइए, यही आपका सबसे अच्छा रोज़ का दाम है।`),
      stake: 0, yes: L(s, `Set ${inr(a.price!)}`, `${inr(a.price!)} करें`), no: L(s, 'Keep current', 'अभी वाला रखें') };
  }
}

export function answerAlert(p: Product, a: Alert, accept: boolean) {
  const s0 = getState();
  update(d => { const dp = d.products.find(x => x.id === p.id); if (dp) applyAlert(dp, a.id, accept); });
  if (accept) toast.show(a.kind === 'returns' ? (isApparel(p.attrs) ? L(s0, 'Size chart added', 'साइज़ चार्ट जुड़ गया') : L(s0, 'Photos & size added', 'फ़ोटो और नाप जुड़ गए')) : a.kind === 'rival' ? L(s0, 'Holding your price', 'आपका दाम वही रहेगा') : L(s0, 'Price updated', 'दाम बदल गया'));
}

// ---- demo fast-forward ----
// multi-week jumps pause on any week that brings a new alert, so ask-me-first advice is never skipped
export function advance(n: number, onFirstProfit: () => void) {
  const s0 = getState();
  const profitBefore = s0.products.some(p => p.weeks.some(w => w.profit > 0));
  let fresh: Alert[] = [];
  update(d => {
    for (let i = 0; i < n; i++) { fresh = nextWeek(d); if (d.mode === 'ask' && fresh.length) break; }
  });
  const s = getState();
  if (!profitBefore && !s.celebratedProfit && s.products.some(p => p.weeks.some(w => w.profit > 0))) {
    update(d => { d.celebratedProfit = true; });
    onFirstProfit();
  }
  if (fresh.length) {
    const a = fresh[0];
    const p = s.products.find(x => x.alerts.some(y => y.id === a.id))!;
    banner.show(alertText(s, p, a).t, s.mode === 'auto' ? L(s, 'Mool Mitra · applied automatically', 'मूल मित्र · अपने-आप लागू') : L(s, 'Mool Mitra · tap to answer', 'मूल मित्र · जवाब देने के लिए दबाएं'), 3000);
  }
}

export function WeekStrip({ onFirstProfit }: { onFirstProfit: () => void }) {
  const s = useStore();
  return (
    <div className="weekstrip">
      <div><b>{L(s, `Week ${s.week} on Meesho`, `मीशो पर ${s.week}वां हफ़्ता`)}</b>
        {isFestive(s.week + 1) ? <Pill tone="saffron">🪔 {L(s, 'Diwali next', 'आगे दिवाली')}</Pill> : <Pill>{L(s, 'Demo', 'डेमो')}</Pill>}</div>
      <div className="ws-b">
        <button className="ws-next" onClick={() => { buzz(); advance(1, onFirstProfit); }}>{L(s, 'Next week ▸', 'अगला हफ़्ता ▸')}</button>
        <button className="ws-4" onClick={() => { buzz(); advance(4, onFirstProfit); }} aria-label={L(s, 'Skip up to 4 weeks', '4 हफ़्ते तक आगे')}>+4</button>
      </div>
    </div>
  );
}

export const keepOf = (p: Product) => econ(p.price, inputsOf(p));
export const useActive = () => active(useStore());
