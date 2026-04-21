import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Load .env from monorepo root (one directory up)
  envDir: path.resolve(__dirname, '..'),
  build: {
    // Vite 8 uses lightningcss for CSS minification by default.
    // lightningcss has a known bug crashing on @keyframes with box-shadow
    // in nested contexts. Disable CSS minify — CSS gzip compresses well (~85%)
    // and all selectors are already efficient.
    cssMinify: false,
  },
})
