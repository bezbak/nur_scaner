export type Permission =
  | 'all'
  | 'tickets.view_list'
  | 'tickets.view_detail'
  | 'tickets.scan_qr'
  | 'tickets.confirm_passage'
  | 'tickets.cancel_passage'
  | 'tickets.download_pdf'

export interface AuthUser {
  id: number
  name: string
  roles: string[]
  permissions: Permission[]
}

export interface LoginResponse {
  user: { id: number; name: string }
  tokens: { access: string; refresh: string }
}

export interface TicketSummary {
  id: number
  status: string
  check_status: string
  price: string | number | null
  payment_type?: string | null
  sold_at?: string | null
  fio?: string | null
  public_token: string
  public_url: string
  pdf_url: string
  movie_title?: string
  movie_type?: string
  format?: string
  session_date?: string
  session_time?: string
  hall_name?: string
  used_at?: string | null
  used_by_name?: string | null
  sale_snapshot?: TicketSnapshot
}

export interface TicketSnapshot {
  cinema_name?: string
  ticket_id?: number
  movie_title?: string
  movie_type?: string
  format?: string
  age?: string
  session_date?: string
  session_time?: string
  hall?: string
  row?: string | number
  seat?: string | number
  places?: { row: number; number: number }[]
  price?: string | number
  payment_type?: string | null
  payment_label?: string
  sold_at?: string
  cashier_name?: string
  status?: string
  ticket_url?: string
}

export interface PublicTicket {
  id: number
  status: string
  check_status: string
  price: string | number | null
  payment_type?: string | null
  sold_at?: string | null
  used_at?: string | null
  used_by_name?: string | null
  public_url: string
  pdf_url: string
  sale_snapshot: TicketSnapshot
}
