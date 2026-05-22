# DishMatch Mobile Frontend

React Native (Expo) frontend for DishMatch — a group restaurant decision app where friends create a session, join via 4-digit code, and swipe yes/no on nearby restaurants.

## Project Structure

```
mobile/
├── src/
│   ├── app/                          # Expo Router (file-based routing)
│   │   ├── _layout.tsx               # Root layout with auth check
│   │   ├── auth/
│   │   │   ├── login.tsx             # Login screen
│   │   │   └── signup.tsx            # Signup screen
│   │   ├── (tabs)/                   # Tab navigation
│   │   │   ├── _layout.tsx           # Tabs wrapper
│   │   │   ├── index.tsx             # Home (create/join session)
│   │   │   └── profile.tsx           # User preferences
│   │   └── session/                  # Session flow
│   │       ├── _layout.tsx           # Session navigation
│   │       ├── lobby.tsx             # Session waiting room
│   │       ├── swipe.tsx             # Restaurant swiping
│   │       └── results.tsx           # Top 3 leaderboard
│   ├── components/
│   │   ├── ui/
│   │   │   └── Button.tsx            # Reusable UI components (Button, Input, Card, Avatar, Chip, LoadingSpinner)
│   │   ├── CodeDisplay.tsx           # Session code display (4-char boxes)
│   │   ├── RestaurantCard.tsx        # Swipeable restaurant card
│   │   ├── SwipeStack.tsx            # Card stack manager
│   │   └── MatchModal.tsx            # Instant match celebration (with confetti)
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth logic, token storage, auto-refresh
│   │   ├── useSession.ts             # Session REST API calls
│   │   └── useWebSocket.ts           # WebSocket event handling
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   ├── global.css                    # Global Tailwind styles
│   └── nativewind-env.d.ts           # NativeWind types
├── tailwind.config.js                # Tailwind + NativeWind config
├── app.json                          # Expo app config
├── package.json                      # Dependencies
└── tsconfig.json                     # TypeScript config
```

## Tech Stack

- **Runtime**: React Native 0.85.3, Expo SDK 56
- **Routing**: expo-router (file-based)
- **Styling**: NativeWind v4 (Tailwind + React Native)
- **State & Hooks**: React 19.2.3
- **Gestures**: react-native-reanimated + react-native-gesture-handler
- **Storage**: expo-secure-store (for JWT tokens)
- **Language**: TypeScript strict

## Design System

### Colors (Dark Mode First)
- **Primary**: `#d97757` (warm coral)
- **Primary Light**: `#f5a76d` (light peach)
- **Primary Dark**: `#c7622a` (deep rust)
- **Background**: `#1a1a1a`
- **Surface**: `#262626`
- **Text**: `#ffffff`
- **Success**: `#4caf50`
- **Destructive**: `#ef5350`

### Typography
- **Headers**: DM Sans (600/700)
- **Body**: Roboto (400/500)
- **Code/Metadata**: IBM Plex Mono

See `DESIGN_NOTES.md` for full design rationale.

## Key Features

### Authentication
- Email/password login and signup
- JWT token storage in secure storage
- Auto-refresh on 401 responses
- Logout clears tokens and navigates to login

### Home Screen
- **Create Session**: POSTs to `/sessions`, creates new group
- **Join Session**: Accepts 4-char alphanumeric code, fetches session, joins via POST

### Session Lobby
- Displays shareable 4-digit code (with copy/share buttons)
- Live member list with online indicators
- "Start Swiping" button (host only)
- WebSocket connection monitors `member_joined` and `phase_change` events

### Swiping Screen
- Restaurant card stack with Tinder-style gestures
  - Drag rotation ±15°, spring snap on release
  - Left swipe = "Pass" (no), Right swipe = "Like" (yes)
  - Tap buttons as alternative to gesture
- Card shows: photo, name, rating, price, cuisine tags, address
- Progress bar (user's swipe count, max 10)
- Member progress strip fed by `swipe_progress` WebSocket events
- Minimum 5 swipes before results visible
- `instant_match` event triggers MatchModal with confetti animation

### Results Screen
- Top 3 leaderboard (ranked by yes-count percentage)
- Each result shows: image, name, rating, agreement %, vote count
- Rank badges (#1, #2, #3)
- "Start New Session" returns to home

### Profile Screen
- Dietary restrictions (chips: vegetarian, vegan, gluten-free, etc.)
- Cuisine preferences (chips)
- Budget range ($, $$, $$$, $$$$)
- Max distance slider (1–10 km)
- Save preferences via PUT `/users/me/preferences`
- Logout button

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Production: Point to your backend server URL.

## Running Locally

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Backend running on `http://localhost:8000`

### Steps

```bash
cd mobile
npm install
npx expo start

# Choose platform:
# - Press 'i' for iOS (simulator)
# - Press 'a' for Android (emulator)
# - Press 'w' for web
```

## WebSocket Events

The app connects to `WS /ws/sessions/{id}?token=...` and listens for:

```typescript
{
  type: "member_joined",
  payload: { user_id: string, name: string }
}

{
  type: "swipe_progress",
  payload: { user_id: string, swipe_count: number }
}

{
  type: "instant_match",
  payload: { restaurant: Restaurant }
}

{
  type: "phase_change",
  payload: { phase: "swiping" | "results" | "matched" }
}

{
  type: "top3_ready",
  payload: { results: SessionResult[] }
}
```

## API Endpoints Used

- `POST /auth/login` — Email/password login
- `POST /auth/signup` — Create account
- `POST /auth/refresh` — Refresh access token
- `GET /users/me` — Current user info
- `PUT /users/me/preferences` — Save dietary/cuisine/budget/distance
- `POST /sessions` — Create session
- `GET /sessions/{code}` — Fetch session by 4-char code
- `POST /sessions/{id}/join` — Join existing session
- `GET /sessions/{id}` — Get session details
- `POST /sessions/{id}/start-swiping` — Host starts swiping phase
- `GET /sessions/{id}/restaurants` — List restaurants for session
- `POST /sessions/{id}/swipe` — Submit swipe (yes/no)
- `GET /sessions/{id}/results` — Get Top 3 results
- `WS /ws/sessions/{id}?token=...` — WebSocket for live events

## Component API

### useAuth()
```typescript
const { user, tokens, isLoading, login, signup, logout, refreshToken } = useAuth();
```

### useSession(tokens)
```typescript
const {
  session,
  restaurants,
  results,
  loading,
  error,
  createSession,
  joinSession,
  getSession,
  startSwiping,
  getRestaurants,
  submitSwipe,
  getResults,
} = useSession(tokens);
```

### useWebSocket(sessionId, token, handlers)
```typescript
const { isConnected, disconnect } = useWebSocket(
  sessionId,
  token,
  {
    onMemberJoined?: (payload) => {},
    onSwipeProgress?: (payload) => {},
    onInstantMatch?: (payload) => {},
    onPhaseChange?: (payload) => {},
    onTop3Ready?: (payload) => {},
  }
);
```

## Styling

All styling uses NativeWind (Tailwind + React Native). Custom colors are defined in `tailwind.config.js` and can be used as:

```tsx
className="bg-primary text-neutral-text rounded-md px-4 py-3"
```

Global component classes (`.btn-primary`, `.card`, `.input`, `.chip`) are defined in `global.css`.

## Future Enhancements

1. **Location Services**: Use `expo-location` to get user's actual lat/lng
2. **Push Notifications**: Integrate `expo-notifications` for session invites
3. **Image Caching**: Use `expo-image` for optimized restaurant photos
4. **Animations**: Expand confetti and card interactions with advanced `react-native-reanimated` sequences
5. **Deep Linking**: Handle invites via shareable links (session code in URL)
6. **Offline Support**: Cache session state locally
7. **Analytics**: Track user behavior and match success rates

## Troubleshooting

**WebSocket connection fails**: Check that backend is running and `EXPO_PUBLIC_API_URL` is correct.

**Styles not updating**: Clear Expo cache: `npx expo start -c`

**Module not found errors**: Run `npm install` again and restart the development server.

## License

MIT
