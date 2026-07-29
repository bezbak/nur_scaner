import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { hasPermission } from '../lib/auth'
import type { AuthUser, PublicTicket, TicketSummary } from '../lib/types'
import TicketDetails from '../components/TicketDetails'

export default function TicketPage({ user }: { user: AuthUser | null }) {
  const { token = '' } = useParams()
  const [ticket, setTicket] = useState<PublicTicket | TicketSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<PublicTicket>(`kassa/public/tickets/${encodeURIComponent(token)}/`)
      setTicket(data)
    } catch (err) {
      const status = typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined
      setTicket(null)
      setError(status === 404 ? 'Билет не найден' : status === 410 ? 'Недействительная ссылка' : 'Ошибка проверки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  async function mutate(action: 'confirm-passage' | 'cancel-passage') {
    if (!ticket) return
    setBusy(true)
    setError('')
    try {
      const result = await apiFetch<{ ticket: TicketSummary }>(`kassa/tickets/${ticket.id}/${action}/`, { method: 'POST' })
      setTicket(result.ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка проверки')
      await load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      {loading && <div className="loading-inline">Проверка...</div>}
      {error && <div className="alert error">{error}</div>}
      {ticket && <TicketDetails ticket={ticket} />}

      <div className="actions">
        {user && ticket && hasPermission(user, 'tickets.confirm_passage') && ticket.check_status === 'valid' && (
          <button className="primary" disabled={busy} onClick={() => mutate('confirm-passage')}>Подтвердить проход</button>
        )}
        {user && ticket && hasPermission(user, 'tickets.cancel_passage') && ticket.used_at && (
          <button className="secondary" disabled={busy} onClick={() => mutate('cancel-passage')}>Отменить подтверждение</button>
        )}
        {!user && <Link className="secondary action-link" to="/login">Войти для подтверждения прохода</Link>}
      </div>
    </div>
  )
}
