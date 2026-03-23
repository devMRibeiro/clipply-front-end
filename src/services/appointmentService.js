import api from './api.js'

var appointmentService = {

  listByCompany: function() {
    return api.get('/appointment')
  },

  listTodayByCompany: function() {
    return api.get('/appointment/today')
  },

  listTodayByProfessional: function() {
    return api.get('/appointment/today/me')
  },

  confirm: function(appointmentId) {
    return api.patch('/appointment/' + appointmentId + '/confirm')
  },

  complete: function(appointmentId) {
    return api.patch('/appointment/' + appointmentId + '/complete')
  },

  noShow: function(appointmentId) {
    return api.patch('/appointment/' + appointmentId + '/no-show')
  },

  // Público — sem autenticação
  getAvailableSlots: function(slug, professionalId, productId, date) {
    return api.get('/public/' + slug + '/slots', {
      params: {
        professionalId: professionalId,
        productId: productId,
        date: date,
      },
    })
  },

  createPublic: function(slug, data) {
    return api.post('/public/' + slug + '/appointment', data)
  },

  cancelByToken: function(token) {
    return api.get('/public/appointment/cancel/' + token)
  },
}

export default appointmentService
