# QuizBlitz — Live Multiplayer Quiz Game

A Kahoot-style live quiz app with text, image, and audio questions, team mode, and an animated winner reveal.

**Stack:** React (Vite) + Java Spring Boot + PostgreSQL + WebSocket (STOMP/SockJS)

---

## Features

- Host creates a quiz with text / image / audio questions
- Players join via a 6-character room code, no signup needed
- **Individual mode** — every player scored separately
- **Team mode** — host picks 2–4 teams; backend randomly assigns players, with re-shuffle support
- Speed-based scoring (faster correct answers = more points)
- Live leaderboard between questions
- Animated 3rd → 2nd → 1st place reveal with confetti

---

## Local Development

### Prerequisites
- Java 21+, Maven
- Node 18+
- PostgreSQL (or Docker for a quick local DB)

### 1. Start a local Postgres

```bash
docker run -d --name quizgame-db \
  -e POSTGRES_USER=quizgame \
  -e POSTGRES_PASSWORD=quizgame \
  -e POSTGRES_DB=quizgame \
  -p 5432:5432 \
  postgres:16
```

### 2. Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will be at `http://localhost:8080`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### 4. Seed demo data (optional)

```bash
chmod +x seed.sh
./seed.sh
```

This creates a 5-question "General Knowledge" demo quiz. The script prints the quiz ID — use it in the Quiz Builder.

---

## Deploying to Render (Free Tier)

### Step 1 — Create a Render PostgreSQL instance

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → PostgreSQL**
2. Choose the **Free** plan, name it `quizgame-db`
3. Copy the **Internal Database URL** — you'll paste it in Step 2

> **Note:** Render's free Postgres instances are deleted after 90 days. Back up your quiz data (via `pg_dump`) if the project is long-lived.

### Step 2 — Deploy the backend

1. **New → Web Service** → connect your repo
2. Set root directory: `backend`
3. Runtime: **Docker** (uses the provided `Dockerfile`)
4. Set environment variables:

   | Key | Value |
   |-----|-------|
   | `SPRING_DATASOURCE_URL` | Internal DB URL from Step 1 |
   | `SPRING_DATASOURCE_USERNAME` | DB username from Step 1 |
   | `SPRING_DATASOURCE_PASSWORD` | DB password from Step 1 |
   | `CORS_ALLOWED_ORIGINS` | Your frontend Render URL (fill in after Step 3) |
   | `CLOUDINARY_URL` | _(optional)_ Your Cloudinary URL for image/audio uploads |

5. Note the backend's public URL (e.g. `https://quiz-game-backend.onrender.com`)

### Step 3 — Deploy the frontend

1. **New → Static Site** → connect your repo
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Backend URL from Step 2 |
   | `VITE_WS_URL` | Backend URL from Step 2 |

6. After deploy, copy the frontend URL and update `CORS_ALLOWED_ORIGINS` in the backend service settings.

### Step 4 — Seed demo data

```bash
./seed.sh https://quiz-game-backend.onrender.com
```

---

## Cloudinary (for image/audio questions)

Image and audio uploads require a Cloudinary account (free tier: 25 GB storage, 25 GB monthly bandwidth).

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy your **API Environment variable** from the dashboard (format: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`)
3. Set it as `CLOUDINARY_URL` in the backend environment

If `CLOUDINARY_URL` is not set, media uploads return `null` and the question still works (text-only).

---

## Free-tier Gotchas

| Issue | Mitigation |
|-------|-----------|
| **Cold starts** — backend sleeps after ~15 min idle, takes 30–60s to wake | The frontend shows a spinner; the first REST call wakes the server |
| **WebSocket drops** — idle connections may close when service sleeps | STOMP client auto-reconnects with 3s backoff |
| **No persistent disk** — Render free web services have ephemeral disk | All media is stored in Cloudinary or Postgres (no local file writes) |
| **Postgres expiry** — free DB deleted after 90 days | Back up with `pg_dump`, or upgrade to a paid plan |

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/quizzes` | Create a quiz |
| `POST` | `/api/quizzes/{id}/questions` | Add a question (multipart) |
| `GET` | `/api/quizzes` | List all quizzes |
| `POST` | `/api/rooms` | Create a room from a quiz |
| `POST` | `/api/rooms/{code}/join` | Player joins with nickname |
| `POST` | `/api/rooms/{code}/mode` | Set game mode (INDIVIDUAL/TEAM + teamCount) |
| `POST` | `/api/rooms/{code}/shuffle-teams` | Re-randomize team assignments |
| `POST` | `/api/rooms/{code}/start` | Host starts the game |
| `POST` | `/api/rooms/{code}/next-question` | Advance to next question |
| `POST` | `/api/rooms/{code}/show-results` | Reveal correct answer |
| `POST` | `/api/rooms/{code}/answer` | Player submits an answer |
| `GET` | `/api/rooms/{code}/results` | Get final leaderboard |

### WebSocket topics (subscribe)

| Topic | Event |
|-------|-------|
| `/topic/room/{code}/lobby` | Player joined, team assignments, game starting |
| `/topic/room/{code}/question` | New question pushed |
| `/topic/room/{code}/answer-result` | Per-player score update |
| `/topic/room/{code}/show-results` | Correct answer revealed |
| `/topic/room/{code}/leaderboard` | Leaderboard between questions |
| `/topic/room/{code}/final-results` | Final ranked list (triggers animation) |

Send answers to `/app/room/{code}/submit-answer`.

---

## Project Structure

```
quiz-game/
├── backend/
│   ├── src/main/java/com/quizgame/
│   │   ├── config/          # WebSocket, CORS, Cloudinary
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Request/response objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repos
│   │   ├── service/         # Business logic
│   │   └── websocket/       # STOMP message handlers
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   └── src/
│       ├── components/      # Timer, Leaderboard, WinnerReveal
│       ├── hooks/           # useWebSocket, useApi
│       ├── pages/           # Landing, HostQuizBuilder, HostLobby, HostGame, PlayerJoin, PlayerLobby, PlayerGame
│       └── store/           # Zustand game state
├── seed.sh                  # Demo quiz seed script
├── seed-quiz.json           # Demo quiz data
└── README.md
```
