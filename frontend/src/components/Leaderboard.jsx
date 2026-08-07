import { motion, AnimatePresence } from 'framer-motion'

export default function Leaderboard({ entries = [], highlightId, title = 'Leaderboard' }) {
  return (
    <div>
      <h3 style={{ marginBottom: 12, fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="leaderboard-row"
              style={{
                border: highlightId === entry.id ? '1px solid var(--accent)' : undefined,
                background: highlightId === entry.id ? 'rgba(124,58,237,0.15)' : undefined,
              }}
            >
              <div className={`rank-badge rank-${entry.rank <= 3 ? entry.rank : 'other'}`}>
                {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank}
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {entry.teamColor && (
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: entry.teamColor, flexShrink: 0,
                  }} />
                )}
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.name}</span>
                {highlightId === entry.id && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontWeight: 700 }}>YOU</span>
                )}
              </div>
              <span style={{ fontWeight: 800, color: 'var(--accent-light)', fontSize: '1.1rem' }}>
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
