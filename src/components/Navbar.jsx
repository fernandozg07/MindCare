import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Sistema de Acompanhamento Terapêutico
          </h1>
          <p className="text-sm text-gray-500">
            {user?.tipo === 'terapeuta' ? 'Painel do Terapeuta' : 'Painel do Paciente'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <User size={20} />
            <span className="text-sm font-medium">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar