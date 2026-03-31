import api from './api.js'

var publicService = {

  listProducts: function(slug) {
    return api.get('/public/' + slug + '/products')
  },

  listProfessionals: function(slug, productId) {
    return api.get('/public/' + slug + '/professionals', {
      params: { productId: productId },
    })
  },

  getAvailableSlots: function(slug, professionalId, productId, date) {
    return api.get('/public/' + slug + '/slots', {
      params: {
        professionalId: professionalId,
        productId:      productId,
        date:           date,
      },
    })
  },

  createAppointment: function(slug, data) {
    return api.post('/public/' + slug + '/appointment', data)
  },

  cancelAppointment: function(token) {
    return api.get('/public/appointment/cancel/' + token)
  },
}

export default publicService