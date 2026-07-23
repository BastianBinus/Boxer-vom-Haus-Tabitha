import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError(authError.message)
    setLoading(false)
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
          {error && <div className="alert alert-error">{error}</div>}

          <div className="field">
            <label className="field-label" htmlFor="email">E-Mail</label>
            <input
              id="email"
              className="field-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">Passwort</label>
            <input
              id="password"
              className="field-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Wird angemeldet…' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
}
