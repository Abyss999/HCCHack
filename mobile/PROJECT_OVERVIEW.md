# DishMatch Mobile — Project Overview

## 📊 Project Statistics

**Lines of Code**: ~4,500
**Files**: 27 application files + 4 documentation files
**Components**: 9 (5 reusable + 4 screen layouts)
**Hooks**: 3 custom (useAuth, useSession, useWebSocket)
**Screens**: 7 full screens
**Dependencies**: 27 (Expo + React Native ecosystem)
**Build Target**: iOS, Android, Web (experimental)

## 🗂️ Directory Structure

```
mobile/
├── src/
│   ├── app/                          # Expo Router (file-based)
│   │   ├── _layout.tsx               # Root auth check
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Home
│   │   │   └── profile.tsx
│   │   └── session/
│   │       ├── _layout.tsx
│   │       ├── lobby.tsx
│   │       ├── swipe.tsx
│   │       └── results.tsx
│   ├── components/
│   │   ├── index.ts                  # Export barrel
│   │   ├── ui/
│   │   │   └── Button.tsx            # 6 UI primitives
│   │   ├── CodeDisplay.tsx
│   │   ├── RestaurantCard.tsx
│   │   ├── SwipeStack.tsx
│   │   ├── MatchModal.tsx
│   │   └── index.ts                  # Component exports
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   ├── useWebSocket.ts
│   │   └── index.ts                  # Hook exports
│   ├── types/
│   │   └── index.ts                  # All TS definitions
│   └── global.css
├── tailwind.config.js                # Design tokens
├── app.json                          # Expo config
├── package.json
├── tsconfig.json
├── .env.example
├── DELIVERY.md                       # ← You are here
├── IMPLEMENTATION.md                 # Implementation details
├── QUICKSTART.md                     # 5-min setup
├── README.md                         # API reference
└── DESIGN_NOTES.md                   # Design system
```

## 🎯 Screen Map

```
┌─────────────────────────────────────────┐
│         ROOT LAYOUT (_layout)            │
│    (Auth check, stack navigation)        │
└──────────┬──────────────────────────────┘
           │
      ┌────┴──────┐
      │            │
   ┌──▼──┐    ┌────▼────┐
   │AUTH │    │(TABS)    │
   └──┬──┘    └────┬─────┘
      │            │
   ┌──▼──────┐    ┌┴──────────┐
   │Login    │    │Home    │Profile
   │Signup   │    └┬──────────┘
   └──┬──────┘     │
      │       ┌────┴─────┐
      │       │          │
      │    ┌──▼──┐  ┌────▼────┐
      │    │Create Create    │Join
      │    │Session  Code    │Code
      │    └──┬──────────────┴──┐
      │       │                 │
      │    ┌──▼──────────────┐  │
      └────┤   LOBBY         │◄─┘
           │ (Waiting room)  │
           └──┬──────────────┘
              │
           ┌──▼──────────────┐
           │   SWIPE         │
           │ (Card deck)     │
           └──┬──────────────┘
              │
         ┌────┴─────────────┐
         │                  │
    ┌────▼──────┐   ┌──────▼─────┐
    │Match Modal│   │Results      │
    │(Confetti) │   │(Leaderboard)│
    └────┬──────┘   └──────┬──────┘
         │                 │
         └────────┬────────┘
                  │
            ┌─────▼──────┐
            │ Home (tabs)│
            └────────────┘
```

## 🔄 Data Flow

```
useAuth()
  ├─ login()      → POST /auth/login → secure-store JWT
  ├─ signup()     → POST /auth/signup → redirect home
  ├─ logout()     → clear store → navigate to login
  └─ refreshToken() → POST /auth/refresh (auto on 401)

useSession()
  ├─ createSession()   → POST /sessions
  ├─ joinSession()     → GET /sessions/{code}, POST /sessions/{id}/join
  ├─ startSwiping()    → POST /sessions/{id}/start-swiping
  ├─ getRestaurants()  → GET /sessions/{id}/restaurants
  ├─ submitSwipe()     → POST /sessions/{id}/swipe
  └─ getResults()      → GET /sessions/{id}/results

useWebSocket()
  ├─ member_joined     → setMembers([...prev, new])
  ├─ swipe_progress    → setMemberProgress({...})
  ├─ instant_match     → setMatchedRestaurant() + confetti
  ├─ phase_change      → router.push() to new screen
  └─ top3_ready        → setDisplayResults()
```

## 🎨 Component Hierarchy

```
Root (_layout)
├── Auth Stack
│   ├── Login
│   └── Signup
└── App Stack
    ├── Tabs
    │   ├── Home
    │   │   └── [Create | Join Code Input]
    │   └── Profile
    │       └── [Chips | Sliders | Buttons]
    └── Session Stack
        ├── Lobby
        │   ├── CodeDisplay
        │   └── Avatar[] (Member List)
        ├── Swipe
        │   ├── Progress Bar
        │   ├── SwipeStack
        │   │   └── RestaurantCard (animated)
        │   └── MatchModal (confetti)
        └── Results
            └── [ResultCard][] (Top 3)
```

## 🎬 Animation Specs

| Animation | Duration | Easing | Where |
|-----------|----------|--------|-------|
| Card swipe | 300ms | Spring (T:100, D:0.8) | RestaurantCard |
| Confetti | 1500ms | Gravity + ease-out | MatchModal |
| Page fade | 150ms | Cubic-bezier | Router transition |
| Button tap | 50ms | Scale 0.98→1.0 | Pressable |
| Match modal scale | 300ms | Spring (T:100) | MatchModal |

## 🔐 Security

- **JWT Storage**: expo-secure-store (encrypted OS keychain)
- **Token Refresh**: Auto on 401 via useAuth
- **Headers**: `Authorization: Bearer {token}` on all requests
- **WebSocket Auth**: JWT passed as `?token=` query param
- **No sensitive data in logs**: All tokens hidden

## 📱 Responsive Design

- **Mobile-first**: Built for portrait orientation
- **NativeWind scaling**: Automatically adapts to screen size
- **Min width**: 280px (handles most older devices)
- **Max width**: No hard cap (scales up for tablets)
- **Safe areas**: SafeAreaView on all screens

## 🧪 Testing Checklist

### Authentication
- [ ] Signup creates account
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] Token refresh works (trigger 401)
- [ ] Logout clears store & navigates

### Home Screen
- [ ] Create session generates code
- [ ] Join session accepts 4-char code
- [ ] Code input validates (4 chars, alphanumeric)

### Lobby
- [ ] Code displays correctly (4 boxes)
- [ ] Copy button copies to clipboard
- [ ] Share button opens share sheet
- [ ] Member list updates via WebSocket
- [ ] Host-only "Start Swiping" visible

### Swipe Screen
- [ ] Cards load and display correctly
- [ ] Swipe left = Pass (no), right = Like (yes)
- [ ] Cards animate (rotate, fade)
- [ ] Progress bar increments
- [ ] Results button appears after 5 swipes
- [ ] Instant match triggers confetti

### Results
- [ ] Top 3 restaurants display
- [ ] Agreement % bars render correctly
- [ ] Rank badges show (1st, 2nd, 3rd)
- [ ] Vote counts accurate
- [ ] "Start New Session" returns home

### Profile
- [ ] Dietary chips toggle on/off
- [ ] Cuisine chips toggle on/off
- [ ] Budget buttons update
- [ ] Distance display updates
- [ ] Save button POSTs correctly
- [ ] Logout button navigates to login

## 🚨 Known Limitations

1. **Placeholder Location**: Home uses hardcoded NYC coords. Integrate `expo-location` for real location.
2. **Image Loading**: No caching yet. Add `expo-image` for optimization.
3. **Offline Mode**: Not implemented. Add AsyncStorage + sync queue.
4. **Push Notifications**: Not integrated. Add `expo-notifications`.
5. **Web Support**: Experimental only. Focus is iOS/Android.

## ✅ Production Checklist

- [ ] Backend API deployed and accessible
- [ ] `.env` configured with production API URL
- [ ] EAS account created for builds
- [ ] Firebase/Sentry configured for monitoring
- [ ] App icons and splash screens added
- [ ] Testflight/Play Store profiles set up
- [ ] Privacy policy and ToS reviewed
- [ ] Rate limiting implemented on backend

## 📞 Support Resources

1. **Docs**: DESIGN_NOTES.md, README.md, QUICKSTART.md
2. **Expo Docs**: https://docs.expo.dev/
3. **React Native**: https://reactnative.dev/docs
4. **NativeWind**: https://www.nativewind.dev/
5. **Reanimated**: https://docs.swmansion.com/react-native-reanimated/

---

**Ready to build. Questions? Check the documentation or reach out to your team.**

Built with ❤️ for great restaurant decisions together.
