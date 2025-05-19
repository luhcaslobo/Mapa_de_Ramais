import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  server: {
    host: '0.0.0.0',          // acessível na rede
    proxy: {
      '/coords': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/pabx': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api': {              // Captura todas as rotas /api/*
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
