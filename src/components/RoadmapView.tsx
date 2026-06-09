import { Video, Roadmap, RoadmapStep } from '../types';

interface RoadmapViewProps {
  roadmap: Roadmap;
  onToggleStep: (stepId: string) => void;
  onBack: () => void;
  onViewVideo: (videoId: string) => void;
  videos: Video[];
}

function StepCard({
  step,
  index,
  isLast,
  onToggle,
  videos,
  onViewVideo,
}: {
  step: RoadmapStep;
  index: number;
  isLast: boolean;
  onToggle: (id: string) => void;
  videos: Video[];
  onViewVideo: (videoId: string) => void;
}) {
  const linkedVideos = videos.filter((v) => step.videoIds.includes(v.id));
  return (
    <div className="relative flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onToggle(step.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90 flex-shrink-0 border-2 font-mono ${
            step.completed
              ? 'bg-chalk-green border-chalk-green text-app-bg'
              : 'bg-app-surface border-app-border text-app-text-muted hover:border-brand-400'
          }`}
        >
          {step.completed ? '✓' : index + 1}
        </button>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] mt-1 mb-1 ${
            step.completed ? 'bg-chalk-green/40' : 'bg-app-border'
          }`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${step.completed ? 'opacity-70' : ''}`}>
        <div
          className={`rounded-xl p-3 border transition-colors ${
            step.completed
              ? 'bg-chalk-green/5 border-chalk-green/20'
              : 'glass-card border-app-border'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-semibold ${step.completed ? 'text-chalk-green line-through' : 'text-app-text'}`}>
              {step.title}
            </h3>
            <span className="text-[10px] text-app-text-muted font-hand font-semibold">~{step.estimatedHours}h</span>
          </div>
          <p className="text-xs text-app-text-secondary leading-relaxed">{step.description}</p>
          {linkedVideos.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-app-text-muted mb-1 font-hand font-semibold">Linked Videos</p>
              {linkedVideos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onViewVideo(v.id)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg bg-app-surface/40 hover:bg-brand-500/10 border border-app-border hover:border-brand-400/30 transition-all duration-300 text-[10px]"
                >
                  <span className="text-brand-400 flex-shrink-0">▶</span>
                  <span className="text-app-text truncate">{v.title}</span>
                  <span className="text-app-text-muted flex-shrink-0 ml-auto font-mono">{v.duration}s</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapView({ roadmap, onToggleStep, onBack, onViewVideo, videos }: RoadmapViewProps) {
  const completedCount = roadmap.steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / roadmap.steps.length) * 100);

  return (
    <div className="flex flex-col h-full bg-app-bg pb-14">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 border-b border-app-border bg-app-bg/95 backdrop-blur z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-app-surface flex items-center justify-center text-sm hover:bg-app-elevated transition-colors border border-app-border text-app-text"
          >
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-base font-display font-bold italic text-app-text">{roadmap.title}</h2>
            <p className="text-xs text-app-text-muted font-hand font-medium">{roadmap.goal}</p>
          </div>
        </div>

        {/* Progress bar with step dots */}
        <div className="mt-3 mb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-app-text-muted font-semibold font-hand">Progress</span>
            <span className="text-xs text-brand-400 font-bold font-mono">{progressPercent}% • {completedCount}/{roadmap.steps.length}</span>
          </div>
          {/* Track with step dots */}
          <div className="relative h-3 flex items-center">
            {/* Background track */}
            <div className="absolute inset-x-0 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="absolute inset-x-0 flex justify-between px-0">
              {roadmap.steps.map((step, i) => {
                const dotPercent = roadmap.steps.length > 1
                  ? (i / (roadmap.steps.length - 1)) * 100
                  : 50;
                return (
                  <div
                    key={step.id}
                    className="relative"
                    style={{ left: `${dotPercent}%`, position: 'absolute', transform: 'translateX(-50%)' }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                        step.completed
                          ? 'bg-blue-400 border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                          : progressPercent >= dotPercent
                            ? 'bg-blue-500 border-blue-400'
                            : 'bg-gray-800 border-gray-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4">
        {roadmap.steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            isLast={i === roadmap.steps.length - 1}
            onToggle={onToggleStep}
            videos={videos}
            onViewVideo={onViewVideo}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-6 pt-3 border-t border-app-border">
        <p className="text-[10px] text-app-text-muted text-center font-mono">
          Created {new Date(roadmap.createdAt).toLocaleDateString()} • {roadmap.steps.length} steps • ~{roadmap.steps.reduce((s, step) => s + step.estimatedHours, 0)}h total
        </p>
      </div>
    </div>
  );
}
