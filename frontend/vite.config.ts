import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// Note: vite-plugin-pwa will be installed when enabling full PWA features
// import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Phase 1: PWA skeleton - plugin disabled for now
    // To enable later:
    // 1. Install: pnpm add -D vite-plugin-pwa
    // 2. Uncomment the import above
    // 3. Uncomment and configure the plugin below
    // 4. Remove `disable: true` to activate service worker
    
    // VitePWA({
    //   disable: true, // Set to false to enable PWA features
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
    //   manifest: {
    //     name: 'PocketShop',
    //     short_name: 'PocketShop',
    //     description: 'Virtual storefront for local businesses',
    //     start_url: '/',
    //     display: 'standalone',
    //     background_color: '#ffffff',
    //     theme_color: '#ff6600',
    //     icons: [
    //       { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    //       { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    //     ],
    //   },
    //   workbox: {
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24, // 24 hours
    //           },
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true
  },
  root: '.',
  publicDir: 'public',
  build: {
    // Optimize code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - split large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@react-google-maps') || id.includes('use-places-autocomplete')) {
              return 'maps-vendor';
            }
            // Other node_modules go into vendor chunk
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit (we're intentionally creating larger chunks for better caching)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for better debugging in production (disabled for smaller bundle)
    sourcemap: false,
  },
})
