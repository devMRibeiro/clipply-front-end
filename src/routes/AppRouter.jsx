import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import PrivateRoute          from '../components/auth/PrivateRoute.jsx'
import AppLayout             from '../components/layout/AppLayout.jsx'

import LoginPage             from '../pages/auth/LoginPage.jsx'
import NotFoundPage          from '../pages/NotFoundPage.jsx'

// Admin
import AdminAppointmentsPage from '../pages/admin/AppointmentsPage.jsx'
import ProductsPage          from '../pages/admin/ProductsPage.jsx'
import SchedulePage          from '../pages/admin/SchedulePage.jsx'
import TeamPage              from '../pages/admin/TeamPage.jsx'
import CustomersPage         from '../pages/admin/CustomersPage.jsx'

// Professional
import ProfessionalAgendaPage from '../pages/professional/AgendaPage.jsx'

// Public
import BookingPage           from '../pages/public/BookingPage.jsx'
import CancelPage            from '../pages/public/CancelPage.jsx'

// Support
import SupportCompaniesPage  from '../pages/support/CompaniesPage.jsx'

function AppRouter() {
  return React.createElement(
    Routes,
    null,

    // ── Pública: Login ────────────────────────────────────
    React.createElement(Route, { path: '/login', element: React.createElement(LoginPage) }),

    // ── Públicas: Agendamento por slug ────────────────────
    React.createElement(Route, { path: '/:slug', element: React.createElement(BookingPage) }),
    React.createElement(Route, { path: '/appointment/cancel/:token', element: React.createElement(CancelPage) }),

    // ── Autenticadas: Admin ───────────────────────────────
    React.createElement(
      Route,
      {
        path: '/admin',
        element: React.createElement(
          PrivateRoute,
          null,
          React.createElement(AppLayout)
        ),
      },
      React.createElement(Route, { index: true, element: React.createElement(AdminAppointmentsPage) }),
      React.createElement(Route, { path: 'produtos',  element: React.createElement(ProductsPage) }),
      React.createElement(Route, { path: 'horarios',  element: React.createElement(SchedulePage) }),
      React.createElement(Route, { path: 'equipe',    element: React.createElement(TeamPage) }),
      React.createElement(Route, { path: 'clientes',  element: React.createElement(CustomersPage) })
    ),

    // ── Autenticadas: Professional ────────────────────────
    React.createElement(
      Route,
      {
        path: '/professional',
        element: React.createElement(
          PrivateRoute,
          null,
          React.createElement(AppLayout)
        ),
      },
      React.createElement(Route, { index: true, element: React.createElement(ProfessionalAgendaPage) })
    ),

    // ── Autenticadas: Support ─────────────────────────────
    React.createElement(
      Route,
      {
        path: '/support',
        element: React.createElement(
          PrivateRoute,
          null,
          React.createElement(AppLayout)
        ),
      },
      React.createElement(Route, { index: true, element: React.createElement(SupportCompaniesPage) })
    ),

    // ── Raiz: redireciona para /admin ─────────────────────
    React.createElement(Route, { path: '/', element: React.createElement(Navigate, { to: '/admin', replace: true }) }),

    // ── 404 ───────────────────────────────────────────────
    React.createElement(Route, { path: '*', element: React.createElement(NotFoundPage) })
  )
}

export default AppRouter
