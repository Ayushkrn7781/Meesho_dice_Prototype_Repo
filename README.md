# Mool Mitra

The right first price for new-to-online sellers on Meesho. Built by Team Razor Blade (IIT Kanpur) for the Meesho DICE Challenge S3.

- **Seller app** (`#seller`): Kitna Bachega? calculator → sign-up → product (one question at a time) → Floor Engine (breakeven, target floor, price menu by goal, true cost, buyer's view) → co-funded launch → weekly Hisaab, Mool Mitra alerts (ask-me-first) and an English/Hindi helper.
- **District console** (`#district`): KPIs, highest-risk sellers with WhatsApp nudges, funnel, localities and a searchable seller-health table. The seller you create in the app appears at the top; nudging them shows up in their Alerts tab.
- **Method** (`#about`): formulas, editable assumptions, competitive research, pilot targets and sources.

All data is simulated and stays in the viewer's browser (localStorage). No backend, no real accounts.

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173
npm test             # pricing engine vs the §9.5 test vectors
```

## Deploy (Vercel)
1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset: **Vite** · Build command: `npm run build` · Output directory: `dist`. Deploy.

Netlify works the same way (build `npm run build`, publish `dist`).

## Single-file build
`npm run build:single` writes one self-contained `dist-single/index.html` you can open offline or email.

## Code map
- `src/model.ts`: Floor Engine pricing math (breakeven, floor, demand curve, recommendations).
- `src/catalog.ts`: product questions and cost estimates.
- `src/sim.ts`: weekly seller simulation, alerts and the simulated district.
- `src/store.ts`: app state (saved in the browser), i18n helper `L()`, ₹ formatter.
- `src/live.ts`: stub hooks for the optional Supabase live mode (not wired up yet).
- `tests/model.test.ts`: §9.5 test vectors.
- `src/seller/*`: seller app screens. `src/District.tsx`: manager console. `src/App.tsx`: landing page and routing.
