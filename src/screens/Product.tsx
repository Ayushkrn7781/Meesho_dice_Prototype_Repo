import { estimate, isComplete, titleFor } from '../engine/catalog';
import { TIERS, type Tier } from '../engine/model';
import { back, navigate } from '../router';
import { active, L, update, useStore } from '../store';
import { AppBar, Button, Card, Segmented, Stepper, StickyCTA, Thumb } from '../ui/core';
import { isApparel, QuestionFlow, RupeeStepper } from './common';

const setActive = (fn: (p: ReturnType<typeof active>) => void) => update(d => fn(active(d)));

// 8.6 Your first product: one question per step
export function Product() {
  const s = useStore();
  const p = active(s);
  const done = isComplete(p.attrs);
  return (
    <main className="screen">
      <AppBar title={s.onboarded ? L(s, 'New product', 'नया सामान') : L(s, 'Your first product', 'आपका पहला सामान')} onBack={back} />
      {!s.onboarded && <Stepper stage={2} />}
      <div className="pad">
        <QuestionFlow attrs={p.attrs} onChange={(na, complete) => {
          setActive(x => { x.attrs = na; x.cost = complete ? estimate(na).cost : 0; x.price = 0; });
          if (complete) setTimeout(() => navigate('costs'), 250);
        }} />
        {done && <Card highlight className="prod-sum">
          <Thumb attrs={p.attrs} size={56} />
          <div><b>{titleFor(p.attrs)[s.lang]}</b><small>{L(s, 'Tap an answer above to change it.', 'बदलने के लिए ऊपर किसी जवाब पर दबाएं।')}</small></div>
        </Card>}
      </div>
      <StickyCTA><Button full disabled={!done} onClick={() => navigate('costs')}>{L(s, 'Next: your costs', 'आगे: आपका खर्च')}</Button></StickyCTA>
    </main>
  );
}

// 8.6 Your costs
export function Costs() {
  const s = useStore();
  const p = active(s);
  return (
    <main className="screen">
      <AppBar title={L(s, 'Your costs', 'आपका खर्च')} sub={titleFor(p.attrs)[s.lang]} onBack={back} />
      {!s.onboarded && <Stepper stage={2} />}
      <div className="pad">
        <Card title={L(s, 'Making cost per piece', 'एक पीस बनाने का खर्च')} kicker={L(s, 'Our estimate · change if different', 'हमारा अंदाज़ा · अलग हो तो बदलें')}>
          <RupeeStepper value={p.cost} label={L(s, 'Making cost per piece in rupees', 'एक पीस का खर्च, रुपये में')} onChange={n => setActive(x => { x.cost = n; x.price = 0; })} />
        </Card>
        <Card title={L(s, 'Quality vs similar items', 'मिलते-जुलते सामान से क्वालिटी')}>
          <Segmented label={L(s, 'Quality', 'क्वालिटी')} value={p.tier} onChange={(t: Tier) => setActive(x => { x.tier = t; x.price = 0; })}
            options={(Object.keys(TIERS) as Tier[]).map(t => [t, s.lang === 'hi' ? TIERS[t].hi : TIERS[t].label])} />
          <p className="hint">{L(s, 'Better quality can sell at a higher price.', 'अच्छी क्वालिटी ऊंचे दाम पर बिक सकती है।')}</p>
        </Card>
        <Card>
          <label className="switch-row">
            <span><b>{isApparel(p.attrs) ? L(s, "I'll add a size chart and real photos", 'मैं साइज़ चार्ट और असली फ़ोटो डालूंगा') : L(s, "I'll add real photos and exact dimensions", 'मैं असली फ़ोटो और सही नाप डालूंगा')}</b><small>{L(s, 'Cuts returns 10% → 7%', 'रिटर्न 10% → 7% हो जाते हैं')}</small></span>
            <input type="checkbox" role="switch" checked={p.sizeChart} onChange={e => setActive(x => { x.sizeChart = e.target.checked; x.price = 0; })} />
          </label>
        </Card>
        <Card title={L(s, 'Pieces in stock', 'स्टॉक में कितने पीस')}>
          <RupeeStepper value={p.stock} step={10} label={L(s, 'Pieces in stock', 'स्टॉक में पीस')} onChange={n => setActive(x => { x.stock = n; })} />
        </Card>
      </div>
      <StickyCTA><Button full disabled={p.cost <= 0} onClick={() => navigate('floor')}>{L(s, 'Find my right price →', 'मेरा सही दाम निकालें →')}</Button></StickyCTA>
    </main>
  );
}
