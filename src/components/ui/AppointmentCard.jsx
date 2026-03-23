import React, { useState } from 'react'
import StatusBadge from '../ui/StatusBadge.jsx'
import Button from '../ui/Button.jsx'
import { formatTime, formatPhone, getInitials } from '../../utils/format.js'
import { APPOINTMENT_STATUS } from '../../utils/constants.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    clock:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    user:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    phone:   'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    tag:     'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    check:   'M5 13l4 4L19 7',
    complete:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    noshow:  'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    cancel:  'M6 18L18 6M6 6l12 12',
    chevron: 'M19 9l-7 7-7-7',
  }
  return React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', className: props.className || 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

function AppointmentCard(props) {
  var appointment = props.appointment
  var onConfirm   = props.onConfirm
  var onComplete  = props.onComplete
  var onNoShow    = props.onNoShow
  var onCancel    = props.onCancel

  var expandedState = useState(false)
  var expanded      = expandedState[0]
  var setExpanded   = expandedState[1]

  var loadingState = useState(null) // 'confirm' | 'complete' | 'noshow' | 'cancel'
  var loadingAction = loadingState[0]
  var setLoadingAction = loadingState[1]

  var status = appointment.status

  function handleAction(action, fn) {
    setLoadingAction(action)
    fn(appointment.id)
      .finally(function() {
        setLoadingAction(null)
      })
  }

  // Linha de tempo — barra de progresso visual do horário
  var now       = new Date()
  var start     = new Date(appointment.startTime)
  var end       = new Date(appointment.endTime)
  var total     = end - start
  var elapsed   = Math.min(Math.max(now - start, 0), total)
  var progress  = total > 0 ? (elapsed / total) * 100 : 0
  var isOngoing = now >= start && now <= end

  // Cor do lado esquerdo por status
  var accentColor = {
    SCHEDULED: 'bg-info-400',
    CONFIRMED: 'bg-brand-500',
    CANCELLED: 'bg-danger-400',
    COMPLETED: 'bg-surface-300',
    NO_SHOW:   'bg-warning-400',
  }[status] || 'bg-surface-300'

  return React.createElement(
    'div',
    {
      className: [
        'bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden',
        'transition-shadow duration-200 hover:shadow-card-md',
      ].join(' '),
    },

    // ── Corpo principal ──────────────────────────────────
    React.createElement(
      'div',
      { className: 'flex' },

      // Barra colorida lateral
      React.createElement('div', { className: 'w-1 shrink-0 ' + accentColor }),

      // Conteúdo
      React.createElement(
        'div',
        { className: 'flex-1 p-4' },

        // Linha 1: horário + status + toggle
        React.createElement(
          'div',
          { className: 'flex items-start justify-between gap-3 mb-3' },

          // Horário
          React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement(
              'span',
              { className: 'font-mono text-xl font-bold text-surface-900 tracking-tight' },
              formatTime(appointment.startTime)
            ),
            React.createElement('span', { className: 'text-surface-300 text-sm' }, '→'),
            React.createElement(
              'span',
              { className: 'font-mono text-sm font-medium text-surface-500' },
              formatTime(appointment.endTime)
            )
          ),

          // Status + expand
          React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement(StatusBadge, { status: status }),
            React.createElement(
              'button',
              {
                onClick: function() { setExpanded(function(v) { return !v }) },
                className: 'text-surface-400 hover:text-surface-700 transition-transform duration-200 ' + (expanded ? 'rotate-180' : ''),
                'aria-label': expanded ? 'Recolher' : 'Expandir',
              },
              React.createElement(Icon, { name: 'chevron', className: 'w-4 h-4' })
            )
          )
        ),

        // Linha 2: cliente + serviço
        React.createElement(
          'div',
          { className: 'flex items-center gap-3 mb-3' },

          // Avatar do cliente
          React.createElement(
            'div',
            { className: 'w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0' },
            React.createElement(
              'span',
              { className: 'text-xs font-bold text-brand-600' },
              getInitials(appointment.customerName)
            )
          ),

          React.createElement(
            'div',
            { className: 'min-w-0' },
            React.createElement(
              'p',
              { className: 'text-sm font-semibold text-surface-900 truncate' },
              appointment.customerName || '—'
            ),
            React.createElement(
              'p',
              { className: 'text-xs text-surface-400 truncate flex items-center gap-1 mt-0.5' },
              React.createElement(Icon, { name: 'tag', className: 'w-3 h-3 shrink-0' }),
              appointment.productName || '—'
            )
          )
        ),

        // Barra de progresso (só se estiver em andamento)
        isOngoing && React.createElement(
          'div',
          { className: 'mb-3' },
          React.createElement(
            'div',
            { className: 'h-1 bg-surface-100 rounded-full overflow-hidden' },
            React.createElement('div', {
              className: 'h-full bg-brand-500 rounded-full transition-all duration-1000',
              style: { width: progress + '%' },
            })
          ),
          React.createElement(
            'p',
            { className: 'text-2xs text-brand-500 font-medium mt-1' },
            'Em andamento'
          )
        ),

        // Ações rápidas (só se status permite)
        React.createElement(
          'div',
          { className: 'flex flex-wrap gap-2' },

          // Confirmar (só SCHEDULED)
          status === APPOINTMENT_STATUS.SCHEDULED && React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'primary',
              loading: loadingAction === 'confirm',
              disabled: loadingAction !== null,
              onClick: function() { handleAction('confirm', onConfirm) },
            },
            React.createElement(Icon, { name: 'check', className: 'w-3.5 h-3.5' }),
            'Confirmar'
          ),

          // Concluir (só CONFIRMED)
          status === APPOINTMENT_STATUS.CONFIRMED && React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'outline',
              loading: loadingAction === 'complete',
              disabled: loadingAction !== null,
              onClick: function() { handleAction('complete', onComplete) },
            },
            React.createElement(Icon, { name: 'complete', className: 'w-3.5 h-3.5' }),
            'Concluir'
          ),

          // No-show (só CONFIRMED)
          status === APPOINTMENT_STATUS.CONFIRMED && React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              loading: loadingAction === 'noshow',
              disabled: loadingAction !== null,
              onClick: function() { handleAction('noshow', onNoShow) },
            },
            React.createElement(Icon, { name: 'noshow', className: 'w-3.5 h-3.5' }),
            'Não veio'
          ),

          // Cancelar (SCHEDULED ou CONFIRMED)
          (status === APPOINTMENT_STATUS.SCHEDULED || status === APPOINTMENT_STATUS.CONFIRMED) && React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              loading: loadingAction === 'cancel',
              disabled: loadingAction !== null,
              className: 'text-danger-500 hover:bg-danger-50 hover:text-danger-600',
              onClick: function() { handleAction('cancel', onCancel) },
            },
            React.createElement(Icon, { name: 'cancel', className: 'w-3.5 h-3.5' }),
            'Cancelar'
          )
        )
      )
    ),

    // ── Detalhe expandido ────────────────────────────────
    expanded && React.createElement(
      'div',
      { className: 'border-t border-surface-100 px-5 py-3 bg-surface-50 animate-slide-down' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-3' },

        // Profissional
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold mb-0.5' }, 'Profissional'),
          React.createElement(
            'p',
            { className: 'text-sm text-surface-700 font-medium flex items-center gap-1.5' },
            React.createElement(Icon, { name: 'user', className: 'w-3.5 h-3.5 text-surface-400' }),
            appointment.professionalName || '—'
          )
        ),

        // Telefone
        React.createElement(
          'div',
          null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold mb-0.5' }, 'Telefone'),
          React.createElement(
            'p',
            { className: 'text-sm text-surface-700 font-medium flex items-center gap-1.5' },
            React.createElement(Icon, { name: 'phone', className: 'w-3.5 h-3.5 text-surface-400' }),
            formatPhone(appointment.customerPhone)
          )
        )
      )
    )
  )
}

export default AppointmentCard
