import React from 'react'

/**
 * Componente de indicador de digitação da IA
 */
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg max-w-xs">
      <div className="flex items-center space-x-1">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <span className="text-sm text-gray-600">IA está digitando...</span>
    </div>
  )
}

export default TypingIndicator