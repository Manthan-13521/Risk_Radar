'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function DemoVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrentTime(v.currentTime);
      setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
    };
    const onMeta = () => { setDuration(v.duration); setLoaded(true); };
    const onEnd = () => { setPlaying(false); setShowControls(true); };
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended', onEnd);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('ended', onEnd);
    };
  }, []);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = pct * v.duration;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-lg relative group"
      style={{
        borderColor: 'rgba(153,0,17,0.35)',
        boxShadow: '0 0 40px rgba(153,0,17,0.12), 0 4px 24px rgba(0,0,0,0.18)',
        background: '#0a0a0a',
      }}
      onMouseMove={resetHideTimer}
      onMouseEnter={resetHideTimer}
    >
      {/* 16:9 aspect ratio wrapper */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <video
          ref={videoRef}
          src="/demo-video.mp4"
          preload="metadata"
          muted={muted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ background: '#000' }}
        />

        {/* Play overlay — shown when paused */}
        {!playing && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
            style={{ background: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={togglePlay}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2 transition hover:scale-110"
              style={{ background: '#990011', borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <svg className="w-8 h-8 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="mt-4 text-white font-bold text-sm tracking-wide opacity-90">
              {loaded ? 'Play Demo' : 'Loading…'}
            </div>
            {duration > 0 && (
              <div
                className="mt-2 text-xs font-mono font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
              >
                {fmt(duration)} · Product Demo
              </div>
            )}
          </div>
        )}

        {/* Controls overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
            showControls || !playing ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="mx-4 mb-1 h-1.5 rounded-full cursor-pointer group/bar relative"
            style={{ background: 'rgba(255,255,255,0.25)' }}
            onClick={seek}
          >
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{ background: '#990011', width: `${progress}%` }}
            />
            {/* Scrubber dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-sm opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-2 px-4 pb-3 pt-1">
            <button
              onClick={togglePlay}
              className="text-white text-sm w-7 h-7 flex items-center justify-center hover:text-red-400 transition"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6zm8-14v14h4V5z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={toggleMute}
              className="text-white text-sm w-7 h-7 flex items-center justify-center hover:text-red-400 transition"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <span className="text-xs font-mono text-white/70 ml-1 flex-1">
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(153,0,17,0.7)', color: '#fff' }}
            >
              40 sec · Product Demo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
