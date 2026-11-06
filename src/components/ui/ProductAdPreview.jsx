import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  Sparkles, Layers, Box, Eye, CheckCircle2, Film, UploadCloud
} from 'lucide-react';
import Badge from './Badge';

export default function ProductAdPreview({ project, onOpenModal }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (videoRef.current && project?.videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [project]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 20;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress((cur / dur) * 100);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If no project uploaded yet, show professional creative work coming soon showcase
  if (!project) {
    return (
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-electric-indigo/20 via-electric-violet/10 to-electric-blue/20 rounded-3xl blur-2xl opacity-40 pointer-events-none" />
        
        <div className="relative rounded-2xl sm:rounded-3xl bg-studio-surface border border-white/10 shadow-2xl overflow-hidden p-8 sm:p-14 text-center">
          {/* Subtle animated background grid */}
          <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-electric-indigo/10 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-indigo/10 border border-electric-indigo/25 text-electric-blue text-xs font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
              <span>Studio Production Pipeline Active</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              My Creative Work Is Coming Soon.
            </h3>

            <p className="text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
              Original 3D animated advertisements, cinematic brand commercials, and high-impact motion reels are currently in post-production.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-sans font-semibold transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-electric-blue" />
                <span>Upload Original Project (Admin Portal)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When creator has uploaded a project, feature it proudly
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Soft Ambient Rim Light behind preview */}
      <div className="absolute -inset-1 bg-gradient-to-r from-electric-indigo/30 via-electric-violet/20 to-electric-blue/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition duration-700 pointer-events-none" />

      {/* Main Glass Frame */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative rounded-2xl sm:rounded-3xl bg-studio-surface border border-white/15 shadow-2xl overflow-hidden group cursor-pointer"
        onClick={() => onOpenModal && onOpenModal(project)}
      >
        {/* Top Studio HUD Bar */}
        <div className="px-4 sm:px-6 py-3 bg-studio-bg/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              FEATURED WORK
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-xs font-mono text-slate-300 uppercase truncate max-w-md">
              {project.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="indigo" className="text-[10px] hidden xs:inline-flex">
              {project.categoryLabel || project.category}
            </Badge>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
              {project.aspectRatio || '16:9'}
            </span>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={project.videoUrl}
            poster={project.thumbnail}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Center Play Button Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-electric-indigo group-hover:border-transparent">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1 fill-current" />
            </div>
          </div>

          {/* Bottom Player Controls & Info HUD */}
          <div 
            className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrubber Progress Bar */}
            <div className="w-full h-1.5 bg-white/20 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/90">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors cursor-pointer"
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors cursor-pointer"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-slate-400 text-[11px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-electric-blue font-sans">
                  <Eye className="w-3.5 h-3.5" /> Click for Cinema Theater View
                </span>

                <button
                  type="button"
                  onClick={() => onOpenModal && onOpenModal(project)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white hover:text-electric-blue transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
                  aria-label="Expand theater mode"
                >
                  <span className="hidden sm:inline font-sans">Theater Mode</span>
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Specs Strip */}
        <div className="px-6 py-4 bg-studio-card border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Original Work:</span>
            <span className="text-white font-medium">{project.title}</span>
          </div>

          <div className="flex items-center gap-3 text-studio-muted text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Original Render
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-electric-blue" /> Master Quality
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
