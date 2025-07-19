import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, User, Mail, Lock, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .required('Nome de usuário é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
  first_name: Yup.string()
    .required('Nome é obrigatório'),
  last_name: Yup.string()
    .required('Sobrenome é obrigatório')
})

const RegisterPatient = () => {
  const { register, isAuthenticated, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!loading && isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const handleSubmit = async (values, { setFieldError }) => {
    setIsSubmitting(true)
    
    const result = await register(values, 'patient')
    
    if (!result.success) {
      if (result.error.includes('usuário')) {
        setFieldError('username', result.error)
      } else if (result.error.includes('email')) {
        setFieldError('email', result.error)
      }
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Paciente
          </h1>
          <p className="text-gray-600">
            Crie sua conta para começar seu acompanhamento
          </p>
        </div>

        {/* Formulário */}
        <div className="card">
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              first_name: '',
              last_name: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                {/* Nome e Sobrenome */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Field
                      type="text"
                      name="first_name"
                      className={`input-field ${errors.first_name && touched.first_name ? 'border-red-500' : ''}`}
                      placeholder="Nome"
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
                      className={`input-field ${errors.last_name && touched.last_name ? 'border-red-500' : ''}`}
                      placeholder="Sobrenome"
                    />
                    <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                {/* Usuário */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Usuário
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="text"
                      name="username"
                      className={`input-field pl-10 ${errors.username && touched.username ? 'border-red-500' : ''}`}
                      placeholder="Digite um nome de usuário"
                    />
                  </div>
                  <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="email"
                      name="email"
                      className={`input-field pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                      placeholder="Digite seu email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Senha */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="password"
                      name="password"
                      className={`input-field pl-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                      placeholder="Digite uma senha"
                    />
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Confirmar senha */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Field
                      type="password"
                      name="confirmPassword"
                      className={`input-field pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirme sua senha"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Botão de submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    <span>Criar conta</span>
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Faça login aqui
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              É terapeuta?{' '}
              <Link to="/register/terapeuta" className="text-primary-600 hover:text-primary-700 font-medium">
                Cadastre-se como terapeuta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPatient
