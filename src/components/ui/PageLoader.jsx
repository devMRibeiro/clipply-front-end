import React from 'react'

function PageLoader() {
  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh flex flex-col items-center justify-center bg-surface-50 gap-4' },

    // Logo mark animado
    React.createElement(
      'div',
      { className: 'relative' },
      React.createElement(
        'div',
        { className: 'w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand' },
        React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', className: 'w-6 h-6 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2.5 },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
        )
      ),
      React.createElement('div', {
        className: 'absolute inset-0 rounded-2xl bg-brand-600 opacity-30 animate-ping',
      })
    ),

    React.createElement(
      'p',
      { className: 'text-sm text-surface-400 font-medium' },
      'Carregando…'
    )
  )
}

export default PageLoader
