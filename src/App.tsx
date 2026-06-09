import { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import VideoFeed from './components/VideoFeed';
import AIAssistant from './components/AIAssistant';
import RoadmapView from './components/RoadmapView';
import SavedList from './components/SavedList';
import SettingsPage from './components/SettingsPage';
import { useAIAssistant } from './hooks/useAIAssistant';
import { mockVideos } from './data/videos';
import { Video, Roadmap, TabId } from './types';

type Theme = 'dark' | 'light';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('shortmath-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<Roadmap[]>([]);
  const [viewingRoadmap, setViewingRoadmap] = useState<Roadmap | null>(null);
  const [globalVolume, setGlobalVolume] = useState(80);
  const [globalMuted, setGlobalMuted] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  // Sync theme to DOM and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('shortmath-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const { messages, isThinking, sendMessage, clearChat } = useAIAssistant();

  // Like / unlike
  const handleLike = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, hasLiked: !v.hasLiked, likes: v.hasLiked ? v.likes - 1 : v.likes + 1 } : v
      )
    );
  }, []);

  // Save / unsave video
  const handleSave = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, saved: !v.saved } : v))
    );

    setSavedVideos((prev) => {
      const alreadySaved = prev.find((sv) => sv.id === videoId);
      if (alreadySaved) {
        return prev.filter((sv) => sv.id !== videoId);
      }
      const video = videos.find((v) => v.id === videoId);
      if (video) {
        return [...prev, { ...video, saved: true }];
      }
      return prev;
    });
  }, [videos]);

  // Toggle step in a roadmap
  const handleToggleRoadmapStep = useCallback((roadmapId: string, stepId: string) => {
    const update = (roadmaps: Roadmap[]) =>
      roadmaps.map((r) => {
        if (r.id !== roadmapId) return r;
        return {
          ...r,
          steps: r.steps.map((s) =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
          ),
        };
      });

    setSavedRoadmaps(update);
    if (viewingRoadmap?.id === roadmapId) {
      setViewingRoadmap((prev) => prev && update([prev])[0]);
    }
  }, [viewingRoadmap]);

  // View roadmap from AI — use existing saved one if present (preserves progress)
  const handleViewRoadmap = useCallback((roadmap: Roadmap) => {
    setSavedRoadmaps((prev) => {
      const existing = prev.find((r) => r.title === roadmap.title);
      if (existing) {
        // Use the saved one — it has correct progress
        setViewingRoadmap(existing);
        setActiveTab('roadmap');
        return prev;
      }
      // New roadmap, save it
      setViewingRoadmap(roadmap);
      setActiveTab('roadmap');
      return [...prev, roadmap];
    });
  }, []);

  // View roadmap from library — switch to roadmap tab
  const handleViewSavedRoadmap = useCallback((roadmap: Roadmap) => {
    setViewingRoadmap(roadmap);
    setActiveTab('roadmap');
  }, []);

  // Remove video from saved
  const handleRemoveVideo = useCallback((videoId: string) => {
    setSavedVideos((prev) => prev.filter((v) => v.id !== videoId));
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, saved: false } : v))
    );
  }, []);

  // Remove roadmap from saved
  const handleRemoveRoadmap = useCallback((roadmapId: string) => {
    setSavedRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
    if (viewingRoadmap?.id === roadmapId) {
      setViewingRoadmap(null);
    }
  }, [viewingRoadmap]);

  // Clear all saved videos
  const handleClearVideos = useCallback(() => {
    setSavedVideos([]);
    setVideos((prev) => prev.map((v) => ({ ...v, saved: false })));
  }, []);

  // Clear all saved roadmaps
  const handleClearRoadmaps = useCallback(() => {
    setSavedRoadmaps([]);
    setViewingRoadmap(null);
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    setSavedVideos([]);
    setSavedRoadmaps([]);
    setViewingRoadmap(null);
    setVideos((prev) => prev.map((v) => ({ ...v, saved: false })));
    clearChat();
  }, [clearChat]);

  // Navigate to home and jump to specific video
  const handleViewVideo = useCallback((video: Video) => {
    setSelectedVideoId(video.id);
    setActiveTab('home');
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    // Dismiss roadmap detail when switching away from roadmap tab
    if (tab !== 'roadmap') {
      setViewingRoadmap(null);
    }
  }, []);

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {/* Feed always mounted — preserves playback progress when switching tabs */}
      <VideoFeed
        videos={videos}
        onLike={handleLike}
        onSave={handleSave}
        volume={globalVolume}
        isMuted={globalMuted}
        onVolumeChange={setGlobalVolume}
        onMuteChange={setGlobalMuted}
        initialVideoId={selectedVideoId}
        onJumpComplete={() => setSelectedVideoId(null)}
        visible={activeTab === 'home'}
      />

      {/* Other tabs overlay on top of feed */}
      {activeTab !== 'home' && (
        <div className="absolute inset-0 z-10 overflow-hidden bg-app-bg">
          {/* AI Assistant */}
          {activeTab === 'ai' && (
            <AIAssistant
              messages={messages}
              isThinking={isThinking}
              onSend={sendMessage}
              onClear={clearChat}
              onViewVideo={handleViewVideo}
              onViewRoadmap={handleViewRoadmap}
            />
          )}

          {/* Roadmap tab */}
          {activeTab === 'roadmap' && (
            viewingRoadmap ? (
              <RoadmapView
                roadmap={viewingRoadmap}
                onToggleStep={(stepId) => handleToggleRoadmapStep(viewingRoadmap.id, stepId)}
                onBack={() => setViewingRoadmap(null)}
                videos={videos}
                onViewVideo={(videoId) => {
                  setSelectedVideoId(videoId);
                  setActiveTab('home');
                }}
              />
            ) : savedRoadmaps.length > 0 ? (
              <div className="flex flex-col h-full bg-app-bg pb-14">
                <div className="px-4 pt-6 pb-3 border-b border-app-border bg-app-bg/95 backdrop-blur z-10">
                  <h2 className="text-base font-display font-bold italic text-app-text">Roadmaps</h2>
                  <p className="text-xs text-app-text-muted font-hand font-medium">Learning Paths</p>
                </div>
                <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
                  {savedRoadmaps.map((r) => {
                    const completed = r.steps.filter((s) => s.completed).length;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleViewSavedRoadmap(r)}
                        className="w-full text-left glass-card rounded-xl p-4 border-app-border hover:border-brand-400/30 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg text-chalk-yellow">◎</span>
                          <span className="text-sm font-semibold text-app-text">{r.title}</span>
                        </div>
                        <p className="text-xs text-app-text-secondary mb-3">{r.goal}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${r.steps.length > 0 ? (completed / r.steps.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-app-text-muted font-mono">
                            {completed}/{r.steps.length} • ~{r.steps.reduce((s, step) => s + step.estimatedHours, 0)}h
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center pb-14">
                <span className="text-5xl mb-4">⋮⋮</span>
                <h3 className="text-base font-display font-bold italic text-app-text mb-1">No roadmaps yet</h3>
                <p className="text-sm text-app-text-secondary mb-4 font-light">
                  Ask the AI assistant to design a personalized learning path for any math topic.
                </p>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="px-5 py-2.5 rounded-full bg-chalk-yellow text-app-bg text-sm font-bold active:scale-95 transition-all hover:glow-chalk-yellow font-hand"
                >
                  Ask AI →
                </button>
              </div>
            )
          )}

          {/* Library */}
          {activeTab === 'library' && (
            <SavedList
              savedVideos={savedVideos}
              savedRoadmaps={savedRoadmaps}
              onViewVideo={handleViewVideo}
              onViewRoadmap={handleViewSavedRoadmap}
              onRemoveVideo={handleRemoveVideo}
              onRemoveRoadmap={handleRemoveRoadmap}
              onToggleRoadmapStep={handleToggleRoadmapStep}
            />
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <SettingsPage
              volume={globalVolume}
              isMuted={globalMuted}
              onVolumeChange={setGlobalVolume}
              onMuteChange={setGlobalMuted}
              savedVideoCount={savedVideos.length}
              savedRoadmapCount={savedRoadmaps.length}
              onClearVideos={handleClearVideos}
              onClearRoadmaps={handleClearRoadmaps}
              onClearAll={handleClearAll}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
