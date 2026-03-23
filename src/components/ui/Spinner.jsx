import React from 'react'

function Spinner(props) {
  var size = props.size || 'md'
  var className = props.className || ''

  var sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-7 h-7 border-2',
    xl: 'w-10 h-10 border-[3px]',
  }

  return React.createElement('span', {
    className: [
      sizeClasses[size] || sizeClasses.md,
      'border-current border-t-transparent rounded-full animate-spin inline-block',
      className,
    ].join(' '),
    role: 'status',
    'aria-label': 'Carregando',
  })
}

export default Spinner
