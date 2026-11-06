import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, ShieldCheck, Film, Play, Pause, 
  Volume2, VolumeX, Maximize2, Sparkles, UploadCloud, 
  ChevronDown, Tv
} from 'lucide-react';
import { contraConfig } from '../../data/contraConfig';
import CinematicBackground from '../ui/CinematicBackground';

export default function Hero({ 
  introVideo, 
  onOpenAdminUpload, 
  onOpenFeaturedProject, 
  featuredProject 
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const hasVideo = Boolean(introVideo?.videoUrl);
  const introPoster = introVideo?.thumbnailUrl || introVideo?.thumbnail || '';

  // 1. Instant Muted Autoplay on Mount & When Video URL is Available
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // Strict browser autoplay policy: must be muted, playsInline, and looping
    video.muted = true;
    setIsMuted(true);
    video.loop = true;
    video.playsInline = true;

    const startAutoplay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Initial autoplay deferred by browser policy:', err);
            // Fallback: start on first touch, click or scroll
            const onFirstUserAction = () => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.loop = true;
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
              window.removeEventListener('click', onFirstUserAction);
              window.removeEventListener('scroll', onFirstUserAction);
              window.removeEventListener('touchstart', onFirstUserAction);
            };
            window.addEventListener('click', onFirstUserAction, { once: true });
            window.addEventListener('scroll', onFirstUserAction, { once: true });
            window.addEventListener('touchstart', onFirstUserAction, { once: true });
          });
      }
    };

    startAutoplay();
  }, [hasVideo, introVideo?.videoUrl]);

  // 2. IntersectionObserver: Pause when scrolled far out of view, resume playing when visible
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
            const p = video.play();
            if (p !== undefined) {
              p.then(() => setIsPlaying(true)).catch(() => {});
            }
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasVideo]);

  // 3. Hover to Restart Video from 0 and keep playing in continuous loop
  const handleMouseEnter = () => {
    setShowControls(true);
    const video = videoRef.current;
    if (video) {
      try {
        video.currentTime = 0;
        setProgress(0);
        video.loop = true;
        const p = video.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to restart video on hover:', err);
      }
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
    // Keep playing in loop — do not pause on mouse leave
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    setHasInteracted(true);
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    setHasInteracted(true);
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * (videoRef.current.duration || 0);
    videoRef.current.currentTime = targetTime;
    setProgress(pos * 100);
  };

  const handleScrollToShowcase = () => {
    const el = document.getElementById('showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="showreel" className="relative min-h-screen pt-28 sm:pt-32 pb-16 lg:pb-24 flex flex-col justify-center overflow-hidden bg-studio-bg">
      {/* Cinematic Animated Background with 3D objects, particles & depth */}
      <CinematicBackground />

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Split Hero Layout: Left Editorial Text (5 cols), Right Large 16:9 Video Player (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: INTRODUCTION TEXT & CTAS (5 COLS)            */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6">
            
            {/* Availability Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center"
            >
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-sans font-medium text-slate-300">
                  Available for Commissions • Verified on <span className="text-white font-semibold">Contra</span>
                </span>
              </div>
            </motion.div>

            {/* Main Editorial Studio Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-heading font-extrabold tracking-[-0.03em] text-white leading-[1.08]"
            >
              Bringing Ideas to Life{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple">
                Through Motion.
              </span>
            </motion.h1>

            {/* Specialization Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-xs sm:text-sm font-sans font-medium text-cyan-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-electric-blue flex-shrink-0" />
                <span>Cinematic 3D Animation | AI Video | Commercials</span>
              </div>
            </motion.div>

            {/* Editorial Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-sm sm:text-base text-studio-muted font-normal leading-relaxed"
            >
              I create visually engaging advertisements and cinematic videos for brands, combining photorealistic 3D motion design, generative AI pipelines, and commercial post-production to turn ambitious concepts into unforgettable visual stories.
            </motion.p>

            {/* Functional Call-to-Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              {/* CTA 1: Explore Work */}
              <button
                type="button"
                onClick={handleScrollToShowcase}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all shadow-lg group cursor-pointer"
              >
                <Play className="w-4 h-4 text-electric-blue fill-current group-hover:scale-110 transition-transform" />
                <span>Explore My Work</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* CTA 2: Hire Me on Contra */}
              <a
                href={contraConfig.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Hire Me on Contra</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* CTA 3: Upload Work / Studio CMS */}
              <button
                type="button"
                onClick={onOpenAdminUpload}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-electric-indigo/50 backdrop-blur-md transition-all shadow-md group cursor-pointer"
                title="Upload Videos & Manage Portfolio"
              >
                <UploadCloud className="w-4 h-4 text-electric-blue group-hover:scale-110 transition-transform" />
                <span>Upload Work</span>
              </button>
            </motion.div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: EXPANSIVE 16:9 VIDEO PLAYER (7 COLS)        */}
          {/* ========================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-7 w-full flex flex-col justify-center"
          >
            {/* Outer 16:9 Frame: Fills the entire 7-column desktop width */}
            <div
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/15 hover:border-electric-indigo/40 transition-all duration-500 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] group flex items-center justify-center"
            >
              
              {hasVideo ? (
                /* Real Uploaded Intro Video Display */
                <>
                  {/* Poster Thumbnail (visible during initial buffer, fades out smoothly once playing) */}
                  {introPoster && !posterError && (
                    <img
                      src={introPoster}
                      alt="Intro showreel poster"
                      onError={() => setPosterError(true)}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none z-10 ${
                        isPlaying ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  )}

                  {/* HTML5 Video Player */}
                  <video
                    ref={videoRef}
                    src={introVideo.videoUrl}
                    poster={!posterError ? introPoster : undefined}
                    autoPlay
                    muted={isMuted}
                    playsInline
                    loop
                    preload="auto"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(e) => console.warn('Hero video playback notice:', e)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                      // Infinite loop safeguard
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                        videoRef.current.loop = true;
                        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                      }
                    }}
                    onClick={togglePlay}
                    className="w-full h-full object-cover cursor-pointer"
                  />

                  {/* Ambient Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-10" />

                  {/* Top Bar: Title, Manage Showreel & Sound Toggle */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                    <span className="px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-black/80 backdrop-blur-md text-white border border-white/15 flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-electric-blue" />
                      <span className="max-w-[140px] sm:max-w-[200px] truncate">{introVideo.title || 'Creator Showreel'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onOpenAdminUpload}
                        className="pointer-events-auto px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide bg-black/80 hover:bg-electric-indigo text-white border border-white/15 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
                        title="Upload or Change Intro Showreel"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-electric-blue" />
                        <span className="hidden sm:inline">Manage Showreel</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleMute}
                        className="pointer-events-auto p-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/15 backdrop-blur-md transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                        aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Center Play Button (only shown when video is paused, so hovering never blocks playback) */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/70 hover:bg-electric-indigo backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl cursor-pointer z-20"
                      aria-label="Play video"
                    >
                      <Play className="w-7 h-7 fill-white ml-0.5" />
                    </button>
                  )}

                  {/* Bottom Controls Bar */}
                  <div className={`absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 to-transparent transition-opacity duration-300 z-20 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {/* Scrubber Bar */}
                    <div
                      onClick={handleSeek}
                      className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer mb-2.5 relative overflow-hidden transition-all"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-electric-blue to-electric-indigo rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="hover:text-white transition-colors cursor-pointer font-medium"
                        >
                          {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="hover:text-white transition-colors cursor-pointer font-medium"
                        >
                          {isMuted ? 'Unmute Audio' : 'Sound On'}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="hover:text-white transition-colors p-1 cursor-pointer"
                        title="Fullscreen"
                        aria-label="Toggle Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Expansive 16:9 Empty State Placeholder */
                <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-studio-card via-studio-surface to-black text-center overflow-hidden">
                  {/* Subtle Background Glow & Grid */}
                  <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-indigo/15 blur-[80px] rounded-full pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wider uppercase bg-white/[0.04] border border-white/10 text-cyan-300 flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-electric-blue" />
                      <span>Introduction Reel</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">16:9 Cinema Widescreen</span>
                  </div>

                  {/* Center Graphic & Pitch */}
                  <div className="relative z-10 space-y-3.5 my-auto">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-electric-blue shadow-2xl">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-electric-blue/80 ml-1" />
                    </div>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">
                      My Creative World
                    </h3>

                    <p className="text-xs sm:text-sm text-studio-muted font-normal max-w-md mx-auto leading-relaxed">
                      Cinematic 3D animation showreel, product commercial montage & visual physics showcase.
                    </p>
                  </div>

                  {/* Bottom Admin Link / Status */}
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-electric-blue/70 animate-pulse" />
                      <span>Showreel Coming Soon</span>
                    </span>

                    {typeof onOpenAdminUpload === 'function' ? (
                      <button
                        type="button"
                        onClick={onOpenAdminUpload}
                        className="text-electric-blue hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload in Admin</span>
                      </button>
                    ) : (
                      <a
                        href="/admin"
                        className="text-electric-blue hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload in Admin</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Below-Player Caption */}
            <div className="mt-3.5 flex items-center justify-between px-3 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Featured 16:9 Director Showreel</span>
              </span>
              <span className="text-slate-500">Commercial 3D & AI Production</span>
            </div>
          </motion.div>

        </div>

        {/* Full-width Studio Specs Bar below hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-14 sm:mt-16 pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
        >
          {contraConfig.stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <span className="text-xs font-sans text-studio-muted block">{stat.label}</span>
              <span className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">{stat.value}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}