import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../hooks/useApi'
import { useGameStore } from '../store/gameStore'

const TYPES = [
  { value: 'TEXT', label: '📝 Text', desc: 'Text question and options' },
  { value: 'IMAGE', label: '🖼️ Image', desc: 'Image as the question prompt' },
  { value: 'AUDIO', label: '🎵 Audio', desc: 'Audio clip as the question prompt' },
]

function QuestionForm({ onAdd, index }) {
  const [type, setType] = useState('TEXT')
  const [prompt, setPrompt] = useState('')
  const [timeLimit, setTimeLimit] = useState(30)
  const [mediaFile, setMediaFile] = useState(null)
  const [options, setOptions] = useState([
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setCorrect = (i) => setOptions(opts => opts.map((o, j) => ({ ...o, correct: j === i })))
  const setOptionText = (i, text) => setOptions(opts => opts.map((o, j) => j === i ? { ...o, text } : o))
  const addOption = () => options.length < 6 && setOptions(o => [...o, { text: '', correct: false }])
  const removeOption = (i) => options.length > 2 && setOptions(opts => opts.filter((_, j) => j !== i))

  const handleSave = async (quizId) => {
    setError('')
    const validOptions = options.filter(o => o.text.trim())
    if (!prompt.trim()) return setError('Question prompt is required')
    if (validOptions.length < 2) return setError('At least 2 options required')
    if (!validOptions.some(o => o.correct)) return setError('Mark one option as correct')

    setSaving(true)
    try {
      const formData = new FormData()
      const dto = { type, prompt, timeLimitSeconds: timeLimit, options: validOptions.map((o, i) => ({ ...o, orderIndex: i })) }
      formData.append('question', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
      if (mediaFile) formData.append('media', mediaFile)
      const q = await api.postForm(`/api/quizzes/${quizId}/questions`, formData)
      onAdd(q)
      setPrompt(''); setOptions([{ text:'',correct:false },{ text:'',correct:false },{ text:'',correct:false },{ text:'',correct:false }])
      setMediaFile(null); setType('TEXT')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return { type, setType, prompt, setPrompt, timeLimit, setTimeLimit, mediaFile, setMediaFile,
           options, setCorrect, setOptionText, addOption, removeOption, saving, error, handleSave }
}

export default function HostQuizBuilder() {
  const navigate = useNavigate()
  const { setRoom, setRole } = useGameStore()

  const [quizTitle, setQuizTitle] = useState('')
  const [quizId, setQuizId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [creatingQuiz, setCreatingQuiz] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [error, setError] = useState('')

  // Current question form state
  const [qType, setQType] = useState('TEXT')
  const [qPrompt, setQPrompt] = useState('')
  const [qTimeLimit, setQTimeLimit] = useState(30)
  const [qMediaFile, setQMediaFile] = useState(null)
  const [qOptions, setQOptions] = useState([
    { text: '', correct: false }, { text: '', correct: false },
    { text: '', correct: false }, { text: '', correct: false },
  ])
  const [qSaving, setQSaving] = useState(false)
  const [qError, setQError] = useState('')

  const handleCreateQuiz = async () => {
    if (!quizTitle.trim()) return setError('Give your quiz a title')
    setCreatingQuiz(true)
    try {
      const quiz = await api.post('/api/quizzes', { title: quizTitle })
      setQuizId(quiz.id)
    } catch (e) { setError(e.message) }
    finally { setCreatingQuiz(false) }
  }

  const handleAddQuestion = async () => {
    setQError('')
    const valid = qOptions.filter(o => o.text.trim())
    if (!qPrompt.trim()) return setQError('Prompt is required')
    if (valid.length < 2) return setQError('At least 2 options required')
    if (!valid.some(o => o.correct)) return setQError('Mark one correct answer')

    setQSaving(true)
    try {
      const formData = new FormData()
      const dto = { type: qType, prompt: qPrompt, timeLimitSeconds: qTimeLimit,
                    options: valid.map((o, i) => ({ ...o, orderIndex: i })) }
      formData.append('question', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
      if (qMediaFile) formData.append('media', qMediaFile)
      const q = await api.postForm(`/api/quizzes/${quizId}/questions`, formData)
      setQuestions(prev => [...prev, q])
      setQPrompt(''); setQOptions([{text:'',correct:false},{text:'',correct:false},{text:'',correct:false},{text:'',correct:false}])
      setQMediaFile(null); setQType('TEXT')
    } catch (e) { setQError(e.message) }
    finally { setQSaving(false) }
  }

  const handleStartLobby = async () => {
    if (questions.length === 0) return setError('Add at least one question')
    setCreatingRoom(true)
    try {
      const hostSessionId = crypto.randomUUID()
      const room = await api.post('/api/rooms', { quizId, hostSessionId })
      setRole('host')
      setRoom(room.roomCode, room.roomId, quizId)
      localStorage.setItem('qb_session', JSON.stringify({ role: 'host', sessionId: hostSessionId, roomCode: room.roomCode }))
      navigate(`/room/${room.roomCode}/host-lobby`)
    } catch (e) { setError(e.message) }
    finally { setCreatingRoom(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>← Back</button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Quiz</h1>
        </div>

        {!quizId ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
            <label className="label">Quiz Title</label>
            <input className="input" placeholder="e.g. Friday Night Trivia" value={quizTitle}
                   onChange={e => setQuizTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateQuiz()} />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 8 }}>{error}</p>}
            <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}
                    onClick={handleCreateQuiz} disabled={creatingQuiz}>
              {creatingQuiz ? 'Creating…' : 'Create Quiz →'}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{quizTitle}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {questions.length} question{questions.length !== 1 ? 's' : ''} added
                  </div>
                </div>
                {questions.length > 0 && (
                  <button className="btn btn-success" onClick={handleStartLobby} disabled={creatingRoom}>
                    {creatingRoom ? 'Creating room…' : '🚀 Open Lobby'}
                  </button>
                )}
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 8 }}>{error}</p>}
            </div>

            {/* Added questions list */}
            {questions.length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {questions.map((q, i) => (
                  <div key={q.id} className="card" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700, minWidth: 28 }}>Q{i+1}</span>
                    <span style={{ flex: 1, fontSize: '0.95rem' }}>{q.prompt}</span>
                    <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>{q.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{q.timeLimitSeconds}s</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add question form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 700 }}>
                ✚ Add Question {questions.length + 1}
              </h3>

              {/* Question type */}
              <label className="label">Question Type</label>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                {TYPES.map(t => (
                  <button key={t.value}
                    onClick={() => setQType(t.value)}
                    className="btn"
                    style={{
                      border: `2px solid ${qType === t.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: qType === t.value ? 'rgba(124,58,237,0.15)' : 'var(--surface2)',
                      flexDirection: 'column', gap: 2, padding: '10px 8px',
                    }}>
                    <span>{t.label}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{t.desc}</span>
                  </button>
                ))}
              </div>

              {/* Media upload (IMAGE/AUDIO) */}
              {qType !== 'TEXT' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Upload {qType === 'IMAGE' ? 'Image' : 'Audio'}</label>
                  <input type="file" accept={qType === 'IMAGE' ? 'image/*' : 'audio/*'}
                         className="input" style={{ padding: '8px 12px' }}
                         onChange={e => setQMediaFile(e.target.files?.[0] || null)} />
                </div>
              )}

              {/* Prompt */}
              <label className="label">Question Prompt</label>
              <textarea className="input" rows={3} placeholder="What is the capital of France?"
                        value={qPrompt} onChange={e => setQPrompt(e.target.value)}
                        style={{ resize: 'vertical', marginBottom: 16 }} />

              {/* Time limit */}
              <label className="label">Time Limit</label>
              <select className="input" value={qTimeLimit} onChange={e => setQTimeLimit(+e.target.value)}
                      style={{ marginBottom: 16 }}>
                {[10, 15, 20, 30, 45, 60].map(s => <option key={s} value={s}>{s} seconds</option>)}
              </select>

              {/* Options */}
              <label className="label">Answer Options — click ○ to mark correct</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                {qOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setQOptions(opts => opts.map((o, j) => ({ ...o, correct: j === i })))}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${opt.correct ? 'var(--success)' : 'var(--border)'}`,
                        background: opt.correct ? 'var(--success)' : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: '#fff',
                      }}>
                      {opt.correct ? '✓' : ''}
                    </button>
                    <input className="input" placeholder={`Option ${i + 1}`} value={opt.text}
                           onChange={e => setQOptions(opts => opts.map((o, j) => j === i ? { ...o, text: e.target.value } : o))} />
                    {qOptions.length > 2 && (
                      <button onClick={() => setQOptions(opts => opts.filter((_, j) => j !== i))}
                              style={{ background: 'none', color: 'var(--danger)', fontSize: '1.1rem', padding: 4 }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {qOptions.length < 6 && (
                <button className="btn btn-secondary btn-sm" onClick={() => setQOptions(o => [...o, { text: '', correct: false }])}>
                  + Add option
                </button>
              )}

              {qError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 12 }}>{qError}</p>}

              <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}
                      onClick={handleAddQuestion} disabled={qSaving}>
                {qSaving ? 'Saving…' : '✚ Add Question'}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
