import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Toda petición que empiece con /api se reenvía al backend .NET
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: true,
      },
    },
  },
})