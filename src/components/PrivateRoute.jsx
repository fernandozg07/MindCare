import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner'; // Assumindo que você tem este componente
import { useAuth } from '../contexts/AuthContext'; // Importa o hook de autenticação

/**
 * Componente de Rota Privada para proteger rotas com base na autenticação e tipo de usuário.
 * Redireciona usuários não autenticados ou não autorizados.
 * @param {object} { children, allowed } - Componentes filhos e um array de tipos de usuário permitidos.
 */
const PrivateRoute = ({ children, allowed = ['terapeuta', 'paciente'] }) => {
  const { user, isAuthenticated, loading } = useAuth(); // Obtém o estado de autenticação e usuário do contexto
  const navigate = useNavigate(); // Hook para navegação programática

  // Efeito para lidar com todos os redirecionamentos como efeitos colaterais
  useEffect(() => {
    // Só age se o carregamento do status de autenticação terminou
    if (!loading) {
      if (!isAuthenticated()) {
        // Se o usuário não está autenticado, redireciona para a página de login
        console.log('PrivateRoute: Não autenticado, redirecionando para /login');
        navigate('/login', { replace: true }); // Redireciona e substitui a entrada no histórico
      } else if (user && !allowed.includes(user.tipo)) {
        // Se o usuário está autenticado, mas seu tipo não está na lista de tipos permitidos para esta rota
        console.log(`PrivateRoute: Usuário tipo "${user.tipo}" não permitido, redirecionando.`);
        // Redireciona para o dashboard apropriado com base no tipo de usuário
        if (user.tipo === 'paciente') {
          navigate('/dashboard/paciente', { replace: true });
        } else if (user.tipo === 'terapeuta') {
          navigate('/dashboard/terapeuta', { replace: true });
        } else if (user.tipo === 'admin') { // Adicionado para lidar com o tipo 'admin', se houver um dashboard específico
          navigate('/dashboard/admin', { replace: true }); // Exemplo: redireciona para um dashboard de admin
        } else {
          // Fallback para tipos de usuário não reconhecidos ou sem rota específica
          navigate('/', { replace: true }); // Redireciona para a raiz
        }
      }
      // Se o usuário está autenticado e seu tipo é permitido, o useEffect não faz nada,
      // e o componente renderiza os 'children' (componentes aninhados da rota).
    }
  }, [isAuthenticated, loading, user, allowed, navigate]); // Dependências do useEffect

  // Mostra um spinner de carregamento enquanto o status de autenticação está sendo verificado
  if (loading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  // Se o carregamento terminou e o usuário não está autenticado,
  // ou o tipo de usuário não é permitido,
  // o useEffect já iniciou o redirecionamento, então não renderize nada aqui para evitar piscar.
  if (!isAuthenticated() || (user && !allowed.includes(user.tipo))) {
    return null;
  }

  // Se o carregamento terminou, o usuário está autenticado e o tipo é permitido,
  // então renderiza os componentes filhos da rota.
  return children;
};

export default PrivateRoute;
