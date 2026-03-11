# Chat App Frontend

A responsive Vite + React chat client with auth, real-time presence, and polished UI accents.

![Chat UI](public/Screenshot%202026-03-11%20223943.png)

## Features
- Email/password signup, login, logout, profile update, and account deletion flows
- Email verification screen and guarded routes using Zustand auth state
- Real-time online user presence via Socket.IO
- Chat list, contact list, message thread view, and empty-state placeholders
- Toast feedback for auth and chat actions, plus loading skeletons for perceived performance
- Tailwind + DaisyUI styling with animated grid/glow background treatment

## Tech Stack
- React 19 with React Router 7
- Zustand for state, Axios for API calls
- Socket.IO client for real-time updates
- Tailwind CSS + DaisyUI for styling
- Vite 7 for build/dev server

## Getting Started
1) Install dependencies
```bash
npm install
```

2) Run the dev server (default: http://localhost:5173)
```bash
npm run dev
```

3) Build for production
```bash
npm run build
```

4) Preview the production build locally
```bash
npm run preview
```

## Configuration
- API base URL is `http://localhost:3000/api` when `import.meta.env.MODE` is `development`; otherwise it uses `/api`. Adjust your backend to match or set a proxy as needed.
- Socket base URL defaults to `http://localhost:3000` in development and `/` in production. Ensure CORS and cookies are enabled on the backend for Socket.IO.
- API client lives in [src/lib/axios.js](src/lib/axios.js); auth state and socket wiring live in [src/store/useAuthStore.js](src/store/useAuthStore.js).

## Project Structure
- [src/App.jsx](src/App.jsx): route shell with auth guards and global Toaster
- [src/pages](src/pages): page-level screens (Chat, Login, Signup, Verify Email)
- [src/components](src/components): reusable UI for chat layout, headers, lists, loaders, and inputs
- [src/store](src/store): Zustand stores for auth and chat state
- [public](public): static assets including the UI screenshot and auth illustrations

## Notes
- The app expects a backend that exposes `/auth` endpoints and a Socket.IO server aligned with the URLs above.
- Sounds for keyboard input are located under [public/sounds](public/sounds).
