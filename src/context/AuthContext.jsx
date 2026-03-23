import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService.js'

var AuthContext = createContext(null)

// O estado do usuário é derivado do JWT que vive no cookie HttpOnly.
// Como não temos acesso direto ao cookie, guardamos apenas os dados
// decodificados que o back-end retorna (via endpoint /me futuro) ou
// que persistimos no sessionStorage apenas com dados não-sensíveis.
var SESSION_KEY = 'clipply_user'

export function AuthProvider(props) {
  var children = props.children

  var stored = null
  try {
    var raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) stored = JSON.parse(raw)
  } catch (e) {
    // ignora
  }

  var userState = useState(stored)
  var user = userState[0]
  var setUser = userState[1]

  var loadingState = useState(true)
  var loading = loadingState[0]
  var setLoading = loadingState[1]

  // Persiste user no sessionStorage sempre que mudar
  useEffect(function() {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [user])

  // Ao montar: tenta renovar o access token silenciosamente.
  // Se falhar, usuário não está autenticado.
  useEffect(function() {
    if (user) {
      setLoading(false)
      return
    }

    authService.refresh()
      .then(function() {
        // Se chegou aqui é porque há um refresh token válido.
        // O usuário estava logado — porém não temos os dados sem um endpoint /me.
        // Por ora apenas marca como "sessão ativa sem dados completos".
        // Quando implementar /me, chamar aqui e popular o user.
        setLoading(false)
      })
      .catch(function() {
        setUser(null)
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  var login = useCallback(function(email, password) {
    return authService.login(email, password)
      .then(function(response) {
        // O back-end não retorna o user no body (apenas 200 OK).
        // Guardamos o email e derivamos o role de forma temporária.
        // Ao implementar endpoint /me, popular aqui com dados reais.
        var userData = { email: email }
        setUser(userData)
        return response
      })
  }, [])

  var logout = useCallback(function() {
    return authService.logout()
      .finally(function() {
        setUser(null)
      })
  }, [])

  var value = {
    user: user,
    loading: loading,
    login: login,
    logout: logout,
    isAuthenticated: user !== null,
  }

  return React.createElement(AuthContext.Provider, { value: value }, children)
}

export function useAuth() {
  var ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
