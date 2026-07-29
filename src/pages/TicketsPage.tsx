import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { hasPermission } from '../lib/auth'
import type { AuthUser, TicketSummary } from '../lib/types'
import TicketStatus from '../components/TicketStatus'

export default function TicketsPage({ user }: { user: AuthUser | null }) {
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ search: '', date: '', movie: '', hall: '', session: '', status: '' })

  async function load() {
    if (!hasPermission(user, 'tickets.view_list')) {
      setError('Нет права на просмотр списка билетов')
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value.trim()) params.set(key, value.trim())
      })
      const query = params.toString()
      const data = await apiFetch<TicketSummary[] | { results: TicketSummary[] }>(`kassa/tickets/sold/${query ? `?${query}` : ''}`)
      setTickets(Array.isArray(data) ? data : data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    load()
  }

  return (
    <div className="page">
      <form className="filters" onSubmit={submit}>
        <input placeholder="Номер, фильм, покупатель" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <div className="grid-2">
          <input placeholder="ID фильма" value={filters.movie} onChange={(e) => setFilters({ ...filters, movie: e.target.value })} />
          <input placeholder="ID зала" value={filters.hall} onChange={(e) => setFilters({ ...filters, hall: e.target.value })} />
        </div>
        <div className="grid-2">
          <input placeholder="ID сеанса" value={filters.session} onChange={(e) => setFilters({ ...filters, session: e.target.value })} />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Все статусы</option>
            <option value="buyed">Продан</option>
            <option value="clicked">Возвращён</option>
            <option value="cancelled">Аннулирован</option>
          </select>
        </div>
        <button className="primary"><RefreshCw size={17} /> Найти</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="loading-inline">Загрузка...</div>}
      {!loading && tickets.length === 0 && !error && <div className="empty">Проданные билеты не найдены</div>}

      <div className="ticket-list">
        {tickets.map((ticket) => (
          <Link className="ticket-row" key={ticket.id} to={`/ticket/${ticket.public_token}`}>
            <div>
              <div className="row-title">#{ticket.id} {ticket.movie_title}</div>
              <div className="row-sub">{ticket.session_date} {ticket.session_time} · {ticket.hall_name} · ряд/место из PDF</div>
            </div>
            <TicketStatus code={ticket.check_status} />
          </Link>
        ))}
      </div>
    </div>
  )
}
