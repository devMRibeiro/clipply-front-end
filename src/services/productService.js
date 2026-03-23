import api from './api.js'

var productService = {

  list: function() {
    return api.get('/product')
  },

  findById: function(productId) {
    return api.get('/product/' + productId)
  },

  create: function(data) {
    return api.post('/product', data)
  },

  update: function(productId, data) {
    return api.put('/product/' + productId, data)
  },

  disable: function(productId) {
    return api.patch('/product/' + productId + '/disable')
  },

  enable: function(productId) {
    return api.patch('/product/' + productId + '/enable')
  },
}

export default productService
