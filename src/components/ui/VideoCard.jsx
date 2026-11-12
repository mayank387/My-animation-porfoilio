import React, { useRef, useState, useEffect } from 'react';
import { Play, ExternalLink, Clock, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from './Badge';
import { getOptimizedThumbnail, THUMBNAIL_DIMENSIONS } from '../../utils/imageOptimization';

export default function VideoCard({ project, onSelect }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isVertical = project.aspectRatio === "9:16";
  const isFourThree = project.aspectRatio === "4:3";
  const optimizedThumbnail = getOptimizedThumbnail(project.thumbnail, project.id, project.title);

  // Desktop Hover Video Preview: only play when hovered on desktop with pointer
  useEffect(() => {
    if (!isHovered || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isHovered]);

  // Hover prioritization: hovering immediately mounts & plays this video on desktop
  const handleMouseEnter = () => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768 && !window.matchMedia('(pointer: coarse)').matches;
    if (isDesktop && project.videoUrl) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
  };

  // Badge styling by category
  const getBadgeVariant = (cat) => {
    switch (cat) {
      case '3d-ads': return 'orange';
      case '2d-animation': return 'amber';
      case '3d-animation': return 'orange';
      case 'product-ads': return 'orange';
      case 'cinematic-commercial': return 'violet';
      case 'nature-wildlife': return 'green';
      case 'promos': return 'cyan';
      case 'reels': return 'cyan';
      default: return 'orange';
    }
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`View project details and video for ${project.title}`}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer bg-studio-card border border-white/[0.08] hover:border-electric-indigo/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(99,102,241,0.3)] flex flex-col focus:outline-none focus:ring-2 focus:ring-electric-indigo/60"
    >
      {/* Media Container: Standardized 16:9 Thumbnail Dimensions for 2-Column Row Alignment */}
      <div className="relative w-full aspect-video overflow-hidden bg-black flex items-center justify-center">
        
        {/* Skeleton placeholder while image loads */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-white/[0.03] animate-pulse flex items-center justify-center">
            <Film className="w-8 h-8 text-white/10" />
          </div>
        )}

        {/* Ambient Studio Lighting Backdrop for Vertical 9:16 / 4:3 Media (CSS-driven - zero duplicate image downloads) */}
        {(isVertical || isFourThree) && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-electric-indigo/20 via-studio-surface/80 to-black z-[1]"
          />
        )}

        {/* Poster / Thumbnail Image */}
        {project.thumbnail && !imageError ? (
          <div className={`w-full h-full flex items-center justify-center relative z-[2] ${isVertical ? 'py-2' : ''}`}>
            <img
              src={optimizedThumbnail}
              alt={project.title}
              width={THUMBNAIL_DIMENSIONS.width}
              height={THUMBNAIL_DIMENSIONS.height}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const fallbackUrl = project.originalThumbnail || (project.thumbnail !== optimizedThumbnail ? project.thumbnail : '');
                if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
                  e.currentTarget.src = fallbackUrl;
                } else {
                  setImageError(true);
                }
              }}
              className={`transition-all duration-700 ease-out group-hover:scale-105 ${
                isVertical 
                  ? 'h-full aspect-[9/16] object-cover rounded-xl shadow-[0_0_40px_rgba(99,102,241,0.25),0_15px_30px_rgba(0,0,0,0.8)] border border-white/15' 
                  : 'w-full h-full object-cover'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-studio-card via-studio-surface to-black flex items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <Film className="w-8 h-8 text-electric-blue/40 mx-auto" />
              <span className="text-xs font-sans text-slate-500 block truncate">{project.title}</span>
            </div>
          </div>
        )}

        {/* Autoplaying Animated Video Preview: ONLY mounted on desktop mouse hover (saves 2.8+ MB on initial page load) */}
        {project.videoUrl && isHovered && (
          <div className={`absolute inset-0 w-full h-full flex items-center justify-center z-[3] pointer-events-none ${
            isVertical ? 'py-2' : ''
          }`}>
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={!imageError ? optimizedThumbnail : undefined}
              width={THUMBNAIL_DIMENSIONS.width}
              height={THUMBNAIL_DIMENSIONS.height}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className={`transition-opacity duration-500 ${
                isVertical 
                  ? 'h-full aspect-[9/16] object-cover rounded-xl shadow-2xl border border-white/15' 
                  : 'w-full h-full object-cover scale-[1.01]'
              } ${isPlaying || imageError ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        )}

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges (Category & Duration) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          <Badge variant={getBadgeVariant(project.category)}>
            {project.categoryLabel || project.category}
          </Badge>

          {project.duration && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium tracking-wide bg-black/70 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-electric-blue" />
              {project.duration}
            </span>
          )}
        </div>

        {/* Center Premium Play Button (Indicates click to open full player with sound) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:bg-electric-indigo group-hover:border-transparent group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}>
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Aspect Ratio Badge */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[9px] font-sans font-medium tracking-wide bg-black/70 backdrop-blur-sm text-slate-300 border border-white/10">
            {project.specType || 'Original Work'}
          </span>

          {isVertical ? (
            <span className="px-2 py-0.5 rounded text-[9px] font-sans font-semibold bg-cyan-950/80 backdrop-blur-sm text-cyan-300 border border-cyan-500/30">
              9:16 VERTICAL REEL
            </span>
          ) : isFourThree ? (
            <span className="px-2 py-0.5 rounded text-[9px] font-sans font-semibold bg-indigo-950/80 backdrop-blur-sm text-indigo-300 border border-indigo-500/30">
              4:3 CLASSIC
            </span>
          ) : null}
        </div>
      </div>

      {/* Project Information Box */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-studio-card to-studio-surface border-t border-white/[0.06]">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-semibold text-white group-hover:text-electric-blue transition-colors duration-300 leading-snug line-clamp-1 tracking-tight">
            {project.title}
          </h3>

          <p className="mt-2 text-xs text-studio-muted font-normal line-clamp-2 leading-relaxed">
            {project.description || project.tagline}
          </p>
        </div>

        {/* Bottom Details & Pipeline Tags */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(project.tools) && project.tools.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/5"
              >
                {tool}
              </span>
            ))}
          </div>

          <span className="text-xs font-sans font-medium text-white/60 group-hover:text-white flex items-center gap-1 transition-colors">
            Play with Sound <ExternalLink className="w-3 h-3 text-electric-blue" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
