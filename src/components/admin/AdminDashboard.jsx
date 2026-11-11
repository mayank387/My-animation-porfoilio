import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, ExternalLink, LogOut, 
  ArrowLeft, Film, Database, CheckCircle2, AlertTriangle, 
  Eye, RefreshCw, Sparkles, BookOpen, Clock, X, Play,
  SlidersHorizontal, Check, ShieldCheck, HelpCircle, 
  FileText, Globe, Layers, UploadCloud
} from 'lucide-react';
import { 
  getProjects, createProject, updateProject, deleteProject, 
  getIntroVideo, saveIntroVideo, deleteIntroVideo,
  uploadMedia,
  updateProjectDisplayOrder, signOutAdmin, isSupabaseConfigured,
  resolvePlayableUrl, supabase
} from '../../lib/supabase';
import { convertImageToWebP } from '../../utils/imageOptimization';
import { projectCategories } from '../../data/projects';
import AdminProjectForm from './AdminProjectForm';
import AdminIntroVideoModal from './AdminIntroVideoModal';
import VideoModal from '../ui/VideoModal';
import Badge from '../ui/Badge';

export default function AdminDashboard({ user, onBackToPortfolio, onLogout, onProjectsUpdated }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'published' | 'draft'
  
  // Intro showreel state
  const [introVideo, setIntroVideo] = useState(null);
  const [introModalOpen, setIntroModalOpen] = useState(false);

  // Modals & previews
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [previewProject, setPreviewProject] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isConfigured = isSupabaseConfigured();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Load projects including drafts
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects(true); // true = include drafts
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load creator showreel intro video
  const loadIntroVideo = async () => {
    try {
      const data = await getIntroVideo();
      setIntroVideo(data);
    } catch (err) {
      console.warn('Failed to load intro showreel:', err);
    }
  };

  useEffect(() => {
    loadProjects();
    loadIntroVideo();
  }, []);

  // Auto-upgrade legacy public URLs in Supabase to resilient 10-year signed URLs
  useEffect(() => {
    if (!supabase || !user) return;

    const repairCloudUrls = async () => {
      try {
        const { data: rawRows, error } = await supabase.from('projects').select('id, video_url, thumbnail_url');
        if (error || !Array.isArray(rawRows)) return;

        let repairedAny = false;
        for (const row of rawRows) {
          let needUpdate = false;
          let newVideoUrl = row.video_url;
          let newThumbUrl = row.thumbnail_url;

          if (row.video_url && row.video_url.includes('/storage/v1/object/public/')) {
            const resolved = await resolvePlayableUrl(row.video_url);
            if (resolved && resolved !== row.video_url) {
              newVideoUrl = resolved;
              needUpdate = true;
            }
          }

          if (row.thumbnail_url && row.thumbnail_url.includes('/storage/v1/object/public/')) {
            const resolvedThumb = await resolvePlayableUrl(row.thumbnail_url);
            if (resolvedThumb && resolvedThumb !== row.thumbnail_url) {
              newThumbUrl = resolvedThumb;
              needUpdate = true;
            }
          }

          if (needUpdate) {
            await supabase
              .from('projects')
              .update({ video_url: newVideoUrl, thumbnail_url: newThumbUrl })
              .eq('id', row.id);
            repairedAny = true;
          }
        }

        if (repairedAny) {
          console.log('Successfully upgraded legacy media URLs to resilient signed cloud URLs.');
          await loadProjects();
          await loadIntroVideo();
          if (typeof onProjectsUpdated === 'function') onProjectsUpdated();
        }
      } catch (err) {
        console.warn('Auto-repair notice:', err);
      }
    };

    repairCloudUrls();
  }, [user]);

  // Filter projects by search, category, and status (published vs draft)
  const filteredProjects = projects.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'all' 
        ? true 
        : selectedStatus === 'published' 
          ? (p.status === 'published' || !p.status) 
          : p.status === 'draft';

    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tools?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Sort projects strictly by displayOrder ascending, with creation date as tie-breaker
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Calculate statistics
  const publishedCount = projects.filter(p => p.status === 'published' || !p.status).length;
  const draftCount = projects.filter(p => p.status === 'draft').length;
  const count16by9 = projects.filter(p => p.aspectRatio === '16:9').length;
  const count9by16 = projects.filter(p => p.aspectRatio === '9:16').length;
  const count4by3 = projects.filter(p => p.aspectRatio === '4:3').length;

  // Handlers
  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleToggleStatus = async (project) => {
    const newStatus = project.status === 'draft' ? 'published' : 'draft';
    try {
      await updateProject(project.id, { ...project, status: newStatus });
      showToast(`Project marked as ${newStatus === 'published' ? 'Published' : 'Draft'}`);
      await loadProjects();
      if (typeof onProjectsUpdated === 'function') {
        onProjectsUpdated();
      }
    } catch (err) {
      alert(`Could not toggle status: ${err.message}`);
    }
  };

  // Instant display index re-ordering (e.g. change Video C from 3 to 1)
  const handleQuickUpdateOrder = async (project, newOrder) => {
    const safe = Math.max(1, parseInt(newOrder, 10) || 1);
    if (safe === project.displayOrder) return;
    try {
      await updateProjectDisplayOrder(project.id, safe);
      showToast(`"${project.title}" order updated to Index #${safe}`);
      await loadProjects();
      if (typeof onProjectsUpdated === 'function') {
        onProjectsUpdated();
      }
    } catch (err) {
      alert(`Could not update display index: ${err.message}`);
    }
  };

  const handleSaveProject = async (projectData, id, rawFiles) => {
    try {
      let finalProjectData = { ...projectData };

      // Automatic WebP Thumbnail Optimization for all project uploads
      if (rawFiles?.thumbFile && (!finalProjectData.thumbnail || finalProjectData.thumbnail.startsWith('blob:') || finalProjectData.thumbnail.startsWith('data:'))) {
        try {
          const webpThumb = await convertImageToWebP(rawFiles.thumbFile, { quality: 0.85, maxWidth: 1920, maxHeight: 1080 });
          const uploadedUrl = await uploadMedia(webpThumb, 'thumbnail');
          finalProjectData.thumbnail = uploadedUrl;
          finalProjectData.thumbnail_url = uploadedUrl;
        } catch (thumbErr) {
          console.warn('WebP upload fallback in AdminDashboard:', thumbErr);
        }
      }

      if (id) {
        await updateProject(id, finalProjectData, rawFiles);
        showToast('Project updated successfully.');
      } else {
        await createProject(finalProjectData, rawFiles);
        showToast(finalProjectData.status === 'published' ? 'Project published to live gallery!' : 'Project saved to drafts.');
      }
      await loadProjects();
      if (typeof onProjectsUpdated === 'function') {
        onProjectsUpdated();
      }
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleSaveIntro = async (metadata, rawFiles, onProgress) => {
    let finalMetadata = { ...metadata };
    if (rawFiles?.thumbFile && (!finalMetadata.thumbnail || finalMetadata.thumbnail.startsWith('blob:') || finalMetadata.thumbnail.startsWith('data:'))) {
      try {
        const webpThumb = await convertImageToWebP(rawFiles.thumbFile, { quality: 0.85, maxWidth: 1920, maxHeight: 1080 });
        const uploadedUrl = await uploadMedia(webpThumb, 'thumbnail', onProgress);
        finalMetadata.thumbnail = uploadedUrl;
        finalMetadata.thumbnail_url = uploadedUrl;
      } catch (thumbErr) {
        console.warn('Intro WebP upload fallback in AdminDashboard:', thumbErr);
      }
    }
    const saved = await saveIntroVideo(finalMetadata, rawFiles, onProgress);
    setIntroVideo(saved);
    showToast('Intro showreel updated and live on homepage!');
    if (typeof onProjectsUpdated === 'function') {
      onProjectsUpdated();
    }
  };

  const handleDeleteIntro = async () => {
    await deleteIntroVideo();
    setIntroVideo(null);
    showToast('Intro showreel removed.');
    if (typeof onProjectsUpdated === 'function') {
      onProjectsUpdated();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id, {
        videoUrl: deletingProject.videoUrl,
        thumbnail: deletingProject.thumbnail
      });
      showToast('Project removed.');
      setDeletingProject(null);
      await loadProjects();
      if (typeof onProjectsUpdated === 'function') {
        onProjectsUpdated();
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-studio-bg text-slate-100 flex flex-col">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-studio-card border border-electric-indigo/40 text-white text-xs font-mono shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-studio-surface/90 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand & Return to Public Portfolio */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToPortfolio}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Website</span>
            </button>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wider">
                MAYANK <span className="text-electric-indigo font-sans text-xs font-normal">// ADMIN DASHBOARD</span>
              </span>
            </div>
          </div>

          {/* Right: Cloud Status, Setup Docs & Sign Out */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDocsModal(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-electric-blue" />
              <span>Setup Guide</span>
            </button>

            {/* Cloud Connection Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-mono">
              <Database className="w-3.5 h-3.5 text-electric-blue" />
              {isConfigured ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Demo Mode
                </span>
              )}
            </div>

            {/* Admin User Pill */}
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 max-w-[150px] truncate">
              {user?.email || 'admin@mayank.studio'}
            </span>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-8">
        
        {/* Supabase Connection Alert Banner */}
        {!isConfigured && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-heading font-semibold text-amber-200">
                  Supabase Cloud Credentials Not Configured
                </h4>
                <p className="text-xs text-amber-300/80 font-normal mt-0.5 leading-relaxed">
                  Currently running in local persistent storage mode. To stream uploaded videos from cloud CDN, connect your Supabase project in <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-200">.env</code>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDocsModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors flex-shrink-0 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Setup Supabase (SQL & Guide)</span>
            </button>
          </div>
        )}

        {/* Welcome & Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total & Published Projects */}
          <div className="p-5 rounded-2xl bg-studio-surface border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Total Video Works</span>
              <Film className="w-4 h-4 text-electric-blue" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                {projects.length}
              </span>
              <span className="text-xs font-sans text-slate-400">projects</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono pt-1">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {publishedCount} Published
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {draftCount} Drafts
              </span>
            </div>
          </div>

          {/* Card 2: 16:9 Cinema Widescreen */}
          <div className="p-5 rounded-2xl bg-studio-surface border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>16:9 Widescreen Films</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">Cinema</span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              {count16by9}
            </div>
            <span className="text-[11px] font-mono text-slate-500 block">
              Commercials & Trailers
            </span>
          </div>

          {/* Card 3: 9:16 Vertical Reels */}
          <div className="p-5 rounded-2xl bg-studio-surface border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>9:16 Vertical Reels</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300">Mobile</span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              {count9by16}
            </div>
            <span className="text-[11px] font-mono text-cyan-400 block">
              Instagram & YouTube Shorts
            </span>
          </div>

          {/* Card 4: Action Button Card - Upload My Stuff */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-electric-indigo/25 via-studio-surface to-studio-surface border border-electric-indigo/40 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 mb-1">
                <UploadCloud className="w-3.5 h-3.5 text-electric-blue" />
                <span>Upload My Stuff</span>
              </span>
              <h4 className="text-sm font-semibold text-white">Add & Publish Videos</h4>
            </div>
            <button
              onClick={handleOpenAdd}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue hover:opacity-95 text-white text-xs font-mono font-semibold shadow-electric-glow transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload My Stuff</span>
            </button>
          </div>

        </div>

        {/* Dedicated "Manage Intro Video / Creator Showreel" Section */}
        <div className="p-6 rounded-3xl bg-studio-surface border border-white/[0.08] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-40 bg-electric-indigo/10 blur-[90px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-electric-indigo/10 border border-electric-indigo/25 flex items-center justify-center text-electric-blue flex-shrink-0">
                <Film className="w-6 h-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                    Homepage Intro Video / Showreel
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    introVideo?.videoUrl 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {introVideo?.videoUrl ? '● Showreel Live' : '○ Showreel Coming Soon'}
                  </span>
                  {introVideo?.aspectRatio && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      {introVideo.aspectRatio}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-studio-muted max-w-2xl font-normal leading-relaxed">
                  Controls the large cinematic video section directly below the hero section on your homepage ("A GLIMPSE INTO MY CREATIVE WORLD").
                  {introVideo?.videoUrl 
                    ? ' Your original video is published with muted scroll autoplay, loop, and visitor sound controls.'
                    : ' No video uploaded yet. Visitors currently see the clean "My Showreel Coming Soon" placeholder.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {introVideo?.videoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewProject(introVideo)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Preview showreel in theater modal"
                >
                  <Eye className="w-3.5 h-3.5 text-electric-blue" />
                  <span>Preview</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIntroModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue text-white text-xs font-mono font-semibold shadow-electric-glow hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{introVideo?.videoUrl ? 'Manage / Replace Showreel' : 'Upload Intro Showreel'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-studio-surface border border-white/[0.08] space-y-3">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, description, or tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-studio-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
              />
            </div>

            {/* Status Tabs: All, Published, Drafts */}
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Status ({projects.length})
              </button>
              <button
                onClick={() => setSelectedStatus('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Published ({publishedCount})</span>
              </button>
              <button
                onClick={() => setSelectedStatus('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'draft'
                    ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Drafts ({draftCount})</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1 flex-shrink-0">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-electric-indigo text-white font-medium'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {projectCategories.filter(c => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-electric-indigo text-white font-medium'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Projects List / Table */}
        <div className="rounded-3xl bg-studio-card border border-white/[0.08] overflow-hidden shadow-xl">
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-electric-blue animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading portfolio projects from database...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Film className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-white">No projects found</p>
              <p className="text-xs font-mono text-studio-muted">
                {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search query, category, or status filter.'
                  : 'No projects added yet. Click "Add New Project" to get started.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-indigo text-white text-xs font-mono hover:bg-electric-indigo/90 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Project</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {sortedProjects.map((p) => {
                const isVertical = p.aspectRatio === '9:16';
                const isDraft = p.status === 'draft';

                return (
                  <div
                    key={p.id}
                    className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-white/[0.015] transition-colors"
                  >
                    {/* Left: Thumbnail & Project Info */}
                    <div className="flex items-start gap-4">
                      {/* Video Poster Thumbnail */}
                      <div 
                        onClick={() => setPreviewProject(p)}
                        className={`relative rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10 group cursor-pointer ${
                          isVertical ? 'w-16 h-24' : 'w-28 sm:w-32 aspect-video'
                        }`}
                        title="Click to preview video in theater modal"
                      >
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <Film className="w-6 h-6 text-electric-blue/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 rounded text-[9px] font-mono bg-black/80 text-white">
                          {p.duration || '0:20'}
                        </span>
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Manual Display Index Order Pill + Quick Stepper */}
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-electric-indigo/15 border border-electric-indigo/30 text-electric-blue text-[10px] font-mono">
                            <span className="text-slate-400">Index:</span>
                            <span className="font-bold text-white">#{p.displayOrder ?? 1}</span>
                            <div className="flex items-center ml-1 border-l border-white/10 pl-1.5 gap-1">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                defaultValue={p.displayOrder ?? 1}
                                key={`${p.id}-${p.displayOrder}`}
                                onBlur={(e) => handleQuickUpdateOrder(p, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                  }
                                }}
                                title="Change index to reorder in gallery. Press Enter or click away to save."
                                className="w-10 text-center bg-black/60 border border-white/20 rounded px-1 py-0.2 text-[10px] font-mono text-cyan-300 font-bold focus:outline-none focus:border-electric-blue"
                              />
                            </div>
                          </div>

                          {/* Status Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            title={`Click to switch to ${isDraft ? 'Published' : 'Draft'}`}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                              isDraft 
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isDraft ? '○ Draft' : '● Published'}
                          </button>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-electric-blue border border-white/5">
                            {p.categoryLabel || p.category}
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            isVertical ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-slate-400'
                          }`}>
                            {p.aspectRatio || '16:9'}
                          </span>
                        </div>

                        <h3 className="text-base font-heading font-semibold text-white tracking-tight">
                          {p.title}
                        </h3>

                        <p className="text-xs text-studio-muted line-clamp-2 max-w-xl leading-relaxed">
                          {p.description || p.tagline}
                        </p>

                        {/* Pipeline Tools */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {Array.isArray(p.tools) && p.tools.slice(0, 5).map((tool, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.03] text-slate-400"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions (Preview, Edit, Delete) */}
                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      {/* Theater Preview Button */}
                      <button
                        onClick={() => setPreviewProject(p)}
                        className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Preview Project in Theater Modal"
                      >
                        <Play className="w-3.5 h-3.5 text-electric-blue" />
                        <span>Preview</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-electric-blue" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingProject(p)}
                        className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* Add / Edit Project Modal */}
      <AdminProjectForm
        project={editingProject}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveProject}
      />

      {/* Intro Showreel Upload & Management Modal */}
      <AdminIntroVideoModal
        isOpen={introModalOpen}
        currentIntro={introVideo}
        onClose={() => setIntroModalOpen(false)}
        onSave={handleSaveIntro}
        onDelete={handleDeleteIntro}
      />

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md p-6 rounded-3xl bg-studio-card border border-white/10 shadow-2xl space-y-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-heading font-bold text-white tracking-tight">
              Delete Project?
            </h3>
            <p className="text-xs text-studio-muted leading-relaxed">
              Are you sure you want to delete <span className="text-white font-medium">"{deletingProject.title}"</span>? This will remove the record from your database and delete uploaded files from storage.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Theater Preview Modal within Admin */}
      <VideoModal
        project={previewProject}
        projects={projects}
        isOpen={Boolean(previewProject)}
        onClose={() => setPreviewProject(null)}
        onSelectProject={(p) => setPreviewProject(p)}
      />

      {/* Supabase Database Setup Guide Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-studio-card border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-electric-blue" />
                <h3 className="text-base font-heading font-bold text-white tracking-tight">
                  Supabase Cloud Database & Storage Setup
                </h3>
              </div>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <p>
                Follow these 4 quick steps to connect your portfolio to **Supabase** for permanent video uploads and secure admin management:
              </p>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-electric-blue font-semibold block">Step 1: Create Supabase Project</span>
                <p className="text-slate-400">
                  Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-white underline">supabase.com</a>, log in, and click <strong>New Project</strong>. Choose a project name (e.g. <code>Mayank-Portfolio</code>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-electric-blue font-semibold block">Step 2: Run SQL Schema & Auto-Create Buckets</span>
                <p className="text-slate-400">
                  Open your project's <strong>SQL Editor</strong>, open <code>DATABASE_SETUP.md</code> in your project files, copy the SQL, and click <strong>RUN</strong>. This automatically creates the projects table, display index column, storage buckets (<code>videos</code> & <code>thumbnail</code>), and all security policies in one click!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-electric-blue font-semibold block">Step 3: Storage Buckets (Auto-Created)</span>
                <p className="text-slate-400">
                  The SQL script automatically provisions both public storage buckets:
                  <br />• <code>videos</code> — Public: <strong>ON</strong> (250 MB limit)
                  <br />• <code>thumbnail</code> — Public: <strong>ON</strong> (25 MB limit)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <span className="font-mono text-electric-blue font-semibold block">Step 4: Create Admin User & Set .env</span>
                <p className="text-slate-400">
                  In Supabase <strong>Authentication &rarr; Users &rarr; Add user</strong>. Enter your admin email and password with <em>Auto Confirm User</em> checked.
                  Then add your Project URL and Anon Key in <code>.env</code>:
                </p>
                <pre className="p-2.5 rounded-lg bg-black text-cyan-300 font-mono text-[11px] overflow-x-auto">
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
