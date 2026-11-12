import React, { useRef, useState, useEffect, lazy, Suspense } from 'react';
import { 
  ArrowUpRight, ShieldCheck, Film, Play, Pause, 
  Volume2, VolumeX, Maximize2, Sparkles, UploadCloud, 
  ChevronDown, Tv
} from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { getOptimizedThumbnail, THUMBNAIL_DIMENSIONS } from '../../utils/imageOptimization';

// Lazy-load Three.js 3D background only on desktop during idle time (saves 538 kB on mobile)
const LazyCinematicBackground = lazy(() => import('../ui/CinematicBackground'));

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
  const [load3D, setLoad3D] = useState(false);

  // Defer heavy Three.js 3D WebGL background to desktop devices during idle time (prevents mobile TBT)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.innerWidth >= 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop) return;

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => setLoad3D(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setLoad3D(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const hasVideo = Boolean(introVideo?.videoUrl);
  const rawPoster = introVideo?.thumbnailUrl || introVideo?.thumbnail || '';
  const introPoster = getOptimizedThumbnail(rawPoster, introVideo?.id || 'creator-intro-showreel', introVideo?.title || 'My Introduction video');

  // 1. Controlled Video Playback: Instant WebP poster for LCP, deferred streaming on mobile
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideo) return;

    // Strict browser playback policy: must be muted, playsInline, and looping
    video.muted = true;
    setIsMuted(true);
    video.loop = true;
    video.playsInline = true;

    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);

    const startPlayback = () => {
      if (!videoRef.current) return;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    };

    if (isMobile) {
      // On mobile: prioritize instant LCP image paint, defer video download until idle or tap
      if ('requestIdleCallback' in window) {
        const handle = window.requestIdleCallback(startPlayback, { timeout: 3500 });
        return () => window.cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(startPlayback, 2500);
        return () => clearTimeout(timer);
      }
    } else {
      startPlayback();
    }
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
      {/* Cinematic Background: Pure CSS Ambient Glow on Mobile (< 768px), Lazy WebGL on Desktop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] bg-studio-orange/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-electric-indigo/10 blur-[120px] rounded-full pointer-events-none" />
        {load3D && (
          <Suspense fallback={null}>
            <LazyCinematicBackground />
          </Suspense>
        )}
      </div>

      <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Split Hero Layout: Left Editorial Text (5 cols), Right Large 16:9 Video Player (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: INTRODUCTION TEXT & CTAS (5 COLS)            */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left space-y-6">
            
            {/* Availability Badge */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-sans font-medium text-slate-300">
                  Available for Commissions • Worldwide Freelance Director
                </span>
              </div>
            </div>

            {/* Main Editorial Studio Headline (Eager static for instant FCP/LCP) */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-heading font-extrabold tracking-[-0.03em] text-white leading-[1.08]">
              Bringing Ideas to Life{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                Through Motion.
              </span>
            </h1>

            {/* Specialization Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-studio-charcoal/80 border border-white/10 backdrop-blur-sm text-xs sm:text-sm font-sans font-medium text-amber-300 shadow-sm self-start">
              <Sparkles className="w-3.5 h-3.5 text-studio-orange flex-shrink-0" />
              <span>Cinematic 3D Animation | AI Video | Commercials</span>
            </div>

            {/* Editorial Paragraph */}
            <p className="text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
              I create visually engaging advertisements and cinematic videos for brands, combining photorealistic 3D motion design, generative AI pipelines, and commercial post-production to turn ambitious concepts into unforgettable visual stories.
            </p>

            {/* Functional Call-to-Actions */}
            <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {/* CTA 1: Explore Work */}
              <button
                type="button"
                onClick={handleScrollToShowcase}
                aria-label="Explore My Work"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-orange-500/40 backdrop-blur-md transition-all shadow-lg group cursor-pointer order-1"
              >
                <Play className="w-4 h-4 text-studio-orange fill-current group-hover:scale-110 transition-transform" />
                <span>Explore My Work</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* CTA 2: Hire me on Behance */}
              <a
                href={siteConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hire Mayank on Behance"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-[#1769FF] hover:bg-[#0056eb] text-white shadow-[0_0_25px_rgba(23,105,255,0.4)] hover:shadow-[0_0_35px_rgba(23,105,255,0.65)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30 order-2"
              >
                <span>Hire me on Behance</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* CTA 3: Upload Work / Studio CMS */}
              <button
                type="button"
                onClick={onOpenAdminUpload}
                aria-label="Upload Work to Studio CMS"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-orange-500/40 backdrop-blur-md transition-all shadow-md group cursor-pointer order-4 sm:order-3"
                title="Upload Videos & Manage Portfolio"
              >
                <UploadCloud className="w-4 h-4 text-studio-orange group-hover:scale-110 transition-transform" />
                <span>Upload Work</span>
              </button>

              {/* CTA 4: Hire me on contra (Positioned directly below Hire me on Behance) */}
              <a
                href={siteConfig.contraUrl || siteConfig.profileUrl || "https://contra.com/Mayankk4rn/work?r=Mayankk4rn"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hire Mayank on Contra"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold font-sans bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-indigo-400/30 order-3 sm:order-4"
              >
                <span>Hire me on contra</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: EXPANSIVE 16:9 VIDEO PLAYER (7 COLS)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 w-full flex flex-col justify-center">
            {/* Outer 16:9 Frame: Fills the entire 7-column desktop width */}
            <div
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/15 hover:border-orange-500/40 transition-all duration-500 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] hover:shadow-[0_0_50px_rgba(255,107,0,0.18)] group flex items-center justify-center"
            >
              
              {hasVideo ? (
                /* Real Uploaded Intro Video Display */
                <>
                  {/* Poster Thumbnail (High priority LCP optimization - WebP with fallback) */}
                  {!posterError && (
                    <picture className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-700 ${
                      isPlaying ? 'opacity-0' : 'opacity-100'
                    }`}>
                      <source srcSet="/thumbnails/intro_showreel_poster.webp" type="image/webp" />
                      <img
                        src={introPoster || "/thumbnails/intro_showreel_poster.webp"}
                        alt="Director Showreel Intro Poster"
                        width={THUMBNAIL_DIMENSIONS.width}
                        height={THUMBNAIL_DIMENSIONS.height}
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          const fallbackUrl = introVideo?.originalThumbnail;
                          if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                            e.currentTarget.src = fallbackUrl;
                          } else {
                            setPosterError(true);
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  )}

                  {/* HTML5 Video Player */}
                  <video
                    ref={videoRef}
                    src={introVideo.videoUrl}
                    poster={introPoster || "/thumbnails/intro_showreel_poster.webp"}
                    width={THUMBNAIL_DIMENSIONS.width}
                    height={THUMBNAIL_DIMENSIONS.height}
                    muted={isMuted}
                    playsInline
                    loop
                    preload="none"
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
                        aria-label="Manage Intro Showreel"
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
                      className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/70 hover:bg-studio-orange backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-2xl cursor-pointer z-20"
                      aria-label="Play introduction video"
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
                      role="slider"
                      tabIndex={0}
                      aria-label="Video timeline scrubber"
                      aria-valuenow={Math.round(progress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      onClick={handleSeek}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' && videoRef.current) {
                          videoRef.current.currentTime = Math.min((videoRef.current.duration || 0), videoRef.current.currentTime + 5);
                        } else if (e.key === 'ArrowLeft' && videoRef.current) {
                          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                        }
                      }}
                      className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer mb-2.5 relative overflow-hidden transition-all focus:outline-none focus:ring-1 focus:ring-studio-orange"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={togglePlay}
                          aria-label={isPlaying ? 'Pause video' : 'Play video'}
                          className="hover:text-white transition-colors cursor-pointer font-medium"
                        >
                          {isPlaying ? 'Pause' : 'Play'}
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
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
                /* Expansive 16:9 Empty State Placeholder with Instant Poster Paint */
                <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-studio-card via-studio-surface to-black text-center overflow-hidden">
                  {/* Instant LCP Poster Background */}
                  <picture className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <source srcSet="/thumbnails/intro_showreel_poster.webp" type="image/webp" />
                    <img
                      src="/thumbnails/intro_showreel_poster.webp"
                      alt="Director Showreel Intro Poster"
                      width={THUMBNAIL_DIMENSIONS.width}
                      height={THUMBNAIL_DIMENSIONS.height}
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover opacity-35"
                    />
                  </picture>

                  {/* Subtle Background Glow & Grid */}
                  <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none z-1" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-indigo/15 blur-[80px] rounded-full pointer-events-none z-1" />

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
          </div>

        </div>

        {/* Full-width Studio Specs Bar below hero */}
        <div className="mt-14 sm:mt-16 pt-8 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {siteConfig.stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <span className="text-xs font-sans text-studio-muted block">{stat.label}</span>
              <span className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">{stat.value}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}