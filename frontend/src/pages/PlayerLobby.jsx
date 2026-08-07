import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../store/gameStore'

export default function PlayerLobby() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { nickname, playerId, lobbyState, setLobbyState } = useGameStore()

  useWebSocket(code, {
    onLobby: (data) => {
      if (data.event === 'GAME_STARTING') {
        navigate(`/room/${code}/player-game`)
      } else {
        setLobbyState(data)
      }
    },
    onQuestion: () => navigate(`/room/${code}/player-game`),
  })

  const myInfo = lobbyState?.players?.find(p => p.nickname === nickname)

  return (
    <div className="page">
      <div className="page-content">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>Room</p>
            <div className="room-code">{code}</div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👋</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hey, <span style={{ color: 'var(--accent-light)' }}>{nickname}</span>!</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Waiting for the host to start the game…</p>

            {/* Animated dots */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
                />
              ))}
            </div>
          </div>

          {/* Team assignment */}
          {myInfo?.teamName && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>Your team</p>
              <div style={{
                fontSize: '1.3rem', fontWeight: 800, color: myInfo.teamColor,
                textShadow: `0 0 20px ${myInfo.teamColor}`,
              }}>
                {myInfo.teamName}
              </div>
            </motion.div>
          )}

          {/* Player list */}
          {lobbyState?.players && (
            <div className="card">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 12 }}>
                {lobbyState.players.length} player{lobbyState.players.length !== 1 ? 's' : ''} in lobby
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <AnimatePresence>
                  {lobbyState.players.map(p => (
                    <motion.span key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 600,
                        background: p.nickname === nickname ? 'var(--accent)' : 'var(--surface2)',
                        border: `1px solid ${p.nickname === nickname ? 'var(--accent)' : 'var(--border)'}`,
                      }}>
                      {p.nickname}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
