import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Film, Image as ImageIcon, Play, CheckCircle2, 
  AlertCircle, Eye, Sparkles, Layers, Sliders, ArrowUpRight,
  FileCheck, ShieldAlert, Clock, RefreshCw, FileText, UploadCloud,
  Camera, Check
} from 'lucide-react';
import { projectCategories } from '../../data/projects';
import { uploadMedia, validateUploadFile, isSupabaseConfigured } from '../../lib/supabase';
import Badge from '../ui/Badge';

export default function AdminProjectForm({ 
  project, 
  isOpen, 
  onClose, 
  onSave 
}) {
  const isEditing = Boolean(project?.id);
  const isConfigured = isSupabaseConfigured();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('3d-animation');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [duration, setDuration] = useState('0:20');
  const [specType, setSpecType] = useState('Original Work');
  const [toolsStr, setToolsStr] = useState('Blender, Cinema 4D, After Effects, DaVinci Resolve');
  const [status, setStatus] = useState('published');
  
  // Media URLs
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  // File Upload State
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFileError, setVideoFileError] = useState('');
  const [thumbFileError, setThumbFileError] = useState('');
  
  // Progress & Status
  const [uploadStage, setUploadStage] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStats, setUploadStats] = useState({ loaded: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Preview Object URLs
  const [previewVideoSrc, setPreviewVideoSrc] = useState('');
  const [previewThumbSrc, setPreviewThumbSrc] = useState('');

  // Auto-Thumbnails & Frame Capture State
  const [autoThumbnails, setAutoThumbnails] = useState([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const liveVideoPreviewRef = useRef(null);

  // Object URL cleanup tracker
  const objectUrlsRef = useRef([]);

  const createSafeObjectUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
  };

  // Pre-fill form when editing or resetting
  useEffect(() => {
    cleanupObjectUrls();

    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || project.tagline || project.concept || '');
      setCategory(project.category || '3d-animation');
      setAspectRatio(project.aspectRatio || '16:9');
      setDisplayOrder(typeof project.displayOrder === 'number' ? project.displayOrder : 1);
      setDuration(project.duration || '0:20');
      setSpecType(project.specType || 'Original Work');
      setToolsStr(Array.isArray(project.tools) ? project.tools.join(', ') : (project.tools || ''));
      setStatus(project.status || 'published');
      setVideoUrl(project.videoUrl || '');
      setThumbnailUrl(project.thumbnail || '');
      setPreviewVideoSrc(project.videoUrl || '');
      setPreviewThumbSrc(project.thumbnail || '');
    } else {
      // Defaults for brand new project
      setTitle('');
      setDescription('');
      setCategory('3d-animation');
      setAspectRatio('16:9');
      setDisplayOrder(1);
      setDuration('0:20');
      setSpecType('Original Work');
      setToolsStr('Blender, Cinema 4D, After Effects, DaVinci Resolve');
      setStatus('published');
      setVideoUrl('');
      setThumbnailUrl('');
      setPreviewVideoSrc('');
      setPreviewThumbSrc('');
    }

    setVideoFile(null);
    setThumbnailFile(null);
    setAutoThumbnails([]);
    setIsExtractingFrames(false);
    setVideoFileError('');
    setThumbFileError('');
    setErrorMsg('');
    setUploadPercent(0);
    setUploadStage('');

    return () => {
      cleanupObjectUrls();
    };
  }, [project, isOpen]);

  // Extract multiple auto-thumbnail candidates from video file (10%, 35%, 60%, 85%)
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
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
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
            const autoFile = new File([frameBlob], `frame_${label.replace(':', '_')}_${Date.now()}.jpg`, { type: 'image/jpeg' });
            const frameUrl = createSafeObjectUrl(autoFile);
            extracted.push({ url: frameUrl, file: autoFile, label });
          }
        }

        URL.revokeObjectURL(tempUrl);
        setAutoThumbnails(extracted);
        setIsExtractingFrames(false);

        // If user has not chosen a custom thumbnail yet, default to the 1st extracted frame
        if (extracted.length > 0 && !thumbnailFile && !thumbnailUrl) {
          setThumbnailFile(extracted[0].file);
          setPreviewThumbSrc(extracted[0].url);
          setThumbFileError('');
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

  // Capture current frame from live preview video player
  const handleCaptureLiveFrame = () => {
    const video = liveVideoPreviewRef.current;
    if (!video || video.readyState < 2) {
      alert('Please play or pause the video to your desired frame before capturing.');
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
        const autoFile = new File([blob], `captured_${label.replace(':', '_')}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const frameUrl = createSafeObjectUrl(autoFile);

        setThumbnailFile(autoFile);
        setPreviewThumbSrc(frameUrl);
        setThumbFileError('');
        setAutoThumbnails((prev) => [{ url: frameUrl, file: autoFile, label: `Capture (${label})` }, ...prev]);
      }, 'image/jpeg', 0.92);
    } catch (e) {
      console.warn('Could not capture frame:', e);
    }
  };

  // Handle local video file pick with immediate validation
  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateUploadFile(file, 'video');
      setVideoFile(file);
      setVideoFileError('');
      const previewUrl = createSafeObjectUrl(file);
      setPreviewVideoSrc(previewUrl);
      generateAutoThumbnails(file);
    } catch (err) {
      setVideoFile(null);
      setVideoFileError(err.message);
    }
  };

  // Handle local thumbnail image pick with immediate validation
  const handleThumbnailFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateUploadFile(file, 'thumbnail');
      setThumbnailFile(file);
      setThumbFileError('');
      const previewUrl = createSafeObjectUrl(file);
      setPreviewThumbSrc(previewUrl);
    } catch (err) {
      setThumbnailFile(null);
      setThumbFileError(err.message);
    }
  };

  // Format bytes for user-friendly progress display
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  // Common Save Handler for Draft or Published
  const handleSaveWithStatus = async (targetStatus) => {
    setErrorMsg('');

    // Field Validations
    if (!title.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    if (!videoFile && !videoUrl.trim()) {
      setErrorMsg('Please select an MP4/WebM video file from your computer or enter a video URL.');
      return;
    }

    if (!thumbnailFile && !thumbnailUrl.trim()) {
      setErrorMsg('Please select a thumbnail image from your computer or enter a poster URL.');
      return;
    }

    setIsSubmitting(true);
    setUploadPercent(0);
    setUploadStage('Preparing project files...');

    try {
      let finalVideoUrl = videoUrl.trim();
      let finalThumbnailUrl = thumbnailUrl.trim();

      // 1. Upload Video if local file selected and Supabase configured
      if (videoFile) {
        if (!isConfigured) {
          setUploadStage('Staging video in local persistent database...');
          setUploadPercent(50);
          finalVideoUrl = previewVideoSrc;
        } else {
          setUploadStage(`Uploading video to cloud storage (${formatBytes(videoFile.size)})...`);
          finalVideoUrl = await uploadMedia(
            videoFile, 
            'video', 
            (percent, loaded, total) => {
              setUploadPercent(Math.round(percent * 0.7)); // video is 70% of total
              setUploadStats({ loaded, total });
            }
          );
        }
      }

      // 2. Upload Thumbnail if local image selected and Supabase configured
      if (thumbnailFile) {
        if (!isConfigured) {
          setUploadStage('Staging thumbnail in local database...');
          setUploadPercent(90);
          finalThumbnailUrl = previewThumbSrc;
        } else {
          setUploadStage(`Uploading thumbnail to cloud storage (${formatBytes(thumbnailFile.size)})...`);
          finalThumbnailUrl = await uploadMedia(
            thumbnailFile, 
            'thumbnail', 
            (percent, loaded, total) => {
              setUploadPercent(70 + Math.round(percent * 0.25)); // thumbnail is 25%
              setUploadStats({ loaded, total });
            }
          );
        }
      }

      setUploadStage('Saving project record...');
      setUploadPercent(98);

      // Find matching category label
      const catObj = projectCategories.find((c) => c.id === category);
      const categoryLabel = catObj ? catObj.label : 'Commercial';

      const toolsArray = toolsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const safeDisplayOrder = Math.max(1, parseInt(displayOrder, 10) || 1);

      const projectData = {
        title: title.trim(),
        description: description.trim(),
        tagline: description.trim(),
        concept: description.trim(),
        category,
        categoryLabel,
        aspectRatio,
        displayOrder: safeDisplayOrder,
        display_order: safeDisplayOrder,
        duration: duration.trim() || '0:20',
        specType: specType.trim() || 'Portfolio Concept',
        tools: toolsArray,
        status: targetStatus,
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbnailUrl,
        disclaimer: 'Portfolio showcase project.'
      };

      await onSave(projectData, project?.id, { videoFile, thumbFile: thumbnailFile });
      setUploadPercent(100);
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      setErrorMsg(err.message || 'Failed to save project. Please check your connection and storage settings.');
    } finally {
      setIsSubmitting(false);
      setUploadPercent(0);
      setUploadStage('');
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
          className="relative w-full max-w-5xl my-auto rounded-3xl bg-studio-surface border border-white/[0.09] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-studio-bg/80 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-electric-indigo/15 border border-electric-indigo/30 flex items-center justify-center text-electric-blue">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-heading font-bold text-white tracking-tight">
                  Upload My Stuff <span className="text-xs text-electric-blue font-mono font-normal">// {isEditing ? 'Edit Project' : 'Add New Video'}</span>
                </h2>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {status === 'published' ? '● Published' : '○ Draft'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-electric-indigo/10 text-electric-blue border border-electric-indigo/20">
                  {aspectRatio}
                </span>
              </div>
              <p className="text-xs text-studio-muted mt-0.5">
                Upload your video master, thumbnail, assign a display index order, and publish to your portfolio.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
              aria-label="Close project modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form & Live Preview Body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Overall Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="flex-1 leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Notice for unconfigured Supabase */}
              {!isConfigured && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>Demo Mode: Cloud keys not set in .env. Uploads will preview in local session.</span>
                </div>
              )}

              {/* 1. Project Title */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Project Title <span className="text-electric-blue">*</span></span>
                  <span className="text-[10px] text-slate-500">e.g. Meta Smart Glasses – Technology Ad</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Smart Glasses – 3D Commercial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo transition-colors"
                />
              </div>

              {/* 2. Category, Aspect Ratio & Manual Display Index */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">
                    Category <span className="text-electric-blue">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo cursor-pointer"
                  >
                    <option value="3d-animation">3D Animation</option>
                    <option value="product-ads">Product Ad</option>
                    <option value="cinematic-commercial">Commercial</option>
                    <option value="nature-wildlife">Nature & Wildlife</option>
                    <option value="promos">Promo Video</option>
                    <option value="reels">Vertical Reel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">
                    Aspect Ratio <span className="text-electric-blue">*</span>
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo cursor-pointer"
                  >
                    <option value="16:9">16:9 Cinema</option>
                    <option value="9:16">9:16 Reel</option>
                    <option value="4:3">4:3 Classic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Display Index <span className="text-electric-blue">*</span></span>
                    <span className="text-[10px] text-slate-500">Order</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    title="Lower number appears first in gallery (1 = Position #1)"
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                  />
                </div>
              </div>

              {/* Display Index Helper Note */}
              <div className="px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-electric-blue" />
                  <span>Manual Gallery Positioning:</span>
                </span>
                <span className="text-electric-blue">
                  Index #{displayOrder} ({displayOrder === 1 ? 'First card on homepage' : `Card position #${displayOrder}`})
                </span>
              </div>

              {/* 3. Project Description */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Project Description</span>
                  <span className="text-[10px] text-slate-500">Optional synopsis</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the commercial brief, creative direction, 3D simulation elements, lighting setup, or brand objectives (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-indigo resize-none leading-relaxed"
                />
              </div>

              {/* 4. Video File Upload & URL */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-electric-blue flex items-center gap-1.5">
                    <Film className="w-4 h-4" /> Video File Source (MP4 / WebM / MOV)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max 100 MB</span>
                </div>

                {videoFileError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{videoFileError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* File Pick Button */}
                  <label className="flex-1 cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-electric-indigo text-center transition-all group">
                    <Upload className="w-4 h-4 mx-auto text-slate-400 group-hover:text-electric-blue mb-1 transition-colors" />
                    <span className="text-[11px] font-mono text-slate-200 block truncate">
                      {videoFile ? videoFile.name : 'Choose Video File from Computer'}
                    </span>
                    {videoFile && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        ✓ {formatBytes(videoFile.size)} ready
                      </span>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Or Direct URL Input */}
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Or paste direct video CDN / Cloud link"
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

              {/* 5. Thumbnail Image Upload & URL */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4" /> Thumbnail Image Poster (JPG / PNG / WebP)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Max 15 MB</span>
                </div>

                {thumbFileError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{thumbFileError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* File Pick Button */}
                  <label className="flex-1 cursor-pointer p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-cyan-400 text-center transition-all group">
                    <Upload className="w-4 h-4 mx-auto text-slate-400 group-hover:text-cyan-300 mb-1 transition-colors" />
                    <span className="text-[11px] font-mono text-slate-200 block truncate">
                      {thumbnailFile ? thumbnailFile.name : 'Choose Poster Image from Computer'}
                    </span>
                    {thumbnailFile && (
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        ✓ {formatBytes(thumbnailFile.size)} ready
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleThumbnailFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Or Direct URL Input */}
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
                    onClick={() => generateAutoThumbnails(videoFile)}
                    className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-cyan-500/20 text-cyan-300 hover:text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>⚡ Auto-Generate 4 Thumbnail Frames</span>
                  </button>
                )}
              </div>

              {/* 6. Technical Spec Details (Duration & Tools) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Duration (MM:SS)</label>
                  <input
                    type="text"
                    placeholder="0:24"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1.5">Spec / Project Badge</label>
                  <input
                    type="text"
                    placeholder="Portfolio Concept Commercial"
                    value={specType}
                    onChange={(e) => setSpecType(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">Software Tools (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Blender 4.2, Cinema 4D, Octane Render, After Effects"
                  value={toolsStr}
                  onChange={(e) => setToolsStr(e.target.value)}
                  className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                />
              </div>

              {/* Upload Progress Bar when uploading */}
              {isSubmitting && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-electric-blue flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {uploadStage}
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

              {/* Action Buttons: Cancel, Save Draft, Publish */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  {/* Save Draft Button */}
                  <button
                    type="button"
                    onClick={() => handleSaveWithStatus('draft')}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 hover:text-amber-200 border border-amber-500/20 text-xs font-mono font-medium transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Save Draft</span>
                  </button>

                  {/* Publish Button */}
                  <button
                    type="button"
                    onClick={() => handleSaveWithStatus('published')}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue text-white text-xs font-mono font-semibold shadow-electric-glow hover:opacity-95 transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isEditing && status === 'published' ? 'Update & Keep Published' : 'Publish to Portfolio'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Live Interactive Aspect-Ratio Preview */}
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

                {/* Aspect-Ratio Canvas */}
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
                        <span className="text-xs font-mono">No video or poster selected</span>
                        <span className="text-[10px] font-mono text-slate-600 mt-1">Upload files on the left to test live player</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Card Simulation */}
                <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-electric-indigo uppercase tracking-wider">
                      {category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {duration || '0:20'}
                    </span>
                  </div>
                  <h4 className="text-sm font-heading font-semibold text-white line-clamp-1 tracking-tight">
                    {title || 'Untitled Commercial Project'}
                  </h4>
                  <p className="text-[11px] text-studio-muted line-clamp-2 leading-relaxed">
                    {description || 'Project synopsis and creative pitch description will appear here on your portfolio cards.'}
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
                        Click any auto-extracted frame below to instantly set it as your video's thumbnail poster:
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
                                setThumbFileError('');
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

                      {/* Button to capture current video player frame */}
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
                <div>✓ Live preview tests video codec compatibility in browser.</div>
                <div>✓ Supports MP4, WebM, and MOV up to 100MB.</div>
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
