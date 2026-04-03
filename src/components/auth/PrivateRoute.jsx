import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PageLoader from '../ui/PageLoader.jsx'

function PrivateRoute(props) {
  var children = props.children

  var authCtx  = useAuth()
  var loading  = authCtx.loading
  var isAuthenticated = authCtx.isAuthenticated
  var isFirstAccess = authCtx.isFirstAccess
  var location = useLocation()

  if (loading) {
    return React.createElement(PageLoader, null)
  }

  if (!isAuthenticated) {
    return React.createElement(Navigate, {
      to: '/login',
      state: { from: location },
      replace: true,
    })
  }

  // Se é primeiro acesso e ainda não está na tela de troca de senha, redireciona
  if (isFirstAccess && location.pathname !== '/first-access') {
    return React.createElement(Navigate, {
      to:      '/first-access',
      replace: true,
    })
  }

  return children
}

export default PrivateRoute
