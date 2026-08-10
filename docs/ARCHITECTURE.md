# Architecture Overview

## System shape
QuizBlitz is a split-stack app:
- Frontend: React + Vite + Zustand + React Router
- Backend: Java 21 + Spring Boot + Spring WebSocket + JPA
- Data store: PostgreSQL
- Optional media: Cloudinary for image/audio question assets

## Runtime flow
1. A host creates a quiz through the quiz builder UI.
2. The host creates a room from a quiz via REST.
3. Players join the room with a nickname.
4. The host selects game mode (individual or team), then starts the game.
5. The backend pushes each question over WebSocket.
6. Players submit answers; the backend scores them and broadcast leaderboard updates.
7. When the game ends, the backend publishes final results.

## Main backend responsibilities
- QuizController: create/list/add questions
- RoomController: room lifecycle endpoints
- GameRoomService: orchestrates room state, scoring, team assignment, and broadcasts
- GameWebSocketController: receives player answer submissions

## Main frontend responsibilities
- Routing in App.jsx
- Zustand store in src/store/gameStore.js
- API wrapper in src/hooks/useApi.js
- WebSocket hookup in src/hooks/useWebSocket.js
- Pages manage host/player screens and game flow

## Core entities
- Quiz: top-level quiz definition
- Question: quiz question with options and media
- GameRoom: active room state, code, mode, question index, status
- Player: player identity, score, session id, team membership
- Team: team assignment for team mode
- Answer: record of a submitted answer and scoring result

## Key integration points
- REST: /api/quizzes and /api/rooms
- WebSocket topics: /topic/room/{code}/lobby, /question, /answer-result, /show-results, /leaderboard, /final-results
- Frontend uses VITE_API_URL and VITE_WS_URL for environment configuration
