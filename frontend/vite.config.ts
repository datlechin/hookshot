import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Vite default port
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Rust backend
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
      },
    },
  },
})
