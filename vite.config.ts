import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` -> installable PWA (Vercel/Netlify). `npm run build:single` -> one self-contained HTML file for offline demos.
const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
  manifest: {
    name: 'Mool Mitra',
    short_name: 'Mool Mitra',
    description: 'The right price for new online sellers, from your own cost.',
    lang: 'hi',
    theme_color: '#5A0F3F',
    background_color: '#5A0F3F',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    scope: '/',
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    navigateFallback: '/index.html',
    runtimeCaching: [{
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
    }],
  },
})

// the single-file build has no service worker: resolve the register module to a no-op
const noSW = { name: 'no-sw', resolveId: (id: string) => (id === 'virtual:pwa-register' ? '\0no-sw' : null), load: (id: string) => (id === '\0no-sw' ? 'export const registerSW = () => () => {}' : null) }

export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile(), noSW] : [react(), pwa],
  build: mode === 'single' ? { outDir: 'dist-single', cssCodeSplit: false, assetsInlineLimit: 100000000 } : { outDir: 'dist' },
}))
