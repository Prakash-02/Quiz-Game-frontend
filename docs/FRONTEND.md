# Frontend Guide

## Structure
- src/pages/: route-level screens for landing, host, player, and quiz setup flows
- src/components/: reusable UI elements like timer, leaderboard, wheel, and winner reveal
- src/hooks/: useApi.js for REST calls and useWebSocket.js for STOMP/SockJS integration
- src/store/gameStore.js: centralized Zustand store for room state and UI state

## Key routes
- /: landing page
- /host-dashboard: host home/dashboard
- /host: quiz builder
- /join: player join screen
- /room/:code/host-lobby and /room/:code/host-game: host experience
- /room/:code/player-lobby and /room/:code/player-game: player experience
- /room/:code/wheel: wheel-based reveal page

## State model
The Zustand store tracks:
- role, session id, player id, nickname
- room code, room id, quiz id
- lobby state, current question, answer result
- leaderboard and final results
- UI state such as server waking and current phase

## API and WebSocket usage
- useApi.js wraps fetch calls and reads VITE_API_URL.
- useWebSocket.js connects to /ws and subscribes to the room-specific topics.
- The store is updated from websocket events for lobby, question, leaderboard, and final results.

## Notes for changes
- Prefer updating the store and hooks centrally instead of duplicating state in components.
- Keep page props and route expectations aligned with backend payloads.
- If new websocket events are added, update both backend publishers and the frontend subscriber logic.
