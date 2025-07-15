import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('❌ Erro na conexão com o Django:', err.message)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`✅ Django respondeu: ${proxyRes.statusCode} ${req.url}`)
          })
        },
      },
    },
  },
})