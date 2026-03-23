import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import PageLoader from '../ui/PageLoader.jsx'

function PrivateRoute(props) {
  var children = props.children

  var authCtx  = useAuth()
  var loading  = authCtx.loading
  var isAuthenticated = authCtx.isAuthenticated
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

  return children
}

export default PrivateRoute
