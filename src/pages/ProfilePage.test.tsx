import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, test, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import ProfilePage from './ProfilePage'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('pawpals_token', 'test-jwt-value')
})

test('renders profile data once it loads', async () => {
  globalThis.fetch = vi.fn((url: string) => {
    if (url.includes('/users/me')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: '1',
            email: 'chris@example.com',
            name: 'Chris',
            friend_code: 'Z1UDIQJZ',
          }),
      })
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) })
  }) as unknown as typeof fetch

  render(
    <MemoryRouter>
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    </MemoryRouter>,
  )

  await waitFor(() => expect(screen.getByText('Chris')).toBeInTheDocument())
  expect(screen.getByText('Z1UDIQJZ')).toBeInTheDocument()
})
