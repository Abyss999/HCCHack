# DishMatch Mobile — Quick Start

## 1. Setup

```bash
cd mobile

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set EXPO_PUBLIC_API_URL to your backend
```

## 2. Start Development Server

```bash
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web (experimental)

## 3. Test Flow

### Authentication
1. On first launch, you'll see **Login** screen
2. Tap "Sign up" to create account with email/password
3. After signup, redirects to **Home** screen

### Create a Session
1. From **Home**, tap **Create Session**
2. This generates a 4-digit code (e.g., `ABC1`)
3. You're taken to **Lobby** showing the code
4. Share the code with friends

### Join a Session
1. Other users tap **Join Session** on Home
2. Enter the 4-digit code
3. They join the Lobby with you

### Start Swiping
1. Once 2+ members are in Lobby, **host** (creator) taps **Start Swiping**
2. Moves to **Swipe** screen with restaurant cards
3. Swipe left (Pass) or right (Like) on each restaurant
4. After 5+ swipes, "See Results" button appears

### Instant Match
- If all members swipe "Like" on the same restaurant
- Confetti animation triggers
- **Match Modal** displays the restaurant details
- Tap "Continue" to see full results

### Results
- **Top 3 leaderboard** shows ranked restaurants
- Each shows agreement % and member votes
- Tap "Start New Session" to return home

## 4. API Connection

Make sure your backend is running:

```bash
# From backend directory
docker compose up -d
uvicorn main:app --reload
# Backend runs on http://localhost:8000
```

Mobile app connects to this backend via:
- REST: All session/user operations
- WebSocket: Live member updates, match events

## 5. Customize

### Change Colors
Edit `tailwind.config.js` in the `colors` section:
```js
primary: {
  DEFAULT: "#d97757",  // Change main color here
  light: "#f5a76d",
  dark: "#c7622a",
  accent: "#e8a885",
},
```

### Change Fonts
Fonts are loaded in `src/global.css` from Google Fonts. Edit the import or swap font family names.

### Adjust Animations
Swipe card animations are in `src/components/RestaurantCard.tsx`:
- `rotateZ`: ±15° rotation angle
- `tension/damping`: Spring physics
- Duration: 300–400ms

Confetti in `src/components/MatchModal.tsx`:
- `particles`: 50 (increase for more)
- Duration: 1.5s animation

## 6. Build for Production

```bash
# Create EAS account (Expo)
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

Or use Expo's managed hosting to deploy directly.

## 7. Common Issues

**WebSocket "403" on swipe submit**: Token expired. App will auto-refresh, but ensure `/auth/refresh` works.

**Restaurant cards not appearing**: Backend must return restaurants from `GET /sessions/{id}/restaurants`.

**Styles look wrong**: Run `npx expo start -c` to clear cache.

**TypeScript errors**: Run `npx tsc --noEmit` to check. Most are non-fatal in Expo.

---

**Need help?** Check `DESIGN_NOTES.md` for design rationale or `README.md` for full API docs.
