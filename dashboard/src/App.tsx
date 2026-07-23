import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { router } from './router'
import './styles/tokens.css'
import './styles/dashboard.css'

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
