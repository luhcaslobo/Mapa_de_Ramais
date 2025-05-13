import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
// RETIRAR DO COMENTÁRIO PARA AMBIENTE DEV 
  // server: {
  //   host: '0.0.0.0',          // acessível na rede
  //   proxy: {
  //     '/coords': 'http://localhost:8000', // encaminha para FastAPI
  //     '/pabx': 'http://localhost:8000',
  //     '/api/annotations': 'http://localhost:8000',
  //   },
    
  // },

})
