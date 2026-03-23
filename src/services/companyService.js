import api from './api.js'

// Requer X-API-KEY no header — configurar via variável de ambiente no painel SUPPORT
var companyService = {

  register: function(data, apiKey) {
    return api.post('/clipply/company', data, {
      headers: { 'X-API-KEY': apiKey },
    })
  },

  disable: function(companyId, apiKey) {
    return api.patch('/clipply/company/' + companyId + '/disable', null, {
      headers: { 'X-API-KEY': apiKey },
    })
  },
}

export default companyService
