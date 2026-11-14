import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { UploadCloud } from 'lucide-react';
// Core above-the-fold critical components
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';

// Code-split below-the-fold sections to slash initial mobile JavaScript
const Showcase = lazy(() => import('./components/sections/Showcase'));
const About = lazy(() => import('./components/sections/About'));
const Services = lazy(() => import('./components/sections/Services'));
const Pipeline = lazy(() => import('./components/sections/Pipeline'));
const TechStack = lazy(() => import('./components/sections/TechStack'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Footer = lazy(() => import('./components/layout/Footer'));

// Code-split heavy interactive modals and admin portal to keep initial mobile bundle ultra-light
const VideoModal = lazy(() => import('./components/ui/VideoModal'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

import { getProjects, getIntroVideo, getAdminSession, onAuthStateChange } from './lib/supabase';
import { initAnalytics, trackPageView } from './lib/analytics';

export default function App() {
  const [projectsList, setProjectsList] = useState([]);
  const [introVideo, setIntroVideo] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to detect if current path or hash is admin
  const isPathAdmin = useCallback(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname.startsWith('/admin/') ||
      window.location.hash === '#admin' ||
      window.location.hash.includes('admin')
    );
  }, []);

  // Admin routing state
  const [isAdminView, setIsAdminView] = useState(isPathAdmin());
  const [adminUser, setAdminUser] = useState(null);

  // Fetch published projects for public portfolio view
  const loadPublicProjects = useCallback(async () => {
    try {
      // false = only fetch published projects (drafts are hidden from public)
      const projects = await getProjects(false);
      setProjectsList(projects || []);
    } catch (err) {
      console.warn('Could not load projects:', err);
      setProjectsList([]);
    }
  }, []);

  // Fetch creator intro showreel
  const loadIntroShowreel = useCallback(async () => {
    try {
      const data = await getIntroVideo();
      setIntroVideo(data);
    } catch (err) {
      console.warn('Could not load intro showreel:', err);
    }
  }, []);

  // Check admin session
  const checkAdminAuth = useCallback(async () => {
    try {
      const sessionUser = await getAdminSession();
      if (sessionUser) {
        setAdminUser(sessionUser);
      }
    } catch (err) {
      console.warn('Session check failed:', err);
    }
  }, []);

  // Mount initialization: Load public portfolio data
  useEffect(() => {
    loadPublicProjects();
    loadIntroShowreel();
  }, [loadPublicProjects, loadIntroShowreel]);

  // Admin Auth: Only check and listen when visiting /admin
  useEffect(() => {
    if (!isAdminView) return;
    checkAdminAuth();

    const { data: authListener } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setAdminUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAdminUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [isAdminView, checkAdminAuth]);

  // GA4 Analytics Initialization & Traffic Source Detection
  useEffect(() => {
    const cleanupAnalytics = initAnalytics();
    return () => {
      if (typeof cleanupAnalytics === 'function') cleanupAnalytics();
    };
  }, []);

  // GA4 Route Change Listener
  useEffect(() => {
    const currentPath = isAdminView 
      ? '/admin' 
      : (window.location.pathname + window.location.hash || '/');
    const pageTitle = isAdminView 
      ? 'Studio Admin // Mayank Portfolio' 
      : 'MAYANK // Creative Director & 3D AI Video Producer';
    trackPageView(currentPath, pageTitle);
  }, [isAdminView]);

  // URL route listener (supports /admin, #admin, and browser back/forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const targetIsAdmin = isPathAdmin();
      setIsAdminView(targetIsAdmin);
      const newPath = targetIsAdmin ? '/admin' : (window.location.pathname + window.location.hash || '/');
      trackPageView(newPath);
      if (!targetIsAdmin) {
        // When coming back from admin to public site, reload public projects and intro showreel
        loadPublicProjects();
        loadIntroShowreel();
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // Global shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to open admin portal
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateToAdmin();
      }
    };
    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('keydown', handleShortcut);
    };
  }, [isPathAdmin, loadPublicProjects, loadIntroShowreel]);

  // Handlers for route switching
  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setIsAdminView(true);
  };

  const handleBackToPortfolio = () => {
    window.location.hash = '';
    window.history.pushState(null, '', '/');
    setIsAdminView(false);
    loadPublicProjects();
    loadIntroShowreel();
  };

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    window.history.pushState(null, '', '/admin');
  };

  const handleLogout = () => {
    setAdminUser(null);
    handleBackToPortfolio();
  };

  // Video Theater Modal handlers
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    if (project?.id) {
      trackPageView(`/project/${project.id}`, project.title || 'Project Showcase');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    trackPageView(window.location.pathname + window.location.hash || '/', document.title);
  };

  const handleOpenFeaturedReel = (targetProject) => {
    const featured = targetProject || projectsList.find((p) => p.featured) || projectsList[0];
    setSelectedProject(featured);
    setIsModalOpen(true);
    if (featured?.id) {
      trackPageView(`/project/${featured.id}`, featured.title || 'Featured Showreel');
    }
  };

  // -------------------------------------------------------------
  // SECURE ADMIN ROUTE VIEW (/admin)
  // -------------------------------------------------------------
  if (isAdminView) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-studio-bg flex items-center justify-center text-xs font-mono text-slate-400">Loading Studio Admin...</div>}>
        {!adminUser ? (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToPortfolio={handleBackToPortfolio}
          />
        ) : (
          <AdminDashboard
            user={adminUser}
            onBackToPortfolio={handleBackToPortfolio}
            onLogout={handleLogout}
            onProjectsUpdated={() => {
              loadPublicProjects();
              loadIntroShowreel();
            }}
          />
        )}
      </Suspense>
    );
  }

  // -------------------------------------------------------------
  // PUBLIC CLIENT PORTFOLIO (100% Preserved Existing Design)
  // -------------------------------------------------------------
  return (
    <div className="relative min-h-screen bg-studio-bg text-slate-100 selection:bg-electric-indigo selection:text-white">
      {/* Subtle Film Grain Noise Texture */}
      <div className="fixed inset-0 pointer-events-none film-grain z-50 opacity-40" />

      {/* Navigation */}
      <Navbar onOpenAdmin={navigateToAdmin} />

      {/* Main Content Sections */}
      <main>
        <Hero 
          introVideo={introVideo}
          onOpenAdminUpload={navigateToAdmin}
          onOpenFeaturedProject={handleOpenFeaturedReel} 
          featuredProject={projectsList.find(p => p.featured) || projectsList[0] || null}
        />
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <Showcase 
            projects={projectsList} 
            onSelectProject={handleSelectProject} 
            onOpenAdmin={navigateToAdmin}
          />
          <About />
          <Services />
          <Pipeline />
          <TechStack />
          <Contact />
        </Suspense>
      </main>

      {/* Floating Quick Upload / Studio CMS Button */}
      <button
        type="button"
        onClick={navigateToAdmin}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-studio-surface/90 hover:bg-electric-indigo border border-white/15 hover:border-transparent text-white text-xs font-sans font-semibold backdrop-blur-xl shadow-2xl transition-all duration-300 flex items-center gap-2 group transform hover:-translate-y-1 cursor-pointer"
        title="Open Admin Upload & Studio CMS (Shortcut: Ctrl + Shift + A)"
        aria-label="Open Admin Upload and Studio CMS"
      >
        <UploadCloud className="w-4 h-4 text-electric-blue group-hover:text-white transition-colors" />
        <span className="hidden sm:inline">Upload / Studio CMS</span>
        <span className="text-[10px] font-mono text-slate-400 group-hover:text-white/80 bg-white/10 px-1.5 py-0.5 rounded">Admin</span>
      </button>

      {/* Footer (Lazy Loaded) */}
      <Suspense fallback={null}>
        <Footer onOpenAdmin={navigateToAdmin} />
      </Suspense>

      {/* Theater Video Modal with Playlist Navigation & Full Controls (Lazy loaded on demand) */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <VideoModal
            project={selectedProject}
            projects={projectsList}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSelectProject={handleSelectProject}
          />
        </Suspense>
      )}
    </div>
  );
}
