import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sessionService } from '../services/api'
import { Calendar, Clock, Plus, Filter, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    data: ''
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await sessionService.getSessions()
      setSessions(data)
    } catch (err) {
      console.error('Erro ao carregar sessões:', err)
      toast.error('Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão?')) {
      return
    }

    try {
      await sessionService.deleteSession(sessionId)
      toast.success('Sessão excluída com sucesso!')
      loadSessions()
    } catch (err) {
      console.error('Erro ao excluir sessão:', err)
      toast.error('Erro ao excluir sessão')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'agendada':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'realizada':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendada':
        return 'bg-yellow-100 text-yellow-800'
      case 'realizada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      status: '',
      data: ''
    })
  }

  const filteredSessions = sessions.filter(session => {
    let matches = true
    
    if (filters.status) {
      matches = matches && session.status === filters.status
    }
    
    if (filters.data) {
      const sessionDate = new Date(session.data_sessao || session.data).toISOString().split('T')[0]
      matches = matches && sessionDate === filters.data
    }
    
    return matches
  })

  if (loading) {
    return <LoadingSpinner text="Carregando sessões..." />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessões</h1>
          <p className="text-gray-600">Gerencie suas sessões terapêuticas</p>
        </div>
        <Link
          to="/sessoes/nova"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Agendar Sessão</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-40">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todos os status</option>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

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

          {(filters.status || filters.data) && (
            <button
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Filter size={16} />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de sessões */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão encontrada</h3>
          <p className="text-gray-600 mb-4">
            {filters.status || filters.data
              ? 'Tente ajustar os filtros para encontrar sessões'
              : 'Comece agendando sua primeira sessão'
            }
          </p>
          <Link
            to="/sessoes/nova"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agendar Primeira Sessão</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(session.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        Sessão #{session.id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(session.data_sessao || session.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>
                          {new Date(session.data_sessao || session.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {session.duracao && (
                        <span>({session.duracao} min)</span>
                      )}
                    </div>
                    {session.paciente_nome && (
                      <div className="flex items-center space-x-1 mt-1 text-sm text-gray-600">
                        <User size={14} />
                        <span>Paciente: {session.paciente_nome}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/sessoes/${session.id}/editar`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
              {session.observacoes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Observações:</strong> {session.observacoes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Sessions