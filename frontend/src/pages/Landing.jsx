import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-content" style={{ textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>⚡</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 8 }}>
            Quiz<span style={{ color: 'var(--accent-light)' }}>Blitz</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 48, fontSize: '1.1rem' }}>
            Live multiplayer quiz battles — no signup needed
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/host')}
            style={{ width: '100%' }}
          >
            🎯 Host a Game
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/join')}
            style={{ width: '100%' }}
          >
            🎮 Join a Game
          </button>
        </motion.div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 40 }}>
          Text, image, and audio questions · Team mode · Animated winner reveal
        </p>
      </div>
    </div>
  )
}
