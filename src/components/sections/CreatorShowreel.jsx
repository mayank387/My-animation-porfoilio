import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, 
  Film, Sparkles, UploadCloud, RotateCcw, Eye
} from 'lucide-react';

export default function CreatorShowreel({ introVideo, onOpenAdminUpload }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const hasVideo = Boolean(introVideo?.videoUrl);
  const isVertical = introVideo?.aspectRatio === '9:16';
  const isFourThree = introVideo?.aspectRatio === '4:3';

  // Instant Muted Autoplay on Mount & When Video URL is Available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    video.muted = true;
    setIsMuted(true);
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          const onFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.loop = true;
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
            window.removeEventListener('click', onFirstInteraction);
            window.removeEventListener('scroll', onFirstInteraction);
          };
          window.addEventListener('click', onFirstInteraction, { once: true });
          window.addEventListener('scroll', onFirstInteraction, { once: true });
        });
    }
  }, [hasVideo, introVideo?.videoUrl]);

  // IntersectionObserver: Muted autoplay when entering viewport, pause when leaving
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasVideo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting) {
            video.loop = true;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasVideo]);

  // Hover to restart video from beginning and keep playing in loop
  const handleMouseEnter = () => {
    setShowControls(true);
    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
        video.loop = true;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to restart showreel on hover:', err);
      }
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Time & duration tracker
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    setHasInteracted(true);
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Sound Mute / Unmute (allows visitors to enable audio manually)
  const toggleMute = () => {
    if (!videoRef.current) return;
    setHasInteracted(true);
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.volume === 0) {
      videoRef.current.volume = 0.85;
      setVolume(0.85);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setHasInteracted(true);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Timeline scrubber seek
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * (videoRef.current.duration || 0);
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    setProgress(pos * 100);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Autohide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="showreel" className="py-20 sm:py-28 relative bg-studio-bg overflow-hidden border-b border-white/[0.06]">
      {/* Background Cinematic Glow Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-electric-indigo/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-electric-blue/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-indigo/10 border border-electric-indigo/20 text-electric-blue text-xs font-sans font-medium uppercase tracking-widest mb-4"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Director Showreel</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight uppercase leading-[1.08]"
          >
            A GLIMPSE INTO MY CREATIVE WORLD.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-studio-muted font-normal leading-relaxed max-w-2xl mx-auto"
          >
            Explore my creativity through cinematic visuals, 3D animations and product advertisements.
          </motion.p>
        </div>

        {/* Cinematic Video Player Frame */}
        <div className="relative mx-auto">
          {/* Subtle Ambient Rim Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-electric-indigo/25 via-electric-violet/20 to-electric-blue/25 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

          {hasVideo ? (
            /* Active Intro Video Player */
            <div
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              className={`relative mx-auto rounded-2xl sm:rounded-3xl bg-black border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden group select-none ${
                isVertical
                  ? 'max-w-md aspect-[9/16]'
                  : isFourThree
                  ? 'max-w-4xl aspect-[4/3]'
                  : 'w-full aspect-video'
              }`}
            >
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                key={introVideo.videoUrl}
                src={introVideo.videoUrl}
                poster={introVideo.thumbnail}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Top Studio Watermark & Sound Pill */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-sans text-white/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium tracking-wide">4K SHOWREEL</span>
                </div>

                {isMuted && isPlaying && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-electric-blue/40 text-electric-blue text-xs font-sans font-medium transition-all cursor-pointer shadow-lg"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Click for Sound</span>
                  </button>
                )}
              </div>

              {/* Center Big Play Button (when paused) */}
              {!isPlaying && (
                <div 
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer z-10 transition-opacity"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/70 hover:bg-electric-indigo text-white border border-white/20 hover:border-transparent flex items-center justify-center shadow-2xl transition-all transform hover:scale-110">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-current" />
                  </div>
                </div>
              )}

              {/* Cinematic Bottom Gradient */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

              {/* Full Controls Bar */}
              <div 
                className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col gap-2.5 z-20 transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Timeline Scrubber */}
                <div 
                  onClick={handleSeek}
                  className="w-full h-1.5 hover:h-2 bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all"
                  title="Seek video timeline"
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Control Icons & Volume */}
                <div className="flex items-center justify-between text-xs font-sans text-white">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors cursor-pointer"
                      aria-label={isPlaying ? 'Pause showreel' : 'Play showreel'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    {/* Mute & Volume Slider */}
                    <div className="flex items-center gap-2 group/vol">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors cursor-pointer"
                        aria-label={isMuted ? 'Unmute showreel' : 'Mute showreel'}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-electric-blue" />}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-20 accent-electric-blue h-1 cursor-pointer bg-white/20 rounded-lg"
                        title="Volume"
                      />
                    </div>

                    {/* Duration Counter */}
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-[11px] font-sans text-slate-400">
                      {isMuted ? 'Muted Autoplay Active' : 'Sound Enabled'}
                    </span>

                    {/* Fullscreen */}
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors cursor-pointer"
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Clean Empty Placeholder: "My Showreel Coming Soon." */
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-studio-surface border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-12 sm:p-24 text-center overflow-hidden">
              <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-electric-indigo/10 blur-[120px] rounded-full pointer-events-none" />

              <div className="relative z-10 max-w-xl mx-auto space-y-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-electric-blue shadow-2xl">
                  <Film className="w-8 h-8 sm:w-10 sm:h-10 text-electric-blue" />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-indigo/10 border border-electric-indigo/20 text-electric-blue text-xs font-sans font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cinematic Showreel Coming Soon</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight uppercase">
                  My Showreel Coming Soon.
                </h3>

                <p className="text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
                  A high-energy compilation of original 3D animated advertisements, cinematic commercials, and visual reels is currently being edited.
                </p>

                <div className="pt-3">
                  <button
                    type="button"
                    onClick={onOpenAdminUpload || (() => { window.location.pathname = '/admin'; })}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-semibold font-sans transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-electric-blue" />
                    <span>Upload Intro Showreel (Admin Dashboard)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

