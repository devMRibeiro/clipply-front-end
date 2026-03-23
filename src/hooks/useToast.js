import { useState, useCallback } from 'react'

function useToast() {
  var toastsState = useState([])
  var toasts = toastsState[0]
  var setToasts = toastsState[1]

  var addToast = useCallback(function(message, type, duration) {
    var toastType = type || 'success'
    var toastDuration = duration || 3500

    var id = Date.now() + Math.random()

    setToasts(function(prev) {
      return prev.concat([{ id: id, message: message, type: toastType }])
    })

    setTimeout(function() {
      setToasts(function(prev) {
        return prev.filter(function(t) { return t.id !== id })
      })
    }, toastDuration)
  }, [])

  var removeToast = useCallback(function(id) {
    setToasts(function(prev) {
      return prev.filter(function(t) { return t.id !== id })
    })
  }, [])

  function toast(message) { addToast(message, 'success') }
  toast.error   = function(message) { addToast(message, 'error') }
  toast.warning = function(message) { addToast(message, 'warning') }
  toast.info    = function(message) { addToast(message, 'info') }

  return { toasts: toasts, toast: toast, removeToast: removeToast }
}

export default useToast
