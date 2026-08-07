import { useEffect, useState } from 'react'

export default function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [totalSeconds])

  const pct = (remaining / totalSeconds) * 100
  const cls = pct <= 25 ? 'danger' : pct <= 50 ? 'warning' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TIME</span>
        <span style={{
          fontSize: '1.5rem', fontWeight: 900,
          color: pct <= 25 ? 'var(--danger)' : pct <= 50 ? 'var(--warning)' : 'var(--text)',
        }}>
          {remaining}s
        </span>
      </div>
      <div className="timer-bar">
        <div
          className={`timer-fill ${cls}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
