import React, { useState, useEffect, useCallback } from 'react'
import productService from '../../services/productService.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import { formatCurrency } from '../../utils/format.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    plus:    'M12 4v16m8-8H4',
    edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    disable: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    enable:  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    clock:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    tag:     'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
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

// ─── Badge ativo/inativo ──────────────────────────────────
function ActiveBadge(props) {
  var active = props.active
  if (active) {
    return React.createElement('span', { className: 'badge-success' }, 'Ativo')
  }
  return React.createElement('span', { className: 'badge-neutral' }, 'Inativo')
}

// ─── Card de produto ──────────────────────────────────────
function ProductCard(props) {
  var product    = props.product
  var onEdit     = props.onEdit
  var onDisable  = props.onDisable
  var onEnable   = props.onEnable
  var loadingId  = props.loadingId

  var isLoading = loadingId === product.id

  return React.createElement(
    'div',
    {
      className: [
        'bg-white rounded-2xl border border-surface-100 shadow-card p-5',
        'transition-shadow duration-200 hover:shadow-card-md',
        !product.active ? 'opacity-60' : '',
      ].join(' '),
    },

    // Cabeçalho
    React.createElement(
      'div',
      { className: 'flex items-start justify-between gap-3 mb-3' },
      React.createElement(
        'div',
        { className: 'min-w-0' },
        React.createElement(
          'h3',
          { className: 'font-semibold text-surface-900 truncate text-sm' },
          product.name
        ),
        product.description && React.createElement(
          'p',
          { className: 'text-xs text-surface-400 mt-0.5 line-clamp-2' },
          product.description
        )
      ),
      React.createElement(ActiveBadge, { active: product.active })
    ),

    // Infos
    React.createElement(
      'div',
      { className: 'flex items-center gap-4 mb-4' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-1.5 text-surface-600' },
        React.createElement(Icon, { name: 'tag', className: 'w-3.5 h-3.5 text-surface-400' }),
        React.createElement(
          'span',
          { className: 'font-mono text-sm font-medium text-brand-700' },
          formatCurrency(product.price)
        )
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-1.5 text-surface-500' },
        React.createElement(Icon, { name: 'clock', className: 'w-3.5 h-3.5 text-surface-400' }),
        React.createElement(
          'span',
          { className: 'text-xs font-medium' },
          product.durationMinutes + ' min'
        )
      )
    ),

    // Ações
    React.createElement(
      'div',
      { className: 'flex items-center gap-2 pt-3 border-t border-surface-100' },

      React.createElement(
        Button,
        {
          size: 'sm',
          variant: 'ghost',
          onClick: function() { onEdit(product) },
          disabled: isLoading,
        },
        React.createElement(Icon, { name: 'edit', className: 'w-3.5 h-3.5' }),
        'Editar'
      ),

      product.active
        ? React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              loading: isLoading,
              disabled: isLoading,
              className: 'text-danger-500 hover:bg-danger-50 hover:text-danger-600',
              onClick: function() { onDisable(product.id) },
            },
            React.createElement(Icon, { name: 'disable', className: 'w-3.5 h-3.5' }),
            'Desativar'
          )
        : React.createElement(
            Button,
            {
              size: 'sm',
              variant: 'ghost',
              loading: isLoading,
              disabled: isLoading,
              className: 'text-brand-600 hover:bg-brand-50',
              onClick: function() { onEnable(product.id) },
            },
            React.createElement(Icon, { name: 'enable', className: 'w-3.5 h-3.5' }),
            'Ativar'
          )
    )
  )
}

// ─── Formulário de produto ────────────────────────────────
var EMPTY_FORM = { name: '', description: '', price: '', durationMinutes: '' }

function ProductForm(props) {
  var initial    = props.initial    // produto sendo editado, ou null
  var onSubmit   = props.onSubmit
  var onCancel   = props.onCancel
  var submitting = props.submitting

  var formState  = useState(initial
    ? {
        name:            initial.name            || '',
        description:     initial.description     || '',
        price:           initial.price !== undefined ? String(initial.price) : '',
        durationMinutes: initial.durationMinutes !== undefined ? String(initial.durationMinutes) : '',
      }
    : EMPTY_FORM
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
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    var price = parseFloat(form.price)
    if (!form.price || isNaN(price) || price < 0.01) e.price = 'Preço deve ser maior que zero'
    var dur = parseInt(form.durationMinutes, 10)
    if (!form.durationMinutes || isNaN(dur) || dur <= 0) e.durationMinutes = 'Duração deve ser maior que zero'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) {
      setErrors(e2)
      return
    }
    onSubmit({
      name:            form.name.trim(),
      description:     form.description.trim() || null,
      price:           parseFloat(form.price),
      durationMinutes: parseInt(form.durationMinutes, 10),
    })
  }

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },
    React.createElement(
      'div',
      { className: 'space-y-4' },

      React.createElement(Input, {
        id:          'name',
        label:       'Nome do serviço',
        type:        'text',
        value:       form.name,
        onChange:    function(ev) { set('name', ev.target.value) },
        placeholder: 'Ex: Corte de cabelo',
        error:       errors.name,
        required:    true,
      }),

      React.createElement(
        'div',
        { className: 'w-full' },
        React.createElement('label', { htmlFor: 'description', className: 'label' }, 'Descrição (opcional)'),
        React.createElement('textarea', {
          id:          'description',
          value:       form.description,
          onChange:    function(ev) { set('description', ev.target.value) },
          placeholder: 'Descreva o serviço brevemente…',
          rows:        3,
          className:   'input resize-none',
        })
      ),

      React.createElement(
        'div',
        { className: 'grid grid-cols-2 gap-4' },

        React.createElement(Input, {
          id:          'price',
          label:       'Preço (R$)',
          type:        'number',
          min:         '0.01',
          step:        '0.01',
          value:       form.price,
          onChange:    function(ev) { set('price', ev.target.value) },
          placeholder: '0,00',
          error:       errors.price,
          required:    true,
        }),

        React.createElement(Input, {
          id:          'durationMinutes',
          label:       'Duração (minutos)',
          type:        'number',
          min:         '1',
          step:        '1',
          value:       form.durationMinutes,
          onChange:    function(ev) { set('durationMinutes', ev.target.value) },
          placeholder: '30',
          error:       errors.durationMinutes,
          required:    true,
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
        initial ? 'Salvar alterações' : 'Criar serviço'
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function ProductsPage() {
  var productsState = useState([])
  var products      = productsState[0]
  var setProducts   = productsState[1]

  var loadingState  = useState(true)
  var loading       = loadingState[0]
  var setLoading    = loadingState[1]

  var errorState    = useState(null)
  var error         = errorState[0]
  var setError      = errorState[1]

  var modalState    = useState(false)   // true = aberto
  var modalOpen     = modalState[0]
  var setModalOpen  = modalState[1]

  var editingState  = useState(null)    // produto sendo editado, ou null = criação
  var editing       = editingState[0]
  var setEditing    = editingState[1]

  var submittingState = useState(false)
  var submitting      = submittingState[0]
  var setSubmitting   = submittingState[1]

  var loadingIdState  = useState(null)  // id do produto sofrendo ação de ativar/desativar
  var loadingId       = loadingIdState[0]
  var setLoadingId    = loadingIdState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  var fetchProducts = useCallback(function() {
    setLoading(true)
    setError(null)
    productService.list()
      .then(function(res) { setProducts(res.data || []) })
      .catch(function(err) {
        var msg = 'Erro ao carregar serviços.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { fetchProducts() }, [fetchProducts])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setEditing(null)
  }

  function handleSubmit(data) {
    setSubmitting(true)
    var promise = editing
      ? productService.update(editing.id, data)
      : productService.create(data)

    promise
      .then(function() {
        toast(editing ? 'Serviço atualizado!' : 'Serviço criado!')
        closeModal()
        fetchProducts()
      })
      .catch(function(err) {
        var msg = editing ? 'Erro ao atualizar serviço.' : 'Erro ao criar serviço.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setSubmitting(false) })
  }

  function handleDisable(id) {
    setLoadingId(id)
    productService.disable(id)
      .then(function() {
        toast.warning('Serviço desativado.')
        fetchProducts()
      })
      .catch(function(err) {
        var msg = 'Erro ao desativar serviço.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setLoadingId(null) })
  }

  function handleEnable(id) {
    setLoadingId(id)
    productService.enable(id)
      .then(function() {
        toast('Serviço ativado!')
        fetchProducts()
      })
      .catch(function(err) {
        var msg = 'Erro ao ativar serviço.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setLoadingId(null) })
  }

  var activeCount   = products.filter(function(p) { return p.active }).length
  var inactiveCount = products.length - activeCount

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
          React.createElement('h1', { className: 'font-display text-2xl font-bold text-surface-900 leading-tight' }, 'Serviços'),
          !loading && products.length > 0 && React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5' },
            activeCount + ' ativo' + (activeCount !== 1 ? 's' : '') +
            (inactiveCount > 0 ? ' · ' + inactiveCount + ' inativo' + (inactiveCount !== 1 ? 's' : '') : '')
          )
        ),
        React.createElement(
          Button,
          { variant: 'primary', onClick: openCreate },
          React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }),
          'Novo serviço'
        )
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-4xl mx-auto' },

      loading && React.createElement(
        'div',
        { className: 'flex flex-col items-center justify-center py-20 gap-3' },
        React.createElement(Spinner, { size: 'lg', className: 'text-brand-500' }),
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando serviços…')
      ),

      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement(
          'button',
          { onClick: fetchProducts, className: 'ml-auto text-xs underline font-semibold' },
          'Tentar novamente'
        )
      ),

      !loading && !error && products.length === 0 && React.createElement(
        EmptyState,
        {
          title:   'Nenhum serviço cadastrado',
          message: 'Cadastre o primeiro serviço da sua empresa para começar a receber agendamentos.',
          action:  { label: 'Criar serviço', onClick: openCreate },
        }
      ),

      !loading && !error && products.length > 0 && React.createElement(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
        products.map(function(product) {
          return React.createElement(ProductCard, {
            key:       product.id,
            product:   product,
            loadingId: loadingId,
            onEdit:    openEdit,
            onDisable: handleDisable,
            onEnable:  handleEnable,
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
        title:   editing ? 'Editar serviço' : 'Novo serviço',
        size:    'md',
      },
      modalOpen && React.createElement(ProductForm, {
        initial:    editing,
        onSubmit:   handleSubmit,
        onCancel:   closeModal,
        submitting: submitting,
      })
    ),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default ProductsPage