import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do ficheiro .env correspondente ao modo (development, production)
  // O terceiro argumento '' permite carregar todas as variáveis de ambiente,
  // mesmo aquelas que não começam com VITE_.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Define variáveis globais que podem ser usadas no código do lado do cliente.
    // Isso é necessário para que `process.env.NODE_ENV` e `import.meta.env.VITE_REACT_APP_BACKEND_URL`
    // sejam acessíveis no seu código React.
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Exponha a variável de ambiente do backend para o frontend.
      // Certifique-se de que VITE_REACT_APP_BACKEND_URL está definida no seu .env ou nas configurações do Render.
      'import.meta.env.VITE_REACT_APP_BACKEND_URL': JSON.stringify(env.VITE_REACT_APP_BACKEND_URL),
    },
    // Prefixo para variáveis de ambiente que serão expostas ao código do cliente.
    // Por padrão, o Vite expõe apenas variáveis que começam com VITE_.
    // Se você tiver outras variáveis que precisa expor, adicione-as aqui.
    envPrefix: ['VITE_', 'REACT_APP_'], // Adicionado 'REACT_APP_' para compatibilidade com CRA-like env vars

    server: {
      host: true, // Permite que o servidor seja acessível externamente (ex: em contêineres Docker)
      port: 3000, // Porta em que o servidor de desenvolvimento do Vite será executado
      // Configuração do proxy para redirecionar requisições para o backend durante o desenvolvimento.
      // Quando você faz uma requisição para '/api', ela será redirecionada para o seu backend.
      proxy: {
        '/api': {
          target: env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:8000', // URL do seu backend Django
          changeOrigin: true, // Necessário para que o host da requisição seja o do backend
          rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' do caminho da requisição para o backend
          secure: false, // Use false para desenvolvimento local se seu backend não for HTTPS
        },
      },
      open: true, // Abre o navegador automaticamente ao iniciar o servidor
    },
    build: {
      // A pasta de saída padrão do Vite é 'dist'. O Render irá publicar o conteúdo desta pasta.
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    }
  };
});
