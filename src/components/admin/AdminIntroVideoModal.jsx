import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Film, Image as ImageIcon, Sparkles, 
  RefreshCw, AlertCircle, CheckCircle2, Play, Trash2, Eye,
  Camera, Check
} from 'lucide-react';
import { validateUploadFile, isSupabaseConfigured } from '../../lib/supabase';
import { convertImageToWebP, extractVideoThumbnailAsWebP } from '../../utils/imageOptimization';

export default function AdminIntroVideoModal({
  isOpen,
  currentIntro,
  onClose,
  onSave,
  onDelete
}) {
  const isConfigured = isSupabaseConfigured();

  const [title, setTitle] = useState('A GLIMPSE INTO MY CREATIVE WORLD.');
  const [description, setDescription] = useState('Explore my creativity through cinematic visuals, 3D animations and product advertisements.');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoError, setVideoError] = useState('');
  const [thumbError, setThumbError] = useState('');

  const [previewVideoSrc, setPreviewVideoSrc] = useState('');
  const [previewThumbSrc, setPreviewThumbSrc] = useState('');

  // Auto-Thumbnails & Live Frame Capture State
  const [autoThumbnails, setAutoThumbnails] = useState([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const liveVideoPreviewRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStats, setUploadStats] = useState({ loaded: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  const objectUrlsRef = useRef([]);

  const createSafeObjectUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
  };

  useEffect(() => {
    if (isOpen) {
      if (currentIntro) {
        setTitle(currentIntro.title || 'A GLIMPSE INTO MY CREATIVE WORLD.');
        setDescription(currentIntro.description || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.');
        setAspectRatio(currentIntro.aspectRatio || '16:9');
        setVideoUrl(currentIntro.videoUrl || '');
        setThumbnailUrl(currentIntro.thumbnail || '');
        setPreviewVideoSrc(currentIntro.videoUrl || '');
        setPreviewThumbSrc(currentIntro.thumbnail || '');
      } else {
        setTitle('A GLIMPSE INTO MY CREATIVE WORLD.');
        setDescription('Explore my creativity through cinematic visuals, 3D animations and product advertisements.');
        setAspectRatio('16:9');
        setVideoUrl('');
        setThumbnailUrl('');
        setPreviewVideoSrc('');
        setPreviewThumbSrc('');
      }
      setVideoFile(null);
      setThumbnailFile(null);
      setAutoThumbnails([]);
      setIsExtractingFrames(false);
      setVideoError('');
      setThumbError('');
      setErrorMsg('');
      setUploadPercent(0);
    }
  }, [isOpen, currentIntro]);

  // Extract multiple auto-thumbnail frame candidates (10%, 35%, 60%, 85%)
  const generateAutoThumbnails = (file) => {
    if (!file) return;
    setIsExtractingFrames(true);

    try {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const tempUrl = URL.createObjectURL(file);
      video.src = tempUrl;

      video.onloadedmetadata = async () => {
        const dur = video.duration || 10;
        const fractions = [0.1, 0.35, 0.6, 0.85];
        const timestamps = fractions.map(f => Math.max(0.1, Math.min(dur - 0.1, dur * f)));
        const extracted = [];

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          const frameBlob = await new Promise((resolve) => {
            const onSeek = () => {
              video.removeEventListener('seeked', onSeek);
              try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 1280;
                canvas.height = video.videoHeight || 720;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85);
              } catch {
                resolve(null);
              }
            };
            video.addEventListener('seeked', onSeek);
            video.currentTime = t;
          });

          if (frameBlob) {
            const mins = Math.floor(t / 60);
            const secs = Math.floor(t % 60);
            const label = `${mins}:${secs.toString().padStart(2, '0')}`;
            const autoFile = new File([frameBlob], `showreel_frame_${label.replace(':', '_')}_${Date.now()}.webp`, { type: 'image/webp' });
            const frameUrl = createSafeObjectUrl(autoFile);
            extracted.push({ url: frameUrl, file: autoFile, label });
          }
        }

        URL.revokeObjectURL(tempUrl);
        setAutoThumbnails(extracted);
        setIsExtractingFrames(false);

        if (extracted.length > 0 && !thumbnailFile && !thumbnailUrl) {
          setThumbnailFile(extracted[0].file);
          setPreviewThumbSrc(extracted[0].url);
          setThumbError('');
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        setIsExtractingFrames(false);
      };
    } catch {
      setIsExtractingFrames(false);
    }
  };

  // Capture current live frame from video player
  const handleCaptureLiveFrame = () => {
    const video = liveVideoPreviewRef.current;
    if (!video || video.readyState < 2) {
      alert('Please play or seek the video to your desired frame before capturing.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const curTime = Math.floor(video.currentTime || 0);
        const mins = Math.floor(curTime / 60);
        const secs = Math.floor(curTime % 60);
        const label = `${mins}:${secs.toString().padStart(2, '0')}`;
        const autoFile = new File([blob], `captured_showreel_${label.replace(':', '_')}_${Date.now()}.webp`, { type: 'image/webp' });
        const frameUrl = createSafeObjectUrl(autoFile);

        setThumbnailFile(autoFile);
        setPreviewThumbSrc(frameUrl);
        setThumbError('');
        setAutoThumbnails((prev) => [{ url: frameUrl, file: autoFile, label: `Capture (${label})` }, ...prev]);
      }, 'image/webp', 0.85);
    } catch (e) {
      console.warn('Could not capture frame:', e);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateUploadFile(file, 'video');
      setVideoFile(file);
      setVideoError('');
      const previewUrl = createSafeObjectUrl(file);
      setPreviewVideoSrc(previewUrl);
      generateAutoThumbnails(file);
    } catch (err) {
      setVideoFile(null);
      setVideoError(err.message);
    }
  };

  const handleThumbChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateUploadFile(file, 'thumbnail');
      // Automatic client-side WebP optimization
      const optimizedFile = await convertImageToWebP(file, { quality: 0.85, maxWidth: 1920, maxHeight: 1080 });
      setThumbnailFile(optimizedFile);
      setThumbError('');
      const previewUrl = createSafeObjectUrl(optimizedFile);
      setPreviewThumbSrc(previewUrl);
    } catch (err) {
      setThumbnailFile(file);
      setThumbError('');
      const previewUrl = createSafeObjectUrl(file);
      setPreviewThumbSrc(previewUrl);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!videoFile && !videoUrl.trim()) {
      setErrorMsg('Please select an MP4 or WebM video file from your computer or enter a video URL.');
      return;
    }

    // Auto-generate high-res WebP thumbnail from video if user has not chosen an image
    let thumbToProcess = thumbnailFile;
    if (!thumbToProcess && !thumbnailUrl.trim() && videoFile) {
      try {
        const autoThumb = await extractVideoThumbnailAsWebP(videoFile, 0.15);
        if (autoThumb) {
          thumbToProcess = autoThumb;
          setThumbnailFile(autoThumb);
        }
      } catch (e) {
        console.warn('Auto video poster extraction skipped:', e);
      }
    }

    setIsSubmitting(true);
    setUploadPercent(0);

    try {
      // Ensure thumbnail is converted to WebP
      let finalThumbFile = thumbToProcess;
      if (finalThumbFile) {
        finalThumbFile = await convertImageToWebP(finalThumbFile, { quality: 0.85, maxWidth: 1920, maxHeight: 1080 });
      }

      const metadata = {
        title: title.trim() || 'A GLIMPSE INTO MY CREATIVE WORLD.',
        description: description.trim() || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.',
        aspectRatio,
        duration: '0:30',
        videoUrl: videoUrl.trim(),
        thumbnail: thumbnailUrl.trim()
      };

      await onSave(
        metadata, 
        { videoFile, thumbFile: finalThumbFile }, 
        (percent, loaded, total) => {
          setUploadPercent(percent);
          setUploadStats({ loaded, total });
        }
      );

      onClose();
    } catch (err) {
      console.error('Failed to save intro video:', err);
      setErrorMsg(err.message || 'Failed to upload intro video.');
    } finally {
      setIsSubmitting(false);
      setUploadPercent(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl my-auto rounded-3xl bg-studio-surface border border-white/[0.09] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-studio-bg/80 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-electric-blue" />
                <h2 className="text-lg font-heading font-bold text-white tracking-tight">
                  Manage Intro Video & Creator Showreel
                </h2>
              </div>
              <p className="text-xs text-studio-muted mt-0.5 font-normal">
                Upload or replace the large featured showreel directly below your homepage hero section.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form & Live Preview Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: File Pickers & Settings */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-sans flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="flex-1 leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* 1. Showreel Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Showreel Title</span>
                    <span className="text-[10px] text-slate-500">Header for homepage intro video</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. A GLIMPSE INTO MY CREATIVE WORLD."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Showreel Description</span>
                    <span className="text-[10px] text-slate-500">Subtitle synopsis</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Explore my creativity through cinematic visuals, 3D animations and product advertisements."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-indigo resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* 2. Video File Source */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-electric-blue flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> Video File Source (MP4 / WebM / MOV)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max 250 MB</span>
                </div>

                {videoError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{videoError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-electric-indigo text-center transition-all group">
                    <Upload className="w-4 h-4 mx-auto text-slate-400 group-hover:text-electric-blue mb-1 transition-colors" />
                    <span className="text-[11px] font-mono text-slate-200 block truncate">
                      {videoFile ? videoFile.name : 'Choose Video File from Computer'}
                    </span>
                    {videoFile && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        ✓ {formatBytes(videoFile.size)} selected
                      </span>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Or paste direct cloud video link"
                      value={videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setPreviewVideoSrc(e.target.value);
                      }}
                      className="w-full h-full bg-studio-card border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Thumbnail Poster Source */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Custom Poster Thumbnail (JPG / PNG / WebP)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max 25 MB</span>
                </div>

                {thumbError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{thumbError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-cyan-400 text-center transition-all group">
                    <Upload className="w-4 h-4 mx-auto text-slate-400 group-hover:text-cyan-300 mb-1 transition-colors" />
                    <span className="text-[11px] font-mono text-slate-200 block truncate">
                      {thumbnailFile ? thumbnailFile.name : 'Choose Poster Image from Computer'}
                    </span>
                    {thumbnailFile && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        ✓ {formatBytes(thumbnailFile.size)} selected
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleThumbChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Or paste poster image URL"
                      value={thumbnailUrl}
                      onChange={(e) => {
                        setThumbnailUrl(e.target.value);
                        setPreviewThumbSrc(e.target.value);
                      }}
                      className="w-full h-full bg-studio-card border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {videoFile && (
                  <button
                    type="button"
                    onClick={() => generateThumbnailFromVideo(videoFile)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>⚡ Auto-Generate Thumbnail Frame from Video</span>
                  </button>
                )}
              </div>

              {/* 3. Aspect Ratio Selection */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  Video Aspect Ratio <span className="text-electric-blue">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '16:9', label: '16:9 Widescreen (Cinema)' },
                    { id: '9:16', label: '9:16 Vertical Reel' },
                    { id: '4:3', label: '4:3 Classic Frame' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAspectRatio(opt.id)}
                      className={`p-3 rounded-xl border text-xs font-mono text-center transition-all cursor-pointer ${
                        aspectRatio === opt.id
                          ? 'bg-electric-indigo/20 border-electric-blue text-white font-semibold shadow-electric-glow'
                          : 'bg-studio-card border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold">{opt.id}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Progress Bar */}
              {isSubmitting && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-electric-blue flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Uploading intro showreel to storage...
                    </span>
                    <span className="text-white font-bold">{uploadPercent}%</span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-electric-blue via-electric-indigo to-emerald-400 rounded-full transition-all duration-200"
                      style={{ width: `${Math.max(5, uploadPercent)}%` }}
                    />
                  </div>

                  {uploadStats.total > 0 && (
                    <div className="text-[10px] font-mono text-slate-400 text-right">
                      {formatBytes(uploadStats.loaded)} / {formatBytes(uploadStats.total)}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                {currentIntro ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to remove the intro showreel video?')) {
                        await onDelete();
                        onClose();
                      }
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Showreel</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue text-white text-xs font-mono font-semibold shadow-electric-glow hover:opacity-95 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{currentIntro ? 'Replace & Save Showreel' : 'Upload & Publish Showreel'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live Aspect Ratio Preview */}
            <div className="lg:col-span-5 bg-studio-card border border-white/[0.08] p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                  <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-electric-blue" />
                    <span>Real-time Video Preview</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                    {aspectRatio}
                  </span>
                </div>

                <div className="flex justify-center bg-black/60 rounded-xl p-3 border border-white/5">
                  <div className={`relative rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl transition-all duration-300 ${
                    aspectRatio === '9:16'
                      ? 'w-[200px] aspect-[9/16]'
                      : aspectRatio === '4:3'
                      ? 'w-full aspect-[4/3]'
                      : 'w-full aspect-video'
                  }`}>
                    {previewVideoSrc ? (
                      <video
                        ref={liveVideoPreviewRef}
                        key={previewVideoSrc}
                        src={previewVideoSrc}
                        poster={previewThumbSrc}
                        controls
                        playsInline
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : previewThumbSrc ? (
                      <img
                        src={previewThumbSrc}
                        alt="Poster Preview"
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                        <Film className="w-8 h-8 mb-2 opacity-30" />
                        <span className="text-xs font-mono">No video selected</span>
                        <span className="text-[10px] font-mono text-slate-600 mt-1">Select an MP4 or WebM video file on the left</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-electric-indigo uppercase tracking-wider">
                    Homepage Intro Showreel
                  </span>
                  <h4 className="text-sm font-heading font-semibold text-white tracking-tight">
                    {title || 'A GLIMPSE INTO MY CREATIVE WORLD.'}
                  </h4>
                  <p className="text-[11px] text-studio-muted leading-relaxed">
                    {description || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.'}
                  </p>
                </div>

                {/* Dedicated Auto-Thumbnails & Poster Frame Preview Section */}
                <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Auto-Generated Thumbnails</span>
                    </span>
                    {isExtractingFrames ? (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                        <span>Extracting frames...</span>
                      </span>
                    ) : autoThumbnails.length > 0 ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{autoThumbnails.length} Frames Generated</span>
                      </span>
                    ) : null}
                  </div>

                  {autoThumbnails.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-[11px] font-sans text-slate-400 leading-tight">
                        Click any auto-extracted frame below to instantly set it as your showreel thumbnail poster:
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {autoThumbnails.slice(0, 4).map((thumb, idx) => {
                          const isSelected = previewThumbSrc === thumb.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setThumbnailFile(thumb.file);
                                setPreviewThumbSrc(thumb.url);
                                setThumbError('');
                              }}
                              className={`group relative aspect-video rounded-xl overflow-hidden border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-[1.03] shadow-lg' 
                                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                              }`}
                              title={`Use frame at ${thumb.label} as thumbnail`}
                            >
                              <img src={thumb.url} alt={`Frame ${thumb.label}`} className="w-full h-full object-cover" />
                              <span className="absolute bottom-1 right-1 px-1 rounded text-[8px] font-mono bg-black/85 text-white">
                                {thumb.label}
                              </span>
                              {isSelected && (
                                <div className="absolute top-1 left-1 bg-cyan-400 text-black rounded-full p-0.5 shadow-md">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {previewVideoSrc && (
                        <button
                          type="button"
                          onClick={handleCaptureLiveFrame}
                          className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/25 text-cyan-300 hover:text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Capture Current Frame from Video Player</span>
                        </button>
                      )}
                    </div>
                  ) : previewThumbSrc ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        <img src={previewThumbSrc} alt="Active Poster" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Thumbnail Selected
                        </span>
                        <span className="text-[11px] text-slate-300 font-sans truncate block mt-0.5">
                          {thumbnailFile ? thumbnailFile.name : 'Custom Poster Image'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-black/30 border border-dashed border-white/10 text-center space-y-1.5">
                      <Sparkles className="w-5 h-5 text-slate-500 mx-auto" />
                      <span className="text-xs font-mono text-slate-300 block">Auto-Thumbnails Preview Section</span>
                      <p className="text-[11px] text-studio-muted font-sans max-w-xs mx-auto leading-relaxed">
                        Select a video file to automatically generate 4 high-res candidate frames here so you can pick your ideal thumbnail poster.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500 space-y-1">
                <div>✓ Displays in full cinematic frame directly below hero.</div>
                <div>✓ Autoplays muted on scroll with manual sound toggle.</div>
              </div>
            </div>

          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

