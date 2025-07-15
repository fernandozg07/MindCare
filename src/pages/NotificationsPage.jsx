import React, { useState, useEffect } from 'react';
import { Bell, Settings } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { notificationService } from '../services/api'; // Importe o serviço de API real

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      // Chame seu serviço de API real aqui para buscar notificações
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar notificações.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Atualiza o estado local para refletir a mudança sem recarregar tudo
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n)); // 'lida' conforme o backend
      toast.success('Notificação marcada como lida!');
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao marcar notificação como lida.';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando notificações..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-xl shadow-sm border border-red-200 text-red-700 text-center">
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas e Notificações</h1>
          <p className="text-gray-600">Gerencie suas notificações e configure suas preferências</p>
        </div>
        {/* Futuramente, um botão para ir para as configurações de notificação */}
        <button 
          onClick={() => toast.info('Funcionalidade de configuração de notificações ainda não implementada.')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-2"
        >
          <Settings size={16} /> <span>Configurações</span>
        </button>
      </div>

      {/* Lista de Notificações */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma notificação nova.
          </h3>
          <p className="text-gray-600">
            Você está em dia com seus alertas!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl shadow-sm border p-6 flex items-start space-x-4 ${
                notification.lida ? 'border-gray-200 opacity-80' : 'border-blue-300 shadow-md' // 'lida' conforme o backend
              }`}
            >
              <div className={`p-3 rounded-full ${notification.lida ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <Bell className={`h-6 w-6 ${notification.lida ? 'text-gray-500' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${notification.lida ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notification.assunto} {/* Usar 'assunto' do backend */}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {notification.conteudo} {/* Usar 'conteudo' do backend */}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notification.data_criacao).toLocaleString('pt-BR')} {/* Usar 'data_criacao' do backend */}
                </p>
              </div>
              {!notification.lida && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors duration-200"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
