import { useState, useCallback, useRef, useEffect } from 'react';
import { Video } from '../types';
import VideoCard from './VideoCard';

interface VideoFeedProps {
  videos: Video[];
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteChange: (m: boolean) => void;
  initialVideoId: string | null;
  onJumpComplete: () => void;
  visible: boolean;
}

export default function VideoFeed({ videos, onLike, onSave, volume, isMuted, onVolumeChange, onMuteChange, initialVideoId, onJumpComplete, visible }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Jump to a specific video when navigated from AI/Library
  useEffect(() => {
    if (initialVideoId) {
      const idx = videos.findIndex((v) => v.id === initialVideoId);
      if (idx >= 0 && idx !== currentIndex) {
        setCurrentIndex(idx);
      }
      onJumpComplete();
    }
  }, [initialVideoId]);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < videos.length) {
        setCurrentIndex(index);
        setTranslateY(0);
      }
    },
    [videos.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Touch / mouse handlers for swipe
  const handleStart = useCallback((clientY: number) => {
    setStartY(clientY);
    setIsDragging(true);
  }, []);

  const handleMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const diff = clientY - startY;
      setTranslateY(diff);
    },
    [isDragging, startY]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    if (Math.abs(translateY) > 80) {
      if (translateY > 0 && currentIndex > 0) {
        goPrev();
      } else if (translateY < 0 && currentIndex < videos.length - 1) {
        goNext();
      }
    }
    setTranslateY(0);
  }, [translateY, currentIndex, goPrev, goNext, videos.length]);

  // Wheel for desktop
  const [wheelAccum, setWheelAccum] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (document.fullscreenElement) return;
      // Skip if target is inside volume control or is a form control
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-swipe]')) return;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      e.preventDefault();
      const newAccum = wheelAccum + e.deltaY;
      setWheelAccum(newAccum);
      if (Math.abs(newAccum) > 80) {
        if (newAccum > 0) goNext();
        else goPrev();
        setWheelAccum(0);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [wheelAccum, goNext, goPrev]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.fullscreenElement || !visible) return;
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, visible]);

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No videos found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden touch-none bg-black"
      onTouchStart={(e) => {
        if (document.fullscreenElement) return;
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        handleStart(e.touches[0].clientY);
      }}
      onTouchMove={(e) => {
        if (document.fullscreenElement) return;
        handleMove(e.touches[0].clientY);
      }}
      onTouchEnd={() => {
        if (document.fullscreenElement) return;
        handleEnd();
      }}
      onMouseDown={(e) => {
        if (document.fullscreenElement) return;
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        handleStart(e.clientY);
      }}
      onMouseMove={(e) => { if (isDragging && !document.fullscreenElement) handleMove(e.clientY); }}
      onMouseUp={() => { if (document.fullscreenElement) return; handleEnd(); }}
      onMouseLeave={() => { if (document.fullscreenElement) return; handleEnd(); }}
    >
      {/* Current + adjacent videos for smooth transition */}
      {videos.map((video, i) => {
        if (Math.abs(i - currentIndex) > 1) return null;

        const offset = (i - currentIndex) * 100 + (translateY / window.innerHeight) * 100;
        const isActive = visible && i === currentIndex;

        return (
          <div
            key={video.id}
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${offset}%)`,
              transitionDuration: isDragging ? '0ms' : '300ms',
            }}
          >
            <VideoCard
              video={video}
              isActive={isActive}
              onLike={() => onLike(video.id)}
              onSave={() => onSave(video.id)}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={onVolumeChange}
              onMuteChange={onMuteChange}
            />
          </div>
        );
      })}

      {/* Index indicator — only when feed visible */}
      {visible && (
        <div className="absolute right-3 top-10 bottom-[88px] flex flex-col justify-center gap-1 z-20">
          {videos.map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'h-6 bg-white'
                  : 'h-3 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Top hint */}
      {visible && currentIndex === 0 && (
        <div className="absolute top-4 inset-x-0 flex justify-center z-20 pointer-events-none">
          <span className="text-xs text-white/50 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            Swipe up to browse
          </span>
        </div>
      )}
    </div>
  );
}
