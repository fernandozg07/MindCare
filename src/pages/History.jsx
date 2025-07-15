import React, { useState, useEffect } from 'react'
import { aiService } from '../services/api'
import { Calendar, Filter, Search, MessageCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const History = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    sentimento: '',
    data: '',
    search: ''
  })

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await aiService.getHistory()
      setConversations(response.conversas || response || [])
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
      toast.error('Erro ao carregar histórico')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      sentimento: '',
      data: '',
      search: ''
    })
  }

  const filteredConversations = conversations.filter(conv => {
    let matches = true
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      matches = matches && (
        conv.mensagem_usuario?.toLowerCase().includes(searchLower) ||
        conv.resposta_ia?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters.sentimento) {
      matches = matches && conv.sentimento === filters.sentimento
    }
    
    if (filters.data) {
      const convDate = new Date(conv.data_conversa).toISOString().split('T')[0]
      matches = matches && convDate === filters.data
    }
    
    return matches
  })

  if (loading) {
    return <LoadingSpinner text="Carregando histórico..." />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Conversas</h1>
          <p className="text-gray-600">Revise suas conversas anteriores com o assistente</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MessageCircle size={20} />
          <span className="font-medium">{filteredConversations.length} conversas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Busca */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar nas conversas..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Filtro de sentimento */}
          <div className="min-w-40">
            <select
              value={filters.sentimento}
              onChange={(e) => handleFilterChange('sentimento', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os sentimentos</option>
              <option value="Positivo">Positivo</option>
              <option value="Negativo">Negativo</option>
              <option value="Neutro">Neutro</option>
            </select>
          </div>

          {/* Filtro de data */}
          <div className="min-w-40">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={filters.data}
                onChange={(e) => handleFilterChange('data', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Limpar filtros */}
          {(filters.sentimento || filters.data || filters.search) && (
            <button
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de conversas */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conversa encontrada</h3>
          <p className="text-gray-600">
            {filters.search || filters.sentimento || filters.data
              ? 'Tente ajustar os filtros para encontrar conversas'
              : 'Comece uma conversa no chat para ver o histórico aqui'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <div key={conversation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="space-y-4">
                {/* Header da conversa */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(conversation.data_conversa).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {conversation.sentimento && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      conversation.sentimento === 'Positivo' 
                        ? 'bg-green-100 text-green-800'
                        : conversation.sentimento === 'Negativo'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conversation.sentimento}
                    </span>
                  )}
                </div>

                {/* Mensagem do usuário */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Eu</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{conversation.mensagem_usuario}</p>
                    </div>
                  </div>
                </div>

                {/* Resposta da IA */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">IA</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{conversation.resposta_ia}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History