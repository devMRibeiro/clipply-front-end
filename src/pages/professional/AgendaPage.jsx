import React, { useState, useEffect, useCallback } from 'react'
import appointmentService from '../../services/appointmentService.js'
import AppointmentCard from '../../components/ui/AppointmentCard.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import { formatDate } from '../../utils/format.js'
import { APPOINTMENT_STATUS } from '../../utils/constants.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  }
  return React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      className: props.className || 'w-4 h-4',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2,
    },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

// ─── Resumo do dia ────────────────────────────────────────
function DaySummary(props) {
  var appointments = props.appointments

  var total     = appointments.length
  var confirmed = 0
  var completed = 0
  var noShow    = 0

  var i = 0
  while (i < appointments.length) {
    var s = appointments[i].status
    if (s === APPOINTMENT_STATUS.CONFIRMED) confirmed++
    if (s === APPOINTMENT_STATUS.COMPLETED) completed++
    if (s === APPOINTMENT_STATUS.NO_SHOW)   noShow++
    i++
  }

  var stats = [
    { label: 'Total',      value: total,     accent: 'text-surface-900' },
    { label: 'Confirmados', value: confirmed, accent: 'text-brand-600' },
    { label: 'Concluídos',  value: completed, accent: 'text-surface-500' },
    { label: 'Não vieram',  value: noShow,    accent: 'text-amber-600' },
  ]

  return React.createElement(
    'div',
    { className: 'grid grid-cols-4 gap-3 mb-6' },
    stats.map(function(stat) {
      return React.createElement(
        'div',
        {
          key: stat.label,
          className: 'bg-white rounded-2xl border border-surface-100 shadow-card px-3 py-3 text-center',
        },
        React.createElement('p', { className: 'font-mono text-2xl font-bold ' + stat.accent }, stat.value),
        React.createElement(
          'p',
          { className: 'text-2xs text-surface-400 font-semibold mt-0.5 uppercase tracking-wide leading-tight' },
          stat.label
        )
      )
    })
  )
}

// ─── Página principal ─────────────────────────────────────
function AgendaPage() {
  var dataState    = useState([])
  var data         = dataState[0]
  var setData      = dataState[1]

  var loadingState = useState(true)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  var errorState   = useState(null)
  var error        = errorState[0]
  var setError     = errorState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  var fetchData = useCallback(function() {
    setLoading(true)
    setError(null)
    appointmentService.listTodayByProfessional()
      .then(function(res) {
        var list = res.data || []
        // Ordena por horário de início
        list.sort(function(a, b) { return new Date(a.startTime) - new Date(b.startTime) })
        setData(list)
      })
      .catch(function(err) {
        var msg = 'Erro ao carregar agenda.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { fetchData() }, [fetchData])

  // Profissional só pode marcar como concluído ou não compareceu
  function handleComplete(id) {
    return appointmentService.complete(id)
      .then(function() { toast('Atendimento concluído!'); fetchData() })
      .catch(function(err) {
        toast.error(
          (err.response && err.response.data && err.response.data.message) || 'Erro ao concluir.'
        )
      })
  }

  function handleNoShow(id) {
    return appointmentService.noShow(id)
      .then(function() { toast.warning('Marcado como não compareceu.'); fetchData() })
      .catch(function(err) {
        toast.error(
          (err.response && err.response.data && err.response.data.message) || 'Erro ao registrar.'
        )
      })
  }

  // Ações não disponíveis para o profissional — retornam promise vazia
  function noop() {
    return Promise.resolve()
  }

  var todayLabel = formatDate(new Date().toISOString())

  // Próximo agendamento do dia (primeiro CONFIRMED ainda não iniciado)
  var now  = new Date()
  var next = null
  var j    = 0
  while (j < data.length) {
    var appt = data[j]
    if (
      appt.status === APPOINTMENT_STATUS.CONFIRMED &&
      new Date(appt.startTime) > now
    ) {
      next = appt
      break
    }
    j++
  }

  return React.createElement(
    'div',
    { className: 'min-h-full bg-surface-50' },

    // ── Cabeçalho sticky ──────────────────────────────────
    React.createElement(
      'div',
      { className: 'sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-100 px-5 py-4' },
      React.createElement(
        'div',
        { className: 'flex items-start justify-between gap-4' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'h1',
            { className: 'font-display text-2xl font-bold text-surface-900 leading-tight' },
            'Minha agenda'
          ),
          React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5 font-mono' },
            todayLabel
          )
        ),
        React.createElement(
          'button',
          {
            onClick:    fetchData,
            disabled:   loading,
            className:  'btn-ghost p-2 shrink-0',
            'aria-label': 'Atualizar',
          },
          React.createElement(Icon, {
            name:      'refresh',
            className: 'w-5 h-5 ' + (loading ? 'animate-spin-slow text-brand-500' : 'text-surface-500'),
          })
        )
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-2xl mx-auto' },

      // Resumo numérico
      !loading && data.length > 0 && React.createElement(DaySummary, { appointments: data }),

      // Banner do próximo agendamento
      !loading && next && React.createElement(
        'div',
        { className: 'bg-brand-600 rounded-2xl px-5 py-4 mb-5 text-white shadow-brand' },
        React.createElement(
          'p',
          { className: 'text-xs font-semibold uppercase tracking-wide opacity-70 mb-1' },
          'Próximo atendimento'
        ),
        React.createElement(
          'p',
          { className: 'font-semibold text-base' },
          next.customerName
        ),
        React.createElement(
          'p',
          { className: 'text-sm opacity-80' },
          next.productName + ' · ' +
          new Date(next.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        )
      ),

      // Loading
      loading && React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center py-20 gap-3' },
        React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando agenda…')
      ),

      // Erro
      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement(
          'button',
          { onClick: fetchData, className: 'ml-auto text-xs underline font-semibold' },
          'Tentar novamente'
        )
      ),

      // Lista de agendamentos
      !loading && !error && data.length > 0 && React.createElement(
        'div',
        { className: 'space-y-3' },
        data.map(function(appointment) {
          return React.createElement(AppointmentCard, {
            key:        appointment.id,
            appointment: appointment,
            onConfirm:  noop,
            onComplete: handleComplete,
            onNoShow:   handleNoShow,
            onCancel:   noop,
          })
        })
      ),

      // Empty state
      !loading && !error && data.length === 0 && React.createElement(EmptyState, {
        title:   'Nenhum agendamento hoje',
        message: 'Você não tem atendimentos agendados para hoje.',
      })
    ),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default AgendaPage