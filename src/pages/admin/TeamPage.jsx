import React, { useState, useEffect, useCallback } from 'react'
import userService from '../../services/userService.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Modal from '../../components/ui/Modal.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import ToastContainer from '../../components/ui/ToastContainer.jsx'
import useToast from '../../hooks/useToast.js'
import { getInitials } from '../../utils/format.js'
import { ROLES } from '../../utils/constants.js'

// ─── Ícones ──────────────────────────────────────────────
function Icon(props) {
  var paths = {
    plus:     'M12 4v16m8-8H4',
    lock:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    phone:    'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    mail:     'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zm0 0c0 1.657-1.343 3-3 3m0-6c-1.657 0-3 1.343-3 3m3-3V3m0 18v-3',
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

// ─── Badge de role ────────────────────────────────────────
var ROLE_CONFIG = {
  ADMIN:        { label: 'Admin',        className: 'badge-success' },
  PROFESSIONAL: { label: 'Profissional', className: 'badge-info' },
  SUPPORT:      { label: 'Suporte',      className: 'badge-neutral' },
}

function RoleBadge(props) {
  var config = ROLE_CONFIG[props.role] || { label: props.role, className: 'badge-neutral' }
  return React.createElement('span', { className: config.className }, config.label)
}

// ─── Card de membro ───────────────────────────────────────
function MemberCard(props) {
  var user          = props.user
  var onChangePassword = props.onChangePassword

  var initials = getInitials(user.name)

  var avatarColor = user.role === ROLES.ADMIN
    ? 'bg-brand-50 border-brand-100 text-brand-700'
    : 'bg-blue-50 border-blue-100 text-blue-700'

  return React.createElement(
    'div',
    {
      className: [
        'bg-white rounded-2xl border border-surface-100 shadow-card p-5',
        'transition-shadow duration-200 hover:shadow-card-md',
        !user.active ? 'opacity-60' : '',
      ].join(' '),
    },

    // Cabeçalho: avatar + nome + role
    React.createElement(
      'div',
      { className: 'flex items-start gap-3 mb-4' },

      React.createElement(
        'div',
        { className: 'w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ' + avatarColor },
        React.createElement('span', { className: 'text-sm font-bold' }, initials)
      ),

      React.createElement(
        'div',
        { className: 'min-w-0 flex-1' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-2 flex-wrap' },
          React.createElement(
            'p',
            { className: 'text-sm font-semibold text-surface-900 truncate' },
            user.name
          ),
          !user.active && React.createElement(
            'span',
            { className: 'badge-neutral' },
            'Inativo'
          )
        ),
        React.createElement(RoleBadge, { role: user.role })
      )
    ),

    // Contatos
    React.createElement(
      'div',
      { className: 'space-y-1.5 mb-4' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-2 text-xs text-surface-500' },
        React.createElement(Icon, { name: 'mail', className: 'w-3.5 h-3.5 text-surface-400 shrink-0' }),
        React.createElement('span', { className: 'truncate' }, user.email)
      ),
      user.phone && React.createElement(
        'div',
        { className: 'flex items-center gap-2 text-xs text-surface-500' },
        React.createElement(Icon, { name: 'phone', className: 'w-3.5 h-3.5 text-surface-400 shrink-0' }),
        React.createElement('span', null, user.phone)
      )
    ),

    // Ação: trocar senha (só aparece para o próprio usuário logado — controlado pelo pai)
    user.isSelf && React.createElement(
      'div',
      { className: 'pt-3 border-t border-surface-100' },
      React.createElement(
        Button,
        {
          size:    'sm',
          variant: 'ghost',
          onClick: onChangePassword,
        },
        React.createElement(Icon, { name: 'lock', className: 'w-3.5 h-3.5' }),
        'Trocar senha'
      )
    )
  )
}

// ─── Opções de role para o Select ─────────────────────────
var ROLE_OPTIONS = [
  { value: ROLES.ADMIN,        label: 'Admin' },
  { value: ROLES.PROFESSIONAL, label: 'Profissional' },
]

// ─── Formulário de novo membro ────────────────────────────
var EMPTY_MEMBER_FORM = { name: '', email: '', phone: '', role: '' }

function MemberForm(props) {
  var onSubmit   = props.onSubmit
  var onCancel   = props.onCancel
  var submitting = props.submitting

  var formState  = useState(EMPTY_MEMBER_FORM)
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
    if (!form.name.trim())  e.name  = 'Nome é obrigatório'
    if (!form.email.trim()) e.email = 'E-mail é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.phone.trim()) e.phone = 'Telefone é obrigatório'
    if (!form.role)         e.role  = 'Selecione um perfil'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onSubmit({
      name:  form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role:  form.role,
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
        label:       'Nome completo',
        type:        'text',
        value:       form.name,
        onChange:    function(ev) { set('name', ev.target.value) },
        placeholder: 'Ex: Ana Silva',
        error:       errors.name,
        required:    true,
      }),

      React.createElement(Input, {
        id:          'email',
        label:       'E-mail',
        type:        'email',
        value:       form.email,
        onChange:    function(ev) { set('email', ev.target.value) },
        placeholder: 'ana@empresa.com',
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
      }),

      React.createElement(Select, {
        id:          'role',
        label:       'Perfil',
        value:       form.role,
        onChange:    function(ev) { set('role', ev.target.value) },
        options:     ROLE_OPTIONS,
        placeholder: 'Selecione o perfil…',
        error:       errors.role,
      })
    ),

    React.createElement(
      'p',
      { className: 'text-xs text-surface-400 mt-4' },
      'Uma senha temporária será gerada automaticamente. O usuário poderá alterá-la após o primeiro acesso.'
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
        'Cadastrar membro'
      )
    )
  )
}

// ─── Input de senha com toggle de visibilidade ────────────
function PasswordInput(props) {
  var id          = props.id
  var label       = props.label
  var value       = props.value
  var onChange    = props.onChange
  var error       = props.error
  var placeholder = props.placeholder

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
          'input pr-10',
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

    error && React.createElement(
      'p',
      { className: 'mt-1.5 text-xs text-danger-500 font-medium' },
      error
    )
  )
}

// ─── Formulário de troca de senha ─────────────────────────
var EMPTY_PW_FORM = { currentPassword: '', newPassword: '', confirmNewPassword: '' }

function ChangePasswordForm(props) {
  var onSubmit   = props.onSubmit
  var onCancel   = props.onCancel
  var submitting = props.submitting

  var formState  = useState(EMPTY_PW_FORM)
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
    if (!form.currentPassword) e.currentPassword = 'Senha atual é obrigatória'
    if (!form.newPassword)     e.newPassword     = 'Nova senha é obrigatória'
    if (form.newPassword && (form.newPassword.length < 6 || form.newPassword.length > 16))
      e.newPassword = 'A nova senha deve ter entre 6 e 16 caracteres'
    if (!form.confirmNewPassword) e.confirmNewPassword = 'Confirmação é obrigatória'
    if (form.newPassword && form.confirmNewPassword && form.newPassword !== form.confirmNewPassword)
      e.confirmNewPassword = 'As senhas não coincidem'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    var e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    onSubmit({
      currentPassword:    form.currentPassword,
      newPassword:        form.newPassword,
      confirmNewPassword: form.confirmNewPassword,
    })
  }

  return React.createElement(
    'form',
    { onSubmit: handleSubmit, noValidate: true },

    React.createElement(
      'div',
      { className: 'space-y-4' },

      React.createElement(PasswordInput, {
        id:       'currentPassword',
        label:    'Senha atual',
        value:    form.currentPassword,
        onChange: function(ev) { set('currentPassword', ev.target.value) },
        error:    errors.currentPassword,
      }),

      React.createElement(PasswordInput, {
        id:          'newPassword',
        label:       'Nova senha',
        value:       form.newPassword,
        onChange:    function(ev) { set('newPassword', ev.target.value) },
        placeholder: 'Entre 6 e 16 caracteres',
        error:       errors.newPassword,
      }),

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
        'Alterar senha'
      )
    )
  )
}

// ─── Página principal ─────────────────────────────────────
function TeamPage() {
  var usersState  = useState([])
  var users       = usersState[0]
  var setUsers    = usersState[1]

  var loadingState = useState(true)
  var loading      = loadingState[0]
  var setLoading   = loadingState[1]

  var errorState   = useState(null)
  var error        = errorState[0]
  var setError     = errorState[1]

  // Modal de novo membro
  var memberModalState   = useState(false)
  var memberModalOpen    = memberModalState[0]
  var setMemberModalOpen = memberModalState[1]

  var memberSubmState = useState(false)
  var memberSubmitting = memberSubmState[0]
  var setMemberSubmitting = memberSubmState[1]

  // Modal de troca de senha
  var pwModalState   = useState(false)
  var pwModalOpen    = pwModalState[0]
  var setPwModalOpen = pwModalState[1]

  var pwSubmState    = useState(false)
  var pwSubmitting   = pwSubmState[0]
  var setPwSubmitting = pwSubmState[1]

  var toastHook   = useToast()
  var toasts      = toastHook.toasts
  var toast       = toastHook.toast
  var removeToast = toastHook.removeToast

  // Usuário logado (para marcar isSelf e exibir botão de trocar senha)
  var selfEmail = null
  try {
    var raw = sessionStorage.getItem('clipply_user')
    if (raw) selfEmail = JSON.parse(raw).email
  } catch (e) {
    // ignora
  }

  var fetchUsers = useCallback(function() {
    setLoading(true)
    setError(null)
    userService.list()
      .then(function(res) { setUsers(res.data || []) })
      .catch(function(err) {
        var msg = 'Erro ao carregar equipe.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        setError(msg)
      })
      .finally(function() { setLoading(false) })
  }, [])

  useEffect(function() { fetchUsers() }, [fetchUsers])

  function handleCreateMember(data) {
    setMemberSubmitting(true)
    userService.create(data)
      .then(function() {
        toast('Membro cadastrado! Uma senha temporária foi gerada.')
        setMemberModalOpen(false)
        fetchUsers()
      })
      .catch(function(err) {
        var msg = 'Erro ao cadastrar membro.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setMemberSubmitting(false) })
  }

  function handleChangePassword(data) {
    setPwSubmitting(true)
    userService.changePassword(data)
      .then(function() {
        toast('Senha alterada com sucesso!')
        setPwModalOpen(false)
      })
      .catch(function(err) {
        var msg = 'Erro ao alterar senha.'
        if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message
        toast.error(msg)
      })
      .finally(function() { setPwSubmitting(false) })
  }

  // Separa admins e profissionais para exibição
  var admins        = []
  var professionals = []
  var i = 0
  while (i < users.length) {
    var u = Object.assign({}, users[i], { isSelf: users[i].email === selfEmail })
    if (u.role === ROLES.ADMIN) {
      admins.push(u)
    } else {
      professionals.push(u)
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
        { className: 'flex items-start justify-between gap-4' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'h1',
            { className: 'font-display text-2xl font-bold text-surface-900 leading-tight' },
            'Equipe'
          ),
          !loading && React.createElement(
            'p',
            { className: 'text-sm text-surface-400 mt-0.5' },
            users.length + ' ' + (users.length === 1 ? 'membro' : 'membros')
          )
        ),
        React.createElement(
          Button,
          { variant: 'primary', onClick: function() { setMemberModalOpen(true) } },
          React.createElement(Icon, { name: 'plus', className: 'w-4 h-4' }),
          'Novo membro'
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
        React.createElement('p', { className: 'text-sm text-surface-400' }, 'Carregando equipe…')
      ),

      !loading && error && React.createElement(
        'div',
        { className: 'alert-error' },
        error,
        React.createElement(
          'button',
          { onClick: fetchUsers, className: 'ml-auto text-xs underline font-semibold' },
          'Tentar novamente'
        )
      ),

      !loading && !error && users.length === 0 && React.createElement(
        EmptyState,
        {
          title:   'Nenhum membro cadastrado',
          message: 'Cadastre os membros da sua equipe para que possam acessar o sistema.',
          action:  { label: 'Novo membro', onClick: function() { setMemberModalOpen(true) } },
        }
      ),

      // Admins
      !loading && !error && admins.length > 0 && React.createElement(
        'div',
        { className: 'mb-6' },
        React.createElement(
          'p',
          { className: 'text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3' },
          'Administradores'
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          admins.map(function(user) {
            return React.createElement(MemberCard, {
              key:              user.email,
              user:             user,
              onChangePassword: function() { setPwModalOpen(true) },
            })
          })
        )
      ),

      // Profissionais
      !loading && !error && professionals.length > 0 && React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3' },
          'Profissionais'
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
          professionals.map(function(user) {
            return React.createElement(MemberCard, {
              key:              user.email,
              user:             user,
              onChangePassword: function() { setPwModalOpen(true) },
            })
          })
        )
      )
    ),

    // ── Modal novo membro ──────────────────────────────────
    React.createElement(
      Modal,
      {
        open:    memberModalOpen,
        onClose: function() { if (!memberSubmitting) setMemberModalOpen(false) },
        title:   'Novo membro',
        size:    'md',
      },
      memberModalOpen && React.createElement(MemberForm, {
        onSubmit:   handleCreateMember,
        onCancel:   function() { setMemberModalOpen(false) },
        submitting: memberSubmitting,
      })
    ),

    // ── Modal trocar senha ─────────────────────────────────
    React.createElement(
      Modal,
      {
        open:    pwModalOpen,
        onClose: function() { if (!pwSubmitting) setPwModalOpen(false) },
        title:   'Alterar senha',
        size:    'sm',
      },
      pwModalOpen && React.createElement(ChangePasswordForm, {
        onSubmit:   handleChangePassword,
        onCancel:   function() { setPwModalOpen(false) },
        submitting: pwSubmitting,
      })
    ),

    React.createElement(ToastContainer, { toasts: toasts, removeToast: removeToast })
  )
}

export default TeamPage