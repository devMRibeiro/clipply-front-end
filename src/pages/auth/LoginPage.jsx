import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

function LoginPage() {
  var authCtx  = useAuth()
  var login    = authCtx.login
  var navigate = useNavigate()
  var location = useLocation()

  var from = (location.state && location.state.from && location.state.from.pathname) || '/admin'

  var emailState   = useState('')
  var email        = emailState[0]
  var setEmail     = emailState[1]

  var passwordState = useState('')
  var password      = passwordState[0]
  var setPassword   = passwordState[1]

  var loadingState = useState(false)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  var errorState = useState('')
  var error      = errorState[0]
  var setError   = errorState[1]

  function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Preencha e-mail e senha.')
      return
    }

    setLoading(true)
    setError('')

    login(email, password)
      .then(function() {
        navigate(from, { replace: true })
      })
      .catch(function(err) {
        var msg = 'Credenciais inválidas.'
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message
        }
        setError(msg)
      })
      .finally(function() {
        setLoading(false)
      })
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen-dvh flex flex-col md:flex-row' },

    // ── Painel visual (desktop) ───────────────────────────
    React.createElement(
      'div',
      { className: 'hidden md:flex md:w-1/2 bg-surface-900 flex-col justify-between p-10 relative overflow-hidden' },

      // Decoração geométrica de fundo
      React.createElement('div', {
        className: 'absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl pointer-events-none',
      }),
      React.createElement('div', {
        className: 'absolute bottom-0 right-0 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none',
      }),

      // Logo
      React.createElement(
        'div',
        { className: 'flex items-center gap-3 relative z-10' },
        React.createElement(
          'div',
          { className: 'w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-brand' },
          React.createElement(
            'svg',
            { xmlns: 'http://www.w3.org/2000/svg', className: 'w-5 h-5 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2.5 },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
          )
        ),
        React.createElement(
          'span',
          { className: 'font-display font-bold text-xl text-white tracking-tight' },
          'Clipply'
        )
      ),

      // Tagline
      React.createElement(
        'div',
        { className: 'relative z-10' },
        React.createElement(
          'h1',
          { className: 'font-display text-4xl font-bold text-white leading-tight mb-4 text-balance' },
          'Agendamentos simples e eficientes.'
        ),
        React.createElement(
          'p',
          { className: 'text-surface-400 text-base leading-relaxed' },
          'Gerencie sua agenda, equipe e clientes em um só lugar.'
        )
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
          'div',
          { className: 'flex items-center gap-2 mb-8 md:hidden' },
          React.createElement(
            'div',
            { className: 'w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand' },
            React.createElement(
              'svg',
              { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 text-white', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2.5 },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
            )
          ),
          React.createElement(
            'span',
            { className: 'font-display font-bold text-lg text-surface-900' },
            'Clipply'
          )
        ),

        React.createElement(
          'h2',
          { className: 'text-2xl font-display font-bold text-surface-900 mb-1' },
          'Entrar'
        ),
        React.createElement(
          'p',
          { className: 'text-sm text-surface-400 mb-8' },
          'Acesse sua conta para continuar'
        ),

        // Alerta de erro
        error && React.createElement(
          'div',
          { className: 'alert-error mb-5' },
          React.createElement(
            'svg',
            { xmlns: 'http://www.w3.org/2000/svg', className: 'w-4 h-4 shrink-0', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' })
          ),
          React.createElement('span', null, error)
        ),

        // Form
        React.createElement(
          'form',
          { onSubmit: handleSubmit, noValidate: true },
          React.createElement(
            'div',
            { className: 'space-y-4' },

            React.createElement(Input, {
              id:          'email',
              label:       'E-mail',
              type:        'email',
              value:       email,
              onChange:    function(e) { setEmail(e.target.value) },
              placeholder: 'seu@email.com',
              autoComplete: 'email',
              required:    true,
            }),

            React.createElement(Input, {
              id:          'password',
              label:       'Senha',
              type:        'password',
              value:       password,
              onChange:    function(e) { setPassword(e.target.value) },
              placeholder: '••••••••',
              autoComplete: 'current-password',
              required:    true,
            })
          ),

          React.createElement(
            Button,
            {
              type:      'submit',
              loading:   loading,
              className: 'w-full mt-6',
            },
            'Entrar'
          )
        )
      )
    )
  )
}

export default LoginPage
