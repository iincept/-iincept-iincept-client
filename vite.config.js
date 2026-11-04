import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-framework';
            }
          }
        }
      }
    }
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5088',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://127.0.0.1:5088',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
