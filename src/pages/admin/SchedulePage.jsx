import React, { useState, useEffect, useCallback } from 'react'
import scheduleService from '../../services/scheduleService.js'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Select from '../../components/ui/Select.jsx'
import Input from '../../components/ui/Input.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import { formatDayOfWeek, formatLocalTime } from '../../utils/format.js'
import { DAYS_OF_WEEK } from '../../utils/constants.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    plus:  'M12 4v16m8-8H4',
    edit:  'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
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

// ─── Agrupa schedules por dia da semana ───────────────────
function groupByDay(schedules) {
  var map = {}
  var i = 0
  while (i < schedules.length) {
    var s = schedules[i]
    if (!map[s.dayOfWeek]) map[s.dayOfWeek] = []
    map[s.dayOfWeek].push(s)
    i++
  }

  var days = Object.keys(map)
  var j = 0
  while (j < days.length) {
    map[days[j]].sort(function(a, b) {
      return a.startTime.localeCompare(b.startTime)
    })
    j++
  }

  var result = []
  var k = 0
  while (k < DAYS_OF_WEEK.length) {
    var day = DAYS_OF_WEEK[k]
    if (map[day]) result.push({ day: day, intervals: map[day] })
    k++
  }
  return result
}

// ─── Linha de intervalo dentro de um card de dia ──────────
function IntervalRow(props) {
  var schedule  = props.schedule
  var onEdit    = props.onEdit
  var onDelete  = props.onDelete
  var loadingId = props.loadingId

  var isLoading = loadingId === schedule.id

  return React.createElement(
    'div',
    { className: 'flex items-center justify-between gap-3 py-2 border-t border-surface-100 first:border-t-0' },

    React.createElement(
      'div',
      { className: 'flex items-center gap-1.5 text-surface-600' },
      React.createElement(Icon, { name: 'clock', className: 'w-3.5 h-3.5 text-surface-400 shrink-0' }),
      React.createElement(
        'span',
        { className: 'font-mono text-sm font-medium' },
        formatLocalTime(schedule.startTime) + ' – ' + formatLocalTime(schedule.endTime)
      )
    ),

    React.createElement(
      'div',
      { className: 'flex items-center gap-1' },
      React.createElement(
        Button,
        {
          size:     'sm',
          variant:  'ghost',
          disabled: isLoading,
          onClick:  function() { onEdit(schedule) },
        },
        React.createElement(Icon, { name: 'edit', className: 'w-3.5 h-3.5' }),
        'Editar'
      ),
      React.createElement(
        Button,
        {
          size:      'sm',
          variant:   'ghost',
          loading:   isLoading,
          disabled:  isLoading,
          className: 'text-danger-500 hover:bg-danger-50 hover:text-danger-600',
          onClick:   function() { onDelete(schedule) },
        },
        React.createElement(Icon, { name: 'trash', className: 'w-3.5 h-3.5' }),
        'Remover'
      )
    )
  )
}

// ─── Card de um dia com seus intervalos ───────────────────
function DayCard(props) {
  var day       = props.day
  var intervals = props.intervals
  var onEdit    = props.onEdit
  var onDelete  = props.onDelete
  var onAdd     = props.onAdd
  var loadingId = props.loadingId

  return React.createElement(
    'div',
    { className: 'bg-white rounded-2xl border border-surface-100 shadow-card p-5' },

    React.createElement(
      'div',
      { className: 'flex items-center justify-between gap-3 mb-3' },

      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(
          'div',
          { className: 'w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0' },
          React.createElement(
            'span',
            { className: 'text-2xs font-bold text-brand-600' },
            formatDayOfWeek(day).substring(0, 3).toUpperCase()
          )
        ),
        React.createElement(
          'span',
          { className: 'text-sm font-semibold text-surface-900' },
          formatDayOfWeek(day)
        )
      ),

      React.createElement(
        Button,
        {
          size:    'sm',
          variant: 'ghost',
          onClick: function() { onAdd(day) },
        },
        React.createElement(Icon, { name: 'plus', className: 'w-3.5 h-3.5' }),
        'Intervalo'
      )
    ),

    React.createElement(
      'div',
      null,
      intervals.map(function(schedule) {
        return React.createElement(IntervalRow, {
          key:      schedule.id,
          schedule: schedule,
          loadingId: loadingId,
          onEdit:   onEdit,
          onDelete: onDelete,
        })
      })
    )
  )
}

// ─── Opções de dias para o Select ─────────────────────────
function buildDayOptions() {
  var options = []
  var i = 0
  while (i < DAYS_OF_WEEK.length) {
    options.push({ value: DAYS_OF_WEEK[i], label: formatDayOfWeek(DAYS_OF_WEEK[i]) })
    i++
  }
  return options
}

var ALL_DAY_OPTIONS = buildDayOptions()

// ─── Formulário de intervalo ──────────────────────────────
var EMPTY_FORM = { dayOfWeek: '', startTime: '', endTime: '' }

function ScheduleForm(props) {
  var initial        = props.initial
  var preselectedDay = props.preselectedDay
  var onSubmit       = props.onSubmit
  var onCancel       = props.onCancel
  var submitting     = props.submitting

  var formState = useState(
    initial
      ? {
          dayOfWeek: initial.dayOfWeek || '',
          startTime: formatLocalTime(initial.startTime) || '',
          endTime:   formatLocalTime(initial.endTime)   || '',
        }
      : Object.assign({}, EMPTY_FORM, { dayOfWeek: preselectedDay || '' })
  )
  var form    = formState[0]
  var setForm = formState[1]

  var errorsState = useState({})
  var errors      = errorsState[0]
  var setErrors   = errorsState[1]

  function set(field, value) {
    var next = Object.assign({}, form)
    next[field] = value
    setForm(next)
    var nextErrors = Object.assign({}, errors)
    delete nextErrors[field]
    setErrors(nextErrors)
  }

  function validate() {
    var e = {}
    if (!form.dayOfWeek) e.dayOfWeek = 'Selecione um dia da semana'
    if (!form.startTime) e.startTime = 'Horário de início é obrigatório'
    if (!form.endTime)   e.endTime   = 'Horário de término é obrigatório'
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = 'O término deve ser depois do início'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onSubmit({ dayOfWeek: form.dayOfWeek, startTime: form.startTime, endTime: form.endTime })
  }

  var dayDisabled = !!initial

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },
    React.createElement(
      'div',
      { className: 'space-y-4' },

      React.createElement(Select, {
        id:          'dayOfWeek',
        label:       'Dia da semana',
        value:       form.dayOfWeek,
        onChange:    function(ev) { set('dayOfWeek', ev.target.value) },
        options:     ALL_DAY_OPTIONS,
        placeholder: 'Selecione o dia…',
        error:       errors.dayOfWeek,
        disabled:    dayDisabled,
      }),

      dayDisabled && React.createElement(
        'p',
        { className: 'text-xs text-surface-400 -mt-2' },
        'Para mudar o dia, remova este intervalo e crie um novo.'
      ),

      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4' },
        React.createElement(Input, {
          id:       'startTime',
          label:    'Início',
          type:     'time',
          value:    form.startTime,
          onChange: function(ev) { set('startTime', ev.target.value) },
          error:    errors.startTime,
          required: true,
        }),
        React.createElement(Input, {
          id:       'endTime',
          label:    'Término',
          type:     'time',
          value:    form.endTime,
          onChange: function(ev) { set('endTime', ev.target.value) },
          error:    errors.endTime,
          required: true,
        })
      )
    ),

    React.createElement(
      'div',
      { className: 'flex justify-end gap-3 mt-6' },
      React.createElement(
        Button,
        { variant: 'secondary', onClick: onCancel, disabled: submitting, type: 'button' },
        'Cancelar'
      ),
      React.createElement(
        Button,
        { variant: 'primary', type: 'submit', loading: submitting },
        initial ? 'Salvar alterações' : 'Adicionar intervalo'
      )
    )
  )
}

// ─── Modal de confirmação de exclusão ─────────────────────
function ConfirmDeleteModal(props) {
  var open      = props.open
  var onClose   = props.onClose
  var onConfirm = props.onConfirm
  var loading   = props.loading
  var label     = props.label

  return React.createElement(
    Modal,
    { open: open, onClose: onClose, title: 'Remover intervalo', size: 'sm' },
    React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        { className: 'text-sm text-surface-600 mb-6' },
        'Tem certeza que deseja remover o intervalo ',
        React.createElement('strong', null, label),
        '? Essa ação não pode ser desfeita.'
      ),
      React.createElement(
        'div',
        { className: 'flex justify-end gap-3' },
        React.createElement(
          Button,
          { variant: 'secondary', onClick: onClose, disabled: loading, type: 'button' },
          'Cancelar'
        ),
        React.createElement(
          Button,
          { variant: 'danger', loading: loading, onClick: onConfirm },
          'Remover'
        )
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function SchedulePage() {
  var schedulesState = useState([])
  var schedules      = schedulesState[0]
  var setSchedules   = schedulesState[1]

  var loadingState   = useState(true)
  var loading        = loadingState[0]
  var setLoading     = loadingState[1]

  var errorState     = useState(null)
  var error          = errorState[0]
  var setError       = errorState[1]

  var modalState     = useState(false)
  var modalOpen      = modalState[0]
  var setModalOpen   = modalState[1]

  var editingState   = useState(null)
  var editing        = editingState[0]
  var setEditing     = editingState[1]

  var preselDayState = useState(null)
  var preselDay      = preselDayState[0]
  var setPreselDay   = preselDayState[1]

  var submittingState = useState(false)
  var submitting      = submittingState[0]
  var setSubmitting   = submittingState[1]

  var confirmState     = useState(null)
  var confirmTarget    = confirmState[0]
  var setConfirmTarget = confirmState[1]

  var deletingState  = useState(false)
  var deleting       = deletingState[0]
  var setDeleting    = deletingState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  var fetchSchedules = useCallback(function() {
    setLoading(true)
    setError(null)
    scheduleService.list()
      .then(function(res) { setSchedules(res.data || []) })
      .catch(function(err) {
        var msg = 'Erro ao carregar horários.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { fetchSchedules() }, [fetchSchedules])

  function openCreate(day) {
    setEditing(null)
    setPreselDay(day || null)
    setModalOpen(true)
  }

  function openEdit(schedule) {
    setEditing(schedule)
    setPreselDay(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setEditing(null)
    setPreselDay(null)
  }

  function handleSubmit(data) {
    setSubmitting(true)
    var promise = editing
      ? scheduleService.update(editing.id, data)
      : scheduleService.create(data)

    promise
      .then(function() {
        toast(editing ? 'Intervalo atualizado!' : 'Intervalo adicionado!')
        closeModal()
        fetchSchedules()
      })
      .catch(function(err) {
        var msg = editing ? 'Erro ao atualizar intervalo.' : 'Erro ao adicionar intervalo.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setSubmitting(false) })
  }

  function askDelete(schedule) {
    var label = formatDayOfWeek(schedule.dayOfWeek) +
      ' ' + formatLocalTime(schedule.startTime) +
      '–' + formatLocalTime(schedule.endTime)
    setConfirmTarget({ id: schedule.id, label: label })
  }

  function closeConfirm() {
    if (deleting) return
    setConfirmTarget(null)
  }

  function handleDelete() {
    if (!confirmTarget) return
    setDeleting(true)
    scheduleService.delete(confirmTarget.id)
      .then(function() {
        toast.warning('Intervalo removido.')
        setConfirmTarget(null)
        fetchSchedules()
      })
      .catch(function(err) {
        var msg = 'Erro ao remover intervalo.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setDeleting(false) })
  }

  var grouped = groupByDay(schedules)

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
            'Horários de atendimento'
          ),
          !loading && React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5' },
            grouped.length + ' ' + (grouped.length === 1 ? 'dia configurado' : 'dias configurados') +
            ' · ' + schedules.length + ' ' + (schedules.length === 1 ? 'intervalo' : 'intervalos')
          )
        ),
        React.createElement(
          Button,
          { variant: 'primary', onClick: function() { openCreate(null) } },
          React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }),
          'Novo intervalo'
        )
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-2xl mx-auto' },

      loading && React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center py-20 gap-3' },
        React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando horários…')
      ),

      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement(
          'button',
          { onClick: fetchSchedules, className: 'ml-auto text-xs underline font-semibold' },
          'Tentar novamente'
        )
      ),

      !loading && !error && grouped.length === 0 && React.createElement(
        EmptyState,
        {
          title:   'Nenhum horário configurado',
          message: 'Defina os dias e intervalos em que sua empresa atende.',
          action:  { label: 'Adicionar intervalo', onClick: function() { openCreate(null) } },
        }
      ),

      !loading && !error && grouped.length > 0 && React.createElement(
        'div',
        { className: 'space-y-4' },
        grouped.map(function(group) {
          return React.createElement(DayCard, {
            key:       group.day,
            day:       group.day,
            intervals: group.intervals,
            loadingId: deleting && confirmTarget ? confirmTarget.id : null,
            onEdit:    openEdit,
            onDelete:  askDelete,
            onAdd:     openCreate,
          })
        })
      )
    ),

    // ── Modal criar / editar ──────────────────────────────
    React.createElement(
      Modal,
      {
        open:    modalOpen,
        onClose: closeModal,
        title:   editing ? 'Editar intervalo' : 'Novo intervalo',
        size:    'sm',
      },
      modalOpen && React.createElement(ScheduleForm, {
        initial:        editing,
        preselectedDay: preselDay,
        onSubmit:       handleSubmit,
        onCancel:       closeModal,
        submitting:     submitting,
      })
    ),

    // ── Modal confirmação de exclusão ─────────────────────
    React.createElement(ConfirmDeleteModal, {
      open:      !!confirmTarget,
      onClose:   closeConfirm,
      onConfirm: handleDelete,
      loading:   deleting,
      label:     confirmTarget ? confirmTarget.label : '',
    }),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default SchedulePage