import React from 'react'

var ICONS = {
  success: React.createElement(
    'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M5 13l4 4L19 7' })
  ),
  error: React.createElement(
    'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M6 18L18 6M6 6l12 12' })
  ),
  warning: React.createElement(
    'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' })
  ),
  info: React.createElement(
    'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ),
}

var TYPE_CLASSES = {
  success: 'bg-brand-600 text-white',
  error:   'bg-danger-500 text-white',
  warning: 'bg-warning-500 text-white',
  info:    'bg-info-500 text-white',
}

function ToastContainer(props) {
  var toasts      = props.toasts      || []
  var removeToast = props.removeToast

  return React.createElement(
    'div',
    {
      className: 'fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none',
      style: { maxWidth: '320px' },
    },
    toasts.map(function(toast) {
      return React.createElement(
        'div',
        {
          key: toast.id,
          className: [
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-card-lg text-sm font-medium pointer-events-auto animate-slide-up cursor-pointer',
            TYPE_CLASSES[toast.type] || TYPE_CLASSES.success,
          ].join(' '),
          onClick: function() { if (removeToast) removeToast(toast.id) },
        },
        ICONS[toast.type] || ICONS.info,
        React.createElement('span', { className: 'flex-1' }, toast.message)
      )
    })
  )
}

export default ToastContainer
