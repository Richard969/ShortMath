import { useState } from 'react';

type Theme = 'dark' | 'light' | 'auto';

interface SettingsPageProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteChange: (m: boolean) => void;
  savedVideoCount: number;
  savedRoadmapCount: number;
  onClearVideos: () => void;
  onClearRoadmaps: () => void;
  onClearAll: () => void;
  theme: Theme;
  onSetTheme: (t: Theme) => void;
}

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
  auto: 'Automatic',
};

function DangerButton({ label, description, onClick }: { label: string; description: string; onClick: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-chalk-pink font-hand font-bold">Are you sure?</span>
        <button
          onClick={() => { onClick(); setConfirming(false); }}
          className="text-[10px] px-3 py-1.5 rounded-full bg-chalk-pink text-white font-bold active:scale-95 transition-all font-hand"
        >
          YES
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] px-3 py-1.5 rounded-full bg-gray-700 text-gray-300 active:scale-95 transition-all font-mono tracking-wider"
        >
          NO
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] px-3 py-1.5 rounded-full border border-chalk-pink/40 text-chalk-pink hover:bg-chalk-pink/10 active:scale-95 transition-all font-hand font-semibold"
    >
      {label}
    </button>
  );
}

export default function SettingsPage({
  volume,
  isMuted,
  onVolumeChange,
  onMuteChange,
  savedVideoCount,
  savedRoadmapCount,
  onClearVideos,
  onClearRoadmaps,
  onClearAll,
  theme,
  onSetTheme,
}: SettingsPageProps) {
  return (
    <div className="flex flex-col h-full bg-app-bg pb-14">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-app-border bg-app-bg/95 backdrop-blur z-10">
        <h2 className="text-base font-display font-bold italic text-app-text">Settings</h2>
        <p className="text-xs text-app-text-muted font-hand font-medium">Preferences · Data</p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5 space-y-6">
        {/* Appearance */}
        <section>
          <h3 className="text-sm font-semibold text-app-text-secondary mb-3 font-hand">Appearance</h3>
          <div className="glass-card rounded-xl p-4 border-app-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text font-medium">Theme</p>
              </div>
              <select
                value={theme}
                onChange={(e) => onSetTheme(e.target.value as Theme)}
                className="text-sm font-medium bg-app-elevated text-app-text border border-app-border rounded-lg px-3 py-2 outline-none focus:border-chalk-yellow cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%3E%3Cpath%20d%3D%22M3%205l3%203%203-3%22%20stroke%3D%22%23888%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center] pr-8"
              >
                {(Object.keys(THEME_LABELS) as Theme[]).map((t) => (
                  <option key={t} value={t}>{THEME_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Default Volume */}
        <section>
          <h3 className="text-sm font-semibold text-app-text-secondary mb-3 font-hand">Playback</h3>
          <div className="glass-card rounded-xl p-4 border-app-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-app-text font-medium">Default Volume</span>
              <span className="text-sm text-brand-400 font-bold font-mono">
                {isMuted ? 'Muted' : `${volume}%`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onMuteChange(!isMuted)}
                className="text-xl transition-transform active:scale-125"
              >
                <span className={isMuted || volume === 0 ? 'opacity-40' : volume < 50 ? 'opacity-70' : ''}>◁</span>
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onVolumeChange(v);
                  if (v === 0) onMuteChange(true);
                  else if (isMuted) onMuteChange(false);
                }}
                className="flex-1 h-1 accent-chalk-yellow"
              />
            </div>
            <p className="text-[10px] text-app-text-muted mt-3 font-light">
              This volume will be used for all videos. You can adjust per video from the feed.
            </p>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-sm font-semibold text-app-text-secondary mb-3 font-hand">Data</h3>
          <div className="glass-card rounded-xl p-4 border-app-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text font-medium">Saved Videos</p>
                <p className="text-[10px] text-app-text-muted font-light">{savedVideoCount} video{savedVideoCount !== 1 ? 's' : ''} in library</p>
              </div>
              <DangerButton
                label="CLEAR VIDEOS"
                description="Remove all saved videos"
                onClick={onClearVideos}
              />
            </div>
            <div className="h-px bg-app-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text font-medium">Saved Roadmaps</p>
                <p className="text-[10px] text-app-text-muted font-light">{savedRoadmapCount} roadmap{savedRoadmapCount !== 1 ? 's' : ''} in library</p>
              </div>
              <DangerButton
                label="CLEAR ROADMAPS"
                description="Remove all saved roadmaps"
                onClick={onClearRoadmaps}
              />
            </div>
            <div className="h-px bg-app-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-app-text font-medium">All Data</p>
                <p className="text-[10px] text-app-text-muted font-light">Reset library, roadmaps & chat history</p>
              </div>
              <DangerButton
                label="CLEAR ALL"
                description="Remove all saved data"
                onClick={onClearAll}
              />
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-app-text-secondary mb-3 font-hand">About</h3>
          <div className="glass-card rounded-xl p-4 border-app-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-app-text">ShortMath</span>
              <span className="text-[10px] text-app-text-muted font-hand font-semibold">v1.0.0</span>
            </div>
            <p className="text-[10px] text-app-text-secondary leading-relaxed font-light">
              A short video platform for math learning. Built with React, TypeScript, Tailwind CSS, and YouTube IFrame API.
              All data is stored locally in your browser — nothing leaves your device.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-app-text-muted font-hand font-medium">△ Math in Minutes</span>
              <span className="text-app-text-muted">•</span>
              <span className="text-[10px] text-app-text-muted font-hand font-medium">◇ AI-Powered</span>
              <span className="text-app-text-muted">•</span>
              <span className="text-[10px] text-app-text-muted font-hand font-medium">◎ Roadmaps</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
