import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  localStorage.clear()
})

test('starts with no token when localStorage is empty', () => {
  const { result } = renderHook(() => useAuth(), { wrapper })
  expect(result.current.token).toBeNull()
})

test('login persists the token to localStorage and updates state', () => {
  const { result } = renderHook(() => useAuth(), { wrapper })

  act(() => result.current.login('test-jwt-value'))

  expect(result.current.token).toBe('test-jwt-value')
  expect(localStorage.getItem('pawpals_token')).toBe('test-jwt-value')
})

test('logout clears the token from both state and localStorage', () => {
  localStorage.setItem('pawpals_token', 'test-jwt-value')
  const { result } = renderHook(() => useAuth(), { wrapper })

  act(() => result.current.logout())

  expect(result.current.token).toBeNull()
  expect(localStorage.getItem('pawpals_token')).toBeNull()
})
