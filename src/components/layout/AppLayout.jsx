import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

// ─── Ícones SVG inline ───────────────────────────────────
function Icon(props) {
  var paths = {
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    package:  'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    people:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    menu:     'M4 6h16M4 12h16M4 18h16',
    close:    'M6 18L18 6M6 6l12 12',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  }

  return React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      className: props.className || 'w-5 h-5',
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      strokeWidth: 2,
    },
    React.createElement('path', {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      d: paths[props.name] || '',
    })
  )
}

// ─── Configuração de menus por role ──────────────────────
var MENU_ADMIN = [
  { to: '/admin',           label: 'Agendamentos',  icon: 'calendar', end: true },
  { to: '/admin/produtos',  label: 'Serviços',       icon: 'package' },
  { to: '/admin/horarios',  label: 'Horários',       icon: 'clock' },
  { to: '/admin/equipe',    label: 'Equipe',         icon: 'users' },
  { to: '/admin/clientes',  label: 'Clientes',       icon: 'people' },
]

var MENU_PROFESSIONAL = [
  { to: '/professional', label: 'Minha agenda', icon: 'calendar', end: true },
]

var MENU_SUPPORT = [
  { to: '/support', label: 'Empresas', icon: 'building', end: true },
]

function getMenu(role) {
  if (role === 'ADMIN')        return MENU_ADMIN
  if (role === 'PROFESSIONAL') return MENU_PROFESSIONAL
  if (role === 'SUPPORT')      return MENU_SUPPORT
  return []
}

// ─── Item de nav ─────────────────────────────────────────
function NavItem(props) {
  var item = props.item
  var onClick = props.onClick

  return React.createElement(
    NavLink,
    {
      to:  item.to,
      end: item.end || false,
      onClick: onClick,
      className: function(ref) {
        var isActive = ref.isActive
        return [
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-brand-600 text-white shadow-brand'
            : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
        ].join(' ')
      },
    },
    React.createElement(Icon, { name: item.icon, className: 'w-5 h-5 shrink-0' }),
    React.createElement('span', null, item.label)
  )
}

// ─── Sidebar ─────────────────────────────────────────────
function Sidebar(props) {
  var menu    = props.menu
  var user    = props.user
  var onClose = props.onClose
  var onLogout = props.onLogout

  return React.createElement(
    'aside',
    { className: 'flex flex-col h-full bg-white border-r border-surface-100 w-64 shrink-0' },

    // Logo
    React.createElement(
      'div',
      { className: 'px-5 py-5 border-b border-surface-100' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-2.5' },
        React.createElement(
          'div',
          { className: 'w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shadow-brand shrink-0' },
          React.createElement(Icon, { name: 'calendar', className: 'w-4 h-4 text-white' })
        ),
        React.createElement(
          'span',
          { className: 'font-display font-bold text-lg text-surface-900 tracking-tight' },
          'Clipply'
        )
      )
    ),

    // Nav
    React.createElement(
      'nav',
      { className: 'flex-1 px-3 py-4 space-y-1 overflow-y-auto' },
      menu.map(function(item) {
        return React.createElement(NavItem, { key: item.to, item: item, onClick: onClose })
      })
    ),

    // Footer — usuário + logout
    React.createElement(
      'div',
      { className: 'px-3 py-4 border-t border-surface-100' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-3 px-3 py-2 mb-2' },
        React.createElement(
          'div',
          { className: 'w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0' },
          React.createElement(
            'span',
            { className: 'text-xs font-bold text-brand-700' },
            user && user.email ? user.email.charAt(0).toUpperCase() : '?'
          )
        ),
        React.createElement(
          'div',
          { className: 'min-w-0' },
          React.createElement(
            'p',
            { className: 'text-xs font-semibold text-surface-900 truncate' },
            user && user.email ? user.email : ''
          )
        )
      ),
      React.createElement(
        'button',
        {
          onClick: onLogout,
          className: 'btn-ghost w-full justify-start text-danger-500 hover:bg-danger-50 hover:text-danger-600',
        },
        React.createElement(Icon, { name: 'logout', className: 'w-4 h-4' }),
        'Sair'
      )
    )
  )
}

// ─── Layout principal ─────────────────────────────────────
function AppLayout() {
  var authCtx  = useAuth()
  var user     = authCtx.user
  var logout   = authCtx.logout
  var navigate = useNavigate()

  var drawerState = useState(false)
  var drawerOpen  = drawerState[0]
  var setDrawerOpen = drawerState[1]

  // Deriva role do usuário (virá do contexto após implementar /me)
  var role = user && user.role ? user.role : 'ADMIN'
  var menu = getMenu(role)

  function handleLogout() {
    logout().finally(function() {
      navigate('/login')
    })
  }

  return React.createElement(
    'div',
    { className: 'flex h-screen-dvh overflow-hidden bg-surface-50' },

    // ── Sidebar desktop ───────────────────────────────────
    React.createElement(
      'div',
      { className: 'hidden md:flex md:flex-col' },
      React.createElement(Sidebar, {
        menu:     menu,
        user:     user,
        onLogout: handleLogout,
      })
    ),

    // ── Drawer mobile (overlay) ───────────────────────────
    drawerOpen && React.createElement(
      'div',
      {
        className: 'fixed inset-0 z-40 flex md:hidden',
        onClick: function() { setDrawerOpen(false) },
      },
      // Backdrop
      React.createElement('div', {
        className: 'absolute inset-0 bg-surface-900/50 backdrop-blur-sm',
      }),
      // Drawer panel
      React.createElement(
        'div',
        {
          className: 'relative z-50 flex flex-col w-64 h-full animate-slide-up',
          onClick: function(e) { e.stopPropagation() },
        },
        React.createElement(Sidebar, {
          menu:     menu,
          user:     user,
          onClose:  function() { setDrawerOpen(false) },
          onLogout: handleLogout,
        })
      )
    ),

    // ── Área principal ────────────────────────────────────
    React.createElement(
      'div',
      { className: 'flex-1 flex flex-col min-w-0 overflow-hidden' },

      // Topbar mobile
      React.createElement(
        'header',
        { className: 'md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-100 safe-top' },
        React.createElement(
          'button',
          {
            onClick: function() { setDrawerOpen(true) },
            className: 'btn-ghost p-2',
            'aria-label': 'Abrir menu',
          },
          React.createElement(Icon, { name: 'menu', className: 'w-5 h-5' })
        ),
        React.createElement(
          'span',
          { className: 'font-display font-bold text-surface-900' },
          'Clipply'
        ),
        // Espaço para balancear
        React.createElement('div', { className: 'w-9' })
      ),

      // Conteúdo da página
      React.createElement(
        'main',
        { className: 'flex-1 overflow-y-auto' },
        React.createElement(Outlet, null)
      )
    )
  )
}

export default AppLayout
