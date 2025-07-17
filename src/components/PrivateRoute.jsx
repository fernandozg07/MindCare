import React, { useEffect } from 'react'; // Importe useEffect
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import LoadingSpinner from './LoadingSpinner'; // Assumindo que você tem este componente
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowed = ['terapeuta', 'paciente'] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate(); // Inicialize useNavigate

  // Use useEffect para lidar com todos os redirecionamentos como efeitos colaterais
  useEffect(() => {
    // Só age se o carregamento terminou
    if (!loading) {
      if (!isAuthenticated()) {
        // Se não estiver autenticado, redireciona para a página de login
        console.log('PrivateRoute: Não autenticado, redirecionando para /login');
        navigate('/login', { replace: true });
      } else if (user && !allowed.includes(user.tipo)) {
        // Se autenticado, mas o tipo de usuário não é permitido para esta rota
        console.log(`PrivateRoute: Usuário tipo "${user.tipo}" não permitido, redirecionando.`);
        if (user.tipo === 'paciente') {
          navigate('/dashboard/paciente', { replace: true });
        } else if (user.tipo === 'terapeuta') {
          navigate('/dashboard/terapeuta', { replace: true });
        } else {
          // Fallback para tipos de usuário não reconhecidos ou sem rota específica
          navigate('/', { replace: true });
        }
      }
      // Se autenticado e tipo permitido, o useEffect não faz nada, e o componente renderiza 'children'
    }
  }, [isAuthenticated, loading, user, allowed, navigate]); // Adicione todas as dependências

  if (loading) {
    // Mostra um spinner enquanto a autenticação está sendo verificada
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  // Se o carregamento terminou e o usuário não está autenticado,
  // ou o tipo de usuário não é permitido,
  // o useEffect já iniciou o redirecionamento, então não renderize nada aqui.
  if (!isAuthenticated() || (user && !allowed.includes(user.tipo))) {
    return null;
  }

  // Se o carregamento terminou, o usuário está autenticado e o tipo é permitido,
  // então renderize os componentes filhos.
  return children;
};

export default PrivateRoute;
