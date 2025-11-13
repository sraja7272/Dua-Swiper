import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE || '/Dua-Swiper/', // GitHub Pages base path - matches repo name, or /Dua-Swiper/dev/ for dev branch
})
