import React from 'react'

function Input(props) {
  var id        = props.id
  var label     = props.label
  var error     = props.error
  var hint      = props.hint
  var className = props.className || ''

  // Repassa todo o resto direto para o <input>
  var inputProps = Object.assign({}, props)
  delete inputProps.label
  delete inputProps.error
  delete inputProps.hint
  delete inputProps.className

  return React.createElement(
    'div',
    { className: 'w-full' },

    // Label
    label && React.createElement(
      'label',
      { htmlFor: id, className: 'label' },
      label
    ),

    // Input
    React.createElement('input', Object.assign({}, inputProps, {
      id: id,
      className: [
        'input',
        error ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-400/20' : '',
        className,
      ].join(' '),
    })),

    // Erro
    error && React.createElement(
      'p',
      { className: 'mt-1.5 text-xs text-danger-500 font-medium' },
      error
    ),

    // Hint
    !error && hint && React.createElement(
      'p',
      { className: 'mt-1.5 text-xs text-surface-400' },
      hint
    )
  )
}

export default Input
