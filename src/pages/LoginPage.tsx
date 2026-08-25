import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import { API_BASE } from '../api'
import { useAuth } from '../context/useAuth'

function parseHash() {
  const hash = new URLSearchParams(location.hash.slice(1))
  return {
    token: hash.get('token'),
    hasError: hash.has('error'),
  }
}

export default function LoginPage() {
  const auth = useAuth()
  const [{ token: hashToken, hasError }] = useState(parseHash)

  useEffect(() => {
    if (hashToken) {
      auth.login(hashToken)
    }
    if (hashToken || hasError) {
      history.replaceState(null, '', location.pathname + location.search)
    }
    // Only ever run once, on the initial landing from the OAuth redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (auth.token) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="container">
      <h1>🐾 PawPals</h1>
      <p>A cozy space for friends &amp; critters.</p>
      {hasError && <p className="error-msg">Something went wrong signing in. Please try again.</p>}
      <a href={`${API_BASE}/auth/login`} className="btn">
        Sign in with Google
      </a>
    </div>
  )
}
