# Moore Maternal Care — Expo Mobile App

React Native / Expo mobile app for the Moore Maternal Care pregnancy tracking platform.

## Features

- **Home Dashboard** — pregnancy progress, quick stats, appointment booking
- **Timeline** — week-by-week milestone tracker
- **Symptoms** — log symptoms with severity ratings & mood score
- **Messages** — real-time chat with your care team (supports emergency flags)
- **Forum** — community discussion threads with category filtering
- **Supplements** — product catalog with shopping cart & checkout
- **Profile** — personal & pregnancy info management
- **Multilingual** — English, Spanish, French (via `I18nProvider`)

All screens connect to the same Express backend as the web app.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Expo CLI | `npm install -g expo-cli` |
| Expo Go app | Install on your iOS/Android device |

---

## Quick Start

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Copy the environment example and set your backend URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_API_URL=http://<your-machine-LAN-ip>:5000
```

> **Tip:** Find your LAN IP with `ipconfig` (Windows) or `ifconfig` / `ip addr` (macOS/Linux).
> The device and your machine must be on the same network.

### 3. Start the backend

From the repository root:

```bash
npm run dev
```

### 4. Start Expo

```bash
cd mobile
npm start          # opens Expo Dev Tools
npm run android    # starts Android emulator
npm run ios        # starts iOS simulator (macOS only)
npm run web        # runs in browser
```

### 5. Open on device

Scan the QR code displayed in the terminal with the **Expo Go** app.

---

## Project Structure

```
mobile/
├── App.tsx                    # Root component (providers + navigation)
├── app.json                   # Expo app configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── .env.example
└── src/
    ├── lib/
    │   ├── api.ts             # Axios client pointing to backend
    │   ├── i18n.tsx           # i18n context + translations (EN/ES/FR)
    │   └── theme.ts           # Design tokens (colors, spacing, radii)
    ├── navigation/
    │   └── AppNavigator.tsx   # Bottom-tab navigator
    └── screens/
        ├── HomeScreen.tsx
        ├── TimelineScreen.tsx
        ├── SymptomsScreen.tsx
        ├── MessagesScreen.tsx
        ├── ForumScreen.tsx
        ├── SupplementsScreen.tsx
        └── ProfileScreen.tsx
```

---

## Connecting to the Backend

The mobile app calls the same REST API endpoints as the web app:

| Screen | Endpoint(s) |
|--------|-------------|
| Home | `GET /api/pregnancy/profile`, `GET /api/symptoms` |
| Timeline | `GET /api/pregnancy/profile` |
| Symptoms | `GET /api/symptoms`, `POST /api/symptoms` |
| Messages | `GET /api/messages`, `POST /api/messages` |
| Forum | `GET /api/forum/threads`, `POST /api/forum/threads` |
| Profile | `GET /api/pregnancy/profile`, `POST /api/pregnancy/profile` |

When the backend is unreachable the app falls back to mock demo data (same data as the web app).

---

## Building for Production

### EAS Build (recommended)

```bash
npm install -g eas-cli
eas build --platform android   # APK / AAB
eas build --platform ios       # IPA
```

### Standalone (classic)

```bash
npx expo build:android
npx expo build:ios
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Base URL of the Express backend (required) |

Variables prefixed with `EXPO_PUBLIC_` are bundled into the app at build time.

---

## Tech Stack

- **Expo SDK 51** (React Native 0.74)
- **React Navigation 6** (Bottom Tabs)
- **TanStack React Query 5** (data fetching & caching)
- **Axios** (HTTP client)
- **TypeScript** (strict mode)
