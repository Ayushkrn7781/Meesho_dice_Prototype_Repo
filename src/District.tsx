import { useMemo, useState } from 'react';
import { titleFor } from './catalog';
import { econ, metrics } from './model';
import { district, inputsOf, receiveNudge, type DSeller, type Health } from './sim';
import { inr, showToast, update, useStore } from './store';
import { Card, Pill, Stat } from './ui';

const HL: Record<Health, [string, 'good' | 'bad' | 'warn' | 'plum']> = {
  healthy: ['Healthy', 'good'], below: ['Below minimum price', 'bad'], slow: ['No sales 2+ weeks', 'warn'], returns: ['High returns', 'warn'], quit: ['Stopped selling', 'plum'],
};
// WhatsApp nudge text per issue: [English, Hindi]
function nudgeText(x: DSeller): [string, string] {
  const first = x.name.split(' ')[0];
  const loss = inr((x.floor - x.price) * 0.68);
  switch (x.health) {
    case 'below': return [`${first} ji, at ${inr(x.price)} you lose about ${loss} on every order. Your minimum price is ${inr(x.floor)}. Open Mool Mitra to see your right price.`,
      `${first} जी, ${inr(x.price)} पर आपको हर ऑर्डर पर लगभग ${loss} का घाटा है। आपका न्यूनतम दाम ${inr(x.floor)} है। सही दाम देखने के लिए मूल मित्र खोलें।`];
    case 'slow': return [`${first} ji, no orders for 2 weeks. Turn on the co-funded launch offer: Meesho pays ₹30 of ₹50 off on your next 20 orders.`,
      `${first} जी, 2 हफ़्ते से कोई ऑर्डर नहीं। लॉन्च ऑफ़र चालू करें: अगले 20 ऑर्डर पर ₹50 की छूट में ₹30 मीशो देगा।`];
    case 'returns': return [`${first} ji, your returns are ${x.returns}%. A size chart and real photos usually bring this to about 7% and lower your minimum price.`,
      `${first} जी, आपके रिटर्न ${x.returns}% हैं। साइज़ चार्ट और असली फ़ोटो से ये लगभग 7% तक आते हैं और न्यूनतम दाम घटता है।`];
    case 'quit': return [`${first} ji, we miss you on Meesho. Your Star partner will call to help you restart at a price that makes money.`,
      `${first} जी, मीशो पर आपकी कमी है। आपका स्टार पार्टनर कॉल करके मुनाफ़े वाले दाम पर फिर शुरू करने में मदद करेगा।`];
    default: return [`${first} ji, great work this month! Know another shop owner who should sell online? Refer them to Mool Mitra.`,
      `${first} जी, इस महीने बढ़िया काम! कोई और दुकानदार जानते हैं जिसे ऑनलाइन बेचना चाहिए? उन्हें मूल मित्र बताएं।`];
  }
}

export function District() {
  const s = useStore();
  const [filter, setFilter] = useState<'all' | Health>('all');
  const [q, setQ] = useState('');
  const sellers = useMemo(() => {
    const list = district(s.week * 7);
    if (s.wentLive && s.product.cost > 0 && s.price > 0) {
      const e = econ(s.price, inputsOf(s));
      const month = Math.round(metrics(s.price, inputsOf(s)).month);
      const you: DSeller = { id: 'you', name: s.profile.name, area: 'Aminabad', cat: titleFor(s.product.attrs).en, week: s.week, price: s.price, floor: Math.round(e.breakeven), profit: month, orders: s.weeks.at(-1)?.orders ?? 0, returns: s.product.sizeChart ? 7 : 10, health: s.price < e.breakeven ? 'below' : 'healthy', onMM: true, you: true };
      return [you, ...list];
    }
    return list;
  }, [s]);
  const active = sellers.filter(x => x.health !== 'quit');
  const mm = sellers.filter(x => x.onMM), non = sellers.filter(x => !x.onMM);
  const rate = (arr: DSeller[]) => Math.round(100 * arr.filter(x => x.health !== 'quit').length / Math.max(1, arr.length));
  const below = sellers.filter(x => x.health === 'below');
  const risk = sellers.filter(x => x.health !== 'healthy' && x.health !== 'quit')
    .sort((a, b) => Number(b.health === 'below') - Number(a.health === 'below') || (b.floor - b.price) - (a.floor - a.price));
  const shown = sellers.filter(x => (filter === 'all' || x.health === filter) && (x.name + x.area + x.cat).toLowerCase().includes(q.toLowerCase()));
  const nudge = (x: DSeller) => {
    const [en, hi] = nudgeText(x);
    update(d => { if (!d.nudged.includes(x.id)) d.nudged.push(x.id); if (x.you) receiveNudge(d, en, hi); });
    showToast(`✓ Sent on WhatsApp to ${x.name}`, hi);
  };
  const areas = [...new Set(sellers.map(x => x.area))].map(a => { const g = sellers.filter(x => x.area === a); return { a, n: g.length, below: g.filter(x => x.health === 'below').length, act: rate(g) }; }).sort((x, y) => y.below - x.below);

  return (
    <div className="dist">
      <div className="dist-h">
        <div><p className="kicker">Lucknow district · new-seller growth</p><h1>Good morning, Priya</h1></div>
        <p className="muted">{sellers.length} new sellers · simulated data · week {s.week} of the seller demo</p>
      </div>
      <div className="kpis">
        <Stat label="New sellers (last 90 days)" value={sellers.length} />
        <Stat label="Still selling" value={`${Math.round(100 * active.length / sellers.length)}%`} sub="target 60% at day 90" />
        <Stat label="Listings below minimum price" value={`${Math.round(100 * below.length / sellers.length)}%`} sub={`${below.length} sellers losing money per order`} tone="bad" />
        <Stat label="Active: Mool Mitra users vs others" value={`${rate(mm)}% vs ${rate(non)}%`} sub="the retention gap the pilot measures" tone="good" />
      </div>
      <div className="dist-grid">
        <Card kicker="Today's actions" title="Highest-risk sellers first" right={<Pill tone="bad">{risk.length} at risk</Pill>}>
          <div className="risk">{risk.slice(0, 7).map(x => (
            <div key={x.id} className={'risk-r ' + x.health}>
              <div><b>{x.name}{x.you && ' (you)'}</b><small>{x.area} · {x.cat}</small>
                <span>{x.health === 'below' ? `Priced ${inr(x.price)}, minimum ${inr(x.floor)}: loses ${inr((x.floor - x.price) * 0.68)} per order` : x.health === 'returns' ? `Returns ${x.returns}%` : 'No orders in the last 2 weeks'}</span></div>
              {s.nudged.includes(x.id) ? <Pill tone="good">✓ Sent on WhatsApp</Pill> : <button className="btn sm" onClick={() => nudge(x)} title={nudgeText(x)[0]}>Send nudge</button>}
            </div>))}</div>
        </Card>
        <div className="col">
          <Card kicker="New-seller funnel" title="Signed up → still selling">
            {[['Signed up', 100], ['Listed a product', 96], ['Made a first sale', 88], ['Still selling', Math.round(100 * active.length / sellers.length)]].map(([l, v]) => (
              <div key={l as string} className="fun"><span>{l}</span><div><i style={{ width: `${v}%` }} /></div><b>{v}%</b></div>))}
          </Card>
          <Card kicker="Localities" title="Where to send Star partners">
            <div className="area-t"><div className="mh"><span>Area</span><span>Sellers</span><span>Below min</span><span>Active</span></div>
              {areas.map(r => <div key={r.a} className="mr"><span>{r.a}</span><span>{r.n}</span><span className={r.below ? 'bad' : ''}>{r.below}</span><span>{r.act}%</span></div>)}</div>
          </Card>
        </div>
      </div>
      <Card kicker="All new sellers" title="Seller health" right={<input className="search" aria-label="Search sellers" placeholder="Search name, area…" value={q} onChange={e => setQ(e.target.value)} />}>
        <div className="filters">{(['all', 'below', 'slow', 'returns', 'healthy', 'quit'] as const).map(f => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : HL[f][0]} ({f === 'all' ? sellers.length : sellers.filter(x => x.health === f).length})</button>)}</div>
        <div className="tbl">
          <div className="th"><span>Seller</span><span>Area</span><span>Week</span><span>Price</span><span>Minimum</span><span>Profit / month</span><span>Mool Mitra</span><span>Status</span></div>
          {shown.slice(0, 40).map(x => (
            <div key={x.id} className={'tr' + (x.you ? ' you' : '')}><span><b>{x.name}</b><small>{x.cat}</small></span><span>{x.area}</span><span>{x.week}</span><span>{inr(x.price)}</span><span>{inr(x.floor)}</span>
              <span className={x.profit >= 0 ? 'good' : 'bad'}>{x.health === 'quit' ? '—' : inr(x.profit)}</span><span>{x.onMM ? '✓' : '—'}</span><span><Pill tone={HL[x.health][1]}>{HL[x.health][0]}</Pill></span></div>))}
        </div>
      </Card>
    </div>
  );
}
