import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      // Este proxy é APENAS para desenvolvimento local (npm run dev).
      // Ele redireciona requisições que começam com '/api' para o seu backend Django local.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false, // Use false para desenvolvimento local se seu backend não for HTTPS
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
  build: {
    // A pasta de saída padrão do Vite é 'dist'. O Render irá publicar o conteúdo desta pasta.
    outDir: 'dist',
  }
})
