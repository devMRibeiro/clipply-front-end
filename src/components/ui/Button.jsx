import React from 'react'
import Spinner from './Spinner.jsx'

function Button(props) {
  var variant  = props.variant  || 'primary'
  var size     = props.size     || 'md'
  var loading  = props.loading  || false
  var disabled = props.disabled || false
  var type     = props.type     || 'button'
  var onClick  = props.onClick
  var children = props.children
  var className = props.className || ''

  var base = 'inline-flex items-center justify-center gap-2 font-sans font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none'

  var variants = {
    primary:   'bg-brand-600 text-white hover:bg-brand-700 shadow-brand',
    secondary: 'bg-surface-100 text-surface-700 border border-surface-200 hover:bg-surface-200',
    danger:    'bg-danger-500 text-white hover:bg-danger-600',
    ghost:     'text-surface-600 hover:bg-surface-100',
    outline:   'border border-brand-600 text-brand-600 hover:bg-brand-50',
  }

  var sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  var classes = [
    base,
    variants[variant] || variants.primary,
    sizes[size]       || sizes.md,
    className,
  ].join(' ')

  return React.createElement(
    'button',
    {
      type:     type,
      onClick:  onClick,
      disabled: disabled || loading,
      className: classes,
    },
    loading && React.createElement(Spinner, { size: 'sm' }),
    children
  )
}

export default Button
