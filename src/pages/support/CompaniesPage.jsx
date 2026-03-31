import React, { useState } from 'react'
import companyService from '../../services/companyService.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    plus:     'M12 4v16m8-8H4',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    key:      'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    check:    'M5 13l4 4L19 7',
    disable:  'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 1.657-1.343 3-3 3m0-6c-1.657 0-3 1.343-3 3',
    eyeOff:   'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21',
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

// ─── Input com toggle de visibilidade ─────────────────────
function SecretInput(props) {
  var id          = props.id
  var label       = props.label
  var value       = props.value
  var onChange    = props.onChange
  var error       = props.error
  var placeholder = props.placeholder
  var hint        = props.hint

  var showState = useState(false)
  var show      = showState[0]
  var setShow   = showState[1]

  return React.createElement(
    'div',
    { className: 'w-full' },
    React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement(
      'div',
      { className: 'relative' },
      React.createElement('input', {
        id:          id,
        type:        show ? 'text' : 'password',
        value:       value,
        onChange:    onChange,
        placeholder: placeholder || '••••••••',
        className:   [
          'input pr-10 font-mono text-sm',
          error ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-400/20' : '',
        ].join(' '),
      }),
      React.createElement(
        'button',
        {
          type:      'button',
          tabIndex:  -1,
          onClick:   function() { setShow(function(v) { return !v }) },
          className: 'absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700',
        },
        React.createElement(Icon, { name: show ? 'eyeOff' : 'eye', className: 'w-4 h-4' })
      )
    ),
    error && React.createElement('p', { className: 'mt-1.5 text-xs text-danger-500 font-medium' }, error),
    !error && hint && React.createElement('p', { className: 'mt-1.5 text-xs text-surface-400' }, hint)
  )
}

// ─── Card de resultado após cadastro ──────────────────────
function RegisterResultCard(props) {
  var result = props.result  // { userName, email, slug }
  var onClose = props.onClose

  return React.createElement(
    'div',
    { className: 'space-y-4' },

    // Ícone de sucesso
    React.createElement(
      'div',
      { className: 'flex flex-col items-center gap-2 py-4' },
      React.createElement(
        'div',
        { className: 'w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center' },
        React.createElement(Icon, { name: 'check', className: 'w-6 h-6 text-brand-600' })
      ),
      React.createElement(
        'p',
        { className: 'text-base font-semibold text-surface-900' },
        'Empresa cadastrada!'
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-surface-400 text-center' },
        'Guarde as informações abaixo e envie ao administrador da empresa.'
      )
    ),

    // Dados gerados
    React.createElement(
      'div',
      { className: 'bg-surface-50 rounded-xl border border-surface-200 divide-y divide-surface-100' },

      React.createElement(
        'div',
        { className: 'px-4 py-3' },
        React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold mb-0.5' }, 'Empresa (slug)'),
        React.createElement('p', { className: 'text-sm font-mono font-semibold text-surface-900' }, result.slug)
      ),

      React.createElement(
        'div',
        { className: 'px-4 py-3' },
        React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold mb-0.5' }, 'E-mail do admin'),
        React.createElement('p', { className: 'text-sm font-mono font-semibold text-surface-900' }, result.email)
      ),

      React.createElement(
        'div',
        { className: 'px-4 py-3' },
        React.createElement('p', { className: 'text-2xs text-surface-400 uppercase tracking-wide font-semibold mb-0.5' }, 'Nome do admin'),
        React.createElement('p', { className: 'text-sm font-semibold text-surface-900' }, result.userName)
      )
    ),

    React.createElement(
      'p',
      { className: 'text-xs text-surface-400 text-center' },
      'A senha inicial do admin é a senha padrão configurada no servidor.'
    ),

    React.createElement(
      'div',
      { className: 'flex justify-end' },
      React.createElement(
        Button,
        { variant: 'primary', onClick: onClose },
        'Fechar'
      )
    )
  )
}

// ─── Formulário de cadastro de empresa ────────────────────
var EMPTY_COMPANY_FORM = {
  companyName: '',
  userName:    '',
  email:       '',
  document:    '',
  phone:       '',
}

function CompanyForm(props) {
  var apiKey     = props.apiKey
  var onSuccess  = props.onSuccess
  var onCancel   = props.onCancel
  var submitting = props.submitting
  var setSubmitting = props.setSubmitting

  var formState  = useState(EMPTY_COMPANY_FORM)
  var form       = formState[0]
  var setForm    = formState[1]

  var errorsState = useState({})
  var errors      = errorsState[0]
  var setErrors   = errorsState[1]

  var apiErrorState = useState(null)
  var apiError      = apiErrorState[0]
  var setApiError   = apiErrorState[1]

  function set(field, value) {
    var next = Object.assign({}, form)
    next[field] = value
    setForm(next)
    var nextErrors = Object.assign({}, errors)
    delete nextErrors[field]
    setErrors(nextErrors)
    setApiError(null)
  }

  function validate() {
    var e = {}
    if (!form.companyName.trim()) e.companyName = 'Nome da empresa é obrigatório'
    if (!form.userName.trim())    e.userName    = 'Nome do admin é obrigatório'
    if (!form.email.trim())       e.email       = 'E-mail é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.document.trim())    e.document    = 'CNPJ/documento é obrigatório'
    if (!form.phone.trim())       e.phone       = 'Telefone é obrigatório'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setSubmitting(true)
    setApiError(null)

    companyService.register(
      {
        companyName: form.companyName.trim(),
        userName:    form.userName.trim(),
        email:       form.email.trim(),
        document:    form.document.trim(),
        phone:       form.phone.trim(),
      },
      apiKey
    )
      .then(function(res) {
        onSuccess(res.data)
      })
      .catch(function(err) {
        var msg = 'Erro ao cadastrar empresa.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setApiError(msg)
      })
      .finally(function() { setSubmitting(false) })
  }

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },

    apiError && React.createElement(
      'div',
      { className: 'alert-error mb-4' },
      apiError
    ),

    React.createElement(
      'div',
      { className: 'space-y-4' },

      // Seção: dados da empresa
      React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3' },
          'Dados da empresa'
        ),
        React.createElement(
          'div',
          { className: 'space-y-3' },
          React.createElement(Input, {
            id:          'companyName',
            label:       'Nome da empresa',
            type:        'text',
            value:       form.companyName,
            onChange:    function(ev) { set('companyName', ev.target.value) },
            placeholder: 'Ex: Barbearia do João',
            error:       errors.companyName,
            required:    true,
          }),
          React.createElement(Input, {
            id:          'document',
            label:       'CNPJ / Documento',
            type:        'text',
            value:       form.document,
            onChange:    function(ev) { set('document', ev.target.value) },
            placeholder: '00.000.000/0000-00',
            error:       errors.document,
            required:    true,
          })
        )
      ),

      // Divisor
      React.createElement('div', { className: 'divider' }),

      // Seção: admin
      React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3' },
          'Administrador da empresa'
        ),
        React.createElement(
          'div',
          { className: 'space-y-3' },
          React.createElement(Input, {
            id:          'userName',
            label:       'Nome completo',
            type:        'text',
            value:       form.userName,
            onChange:    function(ev) { set('userName', ev.target.value) },
            placeholder: 'Ex: João da Silva',
            error:       errors.userName,
            required:    true,
          }),
          React.createElement(Input, {
            id:          'email',
            label:       'E-mail',
            type:        'email',
            value:       form.email,
            onChange:    function(ev) { set('email', ev.target.value) },
            placeholder: 'admin@empresa.com',
            error:       errors.email,
            required:    true,
          }),
          React.createElement(Input, {
            id:          'phone',
            label:       'Telefone',
            type:        'tel',
            value:       form.phone,
            onChange:    function(ev) { set('phone', ev.target.value) },
            placeholder: '(11) 99999-9999',
            error:       errors.phone,
            required:    true,
          })
        )
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
        'Cadastrar empresa'
      )
    )
  )
}

// ─── Tela de API Key (primeiro acesso ou key inválida) ────
function ApiKeySetup(props) {
  var onConfirm = props.onConfirm

  var keyState  = useState('')
  var key       = keyState[0]
  var setKey    = keyState[1]

  var showState = useState(false)
  var show      = showState[0]
  var setShow   = showState[1]

  function handleSubmit(ev) {
    ev.preventDefault()
    if (key.trim()) onConfirm(key.trim())
  }

  return React.createElement(
    'div',
    { className: 'min-h-full bg-surface-50 flex items-center justify-center p-6' },

    React.createElement(
      'div',
      { className: 'w-full max-w-sm' },

      // Ícone
      React.createElement(
        'div',
        { className: 'flex justify-center mb-6' },
        React.createElement(
          'div',
          { className: 'w-14 h-14 rounded-2xl bg-surface-900 flex items-center justify-center shadow-card-lg' },
          React.createElement(Icon, { name: 'key', className: 'w-7 h-7 text-white' })
        )
      ),

      React.createElement(
        'h1',
        { className: 'font-display text-2xl font-bold text-surface-900 text-center mb-1' },
        'API Key necessária'
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-surface-400 text-center mb-8' },
        'Informe a chave de API do Clipply para acessar o painel de suporte.'
      ),

      React.createElement(
        'form',
        { onSubmit: handleSubmit, noValidate: true },
        React.createElement(SecretInput, {
          id:          'apiKey',
          label:       'API Key',
          value:       key,
          onChange:    function(ev) { setKey(ev.target.value) },
          placeholder: 'Cole a chave aqui…',
          hint:        'A chave está definida nas configurações do servidor.',
        }),
        React.createElement(
          Button,
          {
            variant:   'primary',
            type:      'submit',
            className: 'w-full mt-4',
            disabled:  !key.trim(),
          },
          'Confirmar'
        )
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
var API_KEY_STORAGE = 'clipply_support_key'

function SupportCompaniesPage() {
  // Persiste a API key na sessão para não precisar redigitar
  var storedKey = null
  try { storedKey = sessionStorage.getItem(API_KEY_STORAGE) } catch (e) { /* ignora */ }

  var apiKeyState  = useState(storedKey || '')
  var apiKey       = apiKeyState[0]
  var setApiKey    = apiKeyState[1]

  var modalState   = useState(false)
  var modalOpen    = modalState[0]
  var setModalOpen = modalState[1]

  var submittingState = useState(false)
  var submitting      = submittingState[0]
  var setSubmitting   = submittingState[1]

  // Resultado do cadastro para exibir no modal
  var resultState  = useState(null)
  var result       = resultState[0]
  var setResult    = resultState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  function handleApiKeyConfirm(key) {
    try { sessionStorage.setItem(API_KEY_STORAGE, key) } catch (e) { /* ignora */ }
    setApiKey(key)
  }

  function handleSuccess(data) {
    setResult(data)
  }

  function handleResultClose() {
    setResult(null)
    setModalOpen(false)
    toast('Empresa cadastrada com sucesso!')
  }

  function openModal() {
    setResult(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (submitting) return
    setModalOpen(false)
    setResult(null)
  }

  // Se não tem API key ainda, pede antes de mostrar a página
  if (!apiKey) {
    return React.createElement(ApiKeySetup, { onConfirm: handleApiKeyConfirm })
  }

  return React.createElement(
    'div',
    { className: 'min-h-full bg-surface-50' },

    // ── Cabeçalho ─────────────────────────────────────────
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
            'Empresas'
          ),
          React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5' },
            'Painel interno Clipply'
          )
        ),
        React.createElement(
          'div',
          { className: 'flex items-center gap-2' },

          // Botão para trocar a API key
          React.createElement(
            Button,
            {
              variant: 'secondary',
              onClick: function() {
                try { sessionStorage.removeItem(API_KEY_STORAGE) } catch (e) { /* ignora */ }
                setApiKey('')
              },
            },
            React.createElement(Icon, { name: 'key', className: 'w-4 h-4' }),
            'Trocar key'
          ),

          React.createElement(
            Button,
            { variant: 'primary', onClick: openModal },
            React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }),
            'Nova empresa'
          )
        )
      )
    ),

    // ── Conteúdo ──────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'px-5 py-5 max-w-2xl mx-auto' },

      // Card informativo
      React.createElement(
        'div',
        { className: 'bg-white rounded-2xl border border-surface-100 shadow-card p-6 flex flex-col items-center text-center gap-3' },
        React.createElement(
          'div',
          { className: 'w-12 h-12 rounded-2xl bg-surface-900 flex items-center justify-center' },
          React.createElement(Icon, { name: 'building', className: 'w-6 h-6 text-white' })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            { className: 'text-sm font-semibold text-surface-900 mb-1' },
            'Painel de suporte ativo'
          ),
          React.createElement(
            'p',
            { className: 'text-xs text-surface-400 max-w-xs' },
            'Use o botão "Nova empresa" para cadastrar um novo cliente no Clipply. As credenciais serão exibidas após o cadastro.'
          )
        ),
        React.createElement(
          Button,
          { variant: 'primary', onClick: openModal },
          React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }),
          'Nova empresa'
        )
      )
    ),

    // ── Modal cadastro ─────────────────────────────────────
    React.createElement(
      Modal,
      {
        open:    modalOpen,
        onClose: closeModal,
        title:   result ? 'Empresa cadastrada' : 'Nova empresa',
        size:    'md',
      },
      modalOpen && !result && React.createElement(CompanyForm, {
        apiKey:       apiKey,
        onSuccess:    handleSuccess,
        onCancel:     closeModal,
        submitting:   submitting,
        setSubmitting: setSubmitting,
      }),
      modalOpen && result && React.createElement(RegisterResultCard, {
        result:  result,
        onClose: handleResultClose,
      })
    ),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default SupportCompaniesPage