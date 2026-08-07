import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../store/gameStore'
import Leaderboard from '../components/Leaderboard'
import WinnerReveal from '../components/WinnerReveal'

export default function HostGame() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { currentQuestion, phase, leaderboard, finalResults, setPhase, setCurrentQuestion, setLeaderboard, setFinalResults } = useGameStore()
  const [answerCounts, setAnswerCounts] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [correctOptionId, setCorrectOptionId] = useState(null)

  useWebSocket(code, {
    onQuestion: (q) => { setShowResults(false); setAnswerCounts({}); setCorrectOptionId(null) },
    onAnswerResult: (data) => {
      setAnswerCounts(prev => ({
        ...prev, [data.playerId]: data.correct
      }))
    },
    onShowResults: (data) => {
      setShowResults(true)
      setCorrectOptionId(data.correctOptionId)
    },
    onLeaderboard: () => {},
    onFinalResults: (data) => {
      setFinalResults(data.entries || [])
    },
  })

  const handleNext = async (action) => {
    setLoading(true)
    try { await api.post(`/api/rooms/${code}/${action}`) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (finalResults) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 16px', overflowY: 'auto' }}>
        <WinnerReveal entries={finalResults} />
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>← New Game</button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Sending first question…</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }}
                  onClick={() => handleNext('next-question')} disabled={loading}>
            {loading ? 'Loading…' : '▶ Show First Question'}
          </button>
        </div>
      </div>
    )
  }

  const answeredCount = Object.keys(answerCounts).length

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div className="room-code" style={{ fontSize: '1.5rem' }}>{code}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Q{currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
            </span>
            <span style={{ color: 'var(--accent-light)', fontWeight: 700 }}>
              {answeredCount} answered
            </span>
          </div>
        </div>

        {/* Question preview */}
        <motion.div key={currentQuestion.questionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
            {currentQuestion.type} · {currentQuestion.timeLimitSeconds}s
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>{currentQuestion.prompt}</p>

          {currentQuestion.mediaUrl && currentQuestion.type === 'IMAGE' && (
            <img src={currentQuestion.mediaUrl} alt="question" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 16 }} />
          )}
          {currentQuestion.mediaUrl && currentQuestion.type === 'AUDIO' && (
            <audio controls src={currentQuestion.mediaUrl} style={{ width: '100%', marginBottom: 16 }} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {currentQuestion.options?.map((opt) => (
              <div key={opt.id} style={{
                padding: '12px 16px', borderRadius: 8,
                border: `2px solid ${showResults && opt.id === correctOptionId ? 'var(--success)' :
                                     showResults && opt.id !== correctOptionId ? 'var(--border)' : 'var(--border)'}`,
                background: showResults && opt.id === correctOptionId ? 'rgba(34,197,94,0.15)' : 'var(--surface2)',
                color: showResults && opt.id === correctOptionId ? 'var(--success)' : 'var(--text)',
                fontWeight: 600,
              }}>
                {opt.text}
                {showResults && opt.id === correctOptionId && <span style={{ marginLeft: 8 }}>✓</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {!showResults ? (
            <button className="btn btn-primary" style={{ flex: 1 }}
                    onClick={() => handleNext('show-results')} disabled={loading}>
              {loading ? '…' : '📊 Show Results'}
            </button>
          ) : (
            <button className="btn btn-success" style={{ flex: 1 }}
                    onClick={() => handleNext('next-question')} disabled={loading}>
              {loading ? '…' : currentQuestion.questionNumber === currentQuestion.totalQuestions
                ? '🏆 Show Final Results' : '▶ Next Question'}
            </button>
          )}
        </div>

        {/* Live leaderboard */}
        {leaderboard.length > 0 && (
          <div className="card">
            <Leaderboard entries={leaderboard} title="Live Leaderboard" />
          </div>
        )}
      </div>
    </div>
  )
}
