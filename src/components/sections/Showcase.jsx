import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Sparkles, ArrowUpRight, ShieldCheck, UploadCloud, Clock } from 'lucide-react';
import { projectCategories } from '../../data/projects';
import { contraConfig } from '../../data/contraConfig';
import VideoCard from '../ui/VideoCard';

export default function Showcase({ projects: customProjects, onSelectProject, onOpenAdmin }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const projectList = customProjects || [];

  // Robust category matching for 3D Ads, 2D Animation, and specific tags
  const matchesCategory = (project, catId) => {
    if (catId === 'all') return true;
    if (catId === '3d-ads') {
      return (
        project.category === '3d-ads' ||
        project.category === 'product-ads' ||
        project.category === 'cinematic-commercial' ||
        (project.category === '3d-animation' && !projectList.some((p) => p.category === '3d-ads'))
      );
    }
    if (catId === '2d-animation') {
      return project.category === '2d-animation' || project.category === '2d';
    }
    return project.category === catId;
  };

  const filteredProjects = activeCategory === 'all'
    ? projectList
    : projectList.filter((p) => matchesCategory(p, activeCategory));

  // Primary tabs (All, 3D Advertisement, 2D Animation) are always preserved & clickable
  const visibleCategories = projectCategories.filter((cat) => {
    if (cat.id === 'all' || cat.id === '3d-ads' || cat.id === '2d-animation') return true;
    const count = projectList.filter((p) => matchesCategory(p, cat.id)).length;
    return count > 0;
  });

  // Guarantee strict displayOrder ascending sort (Video 1 before Video 2)
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <section id="showcase" className="py-24 sm:py-32 relative bg-studio-bg overflow-hidden">
      {/* Background radial glow spots */}
      <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-studio-orange/8 blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-studio-amber/8 blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/[0.08]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-studio-orange uppercase tracking-widest px-3 py-1 rounded-full bg-studio-orange/10 border border-studio-orange/20">
              <Film className="w-3.5 h-3.5" />
              <span>Cinematic Portfolio</span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight">
              Featured Creative Work
            </h2>

            <p className="mt-3 text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
              Explore original 3D animated advertisements, cinematic brand commercials, and high-impact visual reels. Click any project to open full cinema theater mode with sound.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-sans text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Original Director Works & Client Commercials</span>
            </div>
          </div>

          {/* Category Filter Pills (rendered with preserved 2D Animation & 3D Advertisement tabs) */}
          {projectList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 max-w-2xl">
              {visibleCategories.map((cat) => {
                const count = cat.id === 'all'
                  ? projectList.length
                  : projectList.filter(p => matchesCategory(p, cat.id)).length;

                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={isActive}
                    aria-label={`Filter portfolio by ${cat.label} (${count} projects)`}
                    className={`px-4 py-2.5 rounded-xl text-xs font-sans transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-glow font-semibold border-transparent'
                        : 'bg-studio-surface hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 font-medium'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] font-sans px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white font-medium' : 'bg-white/5 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Upload Reel Shortcut */}
              <button
                type="button"
                onClick={onOpenAdmin}
                aria-label="Upload New Reel to Portfolio"
                className="px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-white/[0.06] hover:bg-studio-orange text-white border border-white/10 hover:border-transparent transition-all flex items-center gap-2 cursor-pointer shadow-md group ml-auto sm:ml-0"
                title="Upload New Reel to Portfolio"
              >
                <UploadCloud className="w-3.5 h-3.5 text-electric-blue group-hover:text-white transition-colors" />
                <span>Upload Reel</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Empty State: When no projects have been uploaded yet */}
        {projectList.length === 0 ? (
          <div className="mt-16 relative rounded-3xl bg-studio-surface border border-white/[0.08] p-10 sm:p-20 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 subtle-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric-indigo/10 blur-[130px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-electric-blue shadow-2xl">
                <Film className="w-8 h-8 sm:w-10 sm:h-10 text-electric-blue" />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-indigo/10 border border-electric-indigo/20 text-electric-blue text-xs font-sans font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Production In Progress</span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
                My Creative Work Is Coming Soon.
              </h3>

              <p className="text-sm sm:text-base text-studio-muted font-normal leading-relaxed max-w-xl mx-auto">
                Original 3D animated advertisements, cinematic commercial treatments, and visual reels are currently in post-production. Stay tuned, or reach out directly to commission bespoke motion work.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-semibold font-sans bg-gradient-to-r from-electric-indigo to-electric-blue text-white shadow-electric-glow hover:opacity-95 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Start a Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <a
                  href="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 text-xs font-semibold font-sans transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-electric-blue" />
                  <span>Admin Upload Portal</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Cinematic Two-Column Video Cards Grid */
          <>
            <motion.div
              layout
              className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
            >
              <AnimatePresence mode="popLayout">
                {sortedProjects.map((project) => (
                  <VideoCard
                    key={project.id}
                    project={project}
                    onSelect={onSelectProject}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State for Specific Category Filter */}
            {sortedProjects.length === 0 && (
              <div className="mt-16 text-center py-16 rounded-3xl bg-studio-surface border border-white/5 space-y-3">
                <p className="text-sm font-sans text-slate-300">No projects found in this category.</p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="px-5 py-2.5 rounded-xl text-xs font-sans font-medium bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  View All Work
                </button>
              </div>
            )}
          </>
        )}

        {/* Bottom Agency Banner for Freelance Commissions */}
        <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-studio-surface via-studio-card to-studio-surface border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-electric-indigo/10 blur-[130px] pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Milestone Escrow & Contract Protected</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Want a similar cinematic commercial for your brand?
            </h3>
            <p className="text-xs sm:text-sm text-studio-muted max-w-xl font-normal leading-relaxed">
              I collaborate with global brands, agencies, and founders across all major freelance platforms and direct contracts to direct tailor-made 3D product animations and AI visual narratives.
            </p>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-xs font-semibold font-sans bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5 flex-shrink-0 relative z-10 cursor-pointer"
          >
            <span>Start a Project</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
