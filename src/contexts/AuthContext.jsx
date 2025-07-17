import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api'; // Importa o serviço de autenticação da API
import { toast } from 'react-toastify'; // Importa a biblioteca de notificações toast

// Cria o contexto de autenticação
const AuthContext = createContext();

/**
 * Hook personalizado para acessar o contexto de autenticação.
 * Garante que o hook seja usado dentro de um AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

/**
 * Provedor de autenticação que gerencia o estado do usuário e as operações de login/logout.
 * @param {object} { children } - Os componentes filhos que terão acesso ao contexto.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para armazenar os dados do usuário autenticado
  const [loading, setLoading] = useState(true); // Estado para indicar se a autenticação está sendo verificada

  /**
   * Função memoizada para verificar se o usuário está autenticado.
   * Depende apenas do estado 'user'. O estado 'loading' é gerenciado por checkAuthStatus.
   */
  const isAuthenticated = useCallback(() => {
    // Retorna true se houver um objeto de usuário e 'isAuthenticated' estiver no localStorage.
    // O 'loading' é tratado no useEffect de checkAuthStatus e nos componentes que usam useAuth.
    return !!user && localStorage.getItem('isAuthenticated') === 'true';
  }, [user]);

  /**
   * Função memoizada para verificar o status de autenticação inicial do usuário.
   * Busca dados do usuário e status de autenticação no localStorage.
   * Executada apenas uma vez na montagem do componente.
   */
  const checkAuthStatus = useCallback(() => {
    try {
      const storedIsAuthenticated = localStorage.getItem('isAuthenticated');
      const storedUser = localStorage.getItem('user');

      if (storedIsAuthenticated === 'true' && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Define o usuário a partir dos dados do localStorage
      } else {
        setUser(null); // Garante que o usuário é null se não estiver autenticado
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      // Limpa o localStorage em caso de erro para evitar dados corrompidos
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      setUser(null);
    } finally {
      setLoading(false); // O carregamento termina após a verificação inicial
    }
  }, []); // Sem dependências, executa apenas uma vez na montagem

  // Efeito para executar a verificação de status de autenticação na montagem do componente.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // checkAuthStatus é uma dependência, mas é memoizada, então não causa loop.

  /**
   * Função para realizar o login do usuário.
   * @param {object} credentials - Objeto contendo email e senha do usuário.
   * @returns {object} - Objeto com 'success' (booleano) e 'user_type' ou 'error'.
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials); // Chama a API de login

      // Extrai os dados do usuário da resposta da API
      const userData = {
        id: response.user?.id,
        email: response.user?.email || credentials.email,
        first_name: response.user?.first_name,
        last_name: response.user?.last_name,
        tipo: response.user?.tipo || response.user_type // Prioriza 'tipo' do user, senão 'user_type'
      };
      
      // Armazena o status de autenticação e os dados do usuário no localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData); // Atualiza o estado do usuário no contexto
      
      toast.success('Login realizado com sucesso!'); // Exibe notificação de sucesso
      return { success: true, user_type: userData.tipo, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      // Lida com diferentes tipos de erros da API
      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dados inválidos';
      } else if (!error.response) { // Erro sem resposta (ex: rede offline, CORS)
        errorMessage = 'Erro de conexão com o servidor';
      }
      
      toast.error(errorMessage); // Exibe notificação de erro
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Função para realizar o logout do usuário.
   */
  const logout = async () => {
    try {
      await authService.logout(); // Chama a API de logout
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpa os dados de autenticação do localStorage e do estado
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setUser(null); // Define o usuário como null
      toast.success('Logout realizado com sucesso!'); // Exibe notificação de sucesso
    }
  };

  /**
   * Função memoizada para verificar se o usuário é um terapeuta.
   */
  const isTherapist = useCallback(() => {
    return user?.tipo === 'terapeuta';
  }, [user]);

  /**
   * Função memoizada para verificar se o usuário é um paciente.
   */
  const isPatient = useCallback(() => {
    return user?.tipo === 'paciente';
  }, [user]);

  // Objeto de valor que será fornecido pelo contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isTherapist,
    isPatient
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};