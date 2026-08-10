# Development Workflow

## Local startup
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

## Demo data
```bash
./seed.sh
```

## Useful checks
- Backend health is served by the Spring Boot app on port 8080 by default.
- Frontend runs through Vite on port 5173 by default.
- The app expects the backend and frontend URLs to be aligned via VITE_API_URL and VITE_WS_URL.

## Common change checklist
1. Identify whether the change affects REST, WebSocket, or shared store state.
2. Update the backend contract first if the payload shape changes.
3. Update the frontend consumer or page state next.
4. Validate the flow end-to-end with the local dev environment.

## Troubleshooting tips
- If the app cannot connect, verify the backend URL and WebSocket URL environment variables.
- If quiz creation fails, confirm the database is reachable and the backend has started successfully.
- If media uploads fail, Cloudinary is optional and the quiz can still work without it.
