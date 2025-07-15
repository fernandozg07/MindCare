import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService, notificationService } from '../services/api'; // Importe notificationService
import { Users, MessageCircle, TrendingUp, Calendar, Bell } from 'lucide-react'; // Importe Bell
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const TherapistDashboard = () => {
  const { loading: authLoading, isPatient, isTherapist } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]); // Estado para as notificações
  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true); // Novo estado de loading
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userService.getTherapistDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar dados do dashboard';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await notificationService.getNotifications();
      // Filtra apenas as 5 notificações mais recentes para exibir no dashboard
      setNotifications(data.slice(0, 5)); 
    } catch (err) {
      console.error('Erro ao carregar notificações para o dashboard:', err.response ? err.response.data : err.message);
      // Não exibe toast de erro aqui para não poluir, pois é um widget secundário
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isTherapist()) {
      loadDashboardData();
      loadNotifications(); // Carrega as notificações também
    }
  }, [authLoading, isTherapist]);

  const handleViewAllPatients = () => {
    navigate('/pacientes');
  };

  const handleConfigureAlerts = () => {
    navigate('/configuracoes/notificacoes');
  };

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Atualiza o estado local para marcar como lida
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
      toast.success('Notificação marcada como lida!');
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      toast.error('Erro ao marcar notificação como lida.');
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="Verificando acesso..." />;
  }

  if (isPatient()) {
    return <Navigate to="/dashboard/paciente" replace />;
  }

  if (!isTherapist()) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner text="Carregando dashboard..." />;
  }

  if (!dashboardData || !dashboardData.terapeuta) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
        <p className="text-gray-600">Nenhum dado disponível ou erro ao carregar.</p>
        <p className="text-gray-500 text-sm mt-2">Verifique sua conexão ou tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard do Terapeuta</h1>
        <p className="text-gray-600">Visão geral dos seus pacientes e atividades</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalPacientes || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.conversasHoje || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.sessoesPendentes || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.alertasUrgentes || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pacientes ativos e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pacientes ativos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pacientes Ativos</h3>
            <button 
              onClick={handleViewAllPatients}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData.pacientesAtivos && dashboardData.pacientesAtivos.length > 0 ? (
              dashboardData.pacientesAtivos.map((paciente, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{paciente.nome}</p>
                    <p className="text-sm text-gray-600">
                      Última conversa: {new Date(paciente.ultimaConversa).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      paciente.sentimento === 'Positivo'
                        ? 'bg-green-100 text-green-800'
                        : paciente.sentimento === 'Negativo'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {paciente.sentimento}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum paciente ativo</p>
            )}
          </div>
        </div>

        {/* Alertas e Notificações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Alertas e Notificações</h3>
            <button 
              onClick={handleConfigureAlerts}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              Configurar
            </button>
          </div>

          <div className="space-y-3">
            {loadingNotifications ? (
              <LoadingSpinner text="Carregando alertas..." size="small" />
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 flex items-start space-x-3 ${
                    notification.lida ? 'bg-gray-50 border-gray-400' : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className={`p-2 rounded-full ${notification.lida ? 'bg-gray-100' : 'bg-blue-100'}`}>
                    <Bell className={`h-5 w-5 ${notification.lida ? 'text-gray-500' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.assunto}</p>
                    <p className="text-sm text-gray-600">{notification.conteudo}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.data_criacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {!notification.lida && (
                    <button
                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded-lg text-xs transition-colors duration-200"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum alerta</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
