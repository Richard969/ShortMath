# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (0.0.0.0:5173)
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview production build
```

No test suite or linter is configured.

## Architecture

**ShortMath** — mock TikTok-style short video platform for math learning. Vite + React 18 + TypeScript + Tailwind CSS 3. Tab-based navigation via React state (no router).

### Stack

- **YouTube IFrame API** for video playback (not native `<video>`). Player is created/destroyed per card, controlled via `YT.Player` methods (`playVideo`, `pauseVideo`, `seekTo`, `setVolume`, `mute`/`unMute`).
- **Tailwind** with custom `app` (theme-aware via CSS variables), `chalk` (accent), `surface` color scales. "Chalkboard & Notebook" aesthetic: dark theme = green chalkboard with chalk-text, light theme = cream notebook paper with ink. Fonts: Lora (`font-display`/`font-body`), Caveat (`font-hand` for labels), JetBrains Mono (`font-mono`). SVG noise/grain texture on `body::before`. Glass morphism (`.glass-card`) uses theme-aware CSS variables.
- **Theme system**: CSS custom properties (RGB) with `data-theme` attribute on `<html>`. Dark (default) and light themes. Toggle in Settings. Tailwind colors reference CSS vars (`rgb(var(--app-bg) / <alpha-value>)`). `--chalk-yellow-rgb` etc. separate per theme.
- **No external state library or router**.

### State architecture (all in `App.tsx`, no external state library)

| State | Type | Purpose |
|---|---|---|
| `activeTab` | `TabId` (`'home' \| 'ai' \| 'roadmap' \| 'library'`) | Current tab |
| `videos` | `Video[]` | Source video list (mutated in-place for likes/saves) |
| `savedVideos` | `Video[]` | Saved videos (separate array, not a derived view) |
| `savedRoadmaps` | `Roadmap[]` | Saved roadmaps with step completion state |
| `viewingRoadmap` | `Roadmap \| null` | Currently viewed roadmap detail |
| `globalVolume` / `globalMuted` | `number` / `boolean` | Cross-video persistent volume |
| `selectedVideoId` | `string \| null` | Video to jump to on feed tab |
| `theme` | `'dark' \| 'light'` | Theme, persisted to localStorage (`shortmath-theme`) |

Key patterns:
- Volume state is lifted to App so it persists across video swipes.
- Roadmaps are matched by `title` (not `id`) when saved/loaded — preserves step completion progress when re-opened from AI.
- `handleViewVideo` sets `selectedVideoId` + switches tab; `VideoFeed` reads it via `initialVideoId` prop and calls `onJumpComplete` after the jump.
- `handleTabChange` clears `viewingRoadmap` when leaving the roadmap tab.

### Component tree

```
App
└── Layout (.phone-frame wrapper, max-w-[430px])
    ├── VideoFeed (always mounted, paused when hidden via `visible` prop)
    │   └── VideoCard (YouTube IFrame API, volume, fullscreen)
    │       └── AuthorAvatar (colored initial-circle from author name)
    ├── [overlay div, z-10, only when tab ≠ home]
    │   ├── AIAssistant (chat with video/roadmap cards)
    │   ├── RoadmapView (timeline + step cards + linked videos)
    │   │   └── StepCard (per-step, linked video buttons)
    │   ├── SavedList (library tab: saved videos + roadmaps)
    │   └── SettingsPage (volume, theme toggle, data management)
    └── BottomNav (5-tab nav, overlays content)
```

Feed is always mounted to preserve playback progress across tab switches. Other tabs render in a themed overlay div.

### VideoCard internals

Most complex component. Key details:
- **YouTube API loading**: Singleton `loadYouTubeAPI()` promise — injects `<script>` once, resolves when `window.onYouTubeIframeAPIReady` fires.
- **Player lifecycle**: Created in `useEffect([apiReady, video.youtubeId])`, destroyed on cleanup. `playerContainerId` is a `useRef` stable per component instance (uses `video.id`).
- **Stale closure prevention**: `isActiveRef` synced to `isActive` prop every render. `onReady` callback reads `isActiveRef.current` (not the closure-captured `isActive`), preventing background audio when fast-swiping past a card whose player loaded late.
- **Fullscreen**: `containerRef.requestFullscreen()` / `document.exitFullscreen()`. `fullscreenchange` listener syncs state. While fullscreen, `VideoFeed` skips all swipe input (checks `document.fullscreenElement`).
- **Swipe conflict resolution**: Multi-layered:
  1. YouTube player div has `pointer-events-none` (clicks pass through to play/pause overlay).
  2. Sidebar/controls have `data-no-swipe` attribute.
  3. VideoFeed's wheel/touch/mouse handlers check `target.closest('[data-no-swipe]')` and form control tag names.
  4. Wheel handler uses native `addEventListener('wheel', ..., {passive: false})` (React synthetic events don't support `preventDefault` on passive wheel).
  5. All swipe handlers check `document.fullscreenElement` and skip if non-null.

### Mock AI (`useAIAssistant`)

Simulated with `setTimeout` delays. `searchVideos()` scores mock videos by keyword match against title/topic/description + difficulty hints. `generateRoadmap()` returns one of 3 hardcoded roadmaps (calculus, linear algebra, stats) based on query keywords. Responses include embedded `videos` and `roadmap` arrays rendered as clickable cards in the chat.

### Data model (`src/types/index.ts`)

`Video` uses `youtubeId: string` (not full URL) for embedding. `VideoChapter` has `time` (seconds) and `label`. `Roadmap` contains `steps: RoadmapStep[]` with `videoIds: string[]` (references to `Video.id`).
