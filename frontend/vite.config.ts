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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and React Router
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate UI library (shadcn/ui dependencies)
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-slot', '@radix-ui/react-scroll-area'],
          // Separate data fetching library
          'query-vendor': ['@tanstack/react-query'],
          // Don't bundle syntax-highlighter here - it's lazy loaded with specific languages
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase slightly for main chunk
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
