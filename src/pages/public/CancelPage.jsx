import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import publicService from '../../services/publicService.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    check:   'M5 13l4 4L19 7',
    warning: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    error:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    x:       'M6 18L18 6M6 6l12 12',
  }
  return React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      className: props.className || 'w-5 h-5',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2,
    },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

// ─── Estados possíveis ────────────────────────────────────
// loading | confirm | cancelling | success | already_cancelled | error

function CancelPage() {
  var params = useParams()
  var token  = params.token

  var statusState  = useState('confirm')  // começa pedindo confirmação
  var status       = statusState[0]
  var setStatus    = statusState[1]

  var errorState   = useState(null)
  var error        = errorState[0]
  var setError     = errorState[1]

  function handleCancel() {
    setStatus('cancelling')
    publicService.cancelAppointment(token)
      .then(function() {
        setStatus('success')
      })
      .catch(function(err) {
        var msg = ''
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message
        }

        // Mensagens específicas do backend
        if (msg === 'Appointment is already cancelled') {
          setStatus('already_cancelled')
        } else if (msg === 'Completed appointments cannot be cancelled') {
          setStatus('error')
          setError('Este agendamento já foi concluído e não pode ser cancelado.')
        } else if (msg === 'Appointment not found') {
          setStatus('error')
          setError('Link de cancelamento inválido ou expirado.')
        } else {
          setStatus('error')
          setError(msg || 'Não foi possível cancelar o agendamento. Tente novamente ou entre em contato com a empresa.')
        }
      })
  }

  // ── Tela de confirmação ───────────────────────────────────
  if (status === 'confirm') {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh bg-surface-50 flex items-center justify-center p-6' },
      React.createElement(
        'div',
        { className: 'w-full max-w-sm' },

        // Ícone de aviso
        React.createElement(
          'div',
          { className: 'flex justify-center mb-6' },
          React.createElement(
            'div',
            { className: 'w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center' },
            React.createElement(Icon, { name: 'warning', className: 'w-8 h-8 text-amber-600' })
          )
        ),

        React.createElement(
          'div',
          { className: 'text-center mb-8' },
          React.createElement(
            'h1',
            { className: 'font-display text-2xl font-bold text-surface-900 mb-2' },
            'Cancelar agendamento'
          ),
          React.createElement(
            'p',
            { className: 'text-sm text-surface-500' },
            'Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita.'
          )
        ),

        React.createElement(
          'div',
          { className: 'flex flex-col gap-3' },
          React.createElement(
            Button,
            {
              variant:   'danger',
              className: 'w-full',
              onClick:   handleCancel,
            },
            React.createElement(Icon, { name: 'x', className: 'w-4 h-4' }),
            'Sim, cancelar agendamento'
          ),
          React.createElement(
            'a',
            {
              href:      '/',
              className: 'btn-secondary w-full text-center text-sm font-semibold',
            },
            'Não, manter agendamento'
          )
        )
      )
    )
  }

  // ── Cancelando (loading) ──────────────────────────────────
  if (status === 'cancelling') {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh bg-surface-50 flex items-center justify-center p-6' },
      React.createElement(
        'div',
        { className: 'flex flex-col items-center gap-4' },
        React.createElement(Spinner, { size: 'xl', className: 'text-brand-500' }),
        React.createElement(
          'p',
          { className: 'text-sm text-surface-400' },
          'Cancelando agendamento…'
        )
      )
    )
  }

  // ── Sucesso ───────────────────────────────────────────────
  if (status === 'success') {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh bg-surface-50 flex items-center justify-center p-6' },
      React.createElement(
        'div',
        { className: 'w-full max-w-sm text-center' },

        React.createElement(
          'div',
          { className: 'flex justify-center mb-6' },
          React.createElement(
            'div',
            { className: 'w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center' },
            React.createElement(Icon, { name: 'check', className: 'w-8 h-8 text-brand-600' })
          )
        ),

        React.createElement(
          'h1',
          { className: 'font-display text-2xl font-bold text-surface-900 mb-2' },
          'Agendamento cancelado'
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-surface-400 mb-8' },
          'Seu agendamento foi cancelado com sucesso. Esperamos te ver em breve!'
        ),

        React.createElement(
          'a',
          {
            href:      '/',
            className: 'btn-primary w-full text-center text-sm font-semibold',
          },
          'Fazer novo agendamento'
        )
      )
    )
  }

  // ── Já cancelado ──────────────────────────────────────────
  if (status === 'already_cancelled') {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh bg-surface-50 flex items-center justify-center p-6' },
      React.createElement(
        'div',
        { className: 'w-full max-w-sm text-center' },

        React.createElement(
          'div',
          { className: 'flex justify-center mb-6' },
          React.createElement(
            'div',
            { className: 'w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center' },
            React.createElement(Icon, { name: 'check', className: 'w-8 h-8 text-surface-400' })
          )
        ),

        React.createElement(
          'h1',
          { className: 'font-display text-2xl font-bold text-surface-900 mb-2' },
          'Já cancelado'
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-surface-400 mb-8' },
          'Este agendamento já havia sido cancelado anteriormente.'
        ),

        React.createElement(
          'a',
          {
            href:      '/',
            className: 'btn-secondary w-full text-center text-sm font-semibold',
          },
          'Voltar ao início'
        )
      )
    )
  }

  // ── Erro genérico ─────────────────────────────────────────
  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh bg-surface-50 flex items-center justify-center p-6' },
    React.createElement(
      'div',
      { className: 'w-full max-w-sm text-center' },

      React.createElement(
        'div',
        { className: 'flex justify-center mb-6' },
        React.createElement(
          'div',
          { className: 'w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center' },
          React.createElement(Icon, { name: 'error', className: 'w-8 h-8 text-danger-500' })
        )
      ),

      React.createElement(
        'h1',
        { className: 'font-display text-2xl font-bold text-surface-900 mb-2' },
        'Não foi possível cancelar'
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-surface-400 mb-8' },
        error || 'Ocorreu um erro inesperado. Entre em contato com a empresa.'
      ),

      React.createElement(
        'a',
        {
          href:      '/',
          className: 'btn-secondary w-full text-center text-sm font-semibold',
        },
        'Voltar ao início'
      )
    )
  )
}

export default CancelPage