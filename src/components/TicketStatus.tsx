import { STATUS_TEXT } from '../App'

const tone: Record<string, string> = {
  valid: 'status valid',
  already_used: 'status warning',
  returned: 'status danger',
  cancelled: 'status danger',
  invalid_link: 'status danger',
  not_found: 'status danger',
  wrong_session_time: 'status warning',
  not_valid: 'status warning',
}

export default function TicketStatus({ code }: { code?: string }) {
  const value = code || 'error'
  return <div className={tone[value] || 'status warning'}>{STATUS_TEXT[value] || STATUS_TEXT.error}</div>
}
