import React, { useState, useEffect } from 'react'; // Importe useEffect
import { Link, useNavigate } from 'react-router-dom'; // Remova Navigate daqui, pois usaremos useNavigate no useEffect
import { useAuth } from '../contexts/AuthContext';
import { Brain, Mail, Lock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner'; // Certifique-se de que este caminho está correto e o componente funciona
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .required('Senha é obrigatória')
});

const Login = () => {
  const { login, isAuthenticated, loading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Use useEffect para lidar com o redirecionamento inicial
  // Isso evita o loop de renderização ao chamar navigate diretamente na renderização
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      if (user?.tipo === 'terapeuta') {
        navigate('/dashboard/terapeuta', { replace: true });
      } else if (user?.tipo === 'paciente') {
        navigate('/dashboard/paciente', { replace: true });
      } else {
        navigate('/', { replace: true }); // Redirecionamento padrão
      }
    }
  }, [isAuthenticated, loading, user, navigate]); // Adicione todas as dependências relevantes

  // Mostra um spinner de carregamento enquanto o status de autenticação está sendo verificado
  if (loading) {
    return <LoadingSpinner />; // Verifique se este componente está funcionando
  }

  // Se o usuário já estiver autenticado e o carregamento terminou,
  // e o useEffect já iniciou o redirecionamento, não renderize o formulário de login.
  // Isso evita que o formulário apareça brevemente antes do redirecionamento.
  if (isAuthenticated()) {
    return null; 
  }

  const handleSubmit = async (values, { setFieldError }) => {
    setIsSubmitting(true);
    
    const result = await login(values); // Chama a função de login do AuthContext
    
    if (result.success) {
      // Redirecionamento após o sucesso do login.
      // O 'user' no contexto deve ter sido atualizado pela função 'login'.
      // Podemos usar o 'user' do contexto ou o 'result.user_type' se o backend retornar.
      const userType = result.user_type || user?.tipo; // Prioriza o tipo da resposta, senão usa o do contexto

      if (userType === 'terapeuta') {
        navigate('/dashboard/terapeuta', { replace: true });
      } else if (userType === 'paciente') {
        navigate('/dashboard/paciente', { replace: true });
      } else {
        navigate('/', { replace: true }); // Redirecionamento padrão
      }
    } else {
      // Exibe o erro retornado pelo AuthContext no campo de email
      setFieldError('email', result.error); 
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Formik
            initialValues={{
              email: '',
              password: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-6">
                {/* Campo de email */}
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
                      placeholder="Digite seu email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Campo de senha */}
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
                      placeholder="Digite sua senha"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Botão de submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <span>Entrar</span>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Link para registro */}
          <p className="mt-6 text-center text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-800">
              Crie uma agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
