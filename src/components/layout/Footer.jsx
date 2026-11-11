import React, { useState } from 'react';
import { 
  ArrowUpRight, Copy, Check, ShieldCheck, Mail, Film, 
  ExternalLink, Briefcase 
} from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

export default function Footer({ onOpenAdmin }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(siteConfig.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="relative bg-studio-surface border-t border-white/[0.08] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-electric-indigo/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-indigo to-electric-blue flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-studio-surface rounded-[11px] flex items-center justify-center">
                  <Film className="w-4 h-4 text-electric-blue" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-xl text-white tracking-wider">
                MAYANK <span className="text-electric-indigo font-sans text-sm font-normal">// STUDIO</span>
              </span>
            </div>

            <p className="text-sm text-studio-muted max-w-md font-normal leading-relaxed">
              Specialized freelance creative studio dedicated to AI-generated 3D animated videos, cinematic product advertisements, promotional launch films, and high-retention creative Reels.
            </p>

            {/* Freelance Milestone Protection Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs font-sans font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Freelance Creator • Milestone Escrow Protected</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">Navigation</h4>
            <ul className="space-y-2 text-sm font-sans text-slate-300 font-normal">
              <li>
                <a href="#showcase" className="hover:text-electric-blue transition-colors">Showcase & Films</a>
              </li>
              <li>
                <a href="#about" className="hover:text-electric-blue transition-colors">About Director</a>
              </li>
              <li>
                <a href="#services" className="hover:text-electric-blue transition-colors">Studio Services</a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-electric-blue transition-colors">Production Pipeline</a>
              </li>
              <li>
                <a href="#tech-stack" className="hover:text-electric-blue transition-colors">Software & Tools</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-electric-blue transition-colors">Contact & Inquiries</a>
              </li>
            </ul>
          </div>

          {/* Direct Freelance Inquiries & Bookings */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-white/50">Direct Inquiries & Bookings</h4>
            <p className="text-xs text-studio-muted font-normal leading-relaxed">
              Ready to start a production? Available across all major freelance platforms, secure escrow milestone contracts, or direct email inquiry.
            </p>

            <div className="flex flex-col gap-2.5">
              {/* Button 1: Start a Project */}
              <a
                href="#contact"
                aria-label="Start a freelance project with Mayank"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white text-xs font-sans font-semibold shadow-electric-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Button 2: Platform Profile (Behance) */}
              <a
                href={siteConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Hire Mayank on Behance"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1769FF]/20 hover:bg-[#1769FF]/35 text-white text-xs font-sans font-semibold border border-[#1769FF]/40 hover:border-[#1769FF]/70 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current text-[#1769FF]" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.976 3-3.419 0-5.75-2.367-5.75-5.75 0-3.383 2.331-5.75 5.75-5.75 3.419 0 5.75 2.367 5.75 5.75 0 .239-.018.513-.042.75h-8.878c.096 1.691 1.401 2.95 3.327 2.95 1.546 0 2.502-.676 2.869-1.25h1.996zm-7.146-4.25h5.45c-.147-1.464-1.282-2.35-2.677-2.35-1.42 0-2.613.886-2.773 2.35zm-8.58 7.25h-8v-14h7.525c2.458 0 4.225.867 4.225 3.342 0 1.564-.858 2.55-1.925 2.992 1.475.483 2.275 1.708 2.275 3.408 0 2.75-2.025 4.258-4.1 4.258zm-5.4-8.3h4.625c1.175 0 2.1-.55 2.1-1.75 0-1.125-.875-1.625-2.05-1.625h-4.675v3.375zm0 5.85h4.825c1.375 0 2.25-.65 2.25-1.95 0-1.25-.9-1.9-2.325-1.9h-4.75v3.85z"/>
                </svg>
                <span>Hire on Behance</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Clickable Email mailto link with Copy action */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs font-sans text-slate-300 transition-colors">
                <a
                  href={`mailto:${siteConfig.email}`}
                  aria-label={`Send project email to ${siteConfig.email}`}
                  className="flex items-center gap-2 truncate text-slate-300 hover:text-white transition-colors group font-normal"
                  title="Send email to mayankk3n@gmail.com"
                >
                  <Mail className="w-3.5 h-3.5 text-electric-blue flex-shrink-0" />
                  <span className="truncate">{siteConfig.email}</span>
                </a>

                <button
                  type="button"
                  onClick={copyEmail}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
                  title="Copy email to clipboard"
                  aria-label="Copy email address"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-sans font-medium flex-shrink-0">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Official Portfolios & Channels Row */}
        <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] text-xs font-sans">
          <span className="text-slate-400 font-medium">Official Portfolios & Channels:</span>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={siteConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mayank's official Behance profile"
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group font-medium"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#1769FF]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.976 3-3.419 0-5.75-2.367-5.75-5.75 0-3.383 2.331-5.75 5.75-5.75 3.419 0 5.75 2.367 5.75 5.75 0 .239-.018.513-.042.75h-8.878c.096 1.691 1.401 2.95 3.327 2.95 1.546 0 2.502-.676 2.869-1.25h1.996zm-7.146-4.25h5.45c-.147-1.464-1.282-2.35-2.677-2.35-1.42 0-2.613.886-2.773 2.35zm-8.58 7.25h-8v-14h7.525c2.458 0 4.225.867 4.225 3.342 0 1.564-.858 2.55-1.925 2.992 1.475.483 2.275 1.708 2.275 3.408 0 2.75-2.025 4.258-4.1 4.258zm-5.4-8.3h4.625c1.175 0 2.1-.55 2.1-1.75 0-1.125-.875-1.625-2.05-1.625h-4.675v3.375zm0 5.85h4.825c1.375 0 2.25-.65 2.25-1.95 0-1.25-.9-1.9-2.325-1.9h-4.75v3.85z"/>
              </svg>
              <span>Behance: mayankkarn3</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              aria-label={`Send email to ${siteConfig.email}`}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-electric-blue" />
              <span>{siteConfig.email}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-studio-muted font-normal">
          <div>
            © {new Date().getFullYear()} Mayank Creative Studio. All visual rights reserved.
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            <span>Client Contracts via Milestone Escrow</span>
            <span>•</span>
            <span className="text-slate-300">4K Master Delivery</span>
            <span>•</span>
            <button
              type="button"
              onClick={onOpenAdmin || (() => { window.location.pathname = '/admin'; })}
              aria-label="Open Admin and Studio CMS Portal"
              className="text-slate-400 hover:text-electric-blue transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Admin Portal (or press Ctrl + Shift + A)"
            >
              <span>Admin</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
