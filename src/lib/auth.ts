import { apiFetch, setToken } from './api'
import type { AuthUser, LoginResponse, Permission } from './types'

export async function login(name: string, password: string) {
  const response = await apiFetch<LoginResponse>('users/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ name, password }),
  })
  setToken(response.tokens.access)
  return fetchMe()
}

export async function fetchMe() {
  return apiFetch<AuthUser>('users/auth/me/')
}

export function hasPermission(user: AuthUser | null, permission: Permission) {
  return Boolean(user?.permissions.includes('all') || user?.permissions.includes(permission))
}
