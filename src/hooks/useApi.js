import { useState, useCallback } from 'react'

// Hook genérico para encapsular chamadas de serviço com loading e erro
function useApi(serviceFunction) {
  var dataState = useState(null)
  var data = dataState[0]
  var setData = dataState[1]

  var loadingState = useState(false)
  var loading = loadingState[0]
  var setLoading = loadingState[1]

  var errorState = useState(null)
  var error = errorState[0]
  var setError = errorState[1]

  var execute = useCallback(function() {
    var args = Array.prototype.slice.call(arguments)
    setLoading(true)
    setError(null)

    return serviceFunction.apply(null, args)
      .then(function(response) {
        setData(response.data)
        return response
      })
      .catch(function(err) {
        var message = 'Ocorreu um erro inesperado.'
        if (err.response && err.response.data && err.response.data.message) {
          message = err.response.data.message
        } else if (err.message) {
          message = err.message
        }
        setError(message)
        throw err
      })
      .finally(function() {
        setLoading(false)
      })
  }, [serviceFunction])

  function reset() {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { data: data, loading: loading, error: error, execute: execute, reset: reset }
}

export default useApi
