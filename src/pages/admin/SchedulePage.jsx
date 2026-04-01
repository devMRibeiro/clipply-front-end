import React, { useState, useEffect, useCallback } from 'react'
import scheduleService from '../../services/scheduleService.js'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Select from '../../components/ui/Select.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import { formatDayOfWeek, formatLocalTime } from '../../utils/format.js'
import { DAYS_OF_WEEK } from '../../utils/constants.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    plus: 'M12 4v16m8-8H4',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
    check: 'M5 13l4 4L19 7',
    x: 'M6 18L18 6M6 6l12 12',
  }
  return React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', className: props.className || 'w-4 h-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

// ─── Agrupa schedules por dia ─────────────────────────────
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
    map[days[j]].sort(function (a, b) { return a.startTime.localeCompare(b.startTime) })
    j++
  }
  var result = []
  var k = 0
  while (k < DAYS_OF_WEEK.length) {
    if (map[DAYS_OF_WEEK[k]]) result.push({ day: DAYS_OF_WEEK[k], intervals: map[DAYS_OF_WEEK[k]] })
    k++
  }
  return result
}

// ─── Input de hora com máscara livre ─────────────────────
// Aceita somente números, formata automaticamente como HH:MM
function TimeInput(props) {
  var id = props.id
  var label = props.label
  var value = props.value       // "HH:MM" ou ""
  var onChange = props.onChange    // recebe "HH:MM" quando válido, "" quando incompleto
  var error = props.error
  var placeholder = props.placeholder || '08:00'

  var rawState = useState(value ? value.replace(':', '') : '')
  var raw = rawState[0]
  var setRaw = rawState[1]

  useEffect(function () {
    setRaw(value ? value.replace(':', '') : '')
  }, [value]) // eslint-disable-line

  function handleChange(ev) {
    var digits = ev.target.value.replace(/\D/g, '').substring(0, 4)
    setRaw(digits)
    if (digits.length === 4) {
      var h = parseInt(digits.substring(0, 2), 10)
      var m = parseInt(digits.substring(2, 4), 10)
      if (h <= 23 && m <= 59) {
        onChange(digits.substring(0, 2) + ':' + digits.substring(2, 4))
        return
      }
    }
    onChange('')
  }

  function display() {
    if (raw.length >= 2) return raw.substring(0, 2) + (raw.length > 2 ? ':' + raw.substring(2) : '')
    return raw
  }

  return React.createElement(
    'div',
    { className: 'w-full' },
    label && React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement('input', {
      id: id,
      type: 'text',
      inputMode: 'numeric',
      value: display(),
      onChange: handleChange,
      placeholder: placeholder,
      maxLength: 5,
      className: ['input font-mono tracking-widest', error ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-400/20' : ''].join(' '),
    }),
    error && React.createElement('p', { className: 'mt-1.5 text-xs text-danger-500 font-medium' }, error)
  )
}

// ─── Linha de intervalo no formulário ────────────────────
function IntervalFormRow(props) {
  var interval = props.interval
  var index = props.index
  var onChange = props.onChange
  var onRemove = props.onRemove
  var errors = props.errors
  var canRemove = props.canRemove

  return React.createElement(
    'div',
    { className: 'flex items-start gap-3' },

    // Número
    React.createElement(
      'div',
      { className: 'w-6 h-6 rounded-full bg-surface-100 flex items-center justify-center shrink-0 ' + (index === 0 ? 'mt-7' : 'mt-2') },
      React.createElement('span', { className: 'text-2xs font-bold text-surface-500' }, String(index + 1))
    ),

    // Campos
    React.createElement(
      'div',
      { className: 'flex items-start gap-2 flex-1' },
      React.createElement(
        'div', { className: 'flex-1' },
        React.createElement(TimeInput, {
          id: 'start-' + index,
          label: index === 0 ? 'Início' : null,
          value: interval.startTime,
          onChange: function (v) { onChange(index, 'startTime', v) },
          error: errors && errors.startTime,
          placeholder: '08:00',
        })
      ),
      React.createElement(
        'div',
        { className: 'flex items-center justify-center shrink-0 ' + (index === 0 ? 'mt-7' : 'mt-2') },
        React.createElement('span', { className: 'text-surface-300 text-sm' }, '–')
      ),
      React.createElement(
        'div', { className: 'flex-1' },
        React.createElement(TimeInput, {
          id: 'end-' + index,
          label: index === 0 ? 'Término' : null,
          value: interval.endTime,
          onChange: function (v) { onChange(index, 'endTime', v) },
          error: errors && errors.endTime,
          placeholder: '12:00',
        })
      )
    ),

    // Remover
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: function () { onRemove(index) },
        disabled: !canRemove,
        className: [
          'shrink-0 p-1.5 rounded-lg transition-colors',
          index === 0 ? 'mt-7' : 'mt-2',
          canRemove ? 'text-surface-400 hover:text-danger-500 hover:bg-danger-50' : 'text-surface-200 cursor-not-allowed',
        ].join(' '),
        'aria-label': 'Remover',
      },
      React.createElement(Icon, { name: 'x', className: 'w-4 h-4' })
    )
  )
}

// ─── Opções de dias ───────────────────────────────────────
function buildDayOptions() {
  var opts = []
  var i = 0
  while (i < DAYS_OF_WEEK.length) {
    opts.push({ value: DAYS_OF_WEEK[i], label: formatDayOfWeek(DAYS_OF_WEEK[i]) })
    i++
  }
  return opts
}
var ALL_DAY_OPTIONS = buildDayOptions()

// ─── Formulário de dia com múltiplos intervalos ───────────
function DayForm(props) {
  var initial = props.initial    // null | { day, intervals:[{id,startTime,endTime}] }
  var onSubmit = props.onSubmit   // (day, rows)
  var onCancel = props.onCancel
  var submitting = props.submitting
  var usedDays = props.usedDays

  function makeRow(s, e) { return { _key: Date.now() + Math.random(), startTime: s || '', endTime: e || '' } }

  var initDay = initial ? initial.day : ''
  var initRows = []
  if (initial && initial.intervals && initial.intervals.length > 0) {
    var ii = 0
    while (ii < initial.intervals.length) {
      initRows.push(makeRow(formatLocalTime(initial.intervals[ii].startTime), formatLocalTime(initial.intervals[ii].endTime)))
      ii++
    }
  } else {
    initRows = [makeRow()]
  }

  var dayState = useState(initDay)
  var day = dayState[0]
  var setDay = dayState[1]

  var rowsState = useState(initRows)
  var rows = rowsState[0]
  var setRows = rowsState[1]

  var errState = useState({})
  var errors = errState[0]
  var setErrors = errState[1]

  var dayDisabled = !!initial

  var dayOptions = []
  var di = 0
  while (di < ALL_DAY_OPTIONS.length) {
    var opt = ALL_DAY_OPTIONS[di]
    if (!usedDays[opt.value] || (initial && opt.value === initial.day)) dayOptions.push(opt)
    di++
  }

  function handleRowChange(idx, field, val) {
    var next = []
    var ri = 0
    while (ri < rows.length) {
      next.push(ri === idx ? Object.assign({}, rows[ri], { [field]: val }) : rows[ri])
      ri++
    }
    setRows(next)
    var ne = Object.assign({}, errors)
    if (ne.rows && ne.rows[idx]) {
      ne.rows = ne.rows.slice()
      ne.rows[idx] = Object.assign({}, ne.rows[idx])
      delete ne.rows[idx][field]
    }
    setErrors(ne)
  }

  function addRow() { setRows(rows.concat([makeRow()])) }

  function removeRow(idx) {
    if (rows.length <= 1) return
    var next = []
    var ri = 0
    while (ri < rows.length) { if (ri !== idx) next.push(rows[ri]); ri++ }
    setRows(next)
  }

  function validate() {
    var e = {}
    if (!day) e.day = 'Selecione um dia da semana'
    var rowErrors = []
    var hasErr = false
    var vi = 0
    while (vi < rows.length) {
      var re = {}
      if (!rows[vi].startTime) re.startTime = 'Obrigatório'
      if (!rows[vi].endTime) re.endTime = 'Obrigatório'
      if (rows[vi].startTime && rows[vi].endTime && rows[vi].startTime >= rows[vi].endTime)
        re.endTime = 'Término deve ser depois do início'
      rowErrors.push(re)
      if (Object.keys(re).length > 0) hasErr = true
      vi++
    }
    if (hasErr) e.rows = rowErrors
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onSubmit(day, rows)
  }

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },
    React.createElement(
      'div', { className: 'space-y-4' },

      React.createElement(Select, {
        id: 'day', label: 'Dia da semana', value: day,
        onChange: function (ev) { setDay(ev.target.value) },
        options: dayOptions, placeholder: 'Selecione o dia…',
        error: errors.day, disabled: dayDisabled,
      }),

      dayDisabled && React.createElement('p', { className: 'text-xs text-surface-400 -mt-2' }, 'Para mudar o dia, remova todos os intervalos e crie um novo.'),

      React.createElement('div', { className: 'divider' }),

      React.createElement(
        'div', { className: 'flex items-center justify-between' },
        React.createElement('p', { className: 'text-xs font-semibold text-surface-500 uppercase tracking-wide' }, 'Intervalos'),
        React.createElement(
          'button', { type: 'button', onClick: addRow, className: 'flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700' },
          React.createElement(Icon, { name: 'plus', className: 'w-3.5 h-3.5' }),
          'Adicionar intervalo'
        )
      ),

      React.createElement(
        'div', { className: 'space-y-2' },
        rows.map(function (row, idx) {
          return React.createElement(IntervalFormRow, {
            key: row._key, interval: row, index: idx,
            onChange: handleRowChange, onRemove: removeRow,
            errors: errors.rows ? errors.rows[idx] : null,
            canRemove: rows.length > 1,
          })
        })
      )
    ),

    React.createElement(
      'div', { className: 'flex justify-end gap-3 mt-6' },
      React.createElement(Button, { variant: 'secondary', onClick: onCancel, disabled: submitting, type: 'button' }, 'Cancelar'),
      React.createElement(Button, { variant: 'primary', type: 'submit', loading: submitting }, initial ? 'Salvar alterações' : 'Adicionar dia')
    )
  )
}

// ─── Modal de copiar para outros dias ────────────────────
function CopyDayModal(props) {
  var open = props.open, onClose = props.onClose, onConfirm = props.onConfirm
  var sourceDay = props.sourceDay, usedDays = props.usedDays, loading = props.loading

  var selState = useState({})
  var selected = selState[0], setSelected = selState[1]

  useEffect(function () { if (open) setSelected({}) }, [open])

  function toggle(d) {
    var next = Object.assign({}, selected)
    if (next[d]) { delete next[d] } else { next[d] = true }
    setSelected(next)
  }

  var targetDays = Object.keys(selected)

  return React.createElement(
    Modal,
    { open: open, onClose: onClose, title: 'Copiar horários', size: 'sm' },
    React.createElement(
      'div', null,
      React.createElement(
        'p', { className: 'text-sm text-surface-500 mb-4' },
        'Selecione os dias que receberão os mesmos intervalos de ',
        React.createElement('strong', null, formatDayOfWeek(sourceDay || '')), '.',
        ' Dias que já têm horário serão substituídos.'
      ),
      React.createElement(
        'div', { className: 'space-y-2 mb-6' },
        DAYS_OF_WEEK.map(function (d) {
          if (d === sourceDay) return null
          var isSel = !!selected[d]
          var hasData = !!usedDays[d]
          return React.createElement(
            'button',
            {
              key: d, type: 'button', onClick: function () { toggle(d) },
              className: [
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
                isSel ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-surface-200 bg-white text-surface-700 hover:border-brand-300',
              ].join(' '),
            },
            React.createElement(
              'div', { className: 'flex items-center gap-2' },
              React.createElement(
                'div',
                { className: ['w-5 h-5 rounded border-2 flex items-center justify-center transition-colors', isSel ? 'bg-brand-600 border-brand-600' : 'border-surface-300'].join(' ') },
                isSel && React.createElement(Icon, { name: 'check', className: 'w-3 h-3 text-white' })
              ),
              formatDayOfWeek(d)
            ),
            hasData && React.createElement('span', { className: 'text-2xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full' }, 'já tem horário')
          )
        })
      ),
      React.createElement(
        'div', { className: 'flex justify-end gap-3' },
        React.createElement(Button, { variant: 'secondary', onClick: onClose, disabled: loading, type: 'button' }, 'Cancelar'),
        React.createElement(
          Button,
          { variant: 'primary', disabled: targetDays.length === 0, loading: loading, onClick: function () { onConfirm(targetDays) } },
          targetDays.length > 0 ? 'Copiar para ' + targetDays.length + ' dia' + (targetDays.length > 1 ? 's' : '') : 'Selecione os dias'
        )
      )
    )
  )
}

// ─── Card de um dia ───────────────────────────────────────
function DayCard(props) {
  var day = props.day, intervals = props.intervals
  var onEdit = props.onEdit, onDelete = props.onDelete, onCopy = props.onCopy

  return React.createElement(
    'div',
    { className: 'bg-white rounded-2xl border border-surface-100 shadow-card p-4 flex flex-col gap-4' },

    // HEADER (mais simples e vertical)
    React.createElement(
      'div',
      { className: 'flex items-center gap-3' },

      React.createElement(
        'div',
        { className: 'w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0' },
        React.createElement(
          'span',
          { className: 'text-xs font-bold text-brand-600' },
          formatDayOfWeek(day).substring(0, 3).toUpperCase()
        )
      ),

      React.createElement(
        'div',
        { className: 'flex flex-col' },
        React.createElement(
          'span',
          { className: 'text-base font-semibold text-surface-900' },
          formatDayOfWeek(day)
        ),
        React.createElement(
          'span',
          { className: 'text-xs text-surface-500' },
          intervals.length + ' intervalo(s)'
        )
      )
    ),

    // INTERVALOS (mais legível)
    React.createElement(
      'div',
      { className: 'flex flex-col gap-2' },

      intervals.map(function (s) {
        return React.createElement(
          'div',
          {
            key: s.id,
            className: 'flex items-center justify-between bg-surface-50 rounded-lg px-3 py-2'
          },

          React.createElement(
            'div',
            { className: 'flex items-center gap-2 text-surface-600' },
            React.createElement(Icon, {
              name: 'clock',
              className: 'w-4 h-4 text-surface-400'
            }),
            React.createElement(
              'span',
              { className: 'font-mono text-sm font-medium' },
              formatLocalTime(s.startTime)
            )
          ),

          React.createElement(
            'span',
            { className: 'text-xs text-surface-400' },
            'até'
          ),

          React.createElement(
            'span',
            { className: 'font-mono text-sm font-medium text-surface-700' },
            formatLocalTime(s.endTime)
          )
        )
      })
    ),

    // AÇÕES (no final)
    React.createElement(
      'div',
      { className: 'flex justify-between gap-2 border-t border-surface-100 pt-3' },

      React.createElement(
        Button,
        {
          size: 'sm',
          variant: 'ghost',
          onClick: function () { onCopy(day) },
          className: 'flex-1'
        },
        React.createElement(Icon, { name: 'copy', className: 'w-4 h-4' }), "Copiar"
      ),

      React.createElement(
        Button,
        {
          size: 'sm',
          variant: 'ghost',
          onClick: function () { onEdit(day) },
          className: 'flex-1'
        },
        React.createElement(Icon, { name: 'edit', className: 'w-4 h-4' }), "Editar"
      ),

      React.createElement(
        Button,
        {
          size: 'sm',
          variant: 'ghost',
          onClick: function () { onDelete(day) },
          className: 'flex-1 text-danger-500'
        },
        React.createElement(Icon, { name: 'trash', className: 'w-4 h-4' }), "Remover"
      )
    )
  )
}

// ─── Modal de confirmação de remoção ─────────────────────
function ConfirmDeleteModal(props) {
  var open = props.open, onClose = props.onClose, onConfirm = props.onConfirm
  var loading = props.loading, dayLabel = props.dayLabel

  return React.createElement(
    Modal, { open: open, onClose: onClose, title: 'Remover dia', size: 'sm' },
    React.createElement(
      'div', null,
      React.createElement('p', { className: 'text-sm text-surface-600 mb-6' }, 'Tem certeza que deseja remover todos os intervalos de ', React.createElement('strong', null, dayLabel), '?'),
      React.createElement(
        'div', { className: 'flex justify-end gap-3' },
        React.createElement(Button, { variant: 'secondary', onClick: onClose, disabled: loading, type: 'button' }, 'Cancelar'),
        React.createElement(Button, { variant: 'danger', loading: loading, onClick: onConfirm }, 'Remover')
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function SchedulePage() {
  var schedulesState = useState([])
  var schedules = schedulesState[0]
  var setSchedules = schedulesState[1]

  var loadingState = useState(true)
  var loading = loadingState[0]
  var setLoading = loadingState[1]

  var errorState = useState(null)
  var error = errorState[0]
  var setError = errorState[1]

  var modalState = useState(false)
  var modalOpen = modalState[0]
  var setModalOpen = modalState[1]

  var editingDayState = useState(null)
  var editingDay = editingDayState[0]
  var setEditingDay = editingDayState[1]

  var submittingState = useState(false)
  var submitting = submittingState[0]
  var setSubmitting = submittingState[1]

  var copyModalState = useState(false)
  var copyModalOpen = copyModalState[0]
  var setCopyModalOpen = copyModalState[1]

  var copySourceState = useState(null)
  var copySource = copySourceState[0]
  var setCopySource = copySourceState[1]

  var copyingState = useState(false)
  var copying = copyingState[0]
  var setCopying = copyingState[1]

  var confirmState = useState(null)
  var confirmTarget = confirmState[0]
  var setConfirmTarget = confirmState[1]

  var deletingState = useState(false)
  var deleting = deletingState[0]
  var setDeleting = deletingState[1]

  var toastHook = useToast()
  var toasts = toastHook.toasts
  var toast = toastHook.toast
  var removeToast = toastHook.removeToast

  var fetchSchedules = useCallback(function () {
    setLoading(true); setError(null)
    scheduleService.list()
      .then(function (res) { setSchedules(res.data || []) })
      .catch(function (err) {
        var msg = 'Erro ao carregar horários.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function () { setLoading(false) })
  }, [])

  useEffect(function () { fetchSchedules() }, [fetchSchedules])

  function buildUsedDays(exceptDay) {
    var map = {}
    var i = 0
    while (i < schedules.length) {
      if (schedules[i].dayOfWeek !== exceptDay) map[schedules[i].dayOfWeek] = true
      i++
    }
    return map
  }

  function closeModal() { if (!submitting) { setModalOpen(false); setEditingDay(null) } }

  // Submete um dia: deleta existentes e recria
  function handleSubmit(day, rows) {
    setSubmitting(true)

    var toDelete = []
    var si = 0
    while (si < schedules.length) {
      if (schedules[si].dayOfWeek === day) toDelete.push(schedules[si].id)
      si++
    }

    function deleteAll(ids, cb) {
      if (ids.length === 0) { cb(); return }
      scheduleService.delete(ids[0]).then(function () { deleteAll(ids.slice(1), cb) }).catch(function () { deleteAll(ids.slice(1), cb) })
    }

    function createAll(list, cb) {
      if (list.length === 0) { cb(); return }
      scheduleService.create({ dayOfWeek: day, startTime: list[0].startTime, endTime: list[0].endTime })
        .then(function () { createAll(list.slice(1), cb) })
        .catch(function (err) {
          var msg = 'Erro ao salvar intervalo.'
          if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
          toast.error(msg)
          createAll(list.slice(1), cb)
        })
    }

    deleteAll(toDelete, function () {
      createAll(rows, function () {
        toast(editingDay ? 'Horários atualizados!' : 'Horários adicionados!')
        closeModal()
        fetchSchedules()
        setSubmitting(false)
      })
    })
  }

  // Remoção do dia inteiro
  function handleDelete() {
    if (!confirmTarget) return
    setDeleting(true)
    var toDelete = []
    var si = 0
    while (si < schedules.length) {
      if (schedules[si].dayOfWeek === confirmTarget.day) toDelete.push(schedules[si].id)
      si++
    }
    function deleteAll(ids) {
      if (ids.length === 0) {
        toast.warning('Horários de ' + confirmTarget.label + ' removidos.')
        setConfirmTarget(null)
        fetchSchedules()
        setDeleting(false)
        return
      }
      scheduleService.delete(ids[0]).then(function () { deleteAll(ids.slice(1)) }).catch(function () { deleteAll(ids.slice(1)) })
    }
    deleteAll(toDelete)
  }

  // Cópia de intervalos para outros dias
  function handleCopy(targetDays) {
    setCopying(true)
    var sourceIntervals = []
    var si = 0
    while (si < schedules.length) {
      if (schedules[si].dayOfWeek === copySource) sourceIntervals.push(schedules[si])
      si++
    }

    function processDay(days, cb) {
      if (days.length === 0) { cb(); return }
      var targetDay = days[0]
      var toDelete = []
      var di = 0
      while (di < schedules.length) {
        if (schedules[di].dayOfWeek === targetDay) toDelete.push(schedules[di].id)
        di++
      }
      function deleteAll(ids, next) {
        if (ids.length === 0) { next(); return }
        scheduleService.delete(ids[0]).then(function () { deleteAll(ids.slice(1), next) }).catch(function () { deleteAll(ids.slice(1), next) })
      }
      function createAll(list, next) {
        if (list.length === 0) { next(); return }
        scheduleService.create({ dayOfWeek: targetDay, startTime: list[0].startTime, endTime: list[0].endTime })
          .then(function () { createAll(list.slice(1), next) })
          .catch(function () { createAll(list.slice(1), next) })
      }
      deleteAll(toDelete, function () { createAll(sourceIntervals, function () { processDay(days.slice(1), cb) }) })
    }

    processDay(targetDays, function () {
      var count = targetDays.length
      toast('Horários copiados para ' + count + ' dia' + (count > 1 ? 's' : '') + '!')
      setCopyModalOpen(false)
      fetchSchedules()
      setCopying(false)
    })
  }

  var grouped = groupByDay(schedules)
  var usedDays = buildUsedDays(null)
  var allFull = grouped.length >= DAYS_OF_WEEK.length

  // Dados do dia sendo editado
  var editingInitial = null
  if (editingDay) {
    var editIntervals = []
    var ei = 0
    while (ei < schedules.length) {
      if (schedules[ei].dayOfWeek === editingDay) editIntervals.push(schedules[ei])
      ei++
    }
    editIntervals.sort(function (a, b) { return a.startTime.localeCompare(b.startTime) })
    editingInitial = { day: editingDay, intervals: editIntervals }
  }

  return React.createElement(
    'div',
    { className: 'min-h-full bg-surface-50' },

    // ── Cabeçalho ─────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'sticky top-0 z-10 bg-surface-50/95 backdrop-blur-sm border-b border-surface-100 px-4 py-4' },

      React.createElement(
        'div',
        { className: 'flex flex-col' },

        // Linha principal (título + botão)
        React.createElement(
          'div',
          { className: 'flex items-center justify-between gap-3' },

          React.createElement(
            'h1',
            { className: 'font-display text-xl font-bold text-surface-900 leading-tight' },
            'Horários de atendimento'
          ),

          !allFull && React.createElement(
            Button,
            {
              variant: 'primary',
              size: 'sm',
              onClick: function () {
                setEditingDay(null)
                setModalOpen(true)
              }
            },
            React.createElement(Icon, { name: 'plus', className: 'w-4 h-8' }), "Novo"
          )
        ),

        // Subtexto separado
        !loading && React.createElement(
          'p',
          { className: 'text-xs font-bold text-surface-400' },
          grouped.length + ' ' + (grouped.length === 1 ? 'dia ' : 'dias definidos')
        )
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-2xl mx-auto' },

      loading && React.createElement(
        'div', { className: 'flex flex-col items-center justify-center py-20 gap-3' },
        React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando horários…')
      ),

      !loading && error && React.createElement(
        'div', { className: 'alert-error' }, error,
        React.createElement('button', { onClick: fetchSchedules, className: 'ml-auto text-xs underline font-semibold' }, 'Tentar novamente')
      ),

      !loading && !error && grouped.length === 0 && React.createElement(EmptyState, {
        title: 'Nenhum horário configurado',
        message: 'Defina os dias e intervalos em que sua empresa atende.',
        action: { label: 'Adicionar dia', onClick: function () { setEditingDay(null); setModalOpen(true) } },
      }),

      !loading && !error && grouped.length > 0 && React.createElement(
        'div', { className: 'space-y-4' },
        grouped.map(function (group) {
          return React.createElement(DayCard, {
            key: group.day, day: group.day, intervals: group.intervals,
            onEdit: function (d) { setEditingDay(d); setModalOpen(true) },
            onDelete: function (d) { setConfirmTarget({ day: d, label: formatDayOfWeek(d) }) },
            onCopy: function (d) { setCopySource(d); setCopyModalOpen(true) },
          })
        }),
        allFull && React.createElement('p', { className: 'text-center text-xs text-surface-400 pt-2' }, 'Todos os dias da semana já foram configurados.')
      )
    ),

    // ── Modal criar/editar ────────────────────────────────
    React.createElement(
      Modal,
      { open: modalOpen, onClose: closeModal, title: editingDay ? 'Editar ' + formatDayOfWeek(editingDay) : 'Adicionar dia', size: 'sm' },
      modalOpen && React.createElement(DayForm, {
        initial: editingInitial, onSubmit: handleSubmit, onCancel: closeModal,
        submitting: submitting, usedDays: buildUsedDays(editingDay),
      })
    ),

    // ── Modal copiar ──────────────────────────────────────
    React.createElement(CopyDayModal, {
      open: copyModalOpen, onClose: function () { if (!copying) setCopyModalOpen(false) },
      onConfirm: handleCopy, sourceDay: copySource, usedDays: usedDays, loading: copying,
    }),

    // ── Modal confirmar exclusão ──────────────────────────
    React.createElement(ConfirmDeleteModal, {
      open: !!confirmTarget, onClose: function () { if (!deleting) setConfirmTarget(null) },
      onConfirm: handleDelete, loading: deleting, dayLabel: confirmTarget ? confirmTarget.label : '',
    }),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default SchedulePage