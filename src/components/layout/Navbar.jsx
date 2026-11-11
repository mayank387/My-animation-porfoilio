import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, Film, UploadCloud } from 'lucide-react';
import { contraConfig } from '../../data/contraConfig';

export default function Navbar({ onOpenAdmin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Showreel', href: '#showreel' },
    { label: 'Work', href: '#showcase' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Pipeline', href: '#pipeline' },
    { label: 'Tech Stack', href: '#tech-stack' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-studio-bg/85 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a href="#" aria-label="Mayank Studio - Creative Director & 3D Video Producer Homepage" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-indigo to-electric-blue flex items-center justify-center p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all">
            <div className="w-full h-full bg-studio-surface rounded-[11px] flex items-center justify-center">
              <Film className="w-4 h-4 text-electric-blue group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
              MAYANK
              <span className="text-xs font-sans font-medium text-electric-indigo px-1.5 py-0.5 rounded bg-electric-indigo/10 border border-electric-indigo/20">
                STUDIO
              </span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium font-sans text-slate-300 hover:text-white transition-colors relative py-1 hover:after:w-full after:w-0 after:h-[2px] after:bg-electric-indigo after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions (Tablet & Desktop) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Availability Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs font-sans text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium">Available for Freelance</span>
          </div>

          {/* Upload / Studio CMS Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Upload Videos and Open Studio CMS"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-sans bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-electric-indigo/50 transition-all cursor-pointer shadow-sm group"
            title="Upload Videos & Manage Studio CMS"
          >
            <UploadCloud className="w-3.5 h-3.5 text-electric-blue group-hover:scale-110 transition-transform" />
            <span>Upload Work</span>
          </button>

          {/* Direct Contact / Hire Action Button */}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold font-sans bg-gradient-to-r from-electric-indigo to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Start a Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button & Quick Actions */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Upload Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Upload Videos and Open Studio CMS"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold font-sans bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 flex items-center gap-1 cursor-pointer"
            title="Upload Videos"
          >
            <UploadCloud className="w-3 h-3 text-electric-blue" />
            <span>Upload</span>
          </button>

          <a
            href="#contact"
            aria-label="Start a freelance project with Mayank"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-electric-indigo text-white flex items-center gap-1"
          >
            <span>Hire Me</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-4 pb-6 bg-studio-surface/95 backdrop-blur-2xl border-b border-white/10 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-electric-blue px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            {/* Mobile Studio CMS Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof onOpenAdmin === 'function') onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-sans font-semibold text-sm transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-electric-blue" />
              <span>Upload Work / Studio CMS</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-sans font-medium text-emerald-400 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Freelance Commissions</span>
            </div>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue text-white font-sans font-semibold text-sm shadow-electric-glow"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Start a Project / Hire Me</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

