import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MessageCircle, 
  History, 
  BarChart3, 
  Users, 
  Brain,
  Calendar,
  User,
  Mail,
  FileText
} from 'lucide-react'

const Sidebar = () => {
  const { isTherapist } = useAuth()

  const navigationLinks = [
    {
      to: '/chat',
      icon: MessageCircle,
      label: 'Chat com IA',
      description: 'Converse com o assistente'
    },
    {
      to: '/historico',
      icon: History,
      label: 'Histórico',
      description: 'Suas conversas anteriores'
    },
    {
      to: isTherapist() ? '/dashboard/terapeuta' : '/dashboard/paciente',
      icon: BarChart3,
      label: 'Dashboard',
      description: isTherapist() ? 'Painel do terapeuta' : 'Acompanhe sua evolução'
    }
  ]

  // Links específicos para terapeutas
  if (isTherapist()) {
    navigationLinks.push(
      {
        to: '/pacientes',
        icon: Users,
        label: 'Pacientes',
        description: 'Gerenciar pacientes'
      },
      {
        to: '/relatorios',
        icon: FileText,
        label: 'Relatórios',
        description: 'Criar e visualizar relatórios'
      }
    )
  }

  // Links comuns
  navigationLinks.push(
    {
      to: '/sessoes',
      icon: Calendar,
      label: 'Sessões',
      description: 'Agendar e visualizar sessões'
    },
    {
      to: '/mensagens',
      icon: Mail,
      label: 'Mensagens',
      description: 'Comunicação direta'
    },
    {
      to: '/perfil',
      icon: User,
      label: 'Perfil',
      description: 'Configurações da conta'
    }
  )

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">MindCare</h2>
            <p className="text-xs text-gray-500">Assistente Mental</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationLinks.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`
                  }
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{link.label}</p>
                    <p className="text-xs opacity-75 truncate">{link.description}</p>
                  </div>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar