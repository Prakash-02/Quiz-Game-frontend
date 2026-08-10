import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../store/gameStore'
import SpinWheel from '../components/SpinWheel'

export default function WheelPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { role, lobbyState, setLobbyState, nickname } = useGameStore()
  const isHost = role === 'host'

  const [wheelWinner, setWheelWinner] = useState(null)
  const [history, setHistory] = useState([])

  useWebSocket(code, {
    onLobby: (data) => { if (!data.event) setLobbyState(data) },
    onWheelResult: (data) => {
      setWheelWinner(data.winner)
      setHistory(prev => [data.winner, ...prev].slice(0, 10))
    },
  })

  const players = (lobbyState?.players || []).map(p => p.nickname)

  const handleSpinResult = async (winner) => {
    setWheelWinner(winner)
    setHistory(prev => [winner, ...prev].slice(0, 10))
    try {
      await api.post(`/api/rooms/${code}/wheel-spin`, { winner })
    } catch (e) {
      console.error('Failed to broadcast wheel result', e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button className="btn btn-secondary btn-sm"
                  onClick={() => navigate(isHost ? `/room/${code}/host-lobby` : `/room/${code}/player-lobby`)}>
            ← Back to Lobby
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900 }}>🎡 Wheel of Names</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Room: <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>{code}</span>
              {' · '}{players.length} player{players.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
          {/* Wheel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
            {isHost ? (
              <SpinWheel
                players={players}
                onResult={handleSpinResult}
              />
            ) : (
              /* Player view: show wheel read-only + winner announcement */
              <div style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                  Waiting for host to spin…
                </p>
                <AnimatePresence>
                  {wheelWinner && (
                    <motion.div
                      key={wheelWinner}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      style={{
                        background: 'var(--surface2)',
                        border: '2px solid var(--accent)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '32px 48px',
                      }}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
                      <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Selected!</div>
                      <div style={{
                        fontSize: '2.5rem', fontWeight: 900,
                        color: wheelWinner === nickname ? 'var(--warning)' : 'var(--accent-light)',
                      }}>
                        {wheelWinner}
                      </div>
                      {wheelWinner === nickname && (
                        <div style={{ color: 'var(--warning)', fontWeight: 700, marginTop: 8 }}>
                          That's you! 🎯
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* History panel */}
          <div style={{ minWidth: 160 }}>
            <div className="card">
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase',
                           letterSpacing: '0.08em', marginBottom: 12 }}>
                Spin History
              </h3>
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No spins yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map((name, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '6px 10px', borderRadius: 8,
                        background: i === 0 ? 'rgba(124,58,237,0.2)' : 'var(--surface2)',
                        border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                        fontSize: '0.85rem', fontWeight: i === 0 ? 700 : 400,
                      }}>
                      {i === 0 && <span style={{ marginRight: 4 }}>🏆</span>}
                      {name}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Players list */}
            <div className="card" style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase',
                           letterSpacing: '0.08em', marginBottom: 12 }}>
                Players
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {players.map(p => (
                  <div key={p} style={{
                    fontSize: '0.85rem', padding: '4px 8px', borderRadius: 6,
                    background: 'var(--surface2)',
                    fontWeight: p === nickname ? 700 : 400,
                    color: p === nickname ? 'var(--accent-light)' : 'var(--text)',
                  }}>
                    {p}{p === nickname ? ' (you)' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
