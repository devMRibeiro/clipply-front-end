import React, { useState, useEffect, useCallback } from 'react'
import AppointmentCard from '../../components/ui/AppointmentCard.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import appointmentService from '../../services/appointmentService.js'
import { formatDate } from '../../utils/format.js'
import { APPOINTMENT_STATUS } from '../../utils/constants.js'

// ─── Ícone SVG inline ────────────────────────────────────
function Icon(props) {
  var paths = {
    refresh:  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  }
  return React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', className: props.className || 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

// ─── Aba de visualização ──────────────────────────────────
function ViewTab(props) {
  var label   = props.label
  var active  = props.active
  var onClick = props.onClick
  var count   = props.count

  return React.createElement(
    'button',
    {
      onClick: onClick,
      className: [
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150',
        active
          ? 'bg-brand-600 text-white shadow-brand'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-800',
      ].join(' '),
    },
    label,
    count !== undefined && React.createElement(
      'span',
      {
        className: [
          'text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center',
          active ? 'bg-white/20 text-white' : 'bg-surface-200 text-surface-600',
        ].join(' '),
      },
      count
    )
  )
}

// ─── Chip de filtro por status ────────────────────────────
function StatusChip(props) {
  var label   = props.label
  var active  = props.active
  var onClick = props.onClick
  var color   = props.color || 'surface'

  var colorMap = {
    brand:   active ? 'bg-brand-100 text-brand-700 border-brand-300'   : 'border-surface-200 text-surface-500 hover:border-brand-200',
    info:    active ? 'bg-blue-100 text-blue-700 border-blue-300'      : 'border-surface-200 text-surface-500 hover:border-blue-200',
    warning: active ? 'bg-amber-100 text-amber-700 border-amber-300'   : 'border-surface-200 text-surface-500 hover:border-amber-200',
    danger:  active ? 'bg-red-100 text-red-700 border-red-300'         : 'border-surface-200 text-surface-500 hover:border-red-200',
    surface: active ? 'bg-surface-100 text-surface-700 border-surface-300' : 'border-surface-200 text-surface-500 hover:border-surface-300',
  }

  return React.createElement(
    'button',
    {
      onClick: onClick,
      className: 'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ' + (colorMap[color] || colorMap.surface),
    },
    label
  )
}

// ─── Resumo numérico do dia ───────────────────────────────
function DaySummary(props) {
  var appointments = props.appointments

  var counts = { total: appointments.length, confirmed: 0, scheduled: 0, completed: 0, noShow: 0 }
  var i = 0
  while (i < appointments.length) {
    var s = appointments[i].status
    if (s === APPOINTMENT_STATUS.CONFIRMED) counts.confirmed++
    if (s === APPOINTMENT_STATUS.SCHEDULED) counts.scheduled++
    if (s === APPOINTMENT_STATUS.COMPLETED) counts.completed++
    if (s === APPOINTMENT_STATUS.NO_SHOW)   counts.noShow++
    i++
  }

  var stats = [
    { label: 'Total',       value: counts.total,     accent: 'text-surface-900' },
    { label: 'Confirmados', value: counts.confirmed,  accent: 'text-brand-600' },
    { label: 'Agendados',   value: counts.scheduled,  accent: 'text-blue-600' },
    { label: 'Concluídos',  value: counts.completed,  accent: 'text-surface-500' },
    { label: 'Não vieram',  value: counts.noShow,     accent: 'text-amber-600' },
  ]

  return React.createElement(
    'div',
    { className: 'grid grid-cols-5 gap-3 mb-6' },
    stats.map(function(stat) {
      return React.createElement(
        'div',
        { key: stat.label, className: 'bg-white rounded-2xl border border-surface-100 shadow-card px-3 py-3 text-center' },
        React.createElement('p', { className: 'font-mono text-2xl font-bold ' + stat.accent }, stat.value),
        React.createElement('p', { className: 'text-2xs text-surface-400 font-semibold mt-0.5 uppercase tracking-wide leading-tight' }, stat.label)
      )
    })
  )
}

// ─── Página principal ─────────────────────────────────────
function AdminAppointmentsPage() {
  var viewState       = useState('today')
  var view            = viewState[0]
  var setView         = viewState[1]

  var dataState       = useState([])
  var data            = dataState[0]
  var setData         = dataState[1]

  var loadingState    = useState(true)
  var loading         = loadingState[0]
  var setLoading      = loadingState[1]

  var errorState      = useState(null)
  var error           = errorState[0]
  var setError        = errorState[1]

  var filterState     = useState(null)
  var activeFilter    = filterState[0]
  var setActiveFilter = filterState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  var fetchData = useCallback(function() {
    setLoading(true)
    setError(null)

    var promise = view === 'today'
      ? appointmentService.listTodayByCompany()
      : appointmentService.listByCompany()

    promise
      .then(function(res) { setData(res.data || []) })
      .catch(function(err) {
        var msg = 'Erro ao carregar agendamentos.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [view])

  useEffect(function() { fetchData() }, [fetchData])

  function handleConfirm(id) {
    return appointmentService.confirm(id)
      .then(function() { toast('Agendamento confirmado!'); fetchData() })
      .catch(function(err) { toast.error((err.response && err.response.data && err.response.data.message) || 'Erro ao confirmar.') })
  }

  function handleComplete(id) {
    return appointmentService.complete(id)
      .then(function() { toast('Agendamento concluído!'); fetchData() })
      .catch(function(err) { toast.error((err.response && err.response.data && err.response.data.message) || 'Erro ao concluir.') })
  }

  function handleNoShow(id) {
    return appointmentService.noShow(id)
      .then(function() { toast.warning('Marcado como não compareceu.'); fetchData() })
      .catch(function(err) { toast.error((err.response && err.response.data && err.response.data.message) || 'Erro ao registrar.') })
  }

  function handleCancel(id) {
    // Endpoint de cancelamento autenticado — adaptar conforme API evoluir
    return appointmentService.noShow(id)
      .then(function() { toast.error('Agendamento cancelado.'); fetchData() })
      .catch(function(err) { toast.error((err.response && err.response.data && err.response.data.message) || 'Erro ao cancelar.') })
  }

  // Filtragem e ordenação local
  var filtered = activeFilter
    ? data.filter(function(a) { return a.status === activeFilter })
    : data.slice()

  filtered.sort(function(a, b) { return new Date(a.startTime) - new Date(b.startTime) })

  var todayLabel = formatDate(new Date().toISOString())

  var filterOptions = [
    { key: null,                         label: 'Todos',       color: 'surface' },
    { key: APPOINTMENT_STATUS.CONFIRMED, label: 'Confirmados', color: 'brand' },
    { key: APPOINTMENT_STATUS.SCHEDULED, label: 'Agendados',   color: 'info' },
    { key: APPOINTMENT_STATUS.COMPLETED, label: 'Concluídos',  color: 'surface' },
    { key: APPOINTMENT_STATUS.NO_SHOW,   label: 'Não vieram',  color: 'warning' },
    { key: APPOINTMENT_STATUS.CANCELLED, label: 'Cancelados',  color: 'danger' },
  ]

  return React.createElement(
    'div',
    { className: 'min-h-full bg-surface-50' },

    // ── Cabeçalho sticky ─────────────────────────────────
    React.createElement(
      'div',
      { className: 'sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-100 px-5 py-4' },

      React.createElement(
        'div',
        { className: 'flex items-start justify-between gap-4 mb-4' },
        React.createElement(
          'div',
          null,
          React.createElement('h1', { className: 'font-display text-2xl font-bold text-surface-900 leading-tight' }, 'Agendamentos'),
          React.createElement('p', { className: 'text-sm text-surface-400 mt-0.5 font-mono' }, view === 'today' ? todayLabel : 'Todos os ativos')
        ),
        React.createElement(
          'button',
          { onClick: fetchData, disabled: loading, className: 'btn-ghost p-2 shrink-0', 'aria-label': 'Atualizar' },
          React.createElement(Icon, { name: 'refresh', className: 'w-5 h-5 ' + (loading ? 'animate-spin-slow text-brand-500' : 'text-surface-500') })
        )
      ),

      React.createElement(
        'div',
        { className: 'flex items-center gap-2' },
        React.createElement(ViewTab, { label: 'Hoje', active: view === 'today', count: view === 'today' ? data.length : undefined, onClick: function() { setView('today'); setActiveFilter(null) } }),
        React.createElement(ViewTab, { label: 'Todos ativos', active: view === 'all', count: view === 'all' ? data.length : undefined, onClick: function() { setView('all'); setActiveFilter(null) } })
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-2xl mx-auto' },

      view === 'today' && !loading && data.length > 0 && React.createElement(DaySummary, { appointments: data }),

      !loading && data.length > 0 && React.createElement(
        'div',
        { className: 'flex flex-wrap gap-2 mb-5' },
        filterOptions.map(function(f) {
          return React.createElement(StatusChip, {
            key: f.key || 'all', label: f.label, color: f.color,
            active: activeFilter === f.key,
            onClick: function() { setActiveFilter(f.key) },
          })
        })
      ),

      loading && React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center py-20 gap-3' },
        React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando agendamentos…')
      ),

      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement('button', { onClick: fetchData, className: 'ml-auto text-xs underline font-semibold' }, 'Tentar novamente')
      ),

      !loading && !error && filtered.length > 0 && React.createElement(
        'div',
        { className: 'space-y-3' },
        filtered.map(function(appointment) {
          return React.createElement(AppointmentCard, {
            key: appointment.id,
            appointment: appointment,
            onConfirm:  handleConfirm,
            onComplete: handleComplete,
            onNoShow:   handleNoShow,
            onCancel:   handleCancel,
          })
        })
      ),

      !loading && !error && filtered.length === 0 && React.createElement(EmptyState, {
        title: activeFilter
          ? 'Nenhum agendamento com esse status'
          : view === 'today' ? 'Nenhum agendamento para hoje' : 'Nenhum agendamento ativo',
        message: activeFilter
          ? 'Tente selecionar outro filtro.'
          : 'Quando houver agendamentos, eles aparecerão aqui.',
      })
    ),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default AdminAppointmentsPage
