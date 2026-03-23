import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

function NotFoundPage() {
  var navigate = useNavigate()

  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh flex flex-col items-center justify-center p-6 bg-surface-50 text-center' },

    React.createElement(
      'p',
      { className: 'font-mono text-8xl font-bold text-surface-200 mb-2 select-none' },
      '404'
    ),

    React.createElement(
      'h1',
      { className: 'text-xl font-display font-bold text-surface-900 mb-2' },
      'Página não encontrada'
    ),

    React.createElement(
      'p',
      { className: 'text-sm text-surface-400 mb-8 max-w-xs' },
      'O endereço que você tentou acessar não existe ou foi movido.'
    ),

    React.createElement(
      Button,
      { onClick: function() { navigate(-1) } },
      'Voltar'
    )
  )
}

export default NotFoundPage
