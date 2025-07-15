import React, { useState, useRef, useEffect } from 'react'
import { aiService } from '../services/api'
import { Send, Bot, User } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mensagem de boas-vindas
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Olá! Sou seu assistente de saúde mental. Como você está se sentindo hoje? Estou aqui para ouvir e ajudar.',
        timestamp: new Date()
      }
    ])
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await aiService.sendMessage(userMessage.content)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.resposta || response.message || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
        sentiment: response.sentimento,
        category: response.categoria,
        intensity: response.intensidade
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      toast.error('Erro ao enviar mensagem. Tente novamente.')
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-gray-200 p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Assistente de Saúde Mental</h2>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Digitando...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 bg-white border-l border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Mensagem */}
                <div className="flex-1">
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Indicador de digitação */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-xs">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">IA está digitando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Área de input */}
      <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Suas conversas são analisadas para melhor compreensão do seu estado emocional
        </p>
      </div>
    </div>
  )
}

export default Chat