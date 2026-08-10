import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const initialNonPersistedState = {
  roomId: null,
  quizId: null,
  lobbyState: null,
  phase: 'lobby',
  currentQuestion: null,
  selectedOptionId: null,
  answerResult: null,
  leaderboard: [],
  finalResults: null,
  serverWaking: false,
}

export const useGameStore = create(
  persist(
    (set) => ({
      // Persisted fields
      role: null,
      sessionId: null,
      playerId: null,
      nickname: null,
      roomCode: null,

      // Ephemeral fields
      ...initialNonPersistedState,

      // Actions
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
      
      reset: () => {
        set({
          role: null,
          sessionId: null,
          playerId: null,
          nickname: null,
          roomCode: null,
          ...initialNonPersistedState,
        })
      },
    }),
    {
      name: 'qb_session',
      storage: createJSONStorage(() => localStorage),
      // Only persist identity/session properties to local storage
      partialize: (state) => ({
        role: state.role,
        sessionId: state.sessionId,
        playerId: state.playerId,
        nickname: state.nickname,
        roomCode: state.roomCode,
      }),
    }
  )
)