/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    fs: {
      allow: [
        // Explicitly allow the mobile-wallet project root
        path.resolve(__dirname),
        // Allow the wallet-core package from the monorepo
        path.resolve(__dirname, '../../packages/wallet-core')
      ]
    }
  }
})
