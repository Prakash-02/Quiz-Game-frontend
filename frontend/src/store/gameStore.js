import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Session info
  role: null,           // 'host' | 'player'
  sessionId: null,
  playerId: null,
  nickname: null,

  // Room
  roomCode: null,
  roomId: null,
  quizId: null,

  // Lobby state
  lobbyState: null,

  // Game phase: 'lobby' | 'question' | 'round-result' | 'final'
  phase: 'lobby',

  // Current question
  currentQuestion: null,
  selectedOptionId: null,
  answerResult: null,

  // Leaderboard
  leaderboard: [],
  finalResults: null,

  // UI
  serverWaking: false,

  setRole: (role) => set({ role }),
  setSession: (sessionId, playerId, nickname) => set({ sessionId, playerId, nickname }),
  setRoom: (roomCode, roomId, quizId) => set({ roomCode, roomId, quizId }),
  setLobbyState: (lobbyState) => set({ lobbyState }),
  setPhase: (phase) => set({ phase }),
  setCurrentQuestion: (q) => set({ currentQuestion: q, selectedOptionId: null, answerResult: null }),
  setSelectedOption: (id) => set({ selectedOptionId: id }),
  setAnswerResult: (result) => set({ answerResult: result }),
  setLeaderboard: (entries) => set({ leaderboard: entries }),
  setFinalResults: (results) => set({ finalResults: results, phase: 'final' }),
  setServerWaking: (v) => set({ serverWaking: v }),
  reset: () => set({
    role: null, sessionId: null, playerId: null, nickname: null,
    roomCode: null, roomId: null, quizId: null,
    lobbyState: null, phase: 'lobby',
    currentQuestion: null, selectedOptionId: null, answerResult: null,
    leaderboard: [], finalResults: null,
  }),
}))
