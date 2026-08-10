import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useGameStore } from '../store/gameStore'

export default function HostDashboard() {
  const navigate = useNavigate()
  const { setRoom, setRole } = useGameStore()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/quizzes')
      .then(setQuizzes)
      .catch(() => setError('Could not load quizzes'))
      .finally(() => setLoading(false))
  }, [])

  const startGame = async (quizId) => {
    setStarting(quizId)
    setError('')
    try {
      const hostSessionId = crypto.randomUUID()
      const room = await api.post('/api/rooms', { quizId, hostSessionId })
      setRole('host')
      setRoom(room.roomCode, room.roomId, quizId)
      localStorage.setItem('qb_session', JSON.stringify({
        role: 'host', sessionId: hostSessionId, roomCode: room.roomCode,
      }))
      navigate(`/room/${room.roomCode}/host-lobby`)
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 8 }}>
              ← Back
            </button>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900 }}>Host a Game</h1>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/host')}>
            ✚ Create New Quiz
          </button>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</p>}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📋</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>No quizzes yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Create your first quiz to get started
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/host')}>
              ✚ Create Quiz
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 16 }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0,
                }}>
                  🎯
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2 }}>
                    {quiz.title}
                  </div>
                  {quiz.description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', overflow: 'hidden',
                                  textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {quiz.description}
                    </div>
                  )}
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                    {quiz.questions?.length ?? 0} question{(quiz.questions?.length ?? 0) !== 1 ? 's' : ''}
                    {quiz.createdAt && ` · ${new Date(quiz.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => startGame(quiz.id)}
                  disabled={starting === quiz.id}
                  style={{ flexShrink: 0 }}
                >
                  {starting === quiz.id ? 'Opening…' : '🚀 Start'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
