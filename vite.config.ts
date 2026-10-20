import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// `npm run build` -> normal static site (Vercel/Netlify). `npm run build:single` -> one self-contained HTML file.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'single' ? { outDir: 'dist-single', cssCodeSplit: false, assetsInlineLimit: 100000000 } : { outDir: 'dist' },
}))
