import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useGameStore } from '../store/gameStore'

export default function PlayerJoin() {
  const navigate = useNavigate()
  const { setSession, setRoom, setRole } = useGameStore()
  const [roomCode, setRoomCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    const code = roomCode.trim().toUpperCase()
    const nick = nickname.trim()
    if (!code || code.length < 4) return setError('Enter a valid room code')
    if (!nick) return setError('Enter a nickname')
    if (nick.length > 32) return setError('Nickname too long (max 32 chars)')

    setLoading(true)
    setError('')
    try {
      const data = await api.post(`/api/rooms/${code}/join`, { nickname: nick })
      setRole('player')
      setSession(data.sessionId, data.playerId, data.nickname)
      setRoom(code, null, null)
      localStorage.setItem('qb_session', JSON.stringify({
        role: 'player', sessionId: data.sessionId, playerId: data.playerId,
        nickname: data.nickname, roomCode: code,
      }))
      navigate(`/room/${code}/player-lobby`)
    } catch (e) {
      setError(e.message || 'Could not join room. Check the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
            ← Back
          </button>

          <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Join a Game</h2>

            <div style={{ marginBottom: 16 }}>
              <label className="label">Room Code</label>
              <input
                className="input"
                placeholder="e.g. AB12CD"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.2rem' }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">Your Nickname</label>
              <input
                className="input"
                placeholder="CoolPlayer123"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={32}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? 'Joining…' : '🎮 Join Game'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
