import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import {
  getFollowers,
  getFollowing,
  getMe,
  updateMe,
  UnauthorizedError,
  type FollowedUser,
  type UserProfile,
} from '../api'
import { useAuth } from '../context/useAuth'

export default function ProfilePage() {
  const auth = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [following, setFollowing] = useState<FollowedUser[]>([])
  const [followers, setFollowers] = useState<FollowedUser[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    if (!auth.token) return
    const token = auth.token

    Promise.all([getMe(token), getFollowing(token), getFollowers(token)])
      .then(([me, followingList, followersList]) => {
        setProfile(me)
        setNameInput(me.name ?? '')
        setFollowing(followingList)
        setFollowers(followersList)
        setLoading(false)
      })
      .catch((err) => {
        if (err instanceof UnauthorizedError) {
          auth.logout()
        }
      })
    // Only re-run if the token itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token])

  if (!auth.token) {
    return <Navigate to="/" replace />
  }

  if (loading || !profile) {
    return (
      <div className="container">
        <h1>🐾 PawPals</h1>
      </div>
    )
  }

  async function handleSave() {
    setStatusMsg('Saving…')
    try {
      const updated = await updateMe(auth.token!, nameInput)
      setProfile(updated)
      setNameInput(updated.name ?? '')
      setIsEditing(false)
      setStatusMsg('Saved!')
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        auth.logout()
        return
      }
      setStatusMsg(err instanceof Error ? err.message : "Couldn't save. Please try again.")
    }
  }

  function handleCancel() {
    setNameInput(profile!.name ?? '')
    setIsEditing(false)
  }

  async function handleCopyFriendCode() {
    try {
      await navigator.clipboard.writeText(profile!.friend_code)
      setStatusMsg('Friend code copied!')
    } catch {
      setStatusMsg("Couldn't copy. Please copy it manually.")
    }
  }

  return (
    <div className="container">
      <h1>🐾 PawPals</h1>

      <div className="counts">
        <div>
          <div className="count-number">{following.length}</div>
          <div className="count-label">Following</div>
        </div>
        <div>
          <div className="count-number">{followers.length}</div>
          <div className="count-label">Followers</div>
        </div>
      </div>

      <div className="field">
        <div className="field-label">Name</div>
        <div className="field-row">
          {isEditing ? (
            <>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                minLength={2}
                maxLength={12}
                autoFocus
              />
              <button
                className="icon-btn confirm"
                title="Save"
                aria-label="Save"
                onClick={handleSave}
              >
                ✓
              </button>
              <button
                className="icon-btn cancel"
                title="Cancel"
                aria-label="Cancel"
                onClick={handleCancel}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <span className="name-display">{profile.name}</span>
              <button
                className="icon-btn"
                title="Edit name"
                aria-label="Edit name"
                onClick={() => setIsEditing(true)}
              >
                ✏️
              </button>
            </>
          )}
        </div>
      </div>

      <div className="field">
        <div className="field-row centered">
          <span className="friend-code">{profile.friend_code}</span>
          <button
            className="icon-btn"
            title="Copy friend code"
            aria-label="Copy friend code"
            onClick={handleCopyFriendCode}
          >
            📋
          </button>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-secondary" onClick={auth.logout}>
          Log out
        </button>
      </div>
      <p className="status-msg">{statusMsg}</p>
    </div>
  )
}
