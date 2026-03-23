import React from 'react'

function EmptyState(props) {
  var title    = props.title    || 'Nenhum item encontrado'
  var message  = props.message
  var action   = props.action   // { label, onClick }
  var icon     = props.icon     // elemento SVG opcional

  var defaultIcon = React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', className: 'w-12 h-12', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })
  )

  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center py-16 px-4 text-center' },

    React.createElement(
      'div',
      { className: 'text-surface-300 mb-4' },
      icon || defaultIcon
    ),

    React.createElement(
      'h3',
      { className: 'text-base font-semibold text-surface-700 mb-1' },
      title
    ),

    message && React.createElement(
      'p',
      { className: 'text-sm text-surface-400 max-w-xs' },
      message
    ),

    action && React.createElement(
      'button',
      {
        onClick: action.onClick,
        className: 'btn-primary mt-5',
      },
      action.label
    )
  )
}

export default EmptyState
