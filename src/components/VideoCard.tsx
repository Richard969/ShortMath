import { useState, useRef, useEffect, useCallback } from 'react';
import { Video } from '../types';
import AuthorAvatar from './AuthorAvatar';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteChange: (m: boolean) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;
  if (window.YT?.Player) {
    apiLoadPromise = Promise.resolve();
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
  });
  return apiLoadPromise;
}

export default function VideoCard({ video, isActive, onLike, onSave, volume, isMuted, onVolumeChange, onMuteChange }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showChapters, setShowChapters] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerId = useRef(`yt-player-${video.id}`);
  const progressInterval = useRef<ReturnType<typeof setInterval>>();
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // Seek helpers
  const getSeekTime = useCallback((clientX: number) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const player = playerRef.current;
    const dur = player?.getDuration?.() || video.duration;
    return ratio * dur;
  }, [video.duration]);

  const handleScrubStart = useCallback((clientX: number) => {
    setIsScrubbing(true);
    const time = getSeekTime(clientX);
    setScrubProgress((time / (playerRef.current?.getDuration?.() || video.duration)) * 100);
  }, [getSeekTime, video.duration]);

  const handleScrubMove = useCallback((clientX: number) => {
    if (!isScrubbing) return;
    const time = getSeekTime(clientX);
    setScrubProgress((time / (playerRef.current?.getDuration?.() || video.duration)) * 100);
  }, [isScrubbing, getSeekTime, video.duration]);

  const handleScrubEnd = useCallback((clientX: number) => {
    setIsScrubbing(false);
    const player = playerRef.current;
    if (!player) return;
    const time = getSeekTime(clientX);
    player.seekTo(time, true);
    setProgress((time / (player.getDuration() || video.duration)) * 100);
    if (player.getPlayerState() !== window.YT?.PlayerState?.PLAYING) {
      player.playVideo();
    }
  }, [getSeekTime, video.duration]);

  // Global scrub listeners
  useEffect(() => {
    if (!isScrubbing) return;
    const onMove = (e: MouseEvent) => handleScrubMove(e.clientX);
    const onUp = (e: MouseEvent) => handleScrubEnd(e.clientX);
    const onTouchMove = (e: TouchEvent) => handleScrubMove(e.touches[0].clientX);
    const onTouchEnd = (e: TouchEvent) => handleScrubEnd(e.changedTouches[0].clientX);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isScrubbing, handleScrubMove, handleScrubEnd]);

  const displayProgress = isScrubbing ? scrubProgress : progress;

  // Load YouTube API
  useEffect(() => {
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (!cancelled) setApiReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Create / destroy player
  useEffect(() => {
    if (!apiReady) return;

    try {
      playerRef.current = new window.YT.Player(playerContainerId.current, {
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: YT.PlayerEvent) => {
            const p = e.target;
            p.setVolume(volume);
            if (isMuted) p.mute(); else p.unMute();
            if (isActiveRef.current) p.playVideo();
          },
          onStateChange: (e: YT.OnStateChangeEvent) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              if (e.data === window.YT.PlayerState.ENDED) {
                setProgress(100);
              }
            }
          },
          onError: () => setLoadError(true),
        },
      });
    } catch {
      setLoadError(true);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [apiReady, video.youtubeId]);

  // Handle active/inactive
  useEffect(() => {
    const player = playerRef.current;
    if (!player?.playVideo || !player?.pauseVideo) return;

    if (isActive) {
      player.playVideo();
      player.setVolume(volume);
      if (isMuted) player.mute(); else player.unMute();
      progressInterval.current = setInterval(() => {
        try {
          const current = player.getCurrentTime();
          const dur = player.getDuration();
          if (dur > 0) setProgress((current / dur) * 100);
        } catch {}
      }, 200);
    } else {
      player.pauseVideo();
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isActive, volume, isMuted]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const state = player.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        player.setVolume(volume);
        if (isMuted) player.mute(); else player.unMute();
        setIsPlaying(true);
      }
    } catch {}
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    onVolumeChange(vol);
    const player = playerRef.current;
    if (!player) return;
    if (vol === 0) {
      onMuteChange(true);
      player.mute();
    } else {
      player.setVolume(vol);
      if (isMuted) {
        onMuteChange(false);
        player.unMute();
      }
    }
  }, [isMuted, onVolumeChange, onMuteChange]);

  // Listen for fullscreen change (e.g. user presses ESC)
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleVolumeWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -5 : 5;
    const vol = Math.min(100, Math.max(0, volume + delta));
    onVolumeChange(vol);
    const player = playerRef.current;
    if (!player) return;
    if (vol === 0) {
      onMuteChange(true);
      player.mute();
    } else {
      player.setVolume(vol);
      if (isMuted) {
        onMuteChange(false);
        player.unMute();
      }
    }
  }, [volume, isMuted, onVolumeChange, onMuteChange]);

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      const restoredVolume = volume === 0 ? 50 : volume;
      if (volume === 0) onVolumeChange(restoredVolume);
      player.setVolume(restoredVolume);
      player.unMute();
      onMuteChange(false);
    } else {
      player.mute();
      onMuteChange(true);
    }
  }, [isMuted, volume, onVolumeChange, onMuteChange]);

  const difficultyColor = {
    beginner: 'bg-[#90d090]/10 text-[#90d090] border-[#90d090]/30',
    intermediate: 'bg-[#f0d060]/10 text-[#f0d060] border-[#f0d060]/30',
    advanced: 'bg-[#f0a0b0]/10 text-[#f0a0b0] border-[#f0a0b0]/30',
  };

  return (
    <div ref={containerRef} className="absolute inset-0 bg-black" onClick={togglePlay}>
      {/* YouTube player container */}
      {!loadError ? (
        <div id={playerContainerId.current} className="absolute inset-0 w-full h-full pointer-events-none" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#141414] text-[#888] gap-2">
          <span className="text-3xl">⚠️</span>
          <p className="text-xs">Video unavailable</p>
          <p className="text-[10px] text-[#666]">youtube.com/watch?v={video.youtubeId}</p>
        </div>
      )}

      {/* Play/Pause overlay */}
      {!isPlaying && !loadError && apiReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Progress bar — draggable */}
      <div
        ref={progressBarRef}
        data-no-swipe
        className={`absolute top-2 left-2 right-2 z-20 cursor-pointer group ${isScrubbing ? 'h-1.5 -top-[3px]' : 'h-0.5'}`}
        onMouseDown={(e) => { e.stopPropagation(); handleScrubStart(e.clientX); }}
        onTouchStart={(e) => { e.stopPropagation(); handleScrubStart(e.touches[0].clientX); }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Track */}
        <div className={`absolute inset-0 rounded-full overflow-hidden ${isScrubbing ? 'bg-white/30' : 'bg-white/20'} transition-colors`}>
          <div
            className="h-full bg-chalk-yellow rounded-full"
            style={{ width: `${displayProgress}%`, transition: isScrubbing ? 'none' : 'width 200ms ease-linear' }}
          />
        </div>
        {/* Scrub handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-chalk-yellow rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${displayProgress}% - 6px)` }}
        />
      </div>

      {/* Chapters indicator */}
      {video.chapters.length > 1 && (
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20 pointer-events-none" style={{ marginTop: isScrubbing ? '10px' : '6px' }}>
          {video.chapters.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/10 rounded-full" />
          ))}
        </div>
      )}

      {/* Chapters panel */}
      {showChapters && (
        <div
          data-no-swipe
          className="absolute top-16 right-3 z-30 bg-[#111]/95 backdrop-blur rounded-xl p-3 border border-[#333]/50 w-48"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <h4 className="text-xs font-semibold text-[#aaa] mb-2 font-hand">Chapters</h4>
          {video.chapters.map((ch, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-1.5 text-xs text-[#ccc] border-b border-[#333]/50 last:border-0 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                playerRef.current?.seekTo(ch.time, true);
                if (playerRef.current?.getPlayerState() !== window.YT?.PlayerState?.PLAYING) {
                  playerRef.current?.playVideo();
                }
                setShowChapters(false);
              }}
            >
              <span className="text-chalk-blue font-mono">{Math.floor(ch.time / 60)}:{String(ch.time % 60).padStart(2, '0')}</span>
              <span>{ch.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Right sidebar actions */}
      <div
        data-no-swipe
        className="absolute right-3 bottom-[88px] flex flex-col items-center gap-5 z-20"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); onLike(); }} className="flex flex-col items-center gap-1">
          <span className={`text-3xl transition-transform active:scale-125 ${video.hasLiked ? 'scale-110 text-chalk-pink' : 'text-white'}`}>
            {video.hasLiked ? '♥' : '♡'}
          </span>
          <span className="text-[10px] text-white font-medium bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 font-hand font-semibold">{video.likes > 1000 ? `${(video.likes / 1000).toFixed(1)}K` : video.likes}</span>
        </button>

        {/* Chapters */}
        <button onClick={(e) => { e.stopPropagation(); setShowChapters(!showChapters); }} className="flex flex-col items-center gap-1">
          <span className="text-2xl text-white">☰</span>
          <span className="text-[10px] text-white font-medium bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 font-hand font-semibold">Chapters</span>
        </button>

        {/* Volume control */}
        <div
          data-no-swipe
          className="flex flex-col items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onWheel={handleVolumeWheel}
        >
          {/* Mute toggle */}
          <button onClick={handleToggleMute} className="flex flex-col items-center gap-1">
            <span className={`text-2xl transition-all active:scale-125 text-white ${isMuted || volume === 0 ? 'opacity-40' : volume < 50 ? 'opacity-70' : ''}`}>
              ◁
            </span>
            <span className="text-[10px] text-white font-medium bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 font-hand font-semibold">
              {isMuted ? 'Muted' : `${volume}%`}
            </span>
          </button>

          {/* Vertical slider */}
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            onWheel={handleVolumeWheel}
            className="volume-slider-vertical"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
              WebkitAppearance: 'slider-vertical',
              width: '4px',
              height: '64px',
              accentColor: '#60a5fa',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Save */}
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="flex flex-col items-center gap-1">
          <span className={`text-2xl transition-transform active:scale-125 text-white ${video.saved ? 'scale-110 text-chalk-yellow' : ''}`}>
            {video.saved ? '★' : '☆'}
          </span>
          <span className="text-[10px] text-white font-medium bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 font-hand font-semibold">Save</span>
        </button>

        {/* Fullscreen */}
        <button onClick={toggleFullscreen} className="flex flex-col items-center gap-1">
          <span className="text-2xl transition-transform active:scale-125 text-white">
            {isFullscreen ? '↙' : '↗'}
          </span>
          <span className="text-[10px] text-white font-medium bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 font-hand font-semibold">
            {isFullscreen ? 'Exit' : 'Full'}
          </span>
        </button>
      </div>

      {/* Black cover bar — hides YouTube iframe gray background at bottom edge (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-black z-20 pointer-events-none" />
      )}

      {/* Bottom info — hidden in fullscreen */}
      {!isFullscreen && (
      <div className="absolute bottom-[72px] left-0 right-0 z-20 px-4 pb-2 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <AuthorAvatar name={video.author.name} size="sm" />
          <span className="text-xs font-hand font-semibold text-white/70">{video.author.name}</span>
        </div>

        <h3 className="text-lg font-display font-bold italic text-white mb-1 leading-tight" style={{ textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>
          {video.title}
        </h3>
        <p className="text-xs text-white/70 leading-snug mb-2 font-light">{video.description}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-hand font-semibold ${difficultyColor[video.difficulty]}`}>
            {video.difficulty}
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/30 text-white/60 border border-white/10 font-hand font-medium">
            {video.topic}
          </span>
          <span className="text-[10px] text-white/40 font-hand">{video.duration}s</span>
        </div>
      </div>
      )}
    </div>
  );
}
