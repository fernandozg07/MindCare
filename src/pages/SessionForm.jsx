import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionService, patientService } from '../services/api';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const SessionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTherapist, isPatient } = useAuth();
  const [session, setSession] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const isEditing = !!id;

  // Define validation schema inside the component to access isTherapist()
  const validationSchema = Yup.object({
    // Para terapeutas, paciente_id é obrigatório e deve ser o ID do OBJETO Paciente
    paciente_id: Yup.number().when([], {
      is: () => isTherapist(),
      then: (schema) => schema.required('Paciente é obrigatório'),
      otherwise: (schema) => schema.nullable(),
    }),
    data: Yup.date().required('Data e Hora são obrigatórios').typeError('Formato de data e hora inválido'),
    duracao: Yup.number()
      .required('Duração é obrigatória')
      .min(1, 'Duração deve ser no mínimo 1 minuto')
      .integer('Duração deve ser um número inteiro'),
    status: Yup.string().required('Status é obrigatório'),
    observacoes: Yup.string().nullable(),
  });

  useEffect(() => {
    if (isEditing) {
      loadSession();
    }
    // Carrega pacientes apenas se o usuário for um terapeuta
    if (isTherapist()) {
      loadPatients();
    }
  }, [id, isEditing, isTherapist]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSession(id);
      setSession(data);
    } catch (err) {
      console.error('Erro ao carregar sessão:', err);
      toast.error('Erro ao carregar dados da sessão. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      // patientService.getPatientsForReports() retorna o ID do objeto Paciente (patient.id)
      // e o ID do Usuario associado (patient.usuario_id).
      // Para agendar sessões, o backend espera o ID do objeto Paciente.
      const data = await patientService.getPatientsForReports(); 
      setPatients(data);
    } catch (err) {
      console.error('Erro ao carregar pacientes para seleção:', err.response ? err.response.data : err.message);
      toast.error('Erro ao carregar pacientes para seleção. Verifique o console.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Garante que a data seja um objeto Date válido antes de chamar toISOString()
      const formattedData = values.data ? new Date(values.data).toISOString() : null;

      let payload = {
        data: formattedData,
        duracao: values.duracao,
        status: values.status,
        observacoes: values.observacoes,
      };

      if (isTherapist()) {
        // Para terapeutas, o payload deve incluir o ID do objeto Paciente
        payload.paciente_id = values.paciente_id; 
      } else if (isPatient()) {
        // Para pacientes, o paciente_id e terapeuta são inferidos pelo backend.
        // Não precisamos enviar paciente_id aqui, pois o backend já sabe quem é o usuário logado.
        // O backend também vai inferir o terapeuta associado ao paciente logado.
        // O erro "Precisa ter um terapeuta associado" será tratado pelo backend.
      }

      if (isEditing) {
        await sessionService.updateSession(id, payload);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await sessionService.createSession(payload);
        toast.success('Sessão agendada com sucesso!');
      }
      navigate('/sessoes');
    } catch (err) {
      console.error('Erro ao salvar sessão:', err.response ? err.response.data : err.message);
      let errorMessage = 'Erro ao salvar sessão.';

      if (err.response && err.response.data) {
        // Trata erros de validação de campo específicos
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          errorMessage = Object.entries(err.response.data)
            .map(([field, messages]) => {
                const msgArray = Array.isArray(messages) ? messages : [messages];
                const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
                return `${fieldName}${msgArray.join(', ')}`;
            })
            .join('; ');
        } 
        // Trata mensagens de erro gerais ou de 'detail'
        else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          errorMessage = err.response.data.toString();
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Carregando dados da sessão..." />;
  }

  const formatIsoDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Verifica se a data é válida antes de formatar
    if (isNaN(date.getTime())) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const initialValues = {
    // Para terapeutas, paciente_id deve ser o ID do OBJETO Paciente
    // session.paciente.id agora se refere ao ID do objeto Paciente (que é o PK)
    paciente_id: session?.paciente?.id || '', 
    data: formatIsoDateTimeLocal(session?.data) || '',
    duracao: session?.duracao || 60,
    status: session?.status || 'agendada',
    observacoes: session?.observacoes || '',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/sessoes"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Sessão' : 'Nova Sessão'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Atualize os detalhes da sessão' : 'Agende uma nova sessão'}
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
              {/* Paciente (apenas para terapeutas) */}
              {isTherapist() && (
                <div>
                  <label htmlFor="paciente_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Paciente *
                  </label>
                  {loadingPatients ? (
                    <LoadingSpinner size="small" text="Carregando pacientes..." />
                  ) : (
                    <Field
                      as="select"
                      name="paciente_id"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.paciente_id && touched.paciente_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione um paciente</option>
                      {/* O valor da opção deve ser o ID do OBJETO Paciente (patient.id) */}
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.nome_completo} ({patient.usuario_nome_completo})
                        </option>
                      ))}
                    </Field>
                  )}
                  <ErrorMessage name="paciente_id" component="div" className="text-red-500 text-sm mt-1" />
                </div>
              )}

              {/* Data e Hora da Sessão */}
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Hora da Sessão *
                </label>
                <Field
                  type="datetime-local"
                  name="data"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.data && touched.data ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="data" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Duração (minutos) */}
              <div>
                <label htmlFor="duracao" className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos) *
                </label>
                <Field
                  type="number"
                  name="duracao"
                  min="1"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.duracao && touched.duracao ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="60"
                />
                <ErrorMessage name="duracao" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <Field
                  as="select"
                  name="status"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.status && touched.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </Field>
                <ErrorMessage name="status" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Observações */}
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <Field
                  as="textarea"
                  name="observacoes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Observações sobre a sessão..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/sessoes"
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
                      <CalendarPlus size={16} />
                      <span>{isEditing ? 'Atualizar' : 'Agendar'} Sessão</span>
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SessionForm;
