# Mool Mitra: Demo Prep (Numbers, Script, Q&A)

Team Razor Blade · IIT Kanpur · Meesho DICE Challenge S3
Problem statement: *Pricing across a product's lifecycle: the new-to-online seller.*

All numbers below come from `src/engine/model.ts` and `src/engine/sim.ts`, and match the test vectors in `tests/model.test.ts`.

---

## Part A. The numbers

### A1. The one idea behind every number

Meesho charges 0% commission, but a seller's cost per order is not zero. Some orders fail or come back, and the seller pays for that. The model works out what the seller actually keeps from a typical order:

1. **How many orders stay sold ("clean")**: `clean = 1 − RTO − returns`. Default: 1 − 20% − 10% = **70%**. With a size chart, returns fall to 7%, so clean is 73%.
2. **Money received**: `clean × price × (1 − 3%)`. The 3% covers payment fees, TCS and TDS.
3. **Product cost, including losses**: `cost × (1 − (RTO + returns) × (1 − 15%))`. 85% of returned or failed pieces are resold, and 15% are lost. For a ₹180 product this is **₹134.1**.
4. **Other costs per order**:
   - Forward shipping: ₹65 × 70% = **₹45.5** (only paid on orders that stay sold)
   - Return shipping: ₹155 × 10% = **₹15.5**
   - Packing: **₹8**
   - Ads: **₹15**
5. **You keep** = money received − all the costs above.

### A2. Number by number, screen by screen

**Kitna Bachega? (before sign-up).** Shows what the seller keeps per order at the typical market price. It is the hook: the seller sees the real number before committing. It proves that sellers don't know their full cost per order (48% in our simulated survey).

**Floor Engine, top tiles and guardrails**

| Number | How it is computed | What it tells the seller |
|---|---|---|
| **Breakeven** | `fixed costs ÷ (clean × 0.97)` | The price below which they lose money on every order. Ramesh: **₹321** |
| **Target floor** | `(fixed costs + ₹40) ÷ (clean × 0.97)` | Breakeven plus a ₹40 target margin. Ramesh: **₹380** |
| **You keep / order** | Money received − costs at the chosen price | Profit per order, in rupees |
| **Orders per week** | `60 × e^(−3 × (P − pref) ÷ pref)`, capped at capacity (60) | Demand falls as price rises. `pref` is the market median, adjusted for quality (Better +12%, Premium +25%) |
| **Per month** | `keep × orders × 4.3` | What this price earns in a month (4.3 weeks per month) |

The orders-per-week figure comes from an illustrative demand curve. It is an assumption, not measured data.

**Price menu and the three goals.** The app checks nine candidate prices and recommends one for each goal:
- **Get first orders:** the lowest price that still keeps at least ₹15.
- **Earn the most:** the price with the highest monthly profit.
- **Clear old stock:** the lowest price that loses no more than ₹20 per order.

For Ramesh these are **₹349, ₹399 and ₹299**.

Ramesh's price table (cost ₹180, market median ₹250):

| Price | Orders/wk | Keep/order | Per month |
|---|---|---|---|
| ₹199 | 60 | −₹83 | **−₹21,409** |
| ₹249 | 60 | −₹49 | −₹12,649 |
| ₹299 | 33 | −₹15 | −₹2,161 |
| ₹349 | 18 | +₹19 | ₹1,484 |
| **₹399** | 10 | **+₹53** | **₹2,280** |
| ₹449 | 5.5 | +₹87 | ₹2,055 |
| ₹499 | 3 | +₹121 | ₹1,569 |
| ₹549 | 1.7 | +₹155 | ₹1,104 |

**Takeaway:** the cheapest price gets the most orders and the biggest loss. The highest price gives the most profit per order but almost no orders. Profit peaks in the middle, and that is the price a seller cannot find by guessing.

**True cost tab.** The receipt from A1, shown line by line, so the seller sees where each rupee goes. It also has a "Shop habit vs online" card: pricing at cost + 30% (₹234 for Ramesh) loses about **₹59 per order** online.

**Buyer's view.** Meesho price filters sit at ₹199, ₹299, ₹399, ₹499 and ₹699. The app warns when a price just misses one (for example ₹319 misses "Under ₹299").

**Launch offer.** Buyers see ₹50 off for the first 20 orders. **Meesho pays ₹30, the seller pays ₹20.** The app shows what the seller still keeps (`keep − 20`). The price never falls below the seller's minimum.

**Hisaab (weekly accounts).** `Profit = money received − making cost − other costs − launch share (₹20 × launch orders)`. Orders are the demand curve with ±15% noise. The noise is seeded, so the demo replays the same way every time. Everything on this screen is **simulated**.

**Alerts (the lifecycle).** These are scripted events in the simulation:

| When | Alert | Number behind it |
|---|---|---|
| 3 weeks after going live | **Rival** cuts price; orders drop 20% in weeks 3–4 | Accepting means holding the price |
| Week 4 | **Festive** prep | Failed deliveries rise from 20% to 28%, demand +40%. Ramesh's breakeven moves ₹321 → **₹334**; profit at ₹399 drops ₹53 → **₹39**. Suggested price = festive best + ₹30 |
| 6 weeks after going live (no size chart) | **Returns** | A size chart cuts returns 10% → 7%, so breakeven falls ₹321 → **₹311** |
| Week 9 | **Post-festive** | Returns the price to the normal best price |

In auto mode the app accepts alerts, but never sets a price below breakeven.

---

## Part B. How this validates the problem statement

| Lifecycle stage | What the prototype does | The number that proves it |
|---|---|---|
| Before listing | Gives breakeven, floor and the best price | ₹321 and ₹399, against the seller's guess of ₹199 |
| Launch | Co-funded offer with a floor guard | Meesho ₹30 + seller ₹20 |
| Competition | Rival alert says to hold the price | 20% order dip handled by price discipline |
| Festival | Reprices for higher failed deliveries | Breakeven ₹321 → ₹334 |
| Returns | Prompts a size chart | Breakeven ₹321 → ₹311 |
| After the peak | Brings the price back | Week 9 alert |

The problem is visible in the numbers:
- Copying the cheapest rival at ₹199 loses **₹83 per order**.
- At 60 orders a week for 4 weeks: 60 × 4 × 83 = **₹19,915** lost. This is the figure in Ramesh's story.
- At ₹399 the seller keeps **₹53 per order** and earns about **₹2,280 a month**. The swing is about ₹136 per order.

---

## Part C. Impact framing (closing minute)

- **Seller retention:** a seller who loses money quits. A seller who keeps ₹53 per order stays.
- **Meesho's economics:** contribution margin is about 2.3%, so each retained seller matters. The ₹30 launch cost is small compared with the lifetime value of a seller who stays.
- **Scale:** about 9.6 lakh active sellers, with 40–50% new to e-commerce. Even a small improvement in survival is large.
- **Say clearly that these are projections.** We have not measured real seller outcomes.

---

## Part D. Demo script (~5 min)

**Before the call:** open the deployed link in a phone-sized window, start from the splash screen, have the Hindi/English toggle ready, and share the screen. One person drives, one speaks.

1. **Hook (30 sec).** "We're Team Razor Blade from IIT Kanpur. Meet Ramesh, a chikankari workshop owner in Lucknow. His kurti costs ₹180. He copies a rival at ₹199 and thinks he makes ₹19. But one in five parcels fails and one in ten returns, and each return costs ₹155. He's actually losing ₹83 an order, ₹19,915 in four weeks, and he quits. Nobody told him his breakeven is ₹321. Mool Mitra is the friend who tells a seller that number before they list."
2. **Splash, language, story (20 sec).** Hindi-first, one-tap English, installable as a PWA.
3. **Kitna Bachega? (45 sec).** Enter a cost, see what you keep in rupees, not percentages. "0% commission is not zero cost."
4. **Product, photos, costs (30 sec).** Simulated OTP sign-up, simple product questions, photos required (they cut returns), costs pre-estimated. Sellers can add their own product in any industry.
5. **Floor Engine (75 sec, the core).** Show breakeven, target floor, the price menu by goal and the monthly profit curve. Then the True cost receipt and the Buyer's view. "We never let a seller list below breakeven, and the seller always decides." At ₹399 Ramesh keeps ₹53 an order and earns about ₹2,280 a month.
6. **Seller verification (30 sec).** Aadhaar, PAN, GST, bank, address. Format checks only; OTP and the ₹1 bank check are simulated; only masked numbers are stored.
7. **Co-funded launch (30 sec).** Buyers see ₹50 off for the first 20 orders. Meesho pays ₹30, the seller pays ₹20. Price never goes below the seller's minimum.
8. **After launch (60 sec).** Home, Hisaab (profit in rupees each week), Alerts (rival, festive, returns, post-festive). One alert a day, with the reason and rupees at stake, always ask-first. Show a week advancing.
9. **Close (30 sec).** 9.6 lakh sellers, 40–50% new, ~2.3% contribution margin. "Pricing becomes a number the seller understands, and the seller keeps selling." Be honest that orders, profits and alerts are simulated, the engine is tested, and the next step is a pilot with Star partners and a district console for managers.

---

## Part E. Caveats to know before the call

1. **The Ramesh numbers use a ₹250 market median, but the app's chikan kurti uses ₹429.** For a chikan kurti at an estimated cost of about ₹240, breakeven is about ₹387, the best price about ₹522, and monthly profit about ₹12,338 (these were computed outside the app, so check them in it). Live numbers will not match the story. Run the flow once, note the actual numbers, and say "Ramesh's numbers are X; the app computes them live for any product."
2. **The constants are assumptions.** Return rate, failed-delivery rate, shipping, ads and price sensitivity are illustrative. Return and failed-delivery rates are based on public figures. The demand curve is a model, not measured data.
3. **The survey is simulated** (n=150). Always label it.
4. **No backend.** Orders, profits and alerts are scripted and stay on the phone.
5. **KYC is format-only.** The real integration would use Meesho's existing KYC services.
6. **The District Console is not in the current build.** It appears in the README and build prompt, but the current code has no such screen. Present it as a next step.
7. **The model is deliberately simple:** one product, uniform costs, one demand curve, no competitor reaction. Real Meesho data (return and failed-delivery rates by category and pincode) would replace the constants.

---

## Part F. Likely judge questions

| Question | Answer |
|---|---|
| Is the data real? | Market figures are from public sources. Orders, profits and alerts are simulated and labelled. Model constants are illustrative, calibrated to public figures. |
| How is demand modelled? | A price-sensitivity curve around the median price of similar items, capped by the seller's capacity. Festive weeks raise demand and failed deliveries. |
| Why not recommend the highest keep per order? | The seller would sell almost nothing. Profit is keep × orders, and it peaks in the middle. |
| Why would Meesho co-fund the launch? | Faster first sale and lower seller churn. Retaining a seller is worth more than ₹30 on 20 orders. |
| Why not fully auto-price like Amazon? | New sellers distrust black boxes. We copy Amazon's min/max guardrails but keep the seller in control and explain every alert in rupees. |
| Why 4.3? | There are about 4.3 weeks in a month. |
| Why a ₹40 margin? | It is a configurable target (`margin` in the code). A pilot would tune it. |
| Is the ₹155 return cost real? | It is an illustrative figure close to public reverse-shipping rates. State it as an assumption. |
| What's the backend? | None yet. State lives on the device. `src/live.ts` is a stub for a Supabase sync. |
