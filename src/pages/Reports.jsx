import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportService } from '../services/api'
import { FileText, Plus, Download, Search, Calendar, User } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getReports()
      setReports(data)
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err)
      toast.error('Erro ao carregar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return
    }

    try {
      await reportService.deleteReport(reportId)
      toast.success('Relatório excluído com sucesso!')
      loadReports()
    } catch (err) {
      console.error('Erro ao excluir relatório:', err)
      toast.error('Erro ao excluir relatório')
    }
  }

  const handleDownloadReport = (report) => {
    const reportData = {
      titulo: report.titulo,
      conteudo: report.conteudo,
      data_criacao: report.data_criacao,
      paciente: report.paciente_nome
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${report.id}-${new Date(report.data_criacao).toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredReports = reports.filter(report =>
    report.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.conteudo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.paciente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner text="Carregando relatórios..." />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Crie e gerencie relatórios dos seus pacientes</p>
        </div>
        <Link
          to="/relatorios/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Novo Relatório</span>
        </Link>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Lista de relatórios */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum relatório encontrado' : 'Nenhum relatório criado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando seu primeiro relatório'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/relatorios/novo"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Criar Primeiro Relatório</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{report.titulo}</h3>
                    <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>Paciente: {report.paciente_nome || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(report.data_criacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 line-clamp-3">
                      {report.conteudo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center space-x-1"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <Link
                    to={`/relatorios/${report.id}/editar`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reports