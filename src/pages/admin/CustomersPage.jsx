import React, { useState, useEffect, useCallback } from 'react'
import customerService from '../../services/customerService.js'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { formatPhone, getInitials } from '../../utils/format.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    phone:  'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
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

// ─── Card de cliente ──────────────────────────────────────
function CustomerCard(props) {
  var customer = props.customer
  var initials = getInitials(customer.name)

  return React.createElement(
    'div',
    {
      className: 'bg-white rounded-2xl border border-surface-100 shadow-card p-4 flex items-center gap-4 transition-shadow duration-200 hover:shadow-card-md',
    },

    // Avatar
    React.createElement(
      'div',
      { className: 'w-10 h-10 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center shrink-0' },
      React.createElement('span', { className: 'text-sm font-bold text-surface-600' }, initials)
    ),

    // Info
    React.createElement(
      'div',
      { className: 'min-w-0 flex-1' },
      React.createElement(
        'p',
        { className: 'text-sm font-semibold text-surface-900 truncate' },
        customer.name
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-1.5 mt-0.5' },
        React.createElement(Icon, { name: 'phone', className: 'w-3 h-3 text-surface-400 shrink-0' }),
        React.createElement(
          'span',
          { className: 'text-xs text-surface-400 font-mono' },
          formatPhone(customer.phone)
        )
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function CustomersPage() {
  var customersState = useState([])
  var customers      = customersState[0]
  var setCustomers   = customersState[1]

  var loadingState   = useState(true)
  var loading        = loadingState[0]
  var setLoading     = loadingState[1]

  var errorState     = useState(null)
  var error          = errorState[0]
  var setError       = errorState[1]

  var searchState    = useState('')
  var search         = searchState[0]
  var setSearch      = searchState[1]

  var fetchCustomers = useCallback(function() {
    setLoading(true)
    setError(null)
    customerService.list()
      .then(function(res) { setCustomers(res.data || []) })
      .catch(function(err) {
        var msg = 'Erro ao carregar clientes.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { fetchCustomers() }, [fetchCustomers])

  // Filtragem local por nome ou telefone
  var term = search.trim().toLowerCase()
  var filtered = []
  var i = 0
  while (i < customers.length) {
    var c = customers[i]
    if (
      !term ||
      c.name.toLowerCase().indexOf(term) !== -1 ||
      c.phone.replace(/\D/g, '').indexOf(term.replace(/\D/g, '')) !== -1
    ) {
      filtered.push(c)
    }
    i++
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
        { className: 'flex items-start justify-between gap-4 mb-3' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'h1',
            { className: 'font-display text-2xl font-bold text-surface-900 leading-tight' },
            'Clientes'
          ),
          !loading && React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5' },
            customers.length + ' ' + (customers.length === 1 ? 'cliente' : 'clientes') + ' cadastrados'
          )
        )
      ),

      // Campo de busca
      React.createElement(
        'div',
        { className: 'relative' },
        React.createElement(
          'div',
          { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none' },
          React.createElement(Icon, { name: 'search', className: 'w-4 h-4' })
        ),
        React.createElement('input', {
          type:        'text',
          value:       search,
          onChange:    function(ev) { setSearch(ev.target.value) },
          placeholder: 'Buscar por nome ou telefone…',
          className:   'input pl-9',
        })
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
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando clientes…')
      ),

      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement(
          'button',
          { onClick: fetchCustomers, className: 'ml-auto text-xs underline font-semibold' },
          'Tentar novamente'
        )
      ),

      !loading && !error && customers.length === 0 && React.createElement(
        EmptyState,
        {
          title:   'Nenhum cliente ainda',
          message: 'Os clientes aparecem aqui automaticamente quando fazem o primeiro agendamento.',
        }
      ),

      !loading && !error && customers.length > 0 && filtered.length === 0 && React.createElement(
        EmptyState,
        {
          title:   'Nenhum resultado encontrado',
          message: 'Tente buscar por outro nome ou telefone.',
        }
      ),

      !loading && !error && filtered.length > 0 && React.createElement(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' },
        filtered.map(function(customer) {
          return React.createElement(CustomerCard, {
            key:      customer.id,
            customer: customer,
          })
        })
      )
    )
  )
}

export default CustomersPage