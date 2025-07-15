import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { patientService } from '../services/api'
import { ArrowLeft, Save } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

// Esquema de validação atualizado para corresponder ao PacienteSerializer
const validationSchema = Yup.object({
  nome_completo: Yup.string().required('Nome completo é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  telefone: Yup.string().nullable(), // Permitir nulo ou vazio
  data_nascimento: Yup.date().nullable(), // Permitir nulo ou vazio
  genero: Yup.string().nullable(), // Adicionado: pode ser 'Masculino', 'Feminino', 'Outro', etc.
  endereco: Yup.string().nullable(),
  cep: Yup.string().nullable(), // Adicionado
  historico_medico: Yup.string().nullable(), // Renomeado de 'observacoes'
  alergias: Yup.string().nullable(), // Adicionado
  medicamentos: Yup.string().nullable(), // Adicionado
  emergencia_nome: Yup.string().nullable(), // Adicionado
  emergencia_telefone: Yup.string().nullable(), // Adicionado
})

const PatientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(false)
  const isEditing = !!id

  useEffect(() => {
    if (isEditing) {
      loadPatient()
    }
  }, [id, isEditing])

  const loadPatient = async () => {
    try {
      setLoading(true)
      const data = await patientService.getPatient(id)
      setPatient(data)
    } catch (err) {
      console.error('Erro ao carregar paciente:', err)
      toast.error('Erro ao carregar dados do paciente. Verifique o console.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEditing) {
        await patientService.updatePatient(id, values)
        toast.success('Paciente atualizado com sucesso!')
      } else {
        await patientService.createPatient(values)
        toast.success('Paciente criado com sucesso!')
      }
      navigate('/pacientes')
    } catch (err) {
      console.error('Erro ao salvar paciente:', err.response ? err.response.data : err.message)
      let errorMessage = 'Erro ao salvar paciente.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          // CORREÇÃO AQUI: Garante que 'messages' é um array antes de tentar 'join'
          errorMessage = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
        } else {
          errorMessage = err.response.data.toString();
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando dados do paciente..." />
  }

  // Valores iniciais do formulário
  const initialValues = {
    nome_completo: patient?.nome_completo || '',
    email: patient?.email || '',
    telefone: patient?.telefone || '',
    data_nascimento: patient?.data_nascimento || '',
    genero: patient?.genero || '',
    endereco: patient?.endereco || '',
    cep: patient?.cep || '',
    historico_medico: patient?.historico_medico || '',
    alergias: patient?.alergias || '',
    medicamentos: patient?.medicamentos || '',
    emergencia_nome: patient?.emergencia_nome || '',
    emergencia_telefone: patient?.emergencia_telefone || '',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/pacientes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Atualize as informações do paciente' : 'Adicione um novo paciente'}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize // Permite que o formulário seja reinicializado quando 'patient' muda
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Nome Completo e Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <Field
                    type="text"
                    name="nome_completo"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.nome_completo && touched.nome_completo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome completo do paciente"
                  />
                  <ErrorMessage name="nome_completo" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Telefone e Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <Field
                    type="text"
                    name="telefone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <Field
                    type="date"
                    name="data_nascimento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Gênero e CEP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">
                    Gênero
                  </label>
                  <Field
                    as="select"
                    name="genero"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </Field>
                </div>
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <Field
                    type="text"
                    name="cep"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <Field
                  type="text"
                  name="endereco"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Rua, número, bairro, cidade, estado"
                />
              </div>

              {/* Histórico Médico (antigas Observações) */}
              <div>
                <label htmlFor="historico_medico" className="block text-sm font-medium text-gray-700 mb-1">
                  Histórico Médico / Observações
                </label>
                <Field
                  as="textarea"
                  name="historico_medico"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Informações relevantes sobre o histórico médico ou observações gerais..."
                />
              </div>

              {/* Alergias e Medicamentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <Field
                    type="text"
                    name="alergias"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ex: Amendoim, Penicilina"
                  />
                </div>
                <div>
                  <label htmlFor="medicamentos" className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamentos em Uso
                  </label>
                  <Field
                    type="text"
                    name="medicamentos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ex: Sertralina, Rivotril"
                  />
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencia_nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Contato de Emergência (Nome)
                  </label>
                  <Field
                    type="text"
                    name="emergencia_nome"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nome do contato de emergência"
                  />
                </div>
                <div>
                  <label htmlFor="emergencia_telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contato de Emergência (Telefone)
                  </label>
                  <Field
                    type="text"
                    name="emergencia_telefone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="(11) 98888-7777"
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/pacientes"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{isEditing ? 'Atualizar' : 'Criar'} Paciente</span>
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default PatientForm
