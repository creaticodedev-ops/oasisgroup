
import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Must match PORT in server/.env (override with API_PORT when 5000 is taken).
const API_TARGET = `http://127.0.0.1:${process.env.API_PORT || 5000}`

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 3000,
    strictPort: true,

    allowedHosts: [
      'borough-learners-ampland-cet.trycloudflare.com',
    ],

    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 3000,
  },

  build: {
    target: 'es2020',
    sourcemap: false,
    reportCompressedSize: false,
  },
})

