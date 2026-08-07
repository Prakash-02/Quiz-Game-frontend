import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../store/gameStore'

const COLORS = { TEAM: '#7c3aed', INDIVIDUAL: '#22c55e' }

export default function HostLobby() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { lobbyState, setLobbyState, setPhase } = useGameStore()
  const [mode, setMode] = useState('INDIVIDUAL')
  const [teamCount, setTeamCount] = useState(2)
  const [starting, setStarting] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const [error, setError] = useState('')

  useWebSocket(code, {
    onLobby: (data) => {
      if (data.event === 'GAME_STARTING') {
        navigate(`/room/${code}/host-game`)
      } else {
        setLobbyState(data)
        if (data.mode) setMode(data.mode)
      }
    },
  })

  const applyMode = async () => {
    try {
      await api.post(`/api/rooms/${code}/mode`, { mode, teamCount })
    } catch (e) { setError(e.message) }
  }

  const shuffle = async () => {
    setShuffling(true)
    try { await api.post(`/api/rooms/${code}/shuffle-teams`) }
    catch (e) { setError(e.message) }
    finally { setShuffling(false) }
  }

  const startGame = async () => {
    if (!lobbyState?.players?.length) return setError('Wait for at least one player to join')
    setStarting(true)
    try {
      await api.post(`/api/rooms/${code}/start`)
      navigate(`/room/${code}/host-game`)
    } catch (e) { setError(e.message); setStarting(false) }
  }

  const players = lobbyState?.players?.filter(p => !p.isHost) || []
  const teams = lobbyState?.teams || []

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Room Code
          </p>
          <div className="room-code">{code}</div>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Share this code with players to join</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Players panel */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Players ({players.length})</h3>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
              <AnimatePresence>
                {players.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Waiting for players…</p>
                )}
                {players.map(p => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{p.nickname}</span>
                    {p.teamColor && (
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999,
                                     background: p.teamColor + '33', color: p.teamColor, fontWeight: 700 }}>
                        {p.teamName}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Mode panel */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Game Mode</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {['INDIVIDUAL', 'TEAM'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="btn"
                  style={{
                    border: `2px solid ${mode === m ? COLORS[m] : 'var(--border)'}`,
                    background: mode === m ? COLORS[m] + '22' : 'var(--surface2)',
                    justifyContent: 'flex-start',
                  }}>
                  {m === 'INDIVIDUAL' ? '👤 Individual' : '👥 Team Mode'}
                </button>
              ))}
            </div>

            {mode === 'TEAM' && (
              <div style={{ marginBottom: 12 }}>
                <label className="label">Number of Teams</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[2, 3, 4].map(n => (
                    <button key={n} onClick={() => setTeamCount(n)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${teamCount === n ? 'var(--accent)' : 'var(--border)'}`,
                        background: teamCount === n ? 'rgba(124,58,237,0.2)' : 'var(--surface2)',
                        color: 'var(--text)', fontWeight: 700,
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={applyMode}>
              Apply Mode
            </button>
          </div>
        </div>

        {/* Teams display */}
        {mode === 'TEAM' && teams.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Team Rosters</h3>
              <button className="btn btn-secondary btn-sm" onClick={shuffle} disabled={shuffling}>
                {shuffling ? 'Shuffling…' : '🔀 Re-shuffle'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${teams.length}, 1fr)`, gap: 12 }}>
              {teams.map(t => (
                <div key={t.id} style={{
                  borderRadius: 12, padding: 12,
                  border: `2px solid ${t.color}`,
                  background: t.color + '11',
                }}>
                  <div style={{ fontWeight: 700, color: t.color, marginBottom: 8 }}>{t.name}</div>
                  {t.memberNicknames.map((n, i) => (
                    <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{n}</div>
                  ))}
                  {t.memberNicknames.length === 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No members yet</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p style={{ color: 'var(--danger)', marginBottom: 12 }}>{error}</p>}

        <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
                onClick={startGame} disabled={starting || players.length === 0}>
          {starting ? 'Starting…' : `🚀 Start Game (${players.length} player${players.length !== 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  )
}
