import React, { useEffect } from 'react'

function Modal(props) {
  var open      = props.open
  var onClose   = props.onClose
  var title     = props.title
  var children  = props.children
  var size      = props.size || 'md'

  // Fecha com ESC
  useEffect(function() {
    if (!open) return

    function handleKey(e) {
      if (e.key === 'Escape' && onClose) onClose()
    }

    document.addEventListener('keydown', handleKey)
    return function() {
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  // Bloqueia scroll do body quando modal aberto
  useEffect(function() {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return function() {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  var sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && onClose) onClose()
  }

  return React.createElement(
    'div',
    {
      className: 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm animate-fade-in',
      onClick: handleBackdropClick,
    },
    React.createElement(
      'div',
      {
        className: [
          'w-full bg-white rounded-2xl shadow-card-lg border border-surface-100',
          'animate-slide-up',
          sizeClasses[size] || sizeClasses.md,
        ].join(' '),
      },

      // Header
      title && React.createElement(
        'div',
        { className: 'flex items-center justify-between px-5 pt-5 pb-4 border-b border-surface-100' },
        React.createElement(
          'h2',
          { className: 'text-base font-semibold text-surface-900' },
          title
        ),
        onClose && React.createElement(
          'button',
          {
            onClick: onClose,
            className: 'btn-ghost p-1.5 -mr-1 text-surface-400 hover:text-surface-700',
            'aria-label': 'Fechar',
          },
          // X icon inline
          React.createElement(
            'svg',
            { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' })
          )
        )
      ),

      // Body
      React.createElement(
        'div',
        { className: 'px-5 py-4' },
        children
      )
    )
  )
}

export default Modal
