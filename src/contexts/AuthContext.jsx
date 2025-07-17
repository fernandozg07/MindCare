import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Importe useCallback
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use useCallback para memoizar a função isAuthenticated,
  // garantindo que ela só mude se suas dependências mudarem.
  // Ela agora depende do estado 'user' e 'loading'.
  const isAuthenticated = useCallback(() => {
    // Se ainda estiver carregando, consideramos não autenticado por enquanto
    if (loading) return false;
    // Verifica se há um objeto de usuário e se o localStorage confirma a autenticação
    return !!user && localStorage.getItem('isAuthenticated') === 'true';
  }, [user, loading]);

  // checkAuthStatus agora é memoizada com useCallback
  const checkAuthStatus = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

      if (storedIsAuthenticated === 'true' && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Evita atualizar o estado 'user' se ele já for o mesmo
        if (JSON.stringify(parsedUser) !== JSON.stringify(user)) {
          setUser(parsedUser);
        }
      } else {
        // Garante que o user é null se não estiver autenticado
        if (user !== null) {
            setUser(null);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      setUser(null); // Garante que o user é null em caso de erro
    } finally {
      setLoading(false);
    }
  }, [user]); // Depende de 'user' para evitar re-parseamento desnecessário se 'user' já estiver definido

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // checkAuthStatus é uma dependência, mas é memoizada

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      const userData = {
        id: response.user?.id,
        email: response.user?.email || credentials.email,
        first_name: response.user?.first_name,
        last_name: response.user?.last_name,
        tipo: response.user?.tipo || response.user_type
      };
      
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Evita atualizar o estado 'user' se ele já for o mesmo
      if (JSON.stringify(userData) !== JSON.stringify(user)) {
        setUser(userData);
      }
      
      toast.success('Login realizado com sucesso!');
      return { success: true, user_type: userData.tipo, user: userData };
    } catch (error) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dados inválidos';
      } else if (!error.response) {
        errorMessage = 'Erro de conexão com o servidor';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    }
  };

  const isTherapist = useCallback(() => {
    return user?.tipo === 'terapeuta';
  }, [user]);

  const isPatient = useCallback(() => {
    return user?.tipo === 'paciente';
  }, [user]);

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
