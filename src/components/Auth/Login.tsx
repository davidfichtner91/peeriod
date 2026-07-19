import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Logo } from '../Logo'

/** Chyby ze Supabase přeložené do lidské řeči. */
function translateError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('nemá povolený přístup') || m.includes('not allowed'))
    return 'Tento účet nemá do PEERIOD přístup.'
  if (m.includes('invalid login credentials'))
    return 'Nesprávný e-mail nebo heslo.'
  if (m.includes('email not confirmed'))
    return 'E-mail zatím není potvrzený. Zkontroluj schránku.'
  if (m.includes('database error') || m.includes('unexpected_failure'))
    return 'Tento účet nemá do PEERIOD přístup.'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Nepodařilo se spojit se serverem. Zkus to znovu.'
  return message
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Přihlášení se nezdařilo'
      setError(translateError(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (err) {
      setError(translateError(err.message))
      setGoogleLoading(false)
    }
    // při úspěchu prohlížeč odchází na Google, stav už neřešíme
  }

  return (
    <div className="loginstage">
      <div className="logincard">
        <div className="loginhead">
          <Logo variant="gradient" size={52} className="mx-auto" />
          <h1>PEERIOD</h1>
          <p>Rozumět jejímu cyklu je snazší, než to vypadá.</p>
        </div>

        {error && <div className="alert" role="alert">{error}</div>}

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
            <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6v-3H1.8a12 12 0 0 0 0 10.7l3.8-3z" />
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 0 0 1.8 7.1l3.8 3C6.5 7.3 9 4.8 12 4.8z" />
          </svg>
          {googleLoading ? 'Přesměrovávám…' : 'Pokračovat přes Google'}
        </button>

        <div className="sep">nebo e-mailem</div>

        <form onSubmit={handleSubmit}>
          <div className="formrow">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="jmeno@email.cz"
            />
          </div>

          <div className="formrow">
            <label htmlFor="login-password">Heslo</label>
            <input
              id="login-password"
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || googleLoading}>
            {loading ? 'Přihlašuji…' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  )
}
