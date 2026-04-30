import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Use public/manifest.json — don't auto-generate one
      manifest: false,
      workbox: {
        // Pre-cache all built assets for full offline support
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Take control of all clients immediately on activation
        clientsClaim: true,
        skipWaiting: true,
        // Clean up old caches from previous SW versions
        cleanupOutdatedCaches: true,
        // Never cache version.json — must always hit the network for update checks
        ignoreURLParametersMatching: [/^_$/],
        navigateFallbackDenylist: [/\/version\.json/],
        runtimeCaching: [{
          urlPattern: /\/version\.json/,
          handler: 'NetworkOnly',
        }],
      },
    }),
  ],
})
