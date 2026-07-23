import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'bvt_auth'

interface AuthContextValue {
  authed: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  const login = (password: string) => {
    const correct = password === import.meta.env.VITE_ADMIN_PASSWORD
    if (correct) {
      localStorage.setItem(STORAGE_KEY, '1')
      setAuthed(true)
    }
    return correct
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
