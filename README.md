# DishMatch

Group restaurant decision app. Friends join a session via a 4-digit code, swipe yes/no on nearby restaurants, and the app either declares an **instant match** (every member said yes to the same place) or shows a **Top 3** leaderboard ranked by yes-count percentage.

## Stack

| Layer | Tech |
|---|---|
| Mobile | React Native (Expo SDK 56) + expo-router + NativeWind v4 |
| Backend | FastAPI (async) |
| Database | MongoDB via Beanie (Motor + Pydantic) |
| Auth | JWT access + refresh (`python-jose`), bcrypt (`passlib`) |
| Realtime | FastAPI WebSockets |
| Restaurants | Google Places API |
| Push | Expo Push API |
| Local dev | Docker Compose (mongo + mongo-express) |
| Production target | DigitalOcean (App Platform or Droplet) |

## Repo layout

```
HCCHack/
├── backend/        FastAPI + Beanie + MongoDB
├── mobile/         Expo + expo-router + NativeWind
└── CLAUDE.md       Project context for Claude Code sessions
```

## Run it

### Backend

```bash
cd backend
docker compose up -d                       # mongo + mongo-express
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                       # then fill JWT_SECRET + GOOGLE_PLACES_API_KEY
uvicorn main:app --reload                  # http://localhost:8000/docs
```

- Health check: `curl http://localhost:8000/` → `{"status":"ok","service":"dishmatch-api"}`
- Mongo admin UI: `http://localhost:8081` (admin/admin)

### Mobile

```bash
cd mobile
npm install
cp .env.example .env                       # EXPO_PUBLIC_API_URL=http://localhost:8000
npx expo start                             # then press i (iOS) / a (Android) / w (web)
```

**Testing on a real device:** `localhost` in the app points at the *phone*, not your laptop. Set `EXPO_PUBLIC_API_URL` to your laptop's LAN IP (e.g. `http://192.168.1.42:8000`). Find it with `ipconfig getifaddr en0` on macOS.

## Smoke test

1. Open `http://localhost:8000/docs`, hit `POST /auth/signup` with `{email, password (8+ chars), name}` → you get an access token.
2. In the mobile app, sign up / log in with the same flow.
3. **Create session** on home → land in lobby with a 4-char code.
4. From a second device/simulator, sign in as a different user, **Enter code** → both see `member_joined` events live.
5. Host taps **Start swiping** → both navigate to the swipe screen.
6. Swipe yes/no. On unanimous yes → instant match modal fires. After 10 swipes per user → Top 3 leaderboard.

> If `GET /restaurants?session_id=...` returns 503, your `GOOGLE_PLACES_API_KEY` isn't set. Sessions still work; you just won't get restaurant cards.

## API surface

```
POST  /auth/signup | /auth/login | /auth/refresh
GET   /users/me                          PUT /users/me/preferences
POST  /users/me/push-token
POST  /sessions                          GET /sessions/{code}
POST  /sessions/{id}/join                POST /sessions/{id}/start
GET   /sessions/{id}/status              GET /sessions/{id}/results
GET   /restaurants?session_id=...
POST  /sessions/{id}/swipe
WS    /ws/sessions/{id}?token=...
        events: member_joined | swipe_progress | instant_match
                | phase_change | top3_ready
```

## Security model (short version)

- All routes rate-limited via `slowapi` (env-configurable per route: auth, swipe, places, etc.). Keyed per-user when authed, per-IP otherwise.
- Security headers: CSP, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`.
- Request body capped at 1 MB (configurable).
- Production startup refuses to boot if `JWT_SECRET` is the placeholder / < 32 chars or if CORS is wildcard.
- Inputs are Pydantic models — no raw user dicts ever reach Mongo (NoSQL-injection-free by construction).
- Session codes enforced by regex; sessions capped at `MAX_SESSION_MEMBERS` (12).
- WebSocket validates JWT + session membership on connect; frames capped at 1024 bytes.

Full details in [CLAUDE.md](./CLAUDE.md).

## Deployment

The backend is containerized (`backend/Dockerfile`) and config-via-env, so it drops onto DigitalOcean App Platform or a Droplet with no code changes. Set `ENVIRONMENT=production`, a strong `JWT_SECRET`, explicit `CORS_ORIGINS`, and an Atlas connection string in `MONGO_URL`.

## Roadmap

The current matching logic uses simple yes-count aggregation. A future phase will swap `MatchingService` for a vector-based welfare function over MongoDB Atlas Vector Search (Gemini embeddings of dish/mood data). Config is structured so the Atlas swap is just an env var change.
