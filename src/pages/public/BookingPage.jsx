import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import publicService from '../../services/publicService.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { formatCurrency, formatPhone } from '../../utils/format.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    check:    'M5 13l4 4L19 7',
    clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    tag:      'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    user:     'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    back:     'M10 19l-7-7m0 0l7-7m-7 7h18',
    phone:    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
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

// ─── Stepper ──────────────────────────────────────────────
var STEPS = ['Serviço', 'Profissional', 'Data & Hora', 'Seus dados']

function Stepper(props) {
  var current = props.current   // 0-based

  return React.createElement(
    'div',
    { className: 'flex items-center justify-center gap-0 mb-8' },
    STEPS.map(function(label, idx) {
      var done    = idx < current
      var active  = idx === current
      var last    = idx === STEPS.length - 1

      return React.createElement(
        'div',
        { key: label, className: 'flex items-center' },

        // Círculo
        React.createElement(
          'div',
          { className: 'flex flex-col items-center gap-1' },
          React.createElement(
            'div',
            {
              className: [
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200',
                done   ? 'bg-brand-600 text-white' : '',
                active ? 'bg-brand-600 text-white ring-4 ring-brand-100' : '',
                !done && !active ? 'bg-surface-200 text-surface-400' : '',
              ].join(' '),
            },
            done
              ? React.createElement(Icon, { name: 'check', className: 'w-4 h-4' })
              : String(idx + 1)
          ),
          React.createElement(
            'span',
            {
              className: [
                'text-2xs font-medium whitespace-nowrap',
                active ? 'text-brand-600' : 'text-surface-400',
              ].join(' '),
            },
            label
          )
        ),

        // Linha entre steps
        !last && React.createElement(
          'div',
          {
            className: [
              'h-px w-8 mb-4 transition-all duration-200',
              done ? 'bg-brand-600' : 'bg-surface-200',
            ].join(' '),
          }
        )
      )
    })
  )
}

// ─── Card de opção selecionável ───────────────────────────
function OptionCard(props) {
  var selected  = props.selected
  var onClick   = props.onClick
  var children  = props.children
  var disabled  = props.disabled

  return React.createElement(
    'button',
    {
      type:      'button',
      onClick:   onClick,
      disabled:  disabled,
      className: [
        'w-full text-left rounded-2xl border p-4 transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        selected
          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
          : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-surface-50',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' '),
    },
    children
  )
}

// ─── Etapa 1: Serviço ──────────────────────────────────────
function StepProduct(props) {
  var products   = props.products
  var selected   = props.selected
  var onSelect   = props.onSelect
  var onNext     = props.onNext

  return React.createElement(
    'div',
    null,
    React.createElement('h2', { className: 'text-base font-semibold text-surface-900 mb-4' }, 'Escolha o serviço'),

    React.createElement(
      'div',
      { className: 'space-y-3 mb-6' },
      products.map(function(product) {
        var isSelected = selected && selected.id === product.id
        return React.createElement(
          OptionCard,
          { key: product.id, selected: isSelected, onClick: function() { onSelect(product) } },
          React.createElement(
            'div',
            { className: 'flex items-start justify-between gap-3' },
            React.createElement(
              'div',
              { className: 'min-w-0' },
              React.createElement('p', { className: 'text-sm font-semibold text-surface-900' }, product.name),
              product.description && React.createElement(
                'p',
                { className: 'text-xs text-surface-400 mt-0.5 line-clamp-2' },
                product.description
              )
            ),
            React.createElement(
              'div',
              { className: 'shrink-0 text-right' },
              React.createElement(
                'p',
                { className: 'font-mono text-sm font-bold text-brand-700' },
                formatCurrency(product.price)
              ),
              React.createElement(
                'p',
                { className: 'text-2xs text-surface-400 flex items-center gap-1 justify-end mt-0.5' },
                React.createElement(Icon, { name: 'clock', className: 'w-3 h-3' }),
                product.durationMinutes + ' min'
              )
            )
          )
        )
      })
    ),

    React.createElement(
      Button,
      {
        variant:   'primary',
        className: 'w-full',
        disabled:  !selected,
        onClick:   onNext,
      },
      'Continuar'
    )
  )
}

// ─── Etapa 2: Profissional ────────────────────────────────
function StepProfessional(props) {
  var professionals = props.professionals
  var selected      = props.selected
  var onSelect      = props.onSelect
  var onNext        = props.onNext
  var onBack        = props.onBack
  var loading       = props.loading

  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex flex-col items-center py-12 gap-3' },
      React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
      React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando profissionais…')
    )
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h2', { className: 'text-base font-semibold text-surface-900 mb-4' }, 'Escolha o profissional'),

    professionals.length === 0 && React.createElement(
      'div',
      { className: 'alert-error mb-4' },
      'Nenhum profissional disponível para este serviço no momento.'
    ),

    React.createElement(
      'div',
      { className: 'space-y-3 mb-6' },
      professionals.map(function(pro) {
        var isSelected = selected && selected.id === pro.id
        return React.createElement(
          OptionCard,
          { key: pro.id, selected: isSelected, onClick: function() { onSelect(pro) } },
          React.createElement(
            'div',
            { className: 'flex items-center gap-3' },
            React.createElement(
              'div',
              { className: 'w-9 h-9 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0' },
              React.createElement(
                'span',
                { className: 'text-xs font-bold text-brand-600' },
                pro.name.charAt(0).toUpperCase()
              )
            ),
            React.createElement('p', { className: 'text-sm font-semibold text-surface-900' }, pro.name)
          )
        )
      })
    ),

    React.createElement(
      'div',
      { className: 'flex gap-3' },
      React.createElement(
        Button,
        { variant: 'secondary', onClick: onBack },
        React.createElement(Icon, { name: 'back', className: 'w-4 h-4' }),
        'Voltar'
      ),
      React.createElement(
        Button,
        {
          variant:   'primary',
          className: 'flex-1',
          disabled:  !selected || professionals.length === 0,
          onClick:   onNext,
        },
        'Continuar'
      )
    )
  )
}

// ─── Geração de datas disponíveis (próximos 30 dias) ──────
function buildDateOptions() {
  var options = []
  var now = new Date()
  var i = 0
  while (i < 30) {
    var d = new Date(now)
    d.setDate(now.getDate() + i)
    var year  = d.getFullYear()
    var month = String(d.getMonth() + 1).padStart(2, '0')
    var day   = String(d.getDate()).padStart(2, '0')
    var iso   = year + '-' + month + '-' + day
    var label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
    options.push({ iso: iso, label: label, dow: d.getDay() }) // getDay: 0=dom
    i++
  }
  return options
}

var DATE_OPTIONS = buildDateOptions()

// ─── Etapa 3: Data & Hora ─────────────────────────────────
function StepDateTime(props) {
  var slug           = props.slug
  var professionalId = props.professionalId
  var productId      = props.productId
  var selectedDate   = props.selectedDate
  var selectedTime   = props.selectedTime
  var onSelectDate   = props.onSelectDate
  var onSelectTime   = props.onSelectTime
  var onNext         = props.onNext
  var onBack         = props.onBack

  var slotsState   = useState([])
  var slots        = slotsState[0]
  var setSlots     = slotsState[1]

  var loadingState = useState(false)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  var errorState   = useState(null)
  var error        = errorState[0]
  var setError     = errorState[1]

  var fetchSlots = useCallback(function(date) {
    setLoading(true)
    setError(null)
    setSlots([])
    onSelectTime(null)
    publicService.getAvailableSlots(slug, professionalId, productId, date)
      .then(function(res) { setSlots(res.data.slots || []) })
      .catch(function(err) {
        var msg = 'Erro ao buscar horários.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [slug, professionalId, productId])  // eslint-disable-line

  function handleDateSelect(iso) {
    onSelectDate(iso)
    fetchSlots(iso)
  }

  // Formata "HH:MM:SS" → "HH:MM"
  function fmt(t) {
    if (!t) return ''
    return t.substring(0, 5)
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h2', { className: 'text-base font-semibold text-surface-900 mb-4' }, 'Escolha a data'),

    // Seletor de datas — scroll horizontal
    React.createElement(
      'div',
      { className: 'flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1' },
      DATE_OPTIONS.map(function(opt) {
        var isSelected = selectedDate === opt.iso
        return React.createElement(
          'button',
          {
            key:       opt.iso,
            type:      'button',
            onClick:   function() { handleDateSelect(opt.iso) },
            className: [
              'flex flex-col items-center shrink-0 w-16 py-2 rounded-xl border text-xs font-medium transition-all duration-150',
              isSelected
                ? 'border-brand-500 bg-brand-600 text-white'
                : 'border-surface-200 bg-white text-surface-600 hover:border-brand-300',
            ].join(' '),
          },
          React.createElement('span', { className: 'text-2xs opacity-70 capitalize' }, opt.label.split(',')[0]),
          React.createElement(
            'span',
            { className: 'text-base font-bold mt-0.5' },
            opt.label.split(',')[1] ? opt.label.split(',')[1].trim().split(' ')[0] : ''
          ),
          React.createElement(
            'span',
            { className: 'text-2xs opacity-70 capitalize' },
            opt.label.split(' ').pop()
          )
        )
      })
    ),

    // Horários disponíveis
    selectedDate && React.createElement(
      'div',
      { className: 'mb-6' },
      React.createElement('h2', { className: 'text-base font-semibold text-surface-900 mb-3' }, 'Horários disponíveis'),

      loading && React.createElement(
        'div',
        { className: 'flex items-center gap-2 text-sm text-surface-400 py-4' },
        React.createElement(Spinner, { size: 'sm', className: 'text-brand-500' }),
        'Buscando horários…'
      ),

      !loading && error && React.createElement(
        'p',
        { className: 'text-sm text-danger-500' },
        error
      ),

      !loading && !error && slots.length === 0 && React.createElement(
        'p',
        { className: 'text-sm text-surface-400' },
        'Nenhum horário disponível para esta data.'
      ),

      !loading && !error && slots.length > 0 && React.createElement(
        'div',
        { className: 'grid grid-cols-4 gap-2' },
        slots.map(function(slot) {
          var isSelected = selectedTime === slot
          return React.createElement(
            'button',
            {
              key:       slot,
              type:      'button',
              onClick:   function() { onSelectTime(slot) },
              className: [
                'py-2 rounded-xl border text-xs font-mono font-semibold transition-all duration-150',
                isSelected
                  ? 'border-brand-500 bg-brand-600 text-white'
                  : 'border-surface-200 bg-white text-surface-700 hover:border-brand-300',
              ].join(' '),
            },
            fmt(slot)
          )
        })
      )
    ),

    React.createElement(
      'div',
      { className: 'flex gap-3' },
      React.createElement(
        Button,
        { variant: 'secondary', onClick: onBack },
        React.createElement(Icon, { name: 'back', className: 'w-4 h-4' }),
        'Voltar'
      ),
      React.createElement(
        Button,
        {
          variant:   'primary',
          className: 'flex-1',
          disabled:  !selectedDate || !selectedTime,
          onClick:   onNext,
        },
        'Continuar'
      )
    )
  )
}

// ─── Etapa 4: Dados do cliente ────────────────────────────
function StepCustomer(props) {
  var onSubmit   = props.onSubmit
  var onBack     = props.onBack
  var submitting = props.submitting

  var formState  = useState({ customerName: '', customerPhone: '' })
  var form       = formState[0]
  var setForm    = formState[1]

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
    if (!form.customerName.trim())  e.customerName  = 'Nome é obrigatório'
    if (!form.customerPhone.trim()) e.customerPhone = 'Telefone é obrigatório'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onSubmit(form)
  }

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },
    React.createElement('h2', { className: 'text-base font-semibold text-surface-900 mb-4' }, 'Seus dados'),

    React.createElement(
      'div',
      { className: 'space-y-4 mb-6' },
      React.createElement(Input, {
        id:          'customerName',
        label:       'Seu nome',
        type:        'text',
        value:       form.customerName,
        onChange:    function(ev) { set('customerName', ev.target.value) },
        placeholder: 'Ex: Maria Souza',
        error:       errors.customerName,
        required:    true,
      }),
      React.createElement(Input, {
        id:          'customerPhone',
        label:       'Seu telefone (WhatsApp)',
        type:        'tel',
        value:       form.customerPhone,
        onChange:    function(ev) { set('customerPhone', ev.target.value) },
        placeholder: '(11) 99999-9999',
        error:       errors.customerPhone,
        required:    true,
        hint:        'Usado para confirmar e lembrar seu agendamento.',
      })
    ),

    React.createElement(
      'div',
      { className: 'flex gap-3' },
      React.createElement(
        Button,
        { variant: 'secondary', onClick: onBack, type: 'button', disabled: submitting },
        React.createElement(Icon, { name: 'back', className: 'w-4 h-4' }),
        'Voltar'
      ),
      React.createElement(
        Button,
        { variant: 'primary', className: 'flex-1', type: 'submit', loading: submitting },
        'Confirmar agendamento'
      )
    )
  )
}

// ─── Resumo da seleção (exibido acima dos steps 2–4) ──────
function SelectionSummary(props) {
  var product      = props.product
  var professional = props.professional
  var date         = props.date
  var time         = props.time

  if (!product) return null

  var items = []

  if (product) items.push({
    icon: 'tag',
    label: product.name + ' · ' + formatCurrency(product.price) + ' · ' + product.durationMinutes + ' min',
  })
  if (professional) items.push({ icon: 'user',     label: professional.name })
  if (date)         items.push({ icon: 'calendar',  label: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) })
  if (time)         items.push({ icon: 'clock',     label: time.substring(0, 5) })

  return React.createElement(
    'div',
    { className: 'bg-surface-50 rounded-xl border border-surface-100 px-4 py-3 mb-6 space-y-1.5' },
    items.map(function(item, idx) {
      return React.createElement(
        'div',
        { key: idx, className: 'flex items-center gap-2 text-xs text-surface-600' },
        React.createElement(Icon, { name: item.icon, className: 'w-3.5 h-3.5 text-brand-500 shrink-0' }),
        React.createElement('span', null, item.label)
      )
    })
  )
}

// ─── Tela de sucesso ──────────────────────────────────────
function SuccessScreen(props) {
  var product      = props.product
  var professional = props.professional
  var date         = props.date
  var time         = props.time
  var companyName  = props.companyName

  var dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })

  return React.createElement(
    'div',
    { className: 'flex flex-col items-center text-center gap-4 py-8' },

    React.createElement(
      'div',
      { className: 'w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center' },
      React.createElement(Icon, { name: 'check', className: 'w-8 h-8 text-brand-600' })
    ),

    React.createElement(
      'div',
      null,
      React.createElement(
        'h2',
        { className: 'font-display text-xl font-bold text-surface-900 mb-1' },
        'Agendamento confirmado!'
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-surface-400' },
        'Nos vemos em breve em ' + companyName + '.'
      )
    ),

    React.createElement(
      'div',
      { className: 'bg-surface-50 rounded-2xl border border-surface-100 w-full px-5 py-4 space-y-3 text-left' },

      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(Icon, { name: 'tag',      className: 'w-4 h-4 text-brand-500 shrink-0' }),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold' }, 'Serviço'),
          React.createElement('p', { className: 'text-sm font-semibold text-surface-900' }, product.name)
        )
      ),

      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(Icon, { name: 'user',     className: 'w-4 h-4 text-brand-500 shrink-0' }),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold' }, 'Profissional'),
          React.createElement('p', { className: 'text-sm font-semibold text-surface-900' }, professional.name)
        )
      ),

      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(Icon, { name: 'calendar', className: 'w-4 h-4 text-brand-500 shrink-0' }),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold' }, 'Data'),
          React.createElement('p', { className: 'text-sm font-semibold text-surface-900 capitalize' }, dateLabel)
        )
      ),

      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(Icon, { name: 'clock',    className: 'w-4 h-4 text-brand-500 shrink-0' }),
        React.createElement('div', null,
          React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold' }, 'Horário'),
          React.createElement('p', { className: 'text-sm font-semibold text-surface-900 font-mono' }, time.substring(0, 5))
        )
      )
    ),

    React.createElement(
      'p',
      { className: 'text-xs text-surface-400' },
      'Se precisar cancelar, use o link enviado para o seu e-mail (caso tenha cadastrado).'
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function BookingPage() {
  var params = useParams()
  var slug   = params.slug

  // Dados da empresa
  var companyState   = useState(null)
  var company        = companyState[0]
  var setCompany     = companyState[1]

  // Produtos
  var productsState  = useState([])
  var products       = productsState[0]
  var setProducts    = productsState[1]

  // Estado global de loading/erro inicial
  var loadingState   = useState(true)
  var loading        = loadingState[0]
  var setLoading     = loadingState[1]

  var errorState     = useState(null)
  var error          = errorState[0]
  var setError       = errorState[1]

  // Etapa atual
  var stepState      = useState(0)
  var step           = stepState[0]
  var setStep        = stepState[1]

  // Seleções
  var productState       = useState(null)
  var selectedProduct    = productState[0]
  var setSelectedProduct = productState[1]

  var prosState          = useState([])
  var professionals      = prosState[0]
  var setProfessionals   = prosState[1]

  var prosLoadState      = useState(false)
  var prosLoading        = prosLoadState[0]
  var setProsLoading     = prosLoadState[1]

  var proState           = useState(null)
  var selectedPro        = proState[0]
  var setSelectedPro     = proState[1]

  var dateState          = useState(null)
  var selectedDate       = dateState[0]
  var setSelectedDate    = dateState[1]

  var timeState          = useState(null)
  var selectedTime       = timeState[0]
  var setSelectedTime    = timeState[1]

  var submittingState    = useState(false)
  var submitting         = submittingState[0]
  var setSubmitting      = submittingState[1]

  var doneState          = useState(false)
  var done               = doneState[0]
  var setDone            = doneState[1]

  // Carrega produtos da empresa
  useEffect(function() {
    setLoading(true)
    publicService.listProducts(slug)
      .then(function(res) {
        setProducts(res.data || [])
        // Tenta pegar o nome da empresa de um header ou de outra forma
        // Por ora usa o slug capitalizado
        setCompany({ name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') })
      })
      .catch(function(err) {
        var msg = 'Empresa não encontrada ou inativa.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [slug])

  // Ao avançar da etapa 1: carrega profissionais
  function handleProductNext() {
    setStep(1)
    setProsLoading(true)
    setSelectedPro(null)
    publicService.listProfessionals(slug, selectedProduct.id)
      .then(function(res) { setProfessionals(res.data || []) })
      .catch(function() { setProfessionals([]) })
      .finally(function() { setProsLoading(false) })
  }

  function handleProfessionalNext() {
    setStep(2)
    setSelectedDate(null)
    setSelectedTime(null)
  }

  function handleDateTimeNext() {
    setStep(3)
  }

  function handleSubmit(customerData) {
    setSubmitting(true)

    // Monta o payload conforme AppointmentRequest
    var payload = {
      professionalId: selectedPro.id,
      productId:      selectedProduct.id,
      date:           selectedDate,
      startTime:      selectedTime.substring(0, 5),
      customerName:   customerData.customerName,
      customerPhone:  customerData.customerPhone,
    }

    publicService.createAppointment(slug, payload)
      .then(function() { setDone(true) })
      .catch(function(err) {
        var msg = 'Erro ao confirmar agendamento.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setSubmitting(false) })
  }

  // ── Estados de loading / erro inicial ────────────────────
  if (loading) {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh flex items-center justify-center bg-surface-50' },
      React.createElement(
        'div',
        { className: 'flex flex-col items-center gap-3' },
        React.createElement(Spinner, { size: 'xl', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando…')
      )
    )
  }

  if (error && !done) {
    return React.createElement(
      'div',
      { className: 'min-h-screen-dvh flex items-center justify-center bg-surface-50 p-6' },
      React.createElement(
        'div',
        { className: 'text-center max-w-xs' },
        React.createElement(
          'p',
          { className: 'font-display text-4xl font-bold text-surface-200 mb-4' },
          ':('
        ),
        React.createElement('p', { className: 'text-sm font-semibold text-surface-700 mb-1' }, 'Algo deu errado'),
        React.createElement('p', { className: 'text-sm text-surface-400' }, error)
      )
    )
  }

  // ── Layout principal ──────────────────────────────────────
  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh bg-surface-50' },

    // Header
    React.createElement(
      'div',
      { className: 'bg-white border-b border-surface-100 px-5 py-4 text-center' },
      React.createElement(
        'p',
        { className: 'text-xs text-surface-400 uppercase tracking-widest font-semibold mb-0.5' },
        'Agendamento online'
      ),
      React.createElement(
        'h1',
        { className: 'font-display text-xl font-bold text-surface-900' },
        company ? company.name : slug
      )
    ),

    // Conteúdo
    React.createElement(
      'div',
      { className: 'max-w-md mx-auto px-5 py-6' },

      // Tela de sucesso
      done && React.createElement(SuccessScreen, {
        product:      selectedProduct,
        professional: selectedPro,
        date:         selectedDate,
        time:         selectedTime,
        companyName:  company ? company.name : slug,
      }),

      // Fluxo de agendamento
      !done && React.createElement(
        'div',
        null,
        React.createElement(Stepper, { current: step }),

        step > 0 && React.createElement(SelectionSummary, {
          product:      selectedProduct,
          professional: step > 1 ? selectedPro  : null,
          date:         step > 2 ? selectedDate  : null,
          time:         step > 2 ? selectedTime  : null,
        }),

        step === 0 && React.createElement(StepProduct, {
          products:  products,
          selected:  selectedProduct,
          onSelect:  setSelectedProduct,
          onNext:    handleProductNext,
        }),

        step === 1 && React.createElement(StepProfessional, {
          professionals: professionals,
          selected:      selectedPro,
          onSelect:      setSelectedPro,
          onNext:        handleProfessionalNext,
          onBack:        function() { setStep(0) },
          loading:       prosLoading,
        }),

        step === 2 && React.createElement(StepDateTime, {
          slug:           slug,
          professionalId: selectedPro ? selectedPro.id : null,
          productId:      selectedProduct ? selectedProduct.id : null,
          selectedDate:   selectedDate,
          selectedTime:   selectedTime,
          onSelectDate:   setSelectedDate,
          onSelectTime:   setSelectedTime,
          onNext:         handleDateTimeNext,
          onBack:         function() { setStep(1) },
        }),

        step === 3 && React.createElement(StepCustomer, {
          onSubmit:   handleSubmit,
          onBack:     function() { setStep(2) },
          submitting: submitting,
        })
      )
    )
  )
}

export default BookingPage