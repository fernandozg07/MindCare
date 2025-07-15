import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { reportService, patientService } from '../services/api' // Certifique-se que patientService está importado
import { ArrowLeft, Save } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  titulo: Yup.string().required('Título é obrigatório'),
  // Esperamos que 'paciente' seja o ID do Usuário (Usuario.id)
  paciente: Yup.number().required('Paciente é obrigatório').typeError('Selecione um paciente válido'),
  conteudo: Yup.string().required('Conteúdo é obrigatório'),
})

const ReportForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [patients, setPatients] = useState([]) // Armazenará pacientes com usuario_id
  const [loading, setLoading] = useState(false)
  const isEditing = !!id

  useEffect(() => {
    // Usa o novo método de serviço que retorna usuario_id
    loadPatientsForReportForm()
    if (isEditing) {
      loadReport()
    }
  }, [id, isEditing])

  const loadReport = async () => {
    try {
      setLoading(true)
      const data = await reportService.getReport(id)
      // Ao editar, o backend retorna o objeto completo do paciente (Usuario).
      // Precisamos extrair o ID dele para o campo do Formik.
      setReport({
        ...data,
        paciente: data.paciente.id // Extrai o ID do Usuario do paciente
      })
    } catch (err) {
      console.error('Erro ao carregar relatório:', err)
      toast.error('Erro ao carregar dados do relatório')
    } finally {
      setLoading(false)
    }
  }

  const loadPatientsForReportForm = async () => {
    try {
      // Usa o método específico do serviço para este propósito
      const data = await patientService.getPatientsForReports()
      console.log("Pacientes carregados para o formulário de relatório:", data); // Log para depuração
      setPatients(data) // 'data' agora contém objetos com 'usuario_id'
    } catch (err) {
      console.error('Erro ao carregar pacientes para o formulário:', err)
      toast.error('Erro ao carregar lista de pacientes. Verifique o console para mais detalhes.');
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // 'values.paciente' já contém o `usuario_id` devido ao mapeamento do <select>
      const payload = {
        titulo: values.titulo,
        paciente_id: values.paciente, // Envia como paciente_id conforme esperado pelo backend
        conteudo: values.conteudo,
      }

      if (isEditing) {
        await reportService.updateReport(id, payload)
        toast.success('Relatório atualizado com sucesso!')
      } else {
        await reportService.createReport(payload)
        toast.success('Relatório criado com sucesso!')
      }
      navigate('/relatorios')
    } catch (err) {
      console.error('Erro ao salvar relatório:', err)
      // Tenta mostrar erros de validação específicos do backend
      if (err.response && err.response.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        toast.error(`Erro ao salvar relatório: ${errorMessages}`);
      } else {
        toast.error('Erro ao salvar relatório');
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando dados do relatório..." />
  }

  // Valores iniciais para o Formik
  const initialValues = {
    titulo: report?.titulo || '',
    // Usa report?.paciente que já é o ID do Usuario após loadReport processá-lo
    paciente: report?.paciente || '',
    conteudo: report?.conteudo || '',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/relatorios"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Atualize as informações do relatório' : 'Crie um novo relatório'}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Título e Paciente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <Field
                    type="text"
                    name="titulo"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.titulo && touched.titulo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Título do relatório"
                  />
                  <ErrorMessage name="titulo" component="div" className="text-red-500 text-sm mt-1" />
                </div>
                <div>
                  <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente *
                  </label>
                  <Field
                    as="select"
                    name="paciente"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.paciente && touched.paciente ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um paciente</option>
                    {/* Mapeia a lista de pacientes usando 'usuario_id' para o valor e 'nome_completo' para o texto */}
                    {patients.map((patient) => (
                      <option key={patient.usuario_id} value={patient.usuario_id}>
                        {patient.nome_completo}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="paciente" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo do Relatório *
                </label>
                <Field
                  as="textarea"
                  name="conteudo"
                  rows={12}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.conteudo && touched.conteudo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Digite o conteúdo do relatório..."
                />
                <ErrorMessage name="conteudo" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/relatorios"
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
                      <span>{isEditing ? 'Atualizar' : 'Criar'} Relatório</span>
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

export default ReportForm