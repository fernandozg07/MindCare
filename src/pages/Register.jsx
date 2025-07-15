import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api'; // Usaremos userService para o registro
import { Brain, User, Mail, Lock, Phone } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  first_name: Yup.string().required('Nome é obrigatório'),
  last_name: Yup.string().required('Sobrenome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'As senhas devem ser iguais')
    .required('Confirmação de senha é obrigatória'),
  tipo: Yup.string().required('Tipo de usuário é obrigatório'),
  // Campos opcionais para terapeuta
  especialidade: Yup.string().when('tipo', {
    is: 'terapeuta',
    then: (schema) => schema.required('Especialidade é obrigatória para terapeutas'),
    otherwise: (schema) => schema.nullable(),
  }),
  crp: Yup.string().when('tipo', {
    is: 'terapeuta',
    then: (schema) => schema.required('CRP é obrigatório para terapeutas'),
    otherwise: (schema) => schema.nullable(),
  }),
});

const Register = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values, { setErrors }) => {
    setIsSubmitting(true);
    try {
      // Prepara o payload para o backend
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        username: values.email, // Usar email como username também
        password: values.password,
        tipo: values.tipo,
      };

      // Adiciona campos específicos para terapeuta se o tipo for 'terapeuta'
      if (values.tipo === 'terapeuta') {
        payload.especialidade = values.especialidade;
        payload.crp = values.crp;
      }

      // Chama a API de registro
      const response = await userService.registerUser(payload);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login'); // Redireciona para a página de login
    } catch (err) {
      console.error('Erro no registro:', err.response ? err.response.data : err.message);
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      if (err.response && err.response.data) {
        // Trata erros de validação de campo específicos do Django
        if (typeof err.response.data === 'object' && !err.response.data.detail) {
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${msgArray.join(', ')}`;
            })
            .join('; ');
          errorMessage = `Erro de validação: ${fieldErrors}`;
          setErrors(err.response.data); // Define erros de campo para Formik
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else {
          errorMessage = err.response.data.toString();
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner text="Verificando autenticação..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crie sua conta
          </h1>
          <p className="text-gray-600">
            Junte-se ao nosso sistema de acompanhamento terapêutico
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Formik
            initialValues={{
              first_name: '',
              last_name: '',
              email: '',
              password: '',
              confirmPassword: '',
              tipo: '', // 'paciente' ou 'terapeuta'
              especialidade: '',
              crp: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values }) => (
              <Form className="space-y-6">
                {/* Nome */}
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="text"
                      name="first_name"
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.first_name && touched.first_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome"
                    />
                  </div>
                  <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Sobrenome */}
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Sobrenome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="text"
                      name="last_name"
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.last_name && touched.last_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                  <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      placeholder="Seu email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="password"
                      name="password"
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Crie uma senha"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="password"
                      name="confirmPassword"
                      className={`w-full px-3 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirme sua senha"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Tipo de Usuário */}
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
                    Você é um:
                  </label>
                  <Field
                    as="select"
                    name="tipo"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.tipo && touched.tipo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione</option>
                    <option value="paciente">Paciente</option>
                    <option value="terapeuta">Terapeuta</option>
                  </Field>
                  <ErrorMessage name="tipo" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Campos específicos para Terapeuta */}
                {values.tipo === 'terapeuta' && (
                  <>
                    {/* Especialidade */}
                    <div>
                      <label htmlFor="especialidade" className="block text-sm font-medium text-gray-700 mb-2">
                        Especialidade
                      </label>
                      <Field
                        type="text"
                        name="especialidade"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.especialidade && touched.especialidade ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Psicologia Clínica, Psicanálise"
                      />
                      <ErrorMessage name="especialidade" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* CRP */}
                    <div>
                      <label htmlFor="crp" className="block text-sm font-medium text-gray-700 mb-2">
                        CRP
                      </label>
                      <Field
                        type="text"
                        name="crp"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.crp && touched.crp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: 12/34567"
                      />
                      <ErrorMessage name="crp" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </>
                )}

                {/* Botão de submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <span>Registrar</span>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Link para login */}
          <p className="mt-6 text-center text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-800">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
