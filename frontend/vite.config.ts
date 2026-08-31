import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const BACKEND_URL = 'http://localhost:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lc': BACKEND_URL,
      '/upload': BACKEND_URL,
      '/collection': BACKEND_URL,
      '/stt': BACKEND_URL,
    },
  },
})
