import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (login(password)) {
      navigate('/', { replace: true })
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      padding: '16px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginBottom: '8px',
          }}>
            Zuchtdaten
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '24px',
            color: 'var(--color-ink)',
          }}>
            Boxer vom Hause Tabitha
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--color-surface)',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {error && <div className="alert alert-error">Falsches Passwort.</div>}

          <div className="field">
            <label className="field-label" htmlFor="password">Passwort</label>
            <input
              id="password"
              className="field-input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              required
              autoFocus
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  )
}
