import { useState } from 'react';
import { titleFor } from '../engine/catalog';
import { bucketNote, econ, metrics, pricePoints, recommend, type Goal } from '../engine/model';
import { inputsOf } from '../engine/sim';
import { back, navigate } from '../router';
import { active, buzz, inr, L, toast, update, useStore } from '../store';
import { Curve } from '../ui/charts';
import { AppBar, Button, Card, MoneyTile, Pill, ReceiptRow, Segmented, Skeleton, Stepper, StickyCTA, Thumb, useCalculating } from '../ui/core';

export function FloorEngine() {
  const s = useStore();
  const p = active(s);
  const inp = inputsOf(p);
  const [tab, setTab] = useState<'menu' | 'cost' | 'buyer'>('menu');
  const busy = useCalculating(p.id + p.cost + p.tier + p.sizeChart);
  const goals: { g: Goal; t: [string, string]; d: [string, string] }[] = [
    { g: 'first', t: ['Get first orders', 'पहले ऑर्डर पाएं'], d: ['Lowest price that keeps ₹15+', 'सबसे कम दाम जिसमें ₹15+ बचें'] },
    { g: 'profit', t: ['Earn the most', 'सबसे ज़्यादा कमाएं'], d: ['Highest profit per month', 'महीने में सबसे ज़्यादा मुनाफ़ा'] },
    { g: 'clear', t: ['Clear old stock', 'पुराना माल निकालें'], d: ['Lose at most ₹20 per order', 'हर ऑर्डर पर ₹20 से ज़्यादा घाटा नहीं'] },
  ];
  const recs = Object.fromEntries(goals.map(x => [x.g, recommend(x.g, inp)])) as Record<Goal, number>;
  const price = p.price || recs[p.goal];
  const e = econ(price, inp);
  const m = metrics(price, inp);
  const menu = pricePoints(inp.median).map(x => metrics(x, inp));
  const idx = menu.reduce((bi, x, i) => (Math.abs(x.p - price) < Math.abs(menu[bi].p - price) ? i : bi), 0);
  const setPrice = (n: number) => update(d => { active(d).price = n; });
  const loss = price < e.breakeven;
  const shop = Math.round(p.cost * 1.3);
  const shopKeep = econ(shop, inp).c;
  const charm = (x: number) => Math.round(x / 10) * 10 - 1;
  const feed = [charm(price * 0.75), charm(price * 0.88), price, charm(price * 1.2)];
  const list = () => {
    update(d => { active(d).price = price; });
    if (p.live) { toast.show(L(s, `Price updated to ${inr(price)}`, `दाम ${inr(price)} हो गया`)); navigate('home'); }
    else navigate('launch');
  };

  return (
    <main className="screen">
      <AppBar title={L(s, 'Floor Engine', 'फ़्लोर इंजन')} onBack={back} />
      {!s.onboarded && <Stepper stage={3} />}
      <div className="pad">
        <div className="fe-head"><Thumb attrs={p.attrs} size={48} /><div><b>{titleFor(p.attrs)[s.lang]}</b><small>{L(s, `Making cost ${inr(p.cost)}`, `बनाने का खर्च ${inr(p.cost)}`)}</small></div></div>
        {busy ? <Skeleton tiles={3} rows={2} /> : <>
          <div className="tiles3">
            <MoneyTile filled label={L(s, 'Your price', 'आपका दाम')} value={price} toned={false} />
            <MoneyTile label={L(s, 'You keep / order', 'हर ऑर्डर पर बचत')} value={e.c} />
            <MoneyTile label={L(s, 'Per month', 'हर महीने')} value={m.month} caption={L(s, `~${Math.round(m.o)} orders/week`, `~${Math.round(m.o)} ऑर्डर/हफ़्ता`)} />
          </div>
          <div className="guards">
            <Pill tone="loss">{L(s, 'Breakeven', 'कम से कम')} {inr(e.breakeven)}</Pill>
            <Pill tone="saffron">{L(s, 'Target floor', 'सही न्यूनतम')} {inr(e.floor)}</Pill>
            {loss && <Pill tone="loss">⚠ {L(s, 'Loss on every order', 'हर ऑर्डर पर घाटा')}</Pill>}
          </div>
        </>}

        <Segmented label={L(s, 'Floor Engine views', 'फ़्लोर इंजन के हिस्से')} value={tab} onChange={setTab}
          options={[['menu', L(s, 'Price menu', 'दाम मेन्यू')], ['cost', L(s, 'True cost', 'असली खर्च')], ['buyer', L(s, "Buyer's view", 'खरीदार की नज़र')]]} />

        {tab === 'menu' && <>
          <div className="goals" role="radiogroup" aria-label={L(s, 'Pick a goal', 'लक्ष्य चुनें')}>
            {goals.map(x => {
              const on = p.goal === x.g && price === recs[x.g];
              return <button key={x.g} role="radio" aria-checked={on} className={'goal' + (on ? ' on' : '')} onClick={() => { buzz(); update(d => { const dp = active(d); dp.goal = x.g; dp.price = recs[x.g]; }); }}>
                {on && <span className="badge">{L(s, 'Recommended', 'सुझाया गया')}</span>}
                <span className="gt">{L(s, ...x.t)}</span><b>{inr(recs[x.g])}</b><small>{L(s, ...x.d)}</small>
              </button>;
            })}
          </div>
          <Card title={L(s, 'Profit per month at each price', 'हर दाम पर महीने का मुनाफ़ा')}>
            <Curve pts={menu.map(x => ({ x: x.p, y: Math.round(x.month) }))} mark={menu[idx].p} floor={Math.round(e.breakeven)}
              floorLabel={L(s, 'breakeven', 'कम से कम')} label={L(s, 'Line chart of monthly profit by price', 'दाम के हिसाब से महीने का मुनाफ़ा')} />
            <label className="slider">
              <span className="sr">{L(s, 'Price', 'दाम')}</span>
              <input type="range" min={0} max={menu.length - 1} step={1} value={idx} onChange={ev => setPrice(menu[Number(ev.target.value)].p)}
                aria-valuetext={inr(menu[idx].p)} aria-label={L(s, 'Choose price', 'दाम चुनें')} className={loss ? 'loss' : ''} />
              <span className="slider-ends"><small>{inr(menu[0].p)}</small><small>{inr(menu[menu.length - 1].p)}</small></span>
            </label>
            <div className="ptable">
              <div className="pr ph" aria-hidden="true"><span>{L(s, 'Price', 'दाम')}</span><span>{L(s, 'Orders/wk', 'ऑर्डर/हफ़्ता')}</span><span>{L(s, 'Keep', 'बचत')}</span><span>{L(s, 'Month', 'महीना')}</span></div>
              {menu.map(x => <button key={x.p} aria-pressed={x.p === price} aria-label={L(s, `${inr(x.p)}: ${x.o.toFixed(1)} orders a week, keep ${inr(x.c)} per order, ${inr(x.month)} a month${x.c < 0 ? ', loss' : ''}`, `${inr(x.p)}: हफ़्ते में ${x.o.toFixed(1)} ऑर्डर, हर ऑर्डर पर ${inr(x.c)}, महीने में ${inr(x.month)}${x.c < 0 ? ', घाटा' : ''}`)} className={'pr' + (x.p === price ? ' on' : '') + (x.c < 0 ? ' loss' : '')} onClick={() => { buzz(); setPrice(x.p); }}>
                <span>{inr(x.p)}{x.c < 0 && <em>{L(s, 'Loss', 'घाटा')}</em>}</span><span>{x.o.toFixed(1)}</span><span>{inr(x.c)}</span><span>{inr(x.month)}</span>
              </button>)}
            </div>
          </Card>
        </>}

        {tab === 'cost' && <>
          <Card title={L(s, `Where ${inr(price)} goes, per order`, `${inr(price)} कहां जाता है, हर ऑर्डर पर`)}>
            <ReceiptRow label={L(s, `Money received (${Math.round(e.clean * 100)}% of orders kept, after 3% fees)`, `मिलने वाला पैसा (${Math.round(e.clean * 100)}% ऑर्डर रखे गए, 3% फ़ीस के बाद)`)} value={e.realised} />
            <ReceiptRow label={L(s, 'Product cost (incl. unsellable returns)', 'सामान का खर्च (न बिकने वाले रिटर्न समेत)')} value={e.cogs} minus />
            <ReceiptRow label={L(s, 'Forward shipping', 'भेजने की शिपिंग')} value={e.fwdC} minus />
            <ReceiptRow label={L(s, 'Return shipping', 'वापसी की शिपिंग')} value={e.revC} minus />
            <ReceiptRow label={L(s, 'Packing', 'पैकिंग')} value={e.pack} minus />
            <ReceiptRow label={L(s, 'Ads', 'विज्ञापन')} value={e.ads} minus />
            <ReceiptRow label={L(s, 'You keep', 'आपको बचेगा')} value={e.c} total />
          </Card>
          <Card tone="peach" title={L(s, 'Shop habit vs online', 'दुकान की आदत बनाम ऑनलाइन')}>
            <p className="small">{L(s, `Shop habit: cost + 30% = ${inr(shop)} → online you'd ${shopKeep < 0 ? `lose ${inr(-shopKeep)}` : `keep only ${inr(shopKeep)}`} per order.`,
              `दुकान वाला हिसाब: खर्च + 30% = ${inr(shop)} → ऑनलाइन हर ऑर्डर पर ${shopKeep < 0 ? `${inr(-shopKeep)} का घाटा` : `सिर्फ़ ${inr(shopKeep)} बचत`}।`)}</p>
          </Card>
        </>}

        {tab === 'buyer' && <Card title={L(s, 'How buyers see you', 'खरीदार आपको कैसे देखेंगे')}>
          <div className="feed">{feed.map((x, i) => (
            <div key={i} className={'feed-i' + (i === 2 ? ' me' : '')}>
              {i === 2 ? <Thumb attrs={p.attrs} size={68} /> : <div className="ph" aria-hidden="true" />}
              <b>{inr(x)}</b><small>{i === 2 ? L(s, 'You', 'आप') : L(s, 'Similar', 'मिलता-जुलता')}</small>
              <span className="free">{L(s, 'Free delivery', 'फ़्री डिलीवरी')}</span>
            </div>))}</div>
          <p className="tip">💡 {bucketNote(price, s.lang)}</p>
        </Card>}
      </div>
      <StickyCTA>
        <Button full disabled={loss} onClick={list}>{p.live ? L(s, `Update price to ${inr(price)}`, `दाम ${inr(price)} करें`) : L(s, `List at ${inr(price)} →`, `${inr(price)} पर लिस्ट करें →`)}</Button>
        {loss && <p className="cta-warn">{L(s, "Mool Mitra won't let you list below your minimum price.", 'मूल मित्र आपको कम से कम दाम से नीचे लिस्ट नहीं करने देगा।')}</p>}
      </StickyCTA>
    </main>
  );
}
