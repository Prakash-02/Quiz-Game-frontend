# AGENTS.md

## Project summary
- This repo contains QuizBlitz, a live multiplayer quiz game.
- Frontend: React + Vite + Zustand + React Router.
- Backend: Java 21 + Spring Boot + Spring WebSocket + JPA + PostgreSQL.
- Optional media storage: Cloudinary.

## Important directories
- backend/src/main/java/com/quizgame: Spring backend code.
- backend/src/main/resources: application.yml and seed SQL.
- frontend/src: React app pages, hooks, store, and components.
- seed.sh and seed-quiz.json: demo quiz seeding.

## Common commands
- Backend:
  - cd backend
  - ./mvnw spring-boot:run
- Frontend:
  - cd frontend
  - npm install
  - npm run dev
- Seed demo data:
  - ./seed.sh

## Repo conventions
- Keep REST endpoints under /api and WebSocket topics under /topic and /app.
- Preserve the existing room lifecycle: create room -> join -> set mode -> start -> next question -> show results -> final results.
- Frontend state is centralized in frontend/src/store/gameStore.js.
- Backend game flow is primarily handled in GameRoomService.
- Prefer minimal, targeted changes that preserve the existing DTO and payload shape.

## Environment variables
- Backend:
  - SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
  - CORS_ALLOWED_ORIGINS
  - CLOUDINARY_URL
- Frontend:
  - VITE_API_URL
  - VITE_WS_URL

## When making changes
- Update the relevant docs if behavior or flow changes.
- Confirm whether the change touches REST APIs, WebSocket topics, or the shared Zustand store.
- Prefer adding or modifying the smallest viable service/controller/page rather than duplicating logic.
