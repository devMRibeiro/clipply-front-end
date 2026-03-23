import api from './api.js'

var customerService = {

  list: function() {
    return api.get('/customer')
  },
}

export default customerService
