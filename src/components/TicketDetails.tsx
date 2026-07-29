import { buildApiUrl } from '../lib/api'
import type { PublicTicket, TicketSummary } from '../lib/types'
import TicketStatus from './TicketStatus'

export default function TicketDetails({ ticket }: { ticket: PublicTicket | TicketSummary }) {
  const s = ticket.sale_snapshot || {}
  const pdfUrl = ticket.pdf_url?.startsWith('http') ? ticket.pdf_url : buildApiUrl(ticket.pdf_url || '')
  const places = s.places?.length
    ? s.places.map((p) => `${p.row}/${p.number}`).join(', ')
    : `${s.row ?? '-'} / ${s.seat ?? '-'}`

  return (
    <section className="panel ticket-card">
      <TicketStatus code={ticket.check_status} />
      <div className="ticket-title">{s.movie_title || ('movie_title' in ticket ? ticket.movie_title : '') || 'Билет'}</div>
      <dl className="details">
        <dt>Тип</dt><dd>{s.movie_type || ('movie_type' in ticket ? ticket.movie_type : '') || '-'}</dd>
        <dt>Формат</dt><dd>{s.format || ('format' in ticket ? ticket.format : '') || '-'}</dd>
        <dt>Возраст</dt><dd>{s.age || '-'}</dd>
        <dt>Дата</dt><dd>{s.session_date || ('session_date' in ticket ? ticket.session_date : '') || '-'}</dd>
        <dt>Время</dt><dd>{s.session_time || ('session_time' in ticket ? ticket.session_time : '') || '-'}</dd>
        <dt>Зал</dt><dd>{s.hall || ('hall_name' in ticket ? ticket.hall_name : '') || '-'}</dd>
        <dt>Ряд / место</dt><dd>{places}</dd>
        <dt>Цена</dt><dd>{String(s.price ?? ticket.price ?? '-')} сом</dd>
        <dt>Оплата</dt><dd>{s.payment_label || ticket.payment_type || '-'}</dd>
        <dt>Продажа</dt><dd>{formatDateTime(s.sold_at || ticket.sold_at)}</dd>
        <dt>Кассир</dt><dd>{s.cashier_name || '-'}</dd>
        <dt>Номер</dt><dd>{s.ticket_id || ticket.id}</dd>
        <dt>Статус оплаты</dt><dd>{ticket.status}</dd>
        <dt>Первый проход</dt><dd>{formatDateTime(ticket.used_at)}</dd>
        <dt>Проверил</dt><dd>{ticket.used_by_name || '-'}</dd>
      </dl>
      {ticket.pdf_url && <a className="secondary action-link" href={pdfUrl} target="_blank" rel="noreferrer">Открыть PDF</a>}
    </section>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}
