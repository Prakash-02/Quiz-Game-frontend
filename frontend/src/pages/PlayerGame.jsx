import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useWebSocket } from '../hooks/useWebSocket'
import { useGameStore } from '../store/gameStore'
import Timer from '../components/Timer'
import Leaderboard from '../components/Leaderboard'
import WinnerReveal from '../components/WinnerReveal'

const OPTION_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#0891b2']

export default function PlayerGame() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { sessionId, playerId, currentQuestion, setCurrentQuestion, leaderboard, finalResults, setFinalResults, setLeaderboard } = useGameStore()

  const [selectedId, setSelectedId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answerResult, setAnswerResult] = useState(null)
  const [phase, setPhase] = useState('waiting') // waiting | question | round-result | final
  const [correctOptionId, setCorrectOptionId] = useState(null)
  const questionStartRef = useRef(null)
  const [myScore, setMyScore] = useState(0)

  const { sendAnswer } = useWebSocket(code, {
    onQuestion: (q) => {
      setSelectedId(null); setSubmitted(false); setAnswerResult(null); setCorrectOptionId(null)
      questionStartRef.current = Date.now()
      setPhase('question')
    },
    onShowResults: (data) => {
      setCorrectOptionId(data.correctOptionId)
      setPhase('round-result')
    },
    onLeaderboard: (data) => setLeaderboard(data.entries || []),
    onFinalResults: (data) => {
      setFinalResults(data.entries || [])
      setPhase('final')
    },
  })

  const handleSelect = async (optId) => {
    if (submitted || !currentQuestion) return
    setSelectedId(optId)
    setSubmitted(true)
    const timeTaken = Date.now() - (questionStartRef.current || Date.now())

    try {
      const result = await api.post(`/api/rooms/${code}/answer`, {
        sessionId, optionId: optId, timeTakenMs: timeTaken,
      })
      setAnswerResult(result)
      if (result.playerScore !== undefined) setMyScore(result.playerScore)
    } catch (e) {
      console.error('Answer submit error:', e)
    }
  }

  const handleTimerExpire = () => {
    if (!submitted) setSubmitted(true)
  }

  if (phase === 'final' && finalResults) {
    const myEntry = finalResults.find(e => e.id === playerId)
    return (
      <div style={{ minHeight: '100vh', padding: '24px 16px', overflowY: 'auto' }}>
        <WinnerReveal entries={finalResults} highlightId={myEntry?.id || playerId} />
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>← Play Again</button>
        </div>
      </div>
    )
  }

  if (phase === 'waiting') {
    return (
      <div className="page">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p>Waiting for the host…</p>
        </div>
      </div>
    )
  }

  if (phase === 'round-result') {
    return (
      <div className="page">
        <div className="page-content">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {answerResult ? (
              <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '3rem', marginBottom: 8 }}>
                  {answerResult.correct ? '✅' : '❌'}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>
                  {answerResult.correct ? 'Correct!' : 'Incorrect'}
                </h2>
                {answerResult.correct && (
                  <div style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: '1.2rem' }}>
                    +{answerResult.pointsAwarded} pts
                  </div>
                )}
                <div style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                  Total: <strong style={{ color: 'var(--text)' }}>{myScore.toLocaleString()} pts</strong>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ color: 'var(--text-muted)' }}>Time's up!</p>
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className="card">
                <Leaderboard entries={leaderboard.slice(0, 5)} highlightId={playerId} />
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 16 }}>
              Waiting for next question…
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div style={{ minHeight: '100vh', padding: '16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Q{currentQuestion.questionNumber}/{currentQuestion.totalQuestions}
          </span>
          <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>
            {myScore.toLocaleString()} pts
          </span>
        </div>

        {/* Timer */}
        <div style={{ marginBottom: 16 }}>
          <Timer totalSeconds={currentQuestion.timeLimitSeconds} onExpire={handleTimerExpire} />
        </div>

        {/* Question */}
        <motion.div key={currentQuestion.questionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="card" style={{ marginBottom: 16 }}>
          {currentQuestion.mediaUrl && currentQuestion.type === 'IMAGE' && (
            <img src={currentQuestion.mediaUrl} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
          )}
          {currentQuestion.mediaUrl && currentQuestion.type === 'AUDIO' && (
            <audio controls autoPlay src={currentQuestion.mediaUrl} style={{ width: '100%', marginBottom: 12 }} />
          )}
          <p style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4 }}>
            {currentQuestion.prompt}
          </p>
        </motion.div>

        {/* Answer options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion.options?.map((opt, i) => {
            const isSelected = selectedId === opt.id
            const isCorrect = phase === 'round-result' && opt.id === correctOptionId
            const isWrong = phase === 'round-result' && isSelected && opt.id !== correctOptionId
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`answer-option${isSelected ? ' selected' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' incorrect' : ''}`}
                onClick={() => handleSelect(opt.id)}
                disabled={submitted}
                style={{ borderLeftColor: OPTION_COLORS[i % OPTION_COLORS.length], borderLeftWidth: 4 }}
              >
                <span style={{ opacity: 0.6, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
                {opt.text}
                {opt.mediaUrl && <img src={opt.mediaUrl} alt="" style={{ maxHeight: 60, borderRadius: 6, marginLeft: 8 }} />}
              </motion.button>
            )
          })}
        </div>

        {submitted && !answerResult && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 16, fontSize: '0.875rem' }}>
            Answer locked in ✓
          </p>
        )}
      </div>
    </div>
  )
}
