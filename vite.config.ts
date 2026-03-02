import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/truly-yours/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // New SW takes over immediately — no stale cache on update
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Truly Yours',
        short_name: 'TrulyYours',
        description: 'Your gentle daily routine guide',
        theme_color: '#F6F8F3',
        background_color: '#F6F8F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        file_handlers: [
          {
            action: './',
            accept: {
              'application/json': ['.typrotocol'],
            },
          },
        ] as any,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}))
