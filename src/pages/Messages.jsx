import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { messageService } from '../services/api';
import { Mail, Send, Search, Plus, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingToMessageId, setReplyingToMessageId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages();
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar mensagens';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // TODO: Substituir window.confirm por um modal customizado
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      await messageService.deleteMessage(messageId);
      toast.success('Mensagem excluída com sucesso!');
      loadMessages(); // Recarrega a lista após a exclusão
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err);
      if (err.response && err.response.status === 403) {
        toast.error('Você não tem permissão para excluir esta mensagem.');
      } else {
        const errorMessage = err.response?.data?.detail || 'Erro ao excluir mensagem';
        toast.error(errorMessage);
      }
    }
  };

  const handleReplyClick = (messageId) => {
    // Alterna a visibilidade do campo de resposta
    setReplyingToMessageId(replyingToMessageId === messageId ? null : messageId);
    setReplyContent(''); // Limpa o conteúdo da resposta ao abrir/fechar
  };

  const handleSendReply = async (originalMessage) => {
    if (!replyContent.trim()) {
      toast.error('A mensagem de resposta não pode estar vazia.');
      return;
    }

    setReplyLoading(true);
    try {
      // O destinatário da resposta é o remetente da mensagem original
      // AGORA ENVIAMOS 'destinatario_id' CONFORME O SERIALIZER DO BACKEND
      const recipientUserId = originalMessage.remetente.id; 

      await messageService.createMessage({
        destinatario_id: recipientUserId, // CORREÇÃO APLICADA AQUI: Mudado de 'destinatario' para 'destinatario_id'
        assunto: `RE: ${originalMessage.assunto}`, // Assunto para a resposta
        conteudo: replyContent,
      });
      toast.success('Resposta enviada com sucesso!');
      setReplyContent('');
      setReplyingToMessageId(null); // Fecha o campo de resposta
      loadMessages(); // Recarrega as mensagens para mostrar a nova resposta
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
      const errorMessage = err.response?.data?.detail || 'Erro ao enviar resposta';
      toast.error(errorMessage);
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredMessages = messages.filter(message =>
    message.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.remetente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner text="Carregando mensagens..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600">Comunicação direta com terapeutas e pacientes</p>
        </div>
        <Link
          to="/mensagens/nova"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nova Mensagem</span>
        </Link>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Lista de mensagens */}
      {filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece enviando sua primeira mensagem'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/mensagens/nova"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Enviar Primeira Mensagem</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{message.assunto}</h3>
                      {!message.lida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      De: {message.remetente_nome || (message.remetente ? `${message.remetente.first_name} ${message.remetente.last_name}` : 'Usuário')}
                    </p>
                    <p className="text-gray-800 mb-2 line-clamp-2">
                      {message.conteudo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.data_envio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleReplyClick(message.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Responder
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              {replyingToMessageId === message.id && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Responder a {message.remetente_nome || (message.remetente ? `${message.remetente.first_name} ${message.remetente.last_name}` : 'Usuário')}:</h4>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Digite sua resposta aqui..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={replyLoading}
                  ></textarea>
                  <button
                    onClick={() => handleSendReply(message)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    disabled={replyLoading}
                  >
                    {replyLoading ? 'Enviando...' : 'Enviar Resposta'} <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
