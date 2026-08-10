import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COLORS = [
  '#7c3aed', '#2563eb', '#16a34a', '#d97706',
  '#dc2626', '#0891b2', '#db2777', '#65a30d',
]

const TWO_PI = 2 * Math.PI

export default function SpinWheel({ players, onResult, disabled }) {
  const canvasRef = useRef(null)
  const rotationRef = useRef(0)
  const velocityRef = useRef(0)
  const rafRef = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)

  const draw = useCallback((rotation) => {
    const canvas = canvasRef.current
    if (!canvas || players.length === 0) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = cx - 12
    const segAngle = TWO_PI / players.length

    ctx.clearRect(0, 0, size, size)

    // Draw segments
    players.forEach((name, i) => {
      const start = rotation + i * segAngle
      const end = start + segAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, start, end)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#0f0f1a'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + segAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      const fontSize = Math.max(9, Math.min(14, 200 / players.length))
      ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 3
      const label = name.length > 10 ? name.slice(0, 9) + '…' : name
      ctx.fillText(label, radius - 12, fontSize / 3)
      ctx.restore()
    })

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, TWO_PI)
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 4
    ctx.stroke()

    // Center hub
    ctx.beginPath()
    ctx.arc(cx, cy, 18, 0, TWO_PI)
    ctx.fillStyle = '#0f0f1a'
    ctx.fill()
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 3
    ctx.stroke()

    // Pointer at top (12 o'clock)
    ctx.save()
    ctx.translate(cx, 0)
    ctx.beginPath()
    ctx.moveTo(0, 4)
    ctx.lineTo(-13, 32)
    ctx.lineTo(13, 32)
    ctx.closePath()
    ctx.fillStyle = '#fbbf24'
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = 8
    ctx.fill()
    ctx.restore()
  }, [players])

  useEffect(() => {
    draw(rotationRef.current)
  }, [draw])

  const spin = () => {
    if (spinning || players.length < 2 || disabled) return
    setSpinning(true)
    setWinner(null)

    // Random velocity between 0.25 and 0.45 radians/frame
    velocityRef.current = 0.25 + Math.random() * 0.2
    // Add extra full rotations for drama (5-10 full spins)
    const extraSpins = (5 + Math.floor(Math.random() * 6)) * TWO_PI
    let accumulated = 0

    const animate = () => {
      velocityRef.current *= 0.988
      accumulated += velocityRef.current
      rotationRef.current += velocityRef.current
      draw(rotationRef.current)

      if (velocityRef.current > 0.002) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        // Determine winner: pointer is at top (-π/2 from 3 o'clock = offset by -π/2)
        // Segments start at rotationRef.current (from 3 o'clock / 0 radians)
        // To find which segment is under the top pointer (-π/2):
        // Relative pointer position on wheel = (-π/2 - rotation) mod 2π
        const segAngle = TWO_PI / players.length
        const relativeAngle = ((-Math.PI / 2 - rotationRef.current) % TWO_PI + TWO_PI) % TWO_PI
        const idx = Math.floor(relativeAngle / segAngle) % players.length
        const winnerName = players[idx]
        setWinner(winnerName)
        setSpinning(false)
        onResult?.(winnerName)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {players.length === 0 ? (
        <div style={{
          width: 360, height: 360, borderRadius: '50%',
          border: '4px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.9rem',
        }}>
          No players yet
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          style={{ maxWidth: '100%', cursor: spinning ? 'wait' : 'pointer', borderRadius: '50%' }}
          onClick={spin}
        />
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={spin}
        disabled={spinning || players.length < 2 || disabled}
        style={{ minWidth: 180 }}
      >
        {spinning ? '🌀 Spinning…' : players.length < 2 ? 'Need 2+ players' : '🎡 Spin the Wheel!'}
      </button>

      <AnimatePresence>
        {winner && !spinning && (
          <motion.div
            key={winner + Date.now()}
            initial={{ scale: 0.5, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            style={{
              textAlign: 'center',
              background: 'var(--surface)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 40px',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              🎉 Selected!
            </div>
            <div style={{
              fontSize: '2rem', fontWeight: 900,
              color: 'var(--accent-light)',
              textShadow: '0 0 30px rgba(168,85,247,0.5)',
            }}>
              {winner}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
