import React from 'react'

function Select(props) {
  var id        = props.id
  var label     = props.label
  var error     = props.error
  var options   = props.options   || [] // [{ value, label }]
  var placeholder = props.placeholder
  var className = props.className || ''

  var selectProps = Object.assign({}, props)
  delete selectProps.label
  delete selectProps.error
  delete selectProps.options
  delete selectProps.placeholder
  delete selectProps.className

  return React.createElement(
    'div',
    { className: 'w-full' },

    label && React.createElement(
      'label',
      { htmlFor: id, className: 'label' },
      label
    ),

    React.createElement(
      'select',
      Object.assign({}, selectProps, {
        id: id,
        className: [
          'input appearance-none cursor-pointer',
          error ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-400/20' : '',
          className,
        ].join(' '),
      }),

      placeholder && React.createElement(
        'option',
        { value: '', disabled: true },
        placeholder
      ),

      options.map(function(opt) {
        return React.createElement(
          'option',
          { key: opt.value, value: opt.value },
          opt.label
        )
      })
    ),

    error && React.createElement(
      'p',
      { className: 'mt-1.5 text-xs text-danger-500 font-medium' },
      error
    )
  )
}

export default Select
