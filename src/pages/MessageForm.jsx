// MessageForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { messageService, patientService } from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const MessageForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTherapist, isPatient } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [initialRecipientId, setInitialRecipientId] = useState('');
  const [patientTherapistId, setPatientTherapistId] = useState(null); // Novo estado para o ID do terapeuta do paciente
  const [loadingPatientTherapist, setLoadingPatientTherapist] = useState(true); // Novo estado de carregamento

  const validationSchema = Yup.object({
    destinatario_id: Yup.number().when([], {
      is: () => isTherapist(),
      then: (schema) => schema.required('Destinatário é obrigatório').typeError('Selecione um destinatário válido'),
      otherwise: (schema) => schema.nullable(), // Pacientes não precisam preencher este campo no frontend
    }),
    assunto: Yup.string().required('Assunto é obrigatório'),
    conteudo: Yup.string().required('Conteúdo é obrigatório'),
  });

  useEffect(() => {
    if (isTherapist()) {
      loadPatients();
    } else if (isPatient()) { // Se for paciente, busca o ID do terapeuta principal
      const fetchPatientTherapist = async () => {
        try {
          setLoadingPatientTherapist(true);
          const therapist = await patientService.getTherapistForPatient();
          // *** CORREÇÃO AQUI: Use 'therapist.id' em vez de 'therapist.usuario_id' ***
          if (therapist && therapist.id) { // Assumindo que a API retorna o ID do terapeuta como 'id'
            console.log("Terapeuta encontrado para o paciente:", therapist);
            setPatientTherapistId(therapist.id);
          } else {
            console.log("Nenhum terapeuta ou ID encontrado na resposta da API:", therapist);
            toast.error("Você não tem um terapeuta principal associado. Não é possível enviar mensagens.");
            setPatientTherapistId(null); // Garante que o ID esteja nulo se não houver terapeuta
          }
        } catch (err) {
          console.error("Erro ao buscar terapeuta do paciente:", err);
          toast.error("Erro ao carregar informações do seu terapeuta.");
          setPatientTherapistId(null);
        } finally {
          setLoadingPatientTherapist(false);
        }
      };
      fetchPatientTherapist();
    }

    const params = new URLSearchParams(location.search);
    const replyToId = params.get('replyTo');
    if (replyToId) {
      setInitialRecipientId(parseInt(replyToId, 10));
    }
  }, [isTherapist, isPatient, location.search]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await patientService.getPatientsForReports();
      console.log('Pacientes carregados para seleção (apenas terapeutas):', data);
      setPatients(data);
    } catch (err) {
      console.error(
        'Erro ao carregar pacientes para seleção:',
        err.response ? err.response.data : err.message
      );
      toast.error('Erro ao carregar pacientes para seleção. Verifique o console.');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      let payload = {
        assunto: values.assunto,
        conteudo: values.conteudo,
      };

      if (isTherapist()) {
        if (!values.destinatario_id) {
            toast.error("Por favor, selecione um destinatário.");
            setSubmitting(false);
            return;
        }
        payload.destinatario_id = values.destinatario_id;
      } else if (isPatient()) {
        // Para pacientes, use o ID do terapeuta principal carregado
        if (!patientTherapistId) {
            toast.error("Você não tem um terapeuta principal associado para enviar esta mensagem.");
            setSubmitting(false);
            return;
        }
        payload.destinatario_id = patientTherapistId; // Adiciona o ID do terapeuta principal
      }

      console.log('Payload enviado:', payload);
      await messageService.createMessage(payload);
      toast.success('Mensagem enviada com sucesso!');
      navigate('/mensagens');
    } catch (err) {
      console.error(
        'Erro ao enviar mensagem:',
        err.response ? err.response.data : err.message
      );
      let errorMessage = 'Erro ao enviar mensagem.';
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          errorMessage = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
              return `${fieldName}${msgArray.join(', ')}`;
            })
            .join('; ');
        } else {
          errorMessage = err.response.data.toString();
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    destinatario_id: initialRecipientId || '',
    assunto: '',
    conteudo: '',
  };

  // Se for paciente e ainda estiver carregando, mostra o spinner
  if (isPatient() && loadingPatientTherapist) {
    return <LoadingSpinner text="Buscando informações do seu terapeuta..." />;
  }
  // Se for paciente e não tiver terapeuta, exibe uma mensagem
  if (isPatient() && !patientTherapistId && !loadingPatientTherapist) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 rounded-xl shadow-sm border border-red-200 text-red-700 text-center">
        <p className="text-lg font-medium">Você não tem um terapeuta principal associado para enviar mensagens.</p>
        <p className="text-sm">Por favor, entre em contato com o suporte.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/mensagens"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Mensagem</h1>
          <p className="text-gray-600">Envie uma mensagem</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              {/* Destinatário (apenas para terapeutas) */}
              {isTherapist() && (
                <div>
                  <label
                    htmlFor="destinatario_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Destinatário *
                  </label>
                  {loadingPatients ? (
                    <LoadingSpinner size="small" text="Carregando pacientes..." />
                  ) : (
                    <Field
                      as="select"
                      name="destinatario_id"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.destinatario_id && touched.destinatario_id
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      value={initialRecipientId || ''}
                      onChange={(e) => {
                        setFieldValue('destinatario_id', parseInt(e.target.value, 10) || '');
                        setInitialRecipientId(parseInt(e.target.value, 10) || '');
                      }}
                    >
                      <option value="">Selecione um destinatário</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.usuario_id}>
                          {patient.nome_completo} ({patient.usuario_nome_completo})
                        </option>
                      ))}
                    </Field>
                  )}
                  <ErrorMessage
                    name="destinatario_id"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}

              {/* Assunto */}
              <div>
                <label
                  htmlFor="assunto"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assunto *
                </label>
                <Field
                  type="text"
                  name="assunto"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.assunto && touched.assunto
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Digite o assunto da mensagem"
                />
                <ErrorMessage
                  name="assunto"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label
                  htmlFor="conteudo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mensagem *
                </label>
                <Field
                  as="textarea"
                  name="conteudo"
                  rows={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.conteudo && touched.conteudo
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Digite sua mensagem..."
                />
                <ErrorMessage
                  name="conteudo"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <Link
                  to="/mensagens"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || (isPatient() && !patientTherapistId)} // Desabilita se paciente não tiver terapeuta
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Enviar Mensagem</span>
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

export default MessageForm;