import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'KabsatLearn',
        short_name: 'KabsatLearn',
        description: 'Offline-first micro-learning for San Fernando, La Union',
        lang: 'fil',
        theme_color: '#4338ca',
        background_color: '#f7f7fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
