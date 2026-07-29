import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ListChecks, LogOut, QrCode, Search } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import TicketsPage from './pages/TicketsPage'
import ScannerPage from './pages/ScannerPage'
import TicketPage from './pages/TicketPage'
import { fetchMe, hasPermission } from './lib/auth'
import { setToken } from './lib/api'
import type { AuthUser } from './lib/types'

export type AppContext = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

export const STATUS_TEXT: Record<string, string> = {
  valid: 'Билет действителен',
  already_used: 'Билет уже использован',
  returned: 'Билет возвращён',
  cancelled: 'Билет аннулирован',
  wrong_session_time: 'Сеанс не соответствует текущей дате или времени',
  not_found: 'Билет не найден',
  invalid_link: 'Недействительная ссылка',
  not_valid: 'Билет недействителен',
  error: 'Ошибка проверки',
}

function Shell({ user, setUser }: AppContext) {
  const location = useLocation()
  const navigate = useNavigate()
  const showNav = user && location.pathname !== '/login'

  function logout() {
    setToken('')
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {showNav && (
        <header className="topbar">
          <div>
            <div className="brand">Проверка билетов</div>
            <div className="userline">{user.name}</div>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Выйти">
            <LogOut size={20} />
          </button>
        </header>
      )}
      <main className="content">
        <Routes>
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/tickets" element={<Protected user={user}><TicketsPage user={user} /></Protected>} />
          <Route path="/scan" element={<Protected user={user}><ScannerPage /></Protected>} />
          <Route path="/ticket/:token" element={<TicketPage user={user} />} />
          <Route path="*" element={<Navigate to={user ? '/tickets' : '/login'} replace />} />
        </Routes>
      </main>
      {showNav && (
        <nav className="bottom-nav">
          <NavLink to="/tickets"><ListChecks size={20} /><span>Билеты</span></NavLink>
          <NavLink to="/scan" className={!hasPermission(user, 'tickets.scan_qr') ? 'disabled' : ''}><QrCode size={20} /><span>Сканер</span></NavLink>
          <NavLink to="/tickets"><Search size={20} /><span>Поиск</span></NavLink>
        </nav>
      )}
    </div>
  )
}

function Protected({ user, children }: { user: AuthUser | null; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)
  const value = useMemo(() => ({ user, setUser }), [user])

  useEffect(() => {
    fetchMe().then(setUser).catch(() => setUser(null)).finally(() => setReady(true))
  }, [])

  if (!ready) return <div className="loading">Загрузка...</div>
  return <Shell {...value} />
}
