# Mool Mitra

A mobile app (installable PWA) that gives new-to-online sellers on Meesho the right price, starting from their own cost. Built by Team Razor Blade (IIT Kanpur) for the Meesho DICE Challenge S3.

Splash → language → story → **Kitna Bachega?** calculator → sign-up (OTP) → product and costs → **Floor Engine** (breakeven, target floor, price menu by goal, true cost, buyer's view) → co-funded **launch** → go-live → **Home · Hisaab · Alerts · Listing**, with a helper chat and a profile sheet. Every screen works in Hindi and English.

All orders, profits and alerts are simulated and stay on the phone (localStorage). There is no backend.

## Run locally
```bash
npm install
npm run dev          # http://localhost:5173 (open on a phone-sized window)
npm test             # pricing engine vs the §10.5 test vectors
```

## Deploy (Vercel)
1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset **Vite** · build `npm run build` · output `dist` → Deploy.
4. Open the URL on a phone → browser menu → **Add to Home screen**. It opens full-screen like an app and works offline.

`npm run build:single` writes one self-contained `dist-single/index.html` for an offline demo (no service worker).

## Code map
- `src/engine/model.ts`: pricing maths (breakeven, floor, demand curve, recommendations).
- `src/engine/catalog.ts`: product questions, icons and cost estimates.
- `src/engine/sim.ts`: weekly simulation and Mool Mitra alerts.
- `src/store.ts`: app state saved on the device, `L()` for Hindi/English, ₹ formatter, toast and banner.
- `src/router.ts`: hash routes; the phone's back button walks back through the flow.
- `src/ui/`: component library (buttons, cards, money tiles, receipt rows, option lists, bottom sheets, charts, confetti).
- `src/screens/`: every screen.
- `src/live.ts`: stub for a future Supabase sync (nothing depends on it).
- `tests/model.test.ts`: §10.5 test vectors.
