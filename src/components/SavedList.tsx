import { Video, Roadmap } from '../types';

interface SavedListProps {
  savedVideos: Video[];
  savedRoadmaps: Roadmap[];
  onViewVideo: (video: Video) => void;
  onViewRoadmap: (roadmap: Roadmap) => void;
  onRemoveVideo: (videoId: string) => void;
  onRemoveRoadmap: (roadmapId: string) => void;
  onToggleRoadmapStep: (roadmapId: string, stepId: string) => void;
}

export default function SavedList({
  savedVideos,
  savedRoadmaps,
  onViewVideo,
  onRemoveVideo,
  onViewRoadmap,
  onToggleRoadmapStep,
  onRemoveRoadmap,
}: SavedListProps) {
  if (savedVideos.length === 0 && savedRoadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center">
        <span className="text-5xl mb-4">◈</span>
        <h3 className="text-base font-display font-bold italic text-app-text mb-1">Library is empty</h3>
        <p className="text-sm text-app-text-secondary mb-4 font-light">
          Save videos and roadmaps to build your personal math learning library.
        </p>
        <div className="flex gap-2 text-[10px] text-gray-600">
          <span>☆ Save videos from Feed</span>
          <span>•</span>
          <span>◇ Ask AI for roadmaps</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-app-bg pb-14">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-app-border bg-app-bg/95 backdrop-blur z-10">
        <h2 className="text-base font-display font-bold italic text-app-text">Library</h2>
        <p className="text-xs text-app-text-muted font-hand font-medium">
          {savedVideos.length} video{savedVideos.length !== 1 ? 's' : ''} • {savedRoadmaps.length} roadmap{savedRoadmaps.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Saved Videos */}
        {savedVideos.length > 0 && (
          <div className="px-4 pt-4">
            <h3 className="text-sm font-semibold text-app-text-muted mb-2 font-hand">Saved Videos</h3>
            <div className="space-y-2">
              {savedVideos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onViewVideo(v)}
                  className="w-full text-left flex gap-3 glass-card rounded-xl p-2 border-app-border hover:border-brand-400/30 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-22 rounded-lg bg-app-surface flex-shrink-0 flex items-center justify-center text-lg text-chalk-yellow">
                    ▶
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-app-text truncate">{v.title}</p>
                    <p className="text-[10px] text-app-text-secondary mt-0.5">{v.author.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700/50 text-app-text-secondary">{v.topic}</span>
                      <span className="text-[9px] text-app-text-muted">{v.duration}s</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveVideo(v.id); }}
                    className="text-app-text-muted hover:text-red-400 text-sm px-2 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Roadmaps */}
        {savedRoadmaps.length > 0 && (
          <div className="px-4 pt-4 pb-4">
            <h3 className="text-sm font-semibold text-app-text-muted mb-2 font-hand">Saved Roadmaps</h3>
            <div className="space-y-2">
              {savedRoadmaps.map((r) => {
                const completed = r.steps.filter((s) => s.completed).length;
                return (
                  <div key={r.id} className="glass-card rounded-xl p-3 border-app-border">
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => onViewRoadmap(r)}
                        className="flex-1 text-left"
                      >
                        <p className="text-xs font-semibold text-app-text">{r.title}</p>
                        <p className="text-[10px] text-app-text-secondary mt-0.5">{r.goal}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${r.steps.length > 0 ? (completed / r.steps.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-app-text-muted font-mono">
                            {completed}/{r.steps.length}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => onRemoveRoadmap(r.id)}
                        className="text-app-text-muted hover:text-red-400 text-sm px-1 transition-colors ml-2"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Inline step toggles */}
                    <div className="mt-2 space-y-1">
                      {r.steps.map((step) => (
                        <button
                          key={step.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRoadmapStep(r.id, step.id);
                          }}
                          className={`w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 transition-colors ${
                            step.completed
                              ? 'bg-chalk-green/10 text-chalk-green'
                              : 'hover:bg-gray-700/30 text-app-text-secondary'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] flex-shrink-0 ${
                              step.completed
                                ? 'bg-chalk-green border-chalk-green text-app-bg'
                                : 'border-gray-600'
                            }`}
                          >
                            {step.completed ? '✓' : ''}
                          </span>
                          <span className={`text-[10px] truncate ${step.completed ? 'line-through' : ''}`}>
                            {step.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
