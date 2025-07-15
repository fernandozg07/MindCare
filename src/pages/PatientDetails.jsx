import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { patientService } from '../services/api'
import { ArrowLeft, Edit, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const PatientDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatientDetails()
  }, [id])

  const loadPatientDetails = async () => {
    try {
      setLoading(true)
      const data = await patientService.getPatient(id)
      setPatient(data)
    } catch (err) {
      console.error('Erro ao carregar detalhes do paciente:', err)
      toast.error('Erro ao carregar detalhes do paciente')
      navigate('/pacientes'); // Redireciona para a lista de pacientes se o paciente não for encontrado
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando detalhes do paciente..." />
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
        <p className="text-gray-600">Paciente não encontrado</p>
        <Link to="/pacientes" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mt-4 inline-block">
          Voltar para lista
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/pacientes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.nome_completo}</h1>
            <p className="text-gray-600">Detalhes do paciente</p>
          </div>
        </div>
        <Link
          to={`/pacientes/${patient.id}/editar`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Edit size={16} />
          <span>Editar</span>
        </Link>
      </div>

      {/* Informações básicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{patient.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Telefone</p>
                <p className="font-medium">{patient.telefone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Data de Nascimento</p>
                <p className="font-medium">
                  {patient.data_nascimento 
                    ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR')
                    : 'Não informado'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Endereço</p>
                <p className="font-medium">{patient.endereco || 'Não informado'}</p>
              </div>
            </div>
            {/* Novos campos adicionados */}
            <div>
              <p className="text-sm text-gray-500">Gênero</p>
              <p className="font-medium">{patient.genero || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CEP</p>
              <p className="font-medium">{patient.cep || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alergias</p>
              <p className="font-medium">{patient.alergias || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Medicamentos</p>
              <p className="font-medium">{patient.medicamentos || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contato de Emergência</p>
              <p className="font-medium">{patient.emergencia_nome || 'Não informado'}{patient.emergencia_telefone ? ` (${patient.emergencia_telefone})` : ''}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Cadastro</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Cadastrado em</p>
              <p className="font-medium">
                {new Date(patient.criado_em).toLocaleDateString('pt-BR')} às{' '}
                {new Date(patient.criado_em).toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Última atualização</p>
              <p className="font-medium">
                {new Date(patient.atualizado_em).toLocaleDateString('pt-BR')} às{' '}
                {new Date(patient.atualizado_em).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico Médico / Observações (renomeado) */}
      {patient.historico_medico && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico Médico / Observações</h3>
          <p className="text-gray-700">{patient.historico_medico}</p>
        </div>
      )}
    </div>
  )
}

export default PatientDetails
