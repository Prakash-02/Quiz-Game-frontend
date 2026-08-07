import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const MEDAL_COLORS = ['#fbbf24', '#9ca3af', '#b45309']
const MEDAL_LABELS = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place']

export default function WinnerReveal({ entries = [], highlightId }) {
  const top3 = [...entries].sort((a, b) => a.rank - b.rank).slice(0, 3)
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean) // 2nd, 1st, 3rd layout
  const [revealed, setRevealed] = useState(0)
  const fired = useRef(false)

  useEffect(() => {
    const timers = []
    // Reveal 3rd → 2nd → 1st with delays
    const order = [2, 1, 0] // indices for 3rd, 2nd, 1st
    order.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), i * 1400))
    })
    // Confetti after 1st place reveals (index 0 = 1st in sorted order, reveals last)
    timers.push(setTimeout(() => {
      if (!fired.current) {
        fired.current = true
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } })
        setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.1, y: 0.6 } }), 300)
        setTimeout(() => confetti({ particleCount: 100, spread: 60, origin: { x: 0.9, y: 0.6 } }), 600)
      }
    }, 3 * 1400))
    return () => timers.forEach(clearTimeout)
  }, [])

  const revealOrder = [top3[2], top3[1], top3[0]].filter(Boolean) // 3rd reveals first, then 2nd, then 1st

  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 40, color: 'var(--accent-light)' }}
      >
        Final Results
      </motion.h1>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
        {revealOrder.map((entry, revealIdx) => (
          <AnimatePresence key={entry?.id}>
            {revealed > revealIdx && entry && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 0.7 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  order: entry.rank === 1 ? 1 : entry.rank === 2 ? 0 : 2,
                }}
              >
                <div style={{
                  fontSize: entry.rank === 1 ? '1.5rem' : '1.1rem',
                  fontWeight: 900,
                  color: MEDAL_COLORS[entry.rank - 1],
                }}>
                  {MEDAL_LABELS[entry.rank - 1]}
                </div>
                <motion.div
                  animate={entry.rank === 1 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    background: 'var(--surface)',
                    border: `3px solid ${MEDAL_COLORS[entry.rank - 1]}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 28px',
                    minWidth: entry.rank === 1 ? 160 : 130,
                    boxShadow: entry.rank === 1 ? `0 0 40px ${MEDAL_COLORS[0]}55` : undefined,
                  }}
                >
                  {entry.teamColor && (
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: entry.teamColor, margin: '0 auto 8px',
                    }} />
                  )}
                  <div style={{
                    fontWeight: 800,
                    fontSize: entry.rank === 1 ? '1.2rem' : '1rem',
                    marginBottom: 4,
                    wordBreak: 'break-word',
                  }}>
                    {entry.name}
                  </div>
                  <div style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: '1.1rem' }}>
                    {entry.score.toLocaleString()} pts
                  </div>
                  {highlightId === entry.id && (
                    <div style={{ color: 'var(--accent-light)', fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>
                      THAT'S YOU!
                    </div>
                  )}
                </motion.div>
                <div style={{
                  background: MEDAL_COLORS[entry.rank - 1] + '33',
                  border: `2px solid ${MEDAL_COLORS[entry.rank - 1]}`,
                  borderRadius: '8px 8px 0 0',
                  height: entry.rank === 1 ? 80 : entry.rank === 2 ? 55 : 35,
                  width: 40,
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {entries.length > 3 && (
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 12 }}>
            Other players
          </div>
          {entries.slice(3).map(entry => (
            <div key={entry.id} className="leaderboard-row" style={{ marginBottom: 8 }}>
              <div className="rank-badge rank-other">{entry.rank}</div>
              <div style={{ flex: 1 }}>
                {entry.teamColor && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.teamColor, display: 'inline-block', marginRight: 6 }} />
                )}
                <span style={{ fontWeight: 600 }}>{entry.name}</span>
                {highlightId === entry.id && <span style={{ marginLeft: 6, fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 700 }}>YOU</span>}
              </div>
              <span style={{ fontWeight: 700 }}>{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
