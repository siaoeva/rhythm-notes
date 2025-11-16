import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward any request starting with /auth to Flask backend
      '/auth': 'http://localhost:5000',
    },
  },
})
