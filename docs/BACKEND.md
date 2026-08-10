# Backend Guide

## Package map
- controller/: REST endpoints
- service/: business logic
- model/: JPA entities
- repository/: Spring Data repositories
- dto/: request/response payloads
- websocket/: STOMP message entry points
- config/: WebSocket, CORS, Cloudinary setup

## Key classes
- QuizController: quiz creation and question creation endpoints
- RoomController: room creation, join, mode selection, start, next question, result display
- GameRoomService: the central state machine for rooms and game loops
- GameWebSocketController: handles answer submissions over WebSocket
- ScoringService: calculates score based on correctness and speed
- MediaService: Cloudinary upload integration

## Important backend flow
- createRoom() creates a room from an existing quiz and a unique 6-character code
- joinRoom() validates the lobby state and stores a player with a session id
- setMode() enables individual or team mode and assigns teams when needed
- startGame() transitions the room from LOBBY to IN_PROGRESS
- nextQuestion() advances the question index and pushes the next question payload
- submitAnswer() validates the option, records the answer, updates score, and broadcasts results
- showResults() reveals the correct option and publishes the leaderboard

## Configuration
See backend/src/main/resources/application.yml for:
- datasource settings
- JPA/Hibernate behavior
- multipart upload limits
- Cloudinary config
- scoring base values

## Notes for changes
- Preserve existing room and question IDs so the frontend state stays compatible.
- Do not change WebSocket topics unless the frontend is updated too.
- Keep answer scoring logic consistent with the existing rapid-response model.
