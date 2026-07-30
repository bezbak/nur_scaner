import { FormEvent, useState } from 'react'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getApiBase, saveApiBase } from '../lib/api'
import { login } from '../lib/auth'
import type { AuthUser } from '../lib/types'

export default function LoginPage({ setUser }: { setUser: (user: AuthUser | null) => void }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [apiBase, setApiBase] = useState(getApiBase())
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      saveApiBase(apiBase)
      const user = await login(name, password)
      setUser(user)
      navigate('/tickets', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="panel login-panel" onSubmit={submit}>
        <div className="panel-title">Вход работника</div>
        <label>Имя пользователя<input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
        <label>Пароль<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} /></label>
        {showSettings && <label>Backend API<input value={apiBase} onChange={(e) => setApiBase(e.target.value)} /></label>}
        {error && <div className="alert error">{error}</div>}
        <button className="primary" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
        <button type="button" className="plain" onClick={() => setShowSettings((v) => !v)}>
          <Settings size={16} /> Настройки API
        </button>
      </form>
    </div>
  )
}
