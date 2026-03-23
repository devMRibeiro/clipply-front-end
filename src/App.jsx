import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AppRouter from './routes/AppRouter.jsx'

function App() {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      AuthProvider,
      null,
      React.createElement(AppRouter)
    )
  )
}

export default App
