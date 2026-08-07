import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useGameStore } from '../store/gameStore'

const WS_URL = import.meta.env.VITE_WS_URL || ''

export function useWebSocket(roomCode, handlers) {
  const clientRef = useRef(null)
  const { setPhase, setCurrentQuestion, setLobbyState, setLeaderboard, setFinalResults, setAnswerResult } = useGameStore()

  const handlersRef = useRef(handlers)
  useEffect(() => { handlersRef.current = handlers }, [handlers])

  useEffect(() => {
    if (!roomCode) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomCode}/lobby`, (msg) => {
          const data = JSON.parse(msg.body)
          if (data.event === 'GAME_STARTING') {
            setPhase('starting')
          } else {
            setLobbyState(data)
          }
          handlersRef.current?.onLobby?.(data)
        })

        client.subscribe(`/topic/room/${roomCode}/question`, (msg) => {
          const data = JSON.parse(msg.body)
          setCurrentQuestion(data)
          setPhase('question')
          handlersRef.current?.onQuestion?.(data)
        })

        client.subscribe(`/topic/room/${roomCode}/answer-result`, (msg) => {
          const data = JSON.parse(msg.body)
          handlersRef.current?.onAnswerResult?.(data)
        })

        client.subscribe(`/topic/room/${roomCode}/show-results`, (msg) => {
          const data = JSON.parse(msg.body)
          setPhase('round-result')
          handlersRef.current?.onShowResults?.(data)
        })

        client.subscribe(`/topic/room/${roomCode}/leaderboard`, (msg) => {
          const data = JSON.parse(msg.body)
          setLeaderboard(data.entries || [])
          handlersRef.current?.onLeaderboard?.(data)
        })

        client.subscribe(`/topic/room/${roomCode}/final-results`, (msg) => {
          const data = JSON.parse(msg.body)
          setFinalResults(data.entries || [])
          handlersRef.current?.onFinalResults?.(data)
        })

        handlersRef.current?.onConnect?.()
      },
      onDisconnect: () => handlersRef.current?.onDisconnect?.(),
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [roomCode])

  const sendAnswer = useCallback((optionId, timeTakenMs, sessionId) => {
    clientRef.current?.publish({
      destination: `/app/room/${roomCode}/submit-answer`,
      body: JSON.stringify({ sessionId, optionId, timeTakenMs }),
    })
  }, [roomCode])

  return { sendAnswer, client: clientRef }
}
