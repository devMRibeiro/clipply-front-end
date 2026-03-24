import api from './api.js'

var authService = {

  login: function(email, password) {
    return api.post('/auth/login', { email: email, password: password })
  },

  logout: function() {
    return api.post('/auth/logout')
  },

  refresh: function() {
    return api.post('/auth/refresh')
  },
  me: function() {
    return api.get('/auth/me')
  },
}

export default authService
