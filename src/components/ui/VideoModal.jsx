import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, Volume2, Volume1, VolumeX, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Sparkles, Layers, CheckCircle2, 
  Info, ExternalLink, Film, RotateCcw
} from 'lucide-react';
import Badge from './Badge';
import { getOptimizedThumbnail } from '../../utils/imageOptimization';

export default function VideoModal({ 
  project, 
  projects = [], 
  isOpen, 
  onClose, 
  onSelectProject 
}) {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [showCenterFeedback, setShowCenterFeedback] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Compute current project index and navigation
  const currentIndex = projects.findIndex((p) => p.id === project?.id);
  const hasPrev = projects.length > 1;
  const hasNext = projects.length > 1;

  const handlePrev = useCallback(() => {
    if (!projects.length || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIndex]);
  }, [currentIndex, projects, onSelectProject]);

  const handleNext = useCallback(() => {
    if (!projects.length || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIndex]);
  }, [currentIndex, projects, onSelectProject]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // When project changes, load new video and play
  useEffect(() => {
    if (!isOpen || !project || !videoRef.current) return;

    setIsVideoLoading(true);
    setCurrentTime(0);
    setProgress(0);
    videoRef.current.currentTime = 0;
    videoRef.current.load();

    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsVideoLoading(false);
        })
        .catch(() => {
          // If unmuted autoplay was blocked by browser policy, fallback to muted playback
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsVideoLoading(false);
              })
              .catch(() => {
                setIsPlaying(false);
                setIsVideoLoading(false);
              });
          } else {
            setIsPlaying(false);
            setIsVideoLoading(false);
          }
        });
    }
  }, [project, isOpen]);

  // Autohide controls on inactivity during playback
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  };

  if (!isOpen || !project) return null;

  // Safe normalization of array fields (avoids TypeError: map is not a function if string or null)
  let safeTools = [];
  try {
    if (Array.isArray(project.tools)) {
      safeTools = project.tools;
    } else if (typeof project.tools === 'string') {
      safeTools = project.tools.trim().startsWith('[') 
        ? JSON.parse(project.tools) 
        : project.tools.split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch {
    safeTools = [];
  }

  let safeHighlights = [];
  try {
    if (Array.isArray(project.highlights)) {
      safeHighlights = project.highlights;
    } else if (typeof project.highlights === 'string') {
      safeHighlights = project.highlights.trim().startsWith('[') 
        ? JSON.parse(project.highlights) 
        : project.highlights.split(',').map(s => s.trim()).filter(Boolean);
    }
  } catch {
    safeHighlights = [];
  }

  const projectConcept = project.concept || project.description || project.tagline || 'Original 3D visual production.';
  const projectTagline = project.tagline || project.description || '';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
    setShowCenterFeedback(true);
    setTimeout(() => setShowCenterFeedback(false), 500);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(total);
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekPercent = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = seekPercent * duration;
    setProgress(seekPercent * 100);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine Aspect Ratio Container Classes (Never stretches or distorts)
  const isVertical = project.aspectRatio === "9:16";
  const isFourThree = project.aspectRatio === "4:3";

  const getContainerDimensions = () => {
    if (isVertical) {
      return "max-w-[340px] sm:max-w-[380px] aspect-[9/16] max-h-[72vh]";
    }
    if (isFourThree) {
      return "max-w-3xl aspect-[4/3] max-h-[70vh]";
    }
    return "w-full max-w-4xl aspect-video max-h-[68vh]";
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-2xl overflow-y-auto"
      >
        {/* Main Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl my-auto rounded-2xl sm:rounded-3xl bg-studio-surface border border-white/[0.09] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* Header Bar: Project Index Counter & Close */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-white/[0.08] bg-studio-bg/80 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              <Badge variant="indigo" className="text-xs">
                {project.categoryLabel}
              </Badge>

              {/* Navigation Counter */}
              {projects.length > 0 && (
                <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/5">
                  <span className="text-white font-medium">{String(currentIndex + 1).padStart(2, '0')}</span>
                  <span className="text-slate-600">/</span>
                  <span>{String(projects.length).padStart(2, '0')}</span>
                </div>
              )}

              <span className="hidden md:inline-flex text-[11px] font-mono text-slate-400">
                {isVertical ? '9:16 VERTICAL CINEMA' : isFourThree ? '4:3 ORIGINAL ASPECT' : '16:9 CINEMA WIDESCREEN'}
              </span>
            </div>

            {/* Quick Next/Prev & Close */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5 mr-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Previous Project (Left Arrow)"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Next Project (Right Arrow)"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close (Esc)"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Container */}
          <div className="flex-1 overflow-y-auto">
            
            {/* Cinema Stage (Video Player Screen) */}
            <div className="relative w-full bg-black flex items-center justify-center p-3 sm:p-6 overflow-hidden">
              
              {/* Prev Project Floating Navigation Arrow (Desktop & Tablet) */}
              {hasPrev && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hidden md:flex absolute left-4 lg:left-6 z-30 p-3 rounded-full bg-black/60 hover:bg-electric-indigo text-white backdrop-blur-md border border-white/15 transition-all transform hover:scale-110 shadow-2xl focus:outline-none"
                  aria-label="Previous Project"
                  title="Previous project (←)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Project Floating Navigation Arrow (Desktop & Tablet) */}
              {hasNext && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="hidden md:flex absolute right-4 lg:right-6 z-30 p-3 rounded-full bg-black/60 hover:bg-electric-indigo text-white backdrop-blur-md border border-white/15 transition-all transform hover:scale-110 shadow-2xl focus:outline-none"
                  aria-label="Next Project"
                  title="Next project (→)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Video Player Frame (Adaptive Aspect Ratio - Never Stretches) */}
              <div
                ref={videoContainerRef}
                onMouseMove={handleMouseMove}
                className={`relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10 flex items-center justify-center group ${getContainerDimensions()}`}
              >
                {/* HTML5 Video Element with MP4 & WebM Support */}
                <video
                  ref={videoRef}
                  key={project.id || project.videoUrl}
                  src={project.videoUrl}
                  poster={getOptimizedThumbnail(project.thumbnail, project.id, project.title)}
                  playsInline
                  loop
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedData={() => setIsVideoLoading(false)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onError={(e) => {
                    console.warn('VideoModal video error:', e);
                    setIsVideoLoading(false);
                  }}
                  onClick={togglePlay}
                  className="w-full h-full object-contain bg-black cursor-pointer select-none"
                />

                {/* Loading / Buffering Spinner */}
                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
                    <div className="w-10 h-10 border-2 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin" />
                  </div>
                )}

                {/* Center Play/Pause Feedback Animation on Click */}
                {showCenterFeedback && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl"
                    >
                      {isPlaying ? (
                        <Play className="w-7 h-7 ml-1 fill-current text-white" />
                      ) : (
                        <Pause className="w-7 h-7 fill-current text-white" />
                      )}
                    </motion.div>
                  </div>
                )}

                {/* Video Controls Bar Overlay */}
                <div
                  className={`absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${
                    isControlsVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Scrubber Progress Bar */}
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all group/seek"
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between text-xs font-mono text-white/90 pt-1">
                    
                    {/* Left: Play/Pause, Next/Prev, Volume & Time */}
                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors"
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Previous Project Button */}
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors"
                        title="Previous Project (←)"
                        aria-label="Previous project"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Next Project Button */}
                      <button
                        type="button"
                        onClick={handleNext}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors"
                        title="Next Project (→)"
                        aria-label="Next project"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Volume Control with Slider */}
                      <div className="flex items-center gap-1.5 group/vol">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-slate-400" />
                          ) : volume < 0.5 ? (
                            <Volume1 className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-14 sm:w-20 h-1 bg-white/20 accent-electric-blue rounded-lg cursor-pointer transition-all"
                          aria-label="Volume slider"
                        />
                      </div>

                      {/* Current Time / Duration */}
                      <span className="text-slate-300 text-[11px] hidden xs:inline">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right: Quality Badge, Aspect Ratio, Fullscreen */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-300">
                        {project.aspectRatio || '16:9'}
                      </span>
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-cyan-300">
                        4K UHD
                      </span>

                      {/* Fullscreen Button */}
                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors"
                        title="Toggle Fullscreen (f)"
                        aria-label="Toggle fullscreen"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Project Details Below Video */}
            <div className="p-6 sm:p-8 bg-studio-surface border-t border-white/[0.08] space-y-6">
              
              {/* Title & Tagline Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="indigo">{project.categoryLabel}</Badge>
                    {project.specType && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-sans font-medium bg-white/[0.04] text-slate-300 border border-white/10">
                        {project.specType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                    {project.title}
                  </h2>
                  <p className="text-sm text-studio-muted font-normal leading-relaxed">
                    {projectTagline}
                  </p>
                </div>

                {/* Direct Project Inquiry CTA */}
                <a
                  href="#contact"
                  onClick={() => onClose && onClose()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white text-xs font-sans font-semibold shadow-electric-glow hover:opacity-95 transition-all transform hover:-translate-y-0.5 flex-shrink-0 cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Grid: Creative Concept & Technical Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                
                {/* Concept Narrative */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-sans font-semibold text-electric-blue">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Concept Breakdown</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                    {projectConcept}
                  </p>
                </div>

                {/* Key Technical Highlights */}
                {safeHighlights.length > 0 && (
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-electric-indigo">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Technical Direction</span>
                    </div>
                    <ul className="space-y-1.5">
                      {safeHighlights.map((h, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-electric-indigo mt-2 flex-shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              {/* Pipeline Software Toolkit */}
              {safeTools.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 mr-1">
                      <Layers className="w-3.5 h-3.5" /> Software:
                    </span>
                    {safeTools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono px-3 py-1 rounded-lg bg-white/[0.03] text-slate-300 border border-white/10"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Keyboard Shortcuts Hint */}
                  <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-500">
                    <span>← → Navigate</span>
                    <span>•</span>
                    <span>Space Play/Pause</span>
                    <span>•</span>
                    <span>M Mute</span>
                    <span>•</span>
                    <span>F Fullscreen</span>
                  </div>
                </div>
              )}

              {/* Transparency Notice */}
              {project.disclaimer && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                    {project.disclaimer}
                  </p>
                </div>
              )}

              {/* Bottom Quick Navigation Bar */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Film</span>
                </button>

                <div className="text-xs font-mono text-studio-muted">
                  Project {currentIndex + 1} of {projects.length}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  <span>Next Film</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
