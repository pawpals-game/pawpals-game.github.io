import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, expect, test } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from './LoginPage'

beforeEach(() => {
  localStorage.clear()
  window.history.pushState({}, '', '/')
})

test('shows the login button when logged out with no fragment', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )

  expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
})

test('reads a token from the URL fragment, persists it, and clears the fragment', () => {
  window.history.pushState({}, '', '/#token=test-jwt-value')

  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )

  expect(localStorage.getItem('pawpals_token')).toBe('test-jwt-value')
  expect(window.location.hash).toBe('')
})

test('shows an error message when the fragment carries #error=', () => {
  window.history.pushState({}, '', '/#error=login_failed')

  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )

  expect(localStorage.getItem('pawpals_token')).toBeNull()
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
})
