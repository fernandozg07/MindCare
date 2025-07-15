import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const isAuthenticated = localStorage.getItem('isAuthenticated')
      
      if (isAuthenticated === 'true' && storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      const userData = {
        id: response.user?.id,
        email: response.user?.email || credentials.email,
        first_name: response.user?.first_name,
        last_name: response.user?.last_name,
        tipo: response.user?.tipo || response.user_type
      }
      
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userData))
      
      setUser(userData)
      
      toast.success('Login realizado com sucesso!')
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      
      let errorMessage = 'Erro ao fazer login'
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Dados inválidos'
      } else if (!error.response) {
        errorMessage = 'Erro de conexão com o servidor'
      }
      
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Logout realizado com sucesso!')
    }
  }

  const isAuthenticated = () => {
    return !!user && localStorage.getItem('isAuthenticated') === 'true'
  }

  const isTherapist = () => {
    return user?.tipo === 'terapeuta'
  }

  const isPatient = () => {
    return user?.tipo === 'paciente'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isTherapist,
    isPatient
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}