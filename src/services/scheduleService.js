import api from './api.js'

var scheduleService = {

  list: function() {
    return api.get('/schedule')
  },

  create: function(data) {
    return api.post('/schedule', data)
  },

  update: function(scheduleId, data) {
    return api.put('/schedule/' + scheduleId, data)
  },

  delete: function(scheduleId) {
    return api.delete('/schedule/' + scheduleId)
  },
}

export default scheduleService
