export const API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:8000'
  : 'https://pawpals-backend.onrender.com'

export interface UserProfile {
  id: string
  email: string
  name: string | null
  friend_code: string
}

export interface FollowedUser {
  id: string
  name: string | null
  friend_code: string
  is_friend: boolean
}

export class UnauthorizedError extends Error {}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  })

  if (response.status === 401) {
    throw new UnauthorizedError('Session expired')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail || `Request to ${path} failed`)
  }

  return response.status === 204 ? (undefined as T) : response.json()
}

export function getMe(token: string): Promise<UserProfile> {
  return request<UserProfile>('/users/me', token)
}

export function updateMe(token: string, name: string): Promise<UserProfile> {
  return request<UserProfile>('/users/me', token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function getFollowing(token: string): Promise<FollowedUser[]> {
  return request<FollowedUser[]>('/follows/following', token)
}

export function getFollowers(token: string): Promise<FollowedUser[]> {
  return request<FollowedUser[]>('/follows/followers', token)
}
