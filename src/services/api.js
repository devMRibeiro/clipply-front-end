import axios from 'axios'

// Instância principal — usa cookies HttpOnly automaticamente
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // envia cookies em todas as requisições
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Flag para evitar loop infinito no refresh ───────────
let isRefreshing = false
let failedQueue = []

function processQueue(error) {
  failedQueue.forEach(function(prom) {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// ─── Interceptor de resposta ─────────────────────────────
api.interceptors.response.use(
  function(response) {
    return response
  },
  function(error) {
    var originalRequest = error.config

    // Se 401 e ainda não tentou o refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Enfileira a requisição enquanto o refresh está em andamento
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve: resolve, reject: reject })
        }).then(function() {
          return api(originalRequest)
        }).catch(function(err) {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise(function(resolve, reject) {
        api.post('/auth/refresh')
          .then(function() {
            processQueue(null)
            resolve(api(originalRequest))
          })
          .catch(function(refreshError) {
            processQueue(refreshError)
            // Redireciona para login se o refresh também falhar
            window.location.href = '/login'
            reject(refreshError)
          })
          .finally(function() {
            isRefreshing = false
          })
      })
    }

    return Promise.reject(error)
  }
)

export default api
