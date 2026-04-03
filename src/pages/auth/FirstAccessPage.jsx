import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import userService from '../../services/userService.js'
import Button from '../../components/ui/Button.jsx'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    lock:   'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    eye:    'M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 1.657-1.343 3-3 3m0-6c-1.657 0-3 1.343-3 3m3-3V3m0 18v-3',
    eyeOff: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21',
    check:  'M5 13l4 4L19 7',
  }
  return React.createElement(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', className: props.className || 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: paths[props.name] || '' })
  )
}

// ─── Input de senha com toggle ────────────────────────────
function PasswordInput(props) {
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
    'div', { className: 'w-full' },
    React.createElement('label', { htmlFor: id, className: 'label' }, label),
    React.createElement(
      'div', { className: 'relative' },
      React.createElement('input', {
        id:          id,
        type:        show ? 'text' : 'password',
        value:       value,
        onChange:    onChange,
        placeholder: placeholder || '••••••••',
        className:   ['input pr-10', error ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-400/20' : ''].join(' '),
      }),
      React.createElement(
        'button',
        { type: 'button', tabIndex: -1, onClick: function() { setShow(function(v) { return !v }) }, className: 'absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700' },
        React.createElement(Icon, { name: show ? 'eyeOff' : 'eye', className: 'w-4 h-4' })
      )
    ),
    error && React.createElement('p', { className: 'mt-1.5 text-xs text-danger-500 font-medium' }, error),
    !error && hint && React.createElement('p', { className: 'mt-1.5 text-xs text-surface-400' }, hint)
  )
}

// ─── Regras de senha visíveis ─────────────────────────────
function PasswordRules(props) {
  var value = props.value

  var rules = [
    { label: 'Mínimo 6 caracteres',   ok: value.length >= 6 },
    { label: 'Máximo 16 caracteres',  ok: value.length <= 16 && value.length > 0 },
  ]

  if (!value) return null

  return React.createElement(
    'div', { className: 'space-y-1 mt-2' },
    rules.map(function(rule) {
      return React.createElement(
        'div', { key: rule.label, className: 'flex items-center gap-2' },
        React.createElement(
          'div',
          {
            className: [
              'w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors',
              rule.ok ? 'bg-brand-500' : 'bg-surface-200',
            ].join(' '),
          },
          rule.ok && React.createElement(Icon, { name: 'check', className: 'w-2.5 h-2.5 text-white' })
        ),
        React.createElement(
          'span',
          { className: 'text-xs ' + (rule.ok ? 'text-brand-700 font-medium' : 'text-surface-400') },
          rule.label
        )
      )
    })
  )
}

// ─── Página principal ─────────────────────────────────────
function FirstAccessPage() {
  var authCtx     = useAuth()
  var refreshUser = authCtx.refreshUser
  var user        = authCtx.user
  var navigate    = useNavigate()

  var formState  = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
  var form       = formState[0]
  var setForm    = formState[1]

  var errorsState = useState({})
  var errors      = errorsState[0]
  var setErrors   = errorsState[1]

  var apiErrorState = useState(null)
  var apiError      = apiErrorState[0]
  var setApiError   = apiErrorState[1]

  var loadingState = useState(false)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  function set(field, value) {
    var next = Object.assign({}, form); next[field] = value; setForm(next)
    var ne = Object.assign({}, errors); delete ne[field]; setErrors(ne)
    setApiError(null)
  }

  function validate() {
    var e = {}
    if (!form.currentPassword)  e.currentPassword = 'Senha atual é obrigatória'
    if (!form.newPassword)      e.newPassword     = 'Nova senha é obrigatória'
    if (form.newPassword && (form.newPassword.length < 6 || form.newPassword.length > 16))
      e.newPassword = 'A nova senha deve ter entre 6 e 16 caracteres'
    if (!form.confirmNewPassword) e.confirmNewPassword = 'Confirmação é obrigatória'
    if (form.newPassword && form.confirmNewPassword && form.newPassword !== form.confirmNewPassword)
      e.confirmNewPassword = 'As senhas não coincidem'
    if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword)
      e.newPassword = 'A nova senha deve ser diferente da senha atual'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setLoading(true)
    setApiError(null)

    userService.changePassword({
      currentPassword:    form.currentPassword,
      newPassword:        form.newPassword,
      confirmNewPassword: form.confirmNewPassword,
    })
      .then(function() {
        // Atualiza o contexto para que firstAccess vire false
        return refreshUser()
      })
      .then(function() {
        // Redireciona para a rota correta baseada no role
        var role = user && user.role ? user.role : 'ADMIN'

        console.warn('role -> ', role);
        console.warn('firstAccess -> ', user.isFirstAccess);

        if (role === 'PROFESSIONAL') {
          console.warn('navegando para página do professinoal');
          navigate('/professional', { replace: true })
        } else if (role === 'SUPPORT') {
          navigate('/support', { replace: true })
        } else {
          navigate('/admin', { replace: true })
        }
      })
      .catch(function(err) {
        var msg = 'Erro ao alterar senha.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setApiError(msg)
      })
      .finally(function() { setLoading(false) })
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh flex flex-col md:flex-row' },

    // ── Painel visual (desktop) ───────────────────────────
    React.createElement(
      'div',
      { className: 'hidden md:flex md:w-1/2 bg-surface-900 flex-col justify-between p-10 relative overflow-hidden' },
      React.createElement('div', { className: 'absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl pointer-events-none' }),
      React.createElement('div', { className: 'absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none' }),

      // Logo
      React.createElement(
        'div', { className: 'flex items-center gap-3 relative z-10' },
        React.createElement(
          'div', { className: 'w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand' },
          React.createElement(
            'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2.5 },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
          )
        ),
        React.createElement('span', { className: 'font-display font-bold text-xl text-white tracking-tight' }, 'Clipply')
      ),

      // Texto
      React.createElement(
        'div', { className: 'relative z-10' },
        React.createElement(
          'div', { className: 'w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6' },
          React.createElement(Icon, { name: 'lock', className: 'w-7 h-7 text-white' })
        ),
        React.createElement('h1', { className: 'font-display text-4xl font-bold text-white leading-tight mb-4 text-balance' }, 'Defina sua senha de acesso.'),
        React.createElement('p', { className: 'text-surface-400 text-base leading-relaxed' }, 'Por segurança, você precisa criar uma senha pessoal antes de continuar.')
      )
    ),

    // ── Formulário ────────────────────────────────────────
    React.createElement(
      'div',
      { className: 'flex-1 flex items-center justify-center p-6 bg-surface-50' },
      React.createElement(
        'div',
        { className: 'w-full max-w-sm animate-slide-up' },

        // Logo mobile
        React.createElement(
          'div', { className: 'flex items-center gap-2 mb-8 md:hidden' },
          React.createElement(
            'div', { className: 'w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand' },
            React.createElement(
              'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2.5 },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
            )
          ),
          React.createElement('span', { className: 'font-display font-bold text-lg text-surface-900' }, 'Clipply')
        ),

        // Cabeçalho
        React.createElement(
          'div', { className: 'mb-8' },
          React.createElement(
            'div', { className: 'w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4' },
            React.createElement(Icon, { name: 'lock', className: 'w-5 h-5 text-brand-600' })
          ),
          React.createElement('h2', { className: 'text-2xl font-display font-bold text-surface-900 mb-1' }, 'Primeiro acesso'),
          React.createElement('p', { className: 'text-sm text-surface-400' }, 'Crie sua senha pessoal para continuar.')
        ),

        // Erro da API
        apiError && React.createElement(
          'div', { className: 'alert-error mb-5' },
          React.createElement(
            'svg', { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' })
          ),
          React.createElement('span', null, apiError)
        ),

        // Form
        React.createElement(
          'form',
          { onSubmit: handleSubmit, noValidate: true },
          React.createElement(
            'div', { className: 'space-y-4' },

            React.createElement(PasswordInput, {
              id:          'currentPassword',
              label:       'Senha temporária',
              value:       form.currentPassword,
              onChange:    function(ev) { set('currentPassword', ev.target.value) },
              placeholder: 'Senha que foi enviada para o seu email',
              error:       errors.currentPassword,
            }),

            React.createElement(
              'div', null,
              React.createElement(PasswordInput, {
                id:          'newPassword',
                label:       'Nova senha',
                value:       form.newPassword,
                onChange:    function(ev) { set('newPassword', ev.target.value) },
                placeholder: 'Entre 6 e 16 caracteres',
                error:       errors.newPassword,
              }),
              React.createElement(PasswordRules, { value: form.newPassword })
            ),

            React.createElement(PasswordInput, {
              id:          'confirmNewPassword',
              label:       'Confirmar nova senha',
              value:       form.confirmNewPassword,
              onChange:    function(ev) { set('confirmNewPassword', ev.target.value) },
              placeholder: 'Repita a nova senha',
              error:       errors.confirmNewPassword,
            })
          ),

          React.createElement(
            Button,
            { type: 'submit', loading: loading, className: 'w-full mt-6' },
            'Definir senha e continuar'
          )
        )
      )
    )
  )
}

export default FirstAccessPage