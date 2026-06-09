# ShortMath — Math in Minutes

A TikTok-style short video platform for math learning. Built as a group study project to explore modern frontend development. Fully functional frontend with mock data — no backend required.

## Features

- **Short Video Feed** — Swipe through curated math videos (YouTube IFrame API), with draggable progress bar, volume control, chapter navigation, and fullscreen support.
- **AI Assistant** — Ask for video recommendations or learning roadmaps. Mock AI responds with keyword-matched results and pre-built study plans.
- **Learning Roadmaps** — Step-by-step study paths with progress tracking and linked videos. Save and complete steps at your own pace.
- **Library** — Save favorite videos and roadmaps. Jump directly to saved content from the library.
- **Chalkboard & Notebook Theme** — Dark chalkboard with chalk-text, or light notebook paper with ink. Toggle in Settings.
- **Responsive** — Mobile-first design with phone-frame layout, touch/swipe gestures, and desktop keyboard/mouse support.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 (custom theme system with CSS variables) |
| Video | YouTube IFrame API |
| Deployment | GitHub Pages via Actions |

No state library, no router, no backend. Pure frontend with mock data.

## Getting Started

```bash
npm install
npm run dev      # Dev server at localhost:5173
npm run build    # Production build → dist/
```

## Project Structure

```
src/
├── components/      # React components
│   ├── VideoCard.tsx      # YouTube player + controls
│   ├── VideoFeed.tsx      # Swipeable feed
│   ├── AIAssistant.tsx    # Chat interface
│   ├── RoadmapView.tsx    # Learning path detail
│   ├── SavedList.tsx      # Library tab
│   ├── SettingsPage.tsx   # Preferences + data
│   ├── BottomNav.tsx      # Tab navigation
│   ├── AuthorAvatar.tsx   # Initials avatar
│   └── Layout.tsx         # Phone frame wrapper
├── hooks/           # Custom hooks
│   └── useAIAssistant.ts  # Mock AI service
├── data/            # Mock data
│   └── videos.ts          # 10 math videos
├── types/           # TypeScript types
└── App.tsx          # Root — state + routing
```

## Group Project

This is a collaborative study project focused on learning modern frontend development patterns. All visual design and code were built as a team. The project demonstrates:

- Component architecture and state management without external libraries
- YouTube IFrame API integration with full player lifecycle
- Touch/mouse gesture handling and event conflict resolution
- Theme system using CSS custom properties and Tailwind integration
- CI/CD with GitHub Actions deploying to GitHub Pages

Not intended as a commercial product — just a showcase of what we learned.
