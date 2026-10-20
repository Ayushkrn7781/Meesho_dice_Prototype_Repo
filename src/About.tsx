import { useState } from 'react';
import { CONFIG, DEFAULT_CONFIG, FESTIVE, TIERS, type ModelConfig } from './model';
import { update, useStore } from './store';
import { Card } from './ui';

const FIELDS: [keyof ModelConfig, string][] = [
  ['median', 'Typical price of similar items (₹)'], ['k', 'Price sensitivity k'], ['D0', 'Orders/week at reference price'], ['cap', 'Seller capacity (orders/week)'],
  ['rto', 'Failed-delivery rate (RTO)'], ['ret', 'Customer return rate'], ['retFixed', 'Return rate with size chart'], ['unsell', 'Unsellable share of returns'],
  ['pack', 'Packing per order (₹)'], ['fwd', 'Forward shipping (₹)'], ['rev', 'Return shipping (₹)'], ['ads', 'Ads per order (₹)'],
  ['phi', 'Payment + TCS + TDS share'], ['margin', 'Target margin above breakeven (₹)'],
];

const SOURCES: [string, string][] = [
  ['Amazon, Automate Pricing (rules inside seller-set min/max)', 'https://sell.amazon.com/tools/automate-pricing'],
  ['Airbnb, New listing promotion (20% off next 3 bookings)', 'https://www.airbnb.com/e/new-listing-promotion'],
  ['Shopee 2026 new-seller policy, third-party summary', 'https://www.duoke.com/en/blog/article/405-2026-Shopee-New-Seller-Onboarding-Guide-Registration-New-Seller-Policy'],
  ['Temu fully managed model', 'https://shopappy.com/ecommerce/temu/temu-local-vs-fully-managed'],
  ['Etsy Optimize Prices beta and seller pushback', 'https://www.valueaddedresource.net/etsy-launches-optimize-prices-beta/'],
  ['Meesho shipping charges for sellers (indicative)', 'https://www.shiprocket.in/blog/meesho-shipping-charges/'],
  ['Meesho listing requirements', 'https://streamoid.com/guide/meesho-seller-guide'],
  ['Khatabook vs Vyapar', 'https://www.mooninvoice.com/blog/khatabook-vs-vyapar'],
];

export function About() {
  const s = useStore();
  const set = (k: keyof ModelConfig, v: number) => update(d => { d.cfg = { ...d.cfg, [k]: v }; });
  const edited = Object.keys(s.cfg).length > 0;
  const [gen, setGen] = useState(0);  // remounts inputs after a reset
  return (
    <main className="about">
      <p className="kicker">Method</p>
      <h1>How Mool Mitra prices</h1>
      <p className="muted">Concept prototype by Team Razor Blade, IIT Kanpur, for the Meesho DICE Challenge S3. <b>All seller, order and district data in this app is simulated.</b> Market facts are from public sources listed below; the survey figures are a simulated survey (n=150).</p>

      <Card kicker="Formulas" title="Per shipped order, price P, making cost C">
        <pre>{`r = RTO rate, q = return rate (size chart: ${DEFAULT_CONFIG.retFixed})
clean     = 1 − r − q                         share of orders the buyer keeps
cogs      = C × (1 − (r + q) × (1 − unsell))  product cost net of resold returns
fixed     = cogs + pack + fwd × clean + rev × q + ads
keep(P)   = clean × P × (1 − phi) − fixed
breakeven = fixed ÷ (clean × (1 − phi))
floor     = (fixed + margin) ÷ (clean × (1 − phi))
pref      = median × (1 + tier premium)
orders(P) = min(cap, D0 × demand × e^(−k × (P − pref) ÷ pref))
month(P)  = keep(P) × orders(P) × 4.3`}</pre>
        <p className="note">Recommendations: <b>Earn the most</b> = highest month(P); <b>Get first orders</b> = lowest price keeping ₹15+; <b>Clear old stock</b> = lowest price losing at most ₹20. Festive weeks 5–7: RTO {FESTIVE.rto * 100}%, demand ×{FESTIVE.demand}. Tier premiums: {Object.values(TIERS).map(t => `${t.label} ${Math.round(t.prem * 100)}%`).join(' · ')}.</p>
      </Card>

      <Card kicker="Assumptions" title="Constants (editable)" right={edited ? <button className="btn sm ghost" onClick={() => { update(d => { d.cfg = {}; }); setGen(g => g + 1); }}>Reset to defaults</button> : undefined}>
        <div className="settings">{FIELDS.map(([k, label]) => (
          <label key={k} className="field">{label}
            <input key={gen} type="number" step="any" defaultValue={CONFIG[k]} onChange={e => { const v = Number(e.target.value); if (Number.isFinite(v)) set(k, v); }} />
          </label>))}</div>
        <p className="note">Changes apply across the whole app in this browser. The §9.5 test values assume the defaults.</p>
      </Card>

      <Card kicker="Competitive research" title="What we copied and what we avoided">
        <div className="tw"><table>
          <thead><tr><th>Platform</th><th>We copy</th><th>We avoid</th></tr></thead>
          <tbody>
            <tr><td>Meesho today</td><td>0% commission framing, feed boost for new listings</td><td>Suggestion ignores the seller's cost; no help after listing</td></tr>
            <tr><td>Amazon Automate Pricing</td><td>Min/max guardrails, pausable automation, price history</td><td>Seller must already know their minimum; English only</td></tr>
            <tr><td>Airbnb New Listing Promotion</td><td>Time-boxed launch discount that ends automatically</td><td>Discount funded fully by the seller</td></tr>
            <tr><td>Shopee new-seller policy</td><td>Capped launch window + traffic boost</td><td>Uncapped subsidies</td></tr>
            <tr><td>Temu fully managed</td><td>A seller only truly knows their cost</td><td>Taking price control away from the seller</td></tr>
            <tr><td>Etsy Optimize Prices</td><td>—</td><td>Price ranges with no knowledge of seller costs</td></tr>
            <tr><td>Khatabook / Vyapar</td><td>Plain-language weekly ledger, WhatsApp-style messages</td><td>Accounting jargon</td></tr>
          </tbody></table></div>
      </Card>

      <Card kicker="Pilot targets" title="Success metrics">
        <div className="tw"><table>
          <thead><tr><th>Metric</th><th>Today (simulated/modelled)</th><th>Pilot target</th></tr></thead>
          <tbody>
            <tr><td>New sellers still selling at day 90</td><td>45%</td><td>60%</td></tr>
            <tr><td>Listings at or above breakeven</td><td>16% priced from cost</td><td>90%</td></tr>
            <tr><td>Days to first sale</td><td>16 (FY25, public)</td><td>7</td></tr>
            <tr><td>Funded launch orders per seller</td><td>—</td><td>≤ 20 (hard cap)</td></tr>
            <tr><td>Sellers who know what they keep per order</td><td>15%</td><td>80%</td></tr>
          </tbody></table></div>
        <p className="note"><b>Business case (modelled):</b> Meesho spends ₹1,080 per seller and gets ₹1,316 back over 24 months; payback in month 17. 5-year NPV ₹29.2 Cr at 12%. Breaks even at roughly a +13-point day-90 retention uplift; turns negative if the launch offer grows to 60 funded orders.</p>
      </Card>

      <Card kicker="Sources" title="Public references">
        <ul className="ticks">{SOURCES.map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noreferrer">{t}</a></li>)}
          <li>Meesho FY26 seller and order figures: Deccan Herald; contribution margin: Exencial Q3 FY26 notes; new-to-e-commerce share and time to first sale: Tigerfeathers; returns/RTO: Angadi Labs (as cited in the team's Data Book).</li>
        </ul>
      </Card>
    </main>
  );
}
