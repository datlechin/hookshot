import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-syntax': ['react-syntax-highlighter'],
          'vendor-utils': ['lucide-react', '@tanstack/react-virtual'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173, // Vite default port
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Rust backend
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3000', // Rust backend WebSocket
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
      },
    },
  },
})
