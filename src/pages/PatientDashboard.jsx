import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'; // Importe useNavigate
import { useAuth } from '../contexts/AuthContext';
import { userService, notificationService } from '../services/api'; // Importe notificationService
import { Calendar, TrendingUp, MessageCircle, Heart, Bell } from 'lucide-react'; // Importe o ícone Bell
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const { loading: authLoading, isPatient, isTherapist } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]); // Novo estado para notificações
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Inicialize o hook useNavigate

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Usa Promise.all para buscar dados do dashboard e notificações em paralelo
      const [patientDashboardData, patientNotifications] = await Promise.all([
        userService.getPatientDashboard(),
        notificationService.getNotifications() 
      ]);
      
      setDashboardData(patientDashboardData);
      
      // Lógica para filtrar e ordenar as notificações para exibição no dashboard
      const unreadNotifications = patientNotifications.filter(n => !n.lida);
      const sortedNotifications = patientNotifications.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
      
      let displayNotifications = [];
      // Prioriza notificações não lidas
      if (unreadNotifications.length > 0) {
          displayNotifications = unreadNotifications.slice(0, 3);
      }
      
      // Se ainda não tiver 3 notificações, preenche com as lidas mais recentes
      if (displayNotifications.length < 3) {
          const remainingSlots = 3 - displayNotifications.length;
          const recentReadNotifications = sortedNotifications.filter(n => n.lida).slice(0, remainingSlots);
          displayNotifications = [...displayNotifications, ...recentReadNotifications];
      }
      
      setNotifications(displayNotifications);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard ou notificações:', err);
      // Mensagem de erro mais detalhada se disponível na resposta da API
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar dados do dashboard ou notificações.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Garante que o dashboard só carregue se a autenticação terminou e o usuário é um paciente
    if (!authLoading && isPatient()) {
      loadDashboardData();
    }
  }, [authLoading, isPatient]); // Adicionado isPatient como dependência

  // Função para redirecionar para a página de todas as notificações
  const handleViewAllNotifications = () => {
    navigate('/configuracoes/notificacoes'); // Rota para a página de notificações
  };

  if (authLoading) {
    return <LoadingSpinner text="Verificando acesso..." />;
  }

  if (isTherapist()) {
    return <Navigate to="/dashboard/terapeuta" replace />;
  }

  if (!isPatient()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner text="Carregando seu progresso..." />;
  }

  // Verifica se dashboardData existe e tem a estrutura esperada antes de renderizar
  // Se o backend retornar 'detail' ou outros erros, dashboardData pode não ter a estrutura esperada.
  if (!dashboardData || !dashboardData.paciente_perfil) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
        <p className="text-gray-600">Nenhum dado disponível ou erro ao carregar.</p>
        <p className="text-gray-500 text-sm mt-2">Verifique sua conexão ou tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Progresso</h1>
        <p className="text-gray-600">Acompanhe sua jornada de bem-estar mental</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Conversas</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalConversas || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.conversasEssaSemana || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sentimento Médio</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.sentimentoMedio || 'N/A'}</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próxima Sessão</p>
              <p className="text-sm font-bold text-gray-900">
                {dashboardData.proximaSessao
                  ? new Date(dashboardData.proximaSessao).toLocaleDateString('pt-BR')
                  : 'Não agendada'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights e recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Personalizados</h3>

          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Progresso positivo:</strong> Continue mantendo suas conversas regulares com o assistente.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Manter uma rotina regular de conversas pode ajudar no acompanhamento do seu bem-estar.
              </p>
            </div>

            {dashboardData.proximaSessao && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Lembrete:</strong> Você tem uma sessão agendada para{' '}
                  {new Date(dashboardData.proximaSessao).toLocaleDateString('pt-BR')}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Novo Card de Notificações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Minhas Notificações</h3>
            <button 
              onClick={handleViewAllNotifications}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    notification.lida ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${notification.lida ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.assunto}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {notification.conteudo}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(notification.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhuma notificação nova.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
