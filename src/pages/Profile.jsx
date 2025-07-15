import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService, patientService } from '../services/api'; // Importe patientService
import { User, Mail, Phone, Calendar, MapPin, Save, Lock, MessageCircle } from 'lucide-react'; // Adicionado MessageCircle
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
// --- Scheimport { Link } from 'react-router-dom';mas de Validação (PLACEHOLDERS - DEFINA-OS DE ACORDO COM SUAS REGRAS) ---
// Se você já tem esses schemas definidos em outro lugar ou no início deste arquivo,
// mantenha suas definições originais.
const profileValidationSchema = Yup.object({
  first_name: Yup.string().required('Nome é obrigatório'),
  last_name: Yup.string().required('Sobrenome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  telefone: Yup.string().nullable(),
  data_nascimento: Yup.date().nullable().typeError('Data de nascimento inválida'),
  endereco: Yup.string().nullable(),
  especialidade: Yup.string().when('tipo', {
    is: (tipo) => tipo === 'terapeuta',
    then: (schema) => schema.required('Especialidade é obrigatória para terapeutas'),
    otherwise: (schema) => schema.nullable(),
  }),
  crp: Yup.string().when('tipo', {
    is: (tipo) => tipo === 'terapeuta',
    then: (schema) => schema.required('CRP é obrigatório para terapeutas'),
    otherwise: (schema) => schema.nullable(),
  }),
});

const passwordValidationSchema = Yup.object({
  old_password: Yup.string().required('Senha atual é obrigatória'),
  new_password: Yup.string()
    .min(6, 'A nova senha deve ter pelo menos 6 caracteres')
    .required('Nova senha é obrigatória'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password'), null], 'As senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});
// --- FIM DOS PLACEHOLDERS DOS SCHEMAS DE VALIDAÇÃO ---


const Profile = () => {
  const { user, isTherapist, isPatient, authLoading } = useAuth(); // Adicionado authLoading
  const [profile, setProfile] = useState(null);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true); // Renomeado para clareza
  const [loadingTherapist, setLoadingTherapist] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Use um useEffect para carregar o perfil quando o estado de autenticação estiver definido
  useEffect(() => {
    if (!authLoading) { // Garante que o AuthContext terminou de carregar
      loadProfile();
    }
  }, [authLoading]); // Depende de authLoading

  // Use outro useEffect para carregar as informações do terapeuta,
  // dependendo do tipo de usuário e do estado de autenticação
  useEffect(() => {
    if (!authLoading && isPatient()) {
      loadTherapistInfo();
    }
  }, [authLoading, isPatient]); // Depende de authLoading e isPatient

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err.response ? err.response.data : err.message);
      toast.error('Erro ao carregar perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadTherapistInfo = async () => {
    try {
      setLoadingTherapist(true);
      const data = await patientService.getTherapistForPatient();
      setTherapistInfo(data);
    } catch (err) {
      console.error('Erro ao carregar informações do terapeuta:', err.response ? err.response.data : err.message);
      // Se o erro for 404 ou indicar que não há terapeuta, não exiba um toast de erro.
      // O backend agora retorna 200 OK com mensagem se não houver terapeuta.
      if (err.response && err.response.status === 404) {
        setTherapistInfo(null); // Define como nulo se não encontrar
      } else {
        toast.error('Não foi possível carregar as informações do seu terapeuta.');
        setTherapistInfo(null); // Define como nulo em caso de outros erros também
      }
    } finally {
      setLoadingTherapist(false);
    }
  };

  // --- Funções de Submissão (PLACEHOLDERS - IMPLEMENTE SUA LÓGICA AQUI) ---
  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      // Adicione o tipo de usuário ao payload para validação condicional no schema
      const payload = { ...values, tipo: user.tipo }; 
      await userService.updateProfile(payload);
      toast.success('Perfil atualizado com sucesso!');
      // Recarregar perfil para garantir que os dados exibidos estejam atualizados
      loadProfile(); 
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err.response ? err.response.data : err.message);
      let errorMessage = 'Erro ao atualizar perfil.';
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
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Lógica para enviar a requisição de alteração de senha
      // Exemplo: await authService.changePassword(values.old_password, values.new_password);
      toast.success('Senha alterada com sucesso!');
      resetForm(); // Limpa o formulário após sucesso
    } catch (err) {
      console.error('Erro ao alterar senha:', err.response ? err.response.data : err.message);
      let errorMessage = 'Erro ao alterar senha.';
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
        }
      }
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  // --- FIM DAS FUNÇÕES DE SUBMISSÃO ---


  if (loadingProfile) { // Usar loadingProfile para o perfil principal
    return <LoadingSpinner text="Carregando perfil..." />;
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center py-8">
        <p className="text-gray-600">Erro ao carregar perfil ou perfil não encontrado.</p>
        <p className="text-gray-500 text-sm mt-2">Verifique sua conexão ou tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informações Pessoais
          </button>
          {isPatient() && ( // Adicione uma tab para o terapeuta se for paciente
            <button
              onClick={() => setActiveTab('my-therapist')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-therapist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meu Terapeuta
            </button>
          )}
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Alterar Senha
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
          </div>

          <Formik
            initialValues={{
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              email: profile.email || '',
              telefone: profile.telefone || '',
              endereco: profile.endereco || '',
              data_nascimento: profile.data_nascimento || '',
              especialidade: profile.especialidade || '',
              crp: profile.crp || ''
            }}
            validationSchema={profileValidationSchema}
            onSubmit={handleProfileSubmit}
            enableReinitialize={true} // Garante que o formulário seja reinicializado se o perfil mudar
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Nome e Sobrenome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Field
                      type="text"
                      name="first_name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Sobrenome
                    </label>
                    <Field
                      type="text"
                      name="last_name"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Email e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="email"
                        name="email"
                        className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={true} // Email geralmente não é editável após o registro
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Field
                        type="text"
                        name="telefone"
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </div>

                {/* Data de nascimento */}
                <div>
                  <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="date"
                      name="data_nascimento"
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Campos específicos para terapeuta */}
                {isTherapist() && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="crp" className="block text-sm font-medium text-gray-700 mb-1">
                        CRP
                      </label>
                      <Field
                        type="text"
                        name="crp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: 12345"
                      />
                    </div>
                    <div>
                      <label htmlFor="especialidade" className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidade
                      </label>
                      <Field
                        type="text"
                        name="especialidade"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ex: Psicologia Clínica"
                      />
                    </div>
                  </div>
                )}

                {/* Endereço */}
                <div>
                  <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Field
                      as="textarea"
                      name="endereco"
                      rows={3}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Rua, número, bairro, cidade, estado"
                    />
                  </div>
                </div>

                {/* Botão de salvar */}
                <div className="flex justify-end">
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
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      {activeTab === 'my-therapist' && isPatient() && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Meu Terapeuta</h3>
          </div>
          {loadingTherapist ? (
            <LoadingSpinner text="Carregando informações do seu terapeuta..." />
          ) : therapistInfo ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                <span className="font-semibold">Nome:</span> {therapistInfo.first_name} {therapistInfo.last_name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {therapistInfo.email}
              </p>
              {therapistInfo.telefone && (
                <p className="text-gray-700">
                  <span className="font-semibold">Telefone:</span> {therapistInfo.telefone}
                </p>
              )}
              {therapistInfo.especialidade && (
                <p className="text-gray-700">
                  <span className="font-semibold">Especialidade:</span> {therapistInfo.especialidade}
                </p>
              )}
              {therapistInfo.crp && (
                <p className="text-gray-700">
                  <span className="font-semibold">CRP:</span> {therapistInfo.crp}
                </p>
              )}
              {/* Adicione um botão para enviar mensagem se desejar */}
              <Link
                to="/mensagens/nova" // Supondo que esta seja a rota para nova mensagem
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mt-4"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">Nenhum terapeuta associado encontrado ou erro ao carregar.</p>
          )}
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
          </div>

          <Formik
            initialValues={{
              old_password: '',
              new_password: '',
              confirm_password: ''
            }}
            validationSchema={passwordValidationSchema}
            onSubmit={handlePasswordSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6 max-w-md">
                <div>
                  <label htmlFor="old_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <Field
                    type="password"
                    name="old_password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.old_password && touched.old_password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite sua senha atual"
                  />
                  <ErrorMessage name="old_password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <Field
                    type="password"
                    name="new_password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.new_password && touched.new_password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite a nova senha"
                  />
                  <ErrorMessage name="new_password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <Field
                    type="password"
                    name="confirm_password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirm_password && touched.confirm_password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirme a nova senha"
                  />
                  <ErrorMessage name="confirm_password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Alterar Senha</span>
                    </>
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
};

export default Profile;
