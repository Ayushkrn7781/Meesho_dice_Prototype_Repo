# Mool Mitra: Build Prompt for a Live, Hostable Prototype

> **How to use this file.** Paste the whole file into an AI app builder (Claude, Cursor, Lovable, Bolt, v0) or hand it to a developer. It is written as a product brief from the product manager, followed by an exact build spec. Everything needed is here: the story, the users, the competitor lessons, every screen, the pricing maths with test values, the data model, the design system, the real-time option, deployment and acceptance tests.
>
> Team Razor Blade, IIT Kanpur · Meesho DICE Challenge S3 (Business track) · Problem statement: *Pricing across a product's lifecycle: the new-to-online seller.*

---

## 0. One-paragraph brief (read this first)

Build **Mool Mitra** ("price friend"), a mobile-first web app for small sellers who are new to selling online on Meesho, plus a desktop **District Console** for a Meesho manager. A seller enters what one product costs them; Mool Mitra adds every hidden per-order cost (failed deliveries, returns, shipping both ways, packing, payment fees, ads), shows the **breakeven price**, a **target floor**, and a **price menu by goal**, then helps the seller launch with a **co-funded launch offer**, shows profit **in rupees every week**, and sends **ask-me-first price alerts** in Hindi or English. The district manager sees which new sellers are pricing below cost or about to quit and nudges them. The app must run in a browser, be deployable to Vercel/Netlify as a static site, work offline-first with simulated data, and optionally switch on a **live mode** (Supabase) so a seller's actions appear on the manager's console in real time on another device.

---

## 1. The story (why this exists)

**Ramesh Gupta** runs a two-machine chikankari workshop in Aminabad, Lucknow. His kurtis cost him ₹180 to make and sell for ₹450 in his shop. A Star partner signs him up on Meesho in a day. He lists at his shop price and gets three orders in two weeks. Worried, he copies the cheapest seller at ₹199. Orders flood in, and so do problems: one in five parcels comes back undelivered, one in ten is returned, every return costs ₹155 in reverse shipping, and some returned pieces cannot be resold. Meesho charges 0% commission, so he believed he was making ₹19 a piece. He was actually losing **₹83 on every order**. By week four he has lost ₹19,915 and stops selling.

Nothing in his journey told him the one number that mattered: **his breakeven is ₹321**. At ₹399 he would have kept **₹53 per order**, sold about 10 a week, and earned about **₹2,280 a month**, and he would still be on Meesho.

Mool Mitra is the friend who tells Ramesh that number before he lists, stays with him through launch and festive weeks, and tells his district manager when he is in trouble.

**Market facts to show in the app's "Why" section** (public sources; cite them):

- ~9.6 lakh active sellers on Meesho in FY26 (+87% YoY), 40–50% new to e-commerce.
- Time to first sale fell from 32 to 16 days (FY23 → FY25).
- COD returns ~24% vs prepaid ~10%; COD failed delivery (RTO) ~26%, fashion up to 40%.
- Meesho contribution margin ~2.3% (Q3 FY26), so every retained seller matters.

**Simulated research** (label as *simulated survey, n=150*):

- 48% of new sellers don't know their full cost per order.
- 32% set their first price by copying the cheapest rival.
- Sellers expect 8% returns + RTO but face about 29%.
- 50% lost money on at least one listing.
- 48% want price help on WhatsApp.

---

## 2. Product principles (non-negotiable)

1. **Rupees, not percentages.** "You keep ₹53 per order" beats "14% margin". Every number a seller sees is in ₹.
2. **Start from the seller's own cost.** Never suggest a price that ignores cost.
3. **The seller decides.** Default mode is *Ask me first*. Automation only within seller-set limits, never below breakeven.
4. **Hindi first, English available.** Every seller-facing string exists in both; one tap switches.
5. **Never list at a loss.** The app blocks listing below breakeven and explains why in one line.
6. **Calm, not noisy.** At most one alert per day; each states the reason and the ₹ at stake and has one primary action.
7. **Honest data.** Any simulated number is labelled "simulated" or "illustrative" on screen.

---

## 3. What we learned from other platforms (competitive research)

| Platform | What they do for a new seller's price | What we copy | What we avoid |
|---|---|---|---|
| **Meesho today** | One-time price suggestion based on similar listings; 0% commission; feed tests new listings | Zero-commission framing, feed boost for new listings | Suggestion ignores the seller's cost; no help after listing |
| **Amazon Automate Pricing** | Rules (match Featured Offer, lowest price, sales-based) inside a **seller-set min and optional max**; pause any time; 30-day history | **Min/max guardrails**, pausable automation, price history | Requires the seller to already know their minimum; English only |
| **Airbnb New Listing Promotion** | Optional 20% off the next 3 bookings for new listings; Airbnb reports 70%+ more bookings and more reviews | **Time-boxed, funded launch discount** that ends automatically | Discount funded fully by the seller |
| **Shopee new-seller policy (2026)** | 0% commission for first 3 months (500 orders/month cap), initial traffic boost in the first ~30 days | **Capped launch window** + traffic boost | Uncapped subsidies |
| **Temu fully managed** | Supplier quotes a supply price; Temu sets retail price and can push it down | The insight that a seller only truly knows **their cost** | Taking price control away from the seller |
| **Etsy Optimize Prices (beta)** | Shows a median price range of "similar" items | — | Sellers rejected it: poor comparisons and **no knowledge of their costs**. Our engine starts from cost. |
| **Khatabook / Vyapar** | Simple Hindi-first bookkeeping for small shops, WhatsApp sharing | **Weekly ledger ("Hisaab") in plain language**, WhatsApp-style messages | Accounting jargon |

**Our gap:** no platform combines (1) a cost-based floor, (2) launch help for zero-history listings, (3) pricing that adapts over the product's life, and (4) Hindi/WhatsApp delivery. Mool Mitra combines all four.

---

## 4. Users and jobs to be done

| Persona | Who | Job to be done | Channel |
|---|---|---|---|
| **Ramesh** (primary) | Chikan workshop owner, Lucknow, new to online, no GSTIN | "Tell me the lowest price I can sell at without losing money, and help me get my first orders." | Phone, Hindi, WhatsApp |
| **Sunita** | Saree shop owner, tier-3 town | "Explain why my online price must differ from my shop price." | Phone app + Hindi voice |
| **Imran** | Surat wholesaler, many designs | "Give me a price menu per design and alert me when costs change." | Phone/desktop, auto mode within limits |
| **Priya** (secondary) | Meesho district manager, Lucknow | "Show me which new sellers are losing money or about to quit, so I can act today." | Desktop console |

---

## 5. Scope

**Must have (MVP, ship first)**

1. Landing page with the story, three proof numbers, and links to both apps.
2. Seller app: Kitna Bachega? calculator → Sign up → Product + cost profile → Floor Engine (price menu, true cost, buyer's view) → Launch offer → Live shop (Home, Hisaab, Alerts, Listing) → Helper chat.
3. District console: KPIs, today's actions (risk list + nudge), funnel, localities, seller table with filters/search.
4. English/Hindi toggle across the seller app.
5. Time simulator ("Next week") so a demo can move through 12 weeks in a minute.
6. Works with no backend (localStorage), deployable as a static site.

**Should have**

- Live mode with Supabase: real sign-up (phone OTP or magic link), sellers saved in a database, district console updates in real time.
- Voice input for sign-up fields (Web Speech API, `hi-IN`), with typing as fallback.
- Add a second product; age-out flow (bundle → clearance at a lower floor) after week 20.

**Won't do (out of scope)**

- Real Meesho API integration, real payments, real WhatsApp sending (show a WhatsApp-style preview instead), real KYC.

---

## 6. Information architecture

```
/                 Landing (story, numbers, "Try seller app", "Open district console", 3-minute demo script)
/seller           Seller app (phone frame on desktop, full screen on mobile)
   step: calc → signup → product → price → launch → live
   live tabs: Home · Hisaab · Alerts · Listing     (+ floating "Ask Mool Mitra" chat)
/district         District console (desktop-first, responsive)
/about            Method, assumptions, sources, "data is simulated" note
```

Use hash routing (`#seller`) so static hosting needs no rewrites, or React Router with a Vercel rewrite to `index.html`.

A stage bar at the top of the seller app shows: **Discover · Register · Product · Price · Launch · Grow**.

---

## 7. Screen-by-screen specification

Each screen lists purpose, content and behaviour. Hindi copy is given for key strings. All other strings must be translated too.

### 7.1 Landing (`/`)
- Hero: "The right first price, from your own cost." Subtext explains the problem in two sentences.
- Three proof tiles:
  - **−₹83**: per order when a ₹180 kurti copies a ₹199 rival.
  - **₹321**: its real breakeven.
  - **+₹53**: kept at the Floor Engine price of ₹399.
- Six feature cards: Kitna Bachega?, Floor Engine, Co-funded launch, Weekly Hisaab, Mool Mitra alerts, District console.
- "3-minute demo" ordered list (see §13) and a "Start a fresh demo" button that clears state.

### 7.2 Seller · Kitna Bachega? (before sign-up) — "कितना बचेगा?"
- Purpose: show the true per-order profit before the seller commits.
- **Sequential dropdowns**: only the next unanswered question is visible; changing an earlier answer clears later ones. Questions:
  1. Category: Kurti / Kurta set / Dupatta.
  2. Style (depends on category).
  3. Fabric.
  4. Work (hand chikankari, mukaish, machine chikankari, block print, plain).
  5. Sleeve (skip for dupatta).
  6. Neck (skip for dupatta).
  7. Main colour.
  8. Sizes.
- After all answers: an editable "Making / buying cost per piece (₹)" pre-filled from the estimate table (§9.4). The answer card then shows:
  - typical price of similar items
  - **Minimum price (no loss)**
  - **You keep at ₹X**, in green or red
  - the line "0% commission does not mean zero cost."
- CTA "Start selling with Mool Mitra". A "Sign up" pill stays in the header so sellers can skip the calculator.

### 7.3 Seller · Sign up — "अपना खाता बनाएं"
- Fields: name, shop name, city, mobile (pre-filled with sample data in demo mode, with a yellow notice "Demo: do not enter real information").
- "Send OTP" → shows "✓ OTP 1234 verified (demo)". In live mode, use Supabase phone/email auth.
- Optional mic button per field (Web Speech API `hi-IN`).
- Card: "No GSTIN? No problem. We create a GST Enrolment ID from your PAN so you can sell within your state."

### 7.4 Seller · First product + 90-second cost profile — "आपका पहला प्रोडक्ट"
- Same sequential dropdowns as §7.2, then:
  - making cost (estimated, editable)
  - quality vs similar listings: Standard / Better than most / Premium-handwork
  - checkbox "I will add a size chart and real photos (cuts returns 10% → 7%)"
  - pieces in stock
- CTA "Find my right price →".

### 7.5 Seller · Floor Engine — "फ़्लोर इंजन"
- **Header tiles**: Your price · You keep per order · Per month (with ~orders/week).
- **Pills**: Breakeven ₹X (red) · Target floor ₹Y (amber) · "⚠ Loss on every order" if the price is below breakeven.
- **Three tabs**:
  1. **Price menu**:
     - Three goal cards, each with its recommended price:
       - **Get first orders** — lowest price that keeps ₹15+
       - **Earn the most** — highest monthly profit
       - **Clear old stock** — lose at most ₹20 per order
     - A line chart of monthly profit vs price, with a dashed breakeven line and the selected price marked.
     - A tappable table (Price · Orders/week · Keep · Month) with loss rows in red.
  2. **True cost**: a receipt for the selected price:
     - money received (share of orders kept, after 3% fees)
     − product cost (incl. unsellable returns)
     − forward shipping
     − return shipping
     − packing
     − ads
     = **You keep**.

     Add a note comparing shop logic (cost + 30%) with online reality.
  3. **Buyer's view**: four product tiles (two cheaper rivals, the seller's, a pricier rival) and a **filter-edge note** (e.g. "₹319 just misses the 'Under ₹299' filter").
- CTA "Use ₹X and continue", **disabled below breakeven** with the line "Mool Mitra will not let you list below your minimum price." If the seller already went live, the CTA reads "Update listing to ₹X" and returns to the live shop.

### 7.6 Seller · Naya Launch — "नया लॉन्च"
- Card "First 20 orders": "Buyers see ~~₹519~~ **₹469** · New launch".
- Rows:
  - Meesho pays ₹30
  - You give ₹20
  - **You still keep ₹X per order**
- Bullets:
  - Shown first to buyers of similar products.
  - Never below your minimum price.
  - Capped at 20 orders, then normal price.
- CTAs: "Go live with launch offer" / "Go live without offer".

### 7.7 Seller · Live shop (tabs)
A **time bar** sits on every tab: "Week N on Meesho", a "Diwali next" pill when relevant, and buttons **Next week ▸** and **+4**.

- **Home** — "नमस्ते, Ramesh जी":
  - tiles for orders so far, profit so far and last week
  - a product card (price, minimum, keep, launch orders left)
  - a banner "N new Mool Mitra alerts need your OK"
  - a bar chart of profit by week, with Diwali weeks in green
- **Hisaab** — "साप्ताहिक हिसाब":
  - **Weekly breakdown**:
    - orders kept by buyers (of N)
    - money received (after 3% fees)
    − making cost
    − shipping, returns, packing, ads
    − launch share
    = **Profit**

    The rows must sum exactly to profit.
  - **Returns check card**: actual vs assumed returns; if lower, the minimum price will fall.
  - **All-weeks table**.
- **Alerts** — "मूल मित्र अलर्ट":
  - Mode toggle **Ask me first / Auto within limits**, with the limits line "never below ₹breakeven".
  - Alert cards: title, week, "WhatsApp" tag, reason with ₹ at stake, primary and secondary action. Accepted alerts turn green ("Done") and ignored ones turn grey. See §9.6 for the rules.
- **Listing**: product card, price guard (current price, breakeven, target floor, size chart ✓/✕), and "Re-check price in Floor Engine".

### 7.8 Seller · Helper chat — floating "Ask Mool Mitra" / "मूल मित्र से पूछें"
- Bottom sheet with message bubbles, quick-reply chips and a text input.
- **Default is rule-based** (works offline, never fails in a demo). It matches keywords in English, Hinglish and Hindi, and answers using the seller's own numbers:
  - minimum price / loss / breakeven
  - returns / RTO
  - commission / fees
  - launch offer
  - rival price cut
  - "what price"
  - fallback: "Talk to a person"
- **Optional AI mode:** if an LLM API key is configured, send a system prompt containing the seller's numbers. Answers must stay under 90 words, use plain Hindi or English, use rupees and invent no policies.

### 7.9 District console (`/district`) — "Good morning, Priya"
- Header: "Lucknow district · new-seller growth", the seller count and a "simulated data" label.
- **KPI tiles**:
  - new sellers (90 days)
  - % still selling (target 60% at day 90)
  - % listings below minimum price (red)
  - active rate: Mool Mitra users vs others
- **Today's actions**: the 7 highest-risk sellers, below-minimum first. Each row shows name, area, category and the issue in ₹ (e.g. "Priced ₹349, minimum ₹387: loses ₹26 per order"), plus a **Send nudge** button. Sending shows "✓ Sent on WhatsApp" and a toast previewing the Hindi message.
- **New-seller funnel**: Signed up → Listed → First sale → Still selling, as horizontal bars.
- **Localities table**: area, sellers, below-min count and active %, sorted by below-min count, to show where to send Star partners.
- **Seller health table**: search box and filter chips (All, Below minimum price, No sales 2+ weeks, High returns, Healthy, Stopped selling). Columns: seller, area, week, price, minimum, profit/month, Mool Mitra user ✓, status pill.
- **The seller created in the seller app appears at the top, highlighted, with live numbers.** In live mode, every signed-up seller appears and updates in real time.

### 7.10 About / Method
- The formulas (§9), assumptions table, sources (§16), and a clear statement of what is simulated.

---

## 8. Data model

```ts
type Lang = 'en' | 'hi';
type Goal = 'first' | 'profit' | 'clear';
type Tier = 'standard' | 'better' | 'premium';

interface Seller {
  id: string; name: string; shop: string; city: string; area: string; mobile: string;
  lang: Lang; createdAt: string; mode: 'ask' | 'auto';
}
interface Product {
  id: string; sellerId: string;
  attrs: Record<string, string>;        // category, style, fabric, work, sleeve, neck, colour, sizes
  cost: number; tier: Tier; sizeChart: boolean; stock: number;
  price: number; goal: Goal; launch: boolean; launchLeft: number; // starts at 20
}
interface WeekRow {
  productId: string; week: number; price: number; shownPrice: number;
  orders: number; kept: number; returned: number; profit: number; launch: boolean; festive: boolean;
}
interface Alert {
  id: string; productId: string; week: number;
  kind: 'rival' | 'festive' | 'returns' | 'post_festive' | 'cost_change';
  price?: number; status: 'new' | 'accepted' | 'ignored'; createdAt: string;
}
interface Nudge { id: string; sellerId: string; managerId: string; kind: string; message: string; sentAt: string; }
```

**Offline mode:** keep one `State` object in `localStorage` under `mool-mitra-v1`. Wrap every read and write in `try/catch`; the app must still work if storage is blocked.

**Live mode (Supabase):** create tables `sellers`, `products`, `weeks`, `alerts` and `nudges` with the fields above.
- **Row-level security:** a seller can read and write only their own rows; the `manager` role can read all rows in its district and insert `nudges`.
- Subscribe the district console to Realtime changes on `sellers`, `products` and `weeks`.
- Subscribe the seller app to `nudges` for its own `sellerId`, so a nudge appears instantly as an alert.
- Merge the 64 simulated district sellers with real ones so the console never looks empty.

---

## 9. The pricing engine (exact logic, must match these test values)

### 9.1 Constants (editable in an admin/settings panel)

| Symbol | Meaning | Value |
|---|---|---|
| `median` | typical price of similar items (₹) | 250 for the reference kurti; see §9.4 per product type |
| `k` | price sensitivity | 3 |
| `D0` | orders/week at the reference price | 60 |
| `cap` | seller capacity, orders/week | 60 |
| `rto` | failed-delivery rate (festive: 0.28) | 0.20 |
| `ret` | customer return rate (with size chart + real photos: 0.07) | 0.10 |
| `unsell` | share of returned/RTO pieces that can't be resold | 0.15 |
| `pack` | packing per order (₹) | 8 |
| `fwd` | forward shipping (₹) | 65 |
| `rev` | return shipping (₹) | 155 |
| `ads` | ads per order (₹) | 15 |
| `phi` | payment + TCS + TDS share | 0.03 |
| `margin` | target margin above breakeven (₹) | 40 |
| tier premium | Standard / Better / Premium | 0 / 0.12 / 0.25 |
| festive | Diwali weeks 5–7 | rto 0.28, demand ×1.4 |

### 9.2 Formulas (per shipped order, price `P`, making cost `C`)

```
r = rto, q = ret (or 0.07 with size chart)
clean     = 1 − r − q                                   // share of orders the buyer keeps
cogs      = C × (1 − (r + q) × (1 − unsell))            // product cost net of resold returns
fixed     = cogs + pack + fwd × clean + rev × q + ads
keep(P)   = clean × P × (1 − phi) − fixed
breakeven = fixed ÷ (clean × (1 − phi))
floor     = (fixed + margin) ÷ (clean × (1 − phi))
pref      = median × (1 + tierPremium)
orders(P) = min(cap, D0 × demand × e^(−k × (P − pref) ÷ pref))
month(P)  = keep(P) × orders(P) × 4.3
```

### 9.3 Recommendations

- Candidate prices: for median 250 use ₹199, 249, 299, 349, 399, 449, 499, 549, 599. Otherwise generate 9 points from `round(median×0.8)−1` in steps of `round(median×0.2/10)×10`.
- **Earn the most** = the candidate with the highest `month`.
- **Get first orders** = the lowest candidate with `keep ≥ ₹15`.
- **Clear old stock** = the lowest candidate with `keep ≥ −₹20`.
- **Filter-edge note:** buckets are 199, 299, 399, 499, 699. If `P` is above a bucket by ≤ ₹25, say "₹P just misses the 'Under ₹bucket' filter"; otherwise say "Visible in 'Under ₹bucket' and every higher filter."

### 9.4 Product-type defaults (from the dropdown answers)

- **Market median (₹):**

  | Kurti, chikankari | Kurti, printed/plain/rayon | Anarkali / set / mukaish | Dupatta |
  |---|---|---|---|
  | 429 | 250 | 549 | 229 |

- **Making-cost estimate:** `round((base[style] × fabricFactor + workAdd) / 5) × 5`.
  - **base[style]:** straight 170, anarkali 300, A-line 210, short 140, kurta+palazzo 330, 3-piece 420, dupatta 90, stole 75
  - **fabricFactor:** cotton 1, mul 1.05, georgette 1.15, rayon 0.7, chanderi 1.2, chiffon 1.05
  - **workAdd:** hand chikankari 70, mukaish 160, machine 15, block 10, plain 0

### 9.5 Test vectors (cost ₹180, Standard tier, median 250, no size chart). The build must reproduce these.

| Price | Orders/wk | Keep/order | Month |
|---|---|---|---|
| ₹199 | 60.0 | −₹83.0 | −₹21,409 |
| ₹249 | 60.0 | −₹49.0 | −₹12,649 |
| ₹299 | 33.3 | −₹15.1 | −₹2,161 |
| ₹349 | 18.3 | ₹18.9 | ₹1,484 |
| **₹399** | **10.0** | **₹52.8** | **₹2,280** |
| ₹449 | 5.5 | ₹86.8 | ₹2,055 |
| ₹499 | 3.0 | ₹120.7 | ₹1,569 |
| ₹549 | 1.7 | ₹154.7 | ₹1,104 |

- **Breakeven, floor and fixed cost:** breakeven **₹321.2**, floor **₹380.1**, fixed cost **₹218.1**. At ₹399, money received is ₹270.9 and product cost ₹134.1; forward shipping is ₹45.5 and return shipping ₹15.5.
- **Recommended prices:** first orders **₹349**, most profit **₹399**, clear stock **₹299**.
- **Scenario checks:**
  - With a size chart, breakeven falls to **₹310.7**.
  - In Diwali weeks (RTO 28%), breakeven rises to **₹333.7** and keep at ₹399 drops to **₹39.3**.

### 9.6 Weekly simulation and alert rules

Per week `w` (deterministic: seeded random so a demo replays identically):
- `festive = 5 ≤ w ≤ 7` (use the festive context).
- Launch is active while `launchLeft > 0`. During launch, buyers see `P − 50` and demand is ×1.25.
- Rival weeks: for `w` = 3–4, demand is ×0.8.
- Orders: `orders = min(cap, round(orders(shownPrice) × (0.85 + 0.3 × rand)))`.
- Profit: `profit = keep(P) × orders − 20 × launchOrdersThisWeek`. Then decrement `launchLeft`.
- Returns: `returned = round(orders × (rto + actualReturnRate))`. The actual return rate is 5–8% with a size chart and 8–11% without.

**Alerts:**
- **Week 3 · rival:** "A rival dropped to ₹(breakeven−21). Matching would lose you ₹X per order. Wait 48 hours: most price cuts reverse." Actions: Hold my price / Ignore.
- **Week 4 · festive:** "Diwali demand is rising. Raise to ₹(festive best + 30) for 3 weeks; your minimum also rises because RTO goes to 28%." Actions: Set ₹X / Keep current.
- **Week 6 · returns** (only if no size chart): "'Size didn't fit' is the top reason. A size chart and real photos cut returns 10% → 7% and lower your minimum." Actions: Add size chart / Later.
- **Week 9 · post-festive** (only if the current price ≠ the best everyday price): "Go back to ₹X, your best everyday price."
- **Auto mode:** accept every new alert automatically, but never set a price below breakeven.
- **Nudge from the district console (live mode):** appears as an alert of kind `cost_change` with the manager's message.

### 9.7 Simulated district (64 sellers, seeded)

- Each seller gets: name (unique first + last name), area (Aminabad, Chowk, Aliganj, Hazratganj, Nakhas, Gomti Nagar, Indira Nagar), category and week on platform.
- Each also gets `onMoolMitra` (55% true), a floor of ₹260–520, and a price. Non-users have a 45% chance of pricing at 70–95% of floor; everyone else prices at 102–132% of floor.
- Health statuses:
  - **quit:** mostly non-users priced below floor after week 6; about 12% of users after week 8
  - **below:** price under floor
  - **returns:** returns above 22%
  - **slow:** 25% of the rest
  - **healthy:** everyone else
- Profit per month ≈ `(price − floor + 40) × 0.68 × orders × 4`.
- Expect roughly 85–90% of Mool Mitra users still selling vs 55–65% of non-users. This is the retention gap the pilot will test.

---

## 10. Design system

- **Look:** warm, trustworthy, Indian marketplace. Rounded cards, generous tap targets (≥44px) and large rupee numbers.
- **Colours:**

  | Role | Hex |
  |---|---|
  | Plum (primary) | `#5A0F3F` |
  | Mauve | `#8E2A6B` |
  | Coral (CTA) | `#E0475E` |
  | Orange (accent) | `#F2A93B` |
  | Peach | `#FCE9D2` |
  | Pink tint | `#FBDDE2` |
  | Ink | `#2A1424` |
  | Muted | `#6B5763` |
  | Good | `#1F7A4C` |
  | Bad | `#C62F52` |
  | Background | `#FAF5F7` |

- **Fonts:** Baloo 2 for headings and numbers, Mukta for body text. Both support Devanagari and load from Google Fonts with system fallbacks.
- **Components:** card (16px radius, 1px border `#ECDDE5`), stat tile, key-value row, pill, segmented control, tabs, goal card, alert card (5px left border coloured by status), bottom tab bar, floating chat button, bottom-sheet chat, phone frame (desktop only).
- **Charts:** hand-drawn SVG or Recharts.
  - Bars: plum for normal, green for festive, coral for losses.
  - Line: profit vs price, with a dashed coral breakeven line.
  - Charts keep proportions (no stretched text).
- **Brand:** Mool Mitra's own mark (plum rounded square with an orange "M" wave). **Do not use Meesho's logo, name styling or trade dress**; refer to Meesho only in plain text.
- **Responsive:** the seller app fills the screen on phones (<900px) and sits in a 400px phone frame with a "Presenter guide" side panel on desktop. The district console stacks to one column on mobile.
- **Accessibility:** colour is never the only signal (pair it with text such as "Loss", "Done"); WCAG AA contrast; labelled form controls; `aria-label` on icon buttons.

---

## 11. Tech stack and project structure

- **Core:** React 19 + TypeScript + Vite. No backend required. One global store (`useSyncExternalStore` or Zustand) persisted to localStorage.
- **Live mode (optional):**
  - `@supabase/supabase-js`, enabled when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set.
  - Without them the app runs fully offline.
- **Builds:**
  - `npm run build` → `dist/` (static site for Vercel/Netlify).
  - `npm run build:single` → one self-contained HTML file via `vite-plugin-singlefile`, for offline demo and email.

```
src/
  model.ts        // §9.1–9.3 pricing engine (pure functions, unit-tested)
  catalog.ts      // §7.2 questions + §9.4 estimates
  sim.ts          // §9.6 weekly simulation + alerts, §9.7 district generator
  store.ts        // state, persistence, i18n helper L(s, en, hi), ₹ formatter
  live.ts         // optional Supabase client, auth, realtime subscriptions
  ui.tsx          // Card, Stat, Row, Pill, Bars, Curve, Logo
  seller/         // SellerApp, Onboarding (Calc, Signup, Costs, Launch), Price, Live (Home, Hisaab, Alerts, Listing), Assistant, ProductForm
  District.tsx
  App.tsx         // landing + routing + presenter guide
tests/model.test.ts  // §9.5 test vectors
```

- ₹ formatting: `en-IN` grouping (₹21,409), with a true minus sign (−₹83).

---

## 12. Acceptance criteria (the build is done when all pass)

1. `model.test.ts` reproduces every value in §9.5 to ±₹1 (orders to ±0.1).
2. A seller can complete calc → sign-up → product → price → launch → live in under 2 minutes, using only taps.
3. The Floor Engine never allows a price below breakeven to be listed; the CTA is disabled and the reason is shown.
4. The Hindi toggle switches every seller-facing string, including alerts, Hisaab and chat chips. No mixed-language screen except proper nouns.
5. Pressing "Next week" 10 times produces exactly the alerts in §9.6, and Hisaab rows sum exactly to weekly profit.
6. Accepting the festive alert changes the listed price for weeks 5–7; accepting "post-festive" restores the best everyday price.
7. The seller created in the app appears at the top of the district console with matching price, minimum and profit.
8. "Send nudge" marks the row as sent. In live mode, the nudge appears on the seller's device within 2 seconds.
9. No console errors. Lighthouse mobile performance ≥ 85 and accessibility ≥ 90.
10. Works at 360px width and at 1440px width; no horizontal scroll on the seller app.
11. With storage blocked (private mode), the app still runs (state resets on reload).
12. Every simulated number is labelled as simulated somewhere on its screen or in the footer.

---

## 13. Demo script (3 minutes, for judges)

1. **Landing (15 s):** read the −₹83 / ₹321 / +₹53 tiles.
2. **Kitna Bachega? (30 s):** Kurti → Straight → Cotton → Hand chikankari → … The minimum price appears before sign-up.
3. **Sign up (15 s):** pre-filled sample details, Send OTP, switch to हिंदी.
4. **Floor Engine (45 s):** pick "Earn the most", tap a cheap row (it turns red and the CTA locks), open True cost and Buyer's view.
5. **Launch (15 s):** Meesho ₹30 + seller ₹20; go live.
6. **Grow (45 s):** press Next week ×3 → accept "hold my price"; press +4 → accept Diwali; open Hisaab.
7. **District console (15 s):** Ramesh at the top; send a nudge to the riskiest seller.

---

## 14. Deployment

1. Push the project to GitHub.
2. On **Vercel**: New Project → import repo → framework *Vite* → build `npm run build` → output `dist` → Deploy. For hash routing nothing else is needed; for path routing add `vercel.json` rewrites to `/index.html`.
3. **Live mode:** create a Supabase project and run the SQL for the tables and RLS in §8. Enable Realtime on `sellers`, `products`, `weeks` and `nudges`. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables, then redeploy.
4. **Netlify** works the same way (publish directory `dist`).

---

## 15. Success metrics shown in the app's About page (pilot targets)

| Metric | Today (simulated/modelled) | Pilot target |
|---|---|---|
| New sellers still selling at day 90 | 45% | 60% |
| Listings at or above breakeven | 16% priced from cost | 90% |
| Days to first sale | 16 (FY25, public) | 7 |
| Funded launch orders per seller | — | ≤ 20 (hard cap) |
| Sellers who know what they keep per order | 15% | 80% |

**Business case** (modelled, shown on About):
- Meesho spends **₹1,080** per seller and gets **₹1,316** back over 24 months; payback in month 17.
- 5-year NPV is **₹29.2 Cr** at 12%.
- The case breaks even at roughly a **+13-point** day-90 retention uplift, and turns negative if the launch offer grows to 60 funded orders.

---

## 16. Sources (for the About page)

- Amazon, *Automate Pricing* (rules inside seller-set min/max): https://sell.amazon.com/tools/automate-pricing
- Airbnb, *New listing promotion* (20% off next 3 bookings; 70%+ more bookings, internal data): https://www.airbnb.com/e/new-listing-promotion
- Shopee 2026 new-seller policy, third-party summary (0% commission for 3 months, 500 orders/month cap, initial traffic boost): https://www.duoke.com/en/blog/article/405-2026-Shopee-New-Seller-Onboarding-Guide-Registration-New-Seller-Policy
- Temu fully managed model (supplier quotes supply price, Temu sets retail): https://shopappy.com/ecommerce/temu/temu-local-vs-fully-managed
- Etsy Optimize Prices beta and seller pushback: https://www.valueaddedresource.net/etsy-launches-optimize-prices-beta/
- Meesho shipping charges for sellers (indicative weight/zone slabs): https://www.shiprocket.in/blog/meesho-shipping-charges/
- Meesho listing requirements: https://streamoid.com/guide/meesho-seller-guide
- Khatabook vs Vyapar (small-business bookkeeping apps): https://www.mooninvoice.com/blog/khatabook-vs-vyapar
- Meesho FY26 seller and order figures: Deccan Herald; contribution margin: Exencial Q3 FY26 notes; new-to-e-commerce share and time to first sale: Tigerfeathers; returns/RTO: Angadi Labs (as cited in the team's Data Book).

---

## 17. Final instruction to the builder

Build exactly this. Start with `model.ts` and its tests (§9.5) so the numbers are right, then the seller flow in the order of §7, then the district console, then live mode. Keep every screen working offline. When in doubt, choose the option that keeps the seller in control and shows rupees. Ship a URL that a judge can open on a phone and complete the §13 demo without help.
