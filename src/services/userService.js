import api from './api.js'

var userService = {

  list: function() {
    return api.get('/management/users')
  },

  create: function(data) {
    return api.post('/management/user', data)
  },

  changePassword: function(data) {
    return api.patch('/management/change-password', data)
  },
}

export default userService
