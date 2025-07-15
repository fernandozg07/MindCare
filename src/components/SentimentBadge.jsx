import React from 'react'
import { Heart, Frown, Meh } from 'lucide-react'

/**
 * Componente para exibir badge de sentimento
 */
const SentimentBadge = ({ sentiment, category, intensity }) => {
  const getSentimentConfig = (sentiment, intensity) => {
    const configs = {
      'Positivo': {
        icon: Heart,
        colors: {
          'Alta': 'bg-green-100 text-green-800 border-green-200',
          'Média': 'bg-green-50 text-green-700 border-green-100',
          'Baixa': 'bg-green-25 text-green-600 border-green-50'
        }
      },
      'Negativo': {
        icon: Frown,
        colors: {
          'Alta': 'bg-red-100 text-red-800 border-red-200',
          'Média': 'bg-red-50 text-red-700 border-red-100',
          'Baixa': 'bg-red-25 text-red-600 border-red-50'
        }
      },
      'Neutro': {
        icon: Meh,
        colors: {
          'Alta': 'bg-gray-100 text-gray-800 border-gray-200',
          'Média': 'bg-gray-50 text-gray-700 border-gray-100',
          'Baixa': 'bg-gray-25 text-gray-600 border-gray-50'
        }
      }
    }

    const config = configs[sentiment] || configs['Neutro']
    const colorClass = config.colors[intensity] || config.colors['Baixa']

    return {
      icon: config.icon,
      colorClass
    }
  }

  const { icon: Icon, colorClass } = getSentimentConfig(sentiment, intensity)

  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      <Icon size={12} />
      <span>{sentiment}</span>
      {category && category !== 'Neutro' && (
        <>
          <span>•</span>
          <span>{category}</span>
        </>
      )}
      <span>•</span>
      <span>{intensity}</span>
    </div>
  )
}

export default SentimentBadge