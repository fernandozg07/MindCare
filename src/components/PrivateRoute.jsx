import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Assumindo que você tem este componente

const PrivateRoute = ({ children, allowed = ['terapeuta', 'paciente'] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    // Mostra um spinner enquanto a autenticação está sendo verificada
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  if (!isAuthenticated()) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Verifica se o tipo de usuário está na lista de permitidos
  if (user && allowed.includes(user.tipo)) {
    return children;
  } else {
    // Se o tipo de usuário não for permitido, redireciona para o dashboard apropriado
    // ou para uma página de acesso negado.
    // Para simplificar, vamos redirecionar para o dashboard do paciente por padrão
    // se não for terapeuta, ou para o login se não for nenhum dos dois.
    if (user && user.tipo === 'paciente') {
      return <Navigate to="/dashboard/paciente" replace />;
    } else if (user && user.tipo === 'terapeuta') {
      return <Navigate to="/dashboard/terapeuta" replace />;
    }
    // Caso fallback, se o tipo de usuário não for reconhecido ou permitido
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
