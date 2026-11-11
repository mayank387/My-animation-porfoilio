import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowUpRight, Mail, Copy, Check, 
  Send, Sparkles, MessageSquare, ExternalLink, Globe,
  Clock, CheckCircle2, ChevronRight, Briefcase
} from 'lucide-react';
import { contraConfig } from '../../data/contraConfig';
import Badge from '../ui/Badge';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectType, setProjectType] = useState('3D Product Advertisement');
  const [projectMessage, setProjectMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contraConfig.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickMailSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project Inquiry: ${projectType} - from ${clientName || 'Client'}`);
    const body = encodeURIComponent(
      `Hello Mayank,\n\nI am interested in collaborating on a video project.\n\nName: ${clientName}\nEmail: ${clientEmail}\nService Required: ${projectType}\n\nProject Details:\n${projectMessage}\n\nLooking forward to hearing back!`
    );
    window.open(`mailto:${contraConfig.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <section id="contact" className="py-24 sm:py-32 relative bg-studio-bg overflow-hidden">
      {/* Animated Aurora Ambient Glow Background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-electric-indigo/15 via-electric-violet/10 to-electric-blue/15 blur-[180px] rounded-full animate-pulse-slow pointer-events-none" />
      <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-electric-blue/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-electric-violet/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Subtle Studio Grid Overlay */}
      <div className="absolute inset-0 bg-subtle-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-sans font-medium text-electric-blue uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/20 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start a Project</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-[1.08]"
          >
            Have an idea?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple">
              Let's bring it to life.
            </span>
          </motion.h2>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg md:text-xl text-studio-muted max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Looking for creative video advertisements or cinematic animations for your brand? Let's work together.
          </motion.p>

          {/* Prominent Action Buttons: Send Project Brief + Platform Profiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 flex-wrap"
          >
            {/* Action 1: Send Project Brief */}
            <a
              href={`mailto:${contraConfig.email}?subject=Project%20Inquiry%20-%20Creative%20Video%20Production`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold font-sans bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>Send Project Brief</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Action 2: Hire Me on Behance */}
            <a
              href={contraConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hire Mayank on Behance"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-semibold font-sans bg-[#1769FF]/20 hover:bg-[#1769FF]/35 text-white border border-[#1769FF]/40 backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg group cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-[#1769FF]" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.976 3-3.419 0-5.75-2.367-5.75-5.75 0-3.383 2.331-5.75 5.75-5.75 3.419 0 5.75 2.367 5.75 5.75 0 .239-.018.513-.042.75h-8.878c.096 1.691 1.401 2.95 3.327 2.95 1.546 0 2.502-.676 2.869-1.25h1.996zm-7.146-4.25h5.45c-.147-1.464-1.282-2.35-2.677-2.35-1.42 0-2.613.886-2.773 2.35zm-8.58 7.25h-8v-14h7.525c2.458 0 4.225.867 4.225 3.342 0 1.564-.858 2.55-1.925 2.992 1.475.483 2.275 1.708 2.275 3.408 0 2.75-2.025 4.258-4.1 4.258zm-5.4-8.3h4.625c1.175 0 2.1-.55 2.1-1.75 0-1.125-.875-1.625-2.05-1.625h-4.675v3.375zm0 5.85h4.825c1.375 0 2.25-.65 2.25-1.95 0-1.25-.9-1.9-2.325-1.9h-4.75v3.85z"/>
              </svg>
              <span>Hire Me on Behance</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Clickable Mailto Email Button */}
            <a
              href={`mailto:${contraConfig.email}?subject=Project%20Inquiry%20-%20Creative%20Video%20Production`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-semibold font-sans bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-electric-blue/40 backdrop-blur-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
            >
              <span className="font-mono text-xs text-electric-blue">{contraConfig.email}</span>
            </a>
          </motion.div>
        </div>

        {/* Contact Matrix: Email Card & Quick Inquiry Form */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Direct Email & Trust Card */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Email Contact Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-studio-card border border-white/[0.08] hover:border-electric-indigo/40 transition-all shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center text-electric-blue">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <Clock className="w-3 h-3" />
                  <span>Responds &lt; 24h</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Professional Email
                </span>
                <p className="mt-1 text-sm text-studio-muted">
                  Send your project requirements, references, or moodboards directly:
                </p>
              </div>

              {/* Clickable Email Address using mailto: with One-Click Copy */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-electric-blue/30 transition-colors flex items-center justify-between gap-3">
                <a
                  href={`mailto:${contraConfig.email}?subject=Project%20Inquiry%20-%20Creative%20Video%20Production`}
                  className="font-mono text-sm text-white hover:text-electric-blue transition-colors truncate flex items-center gap-2 group"
                  title="Click to email mayankk3n@gmail.com"
                >
                  <Mail className="w-4 h-4 text-electric-blue flex-shrink-0" />
                  <span className="truncate">{contraConfig.email}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-electric-blue opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
                  aria-label="Copy email address"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Direct Mail Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`mailto:${contraConfig.email}?subject=Project%20Inquiry%20-%20Creative%20Video%20Production`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono font-medium border border-white/10 hover:border-white/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Mail className="w-3.5 h-3.5 text-electric-blue" />
                  <span>Send Mail</span>
                </a>

                <a
                  href={contraConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1769FF]/15 hover:bg-[#1769FF]/25 text-white text-xs font-mono font-medium border border-[#1769FF]/30 hover:border-[#1769FF]/50 transition-all transform hover:-translate-y-0.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#1769FF]" />
                  <span>Behance Profile</span>
                </a>
              </div>
            </div>

            {/* Escrow Protection & Contract Guarantee Card */}
            <div className="p-7 rounded-3xl bg-studio-surface border border-white/[0.08] space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-heading font-semibold text-sm text-white tracking-tight">Milestone Escrow Protected</span>
              </div>
              <p className="text-xs text-studio-muted leading-relaxed">
                Whether collaborating through Upwork, Fiverr, Behance, or a direct freelance contract, your production budget is held safely in milestone escrow and only released as you review and approve each creative phase.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-electric-blue" />
                <span>Zero hidden surprises • Commercial contracts & invoices provided</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Inquiry Dispatcher */}
          <div className="lg:col-span-7">
            <div className="p-7 sm:p-9 rounded-3xl bg-studio-card border border-white/[0.08] shadow-2xl relative">
              <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono text-electric-blue uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  <span>Send a Message</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Dispatches to {contraConfig.email}</span>
              </div>

              <form onSubmit={handleQuickMailSubmit} className="mt-6 space-y-5">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-xs font-mono text-slate-300 block mb-1.5">Your Name / Company</label>
                    <input
                      id="contact-name"
                      name="clientName"
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-studio-surface border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-xs font-mono text-slate-300 block mb-1.5">Your Email</label>
                    <input
                      id="contact-email"
                      name="clientEmail"
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-studio-surface border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label htmlFor="contact-service" className="text-xs font-mono text-slate-300 block mb-1.5">Interested Service</label>
                  <select
                    id="contact-service"
                    name="projectType"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-studio-surface border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo cursor-pointer"
                  >
                    <option value="3D Animated Advertisements">3D Animated Advertisements</option>
                    <option value="AI Video Production">AI Video Production</option>
                    <option value="Product Commercials">Product Commercials (Electronics, Perfume, Jewellery)</option>
                    <option value="Cinematic Promotional Videos">Cinematic Promotional Videos</option>
                    <option value="Instagram Reels & YouTube Shorts">Instagram Reels & YouTube Shorts (9:16)</option>
                    <option value="Nature & Wildlife Animation">Nature & Wildlife Animation</option>
                  </select>
                </div>

                {/* Project Details */}
                <div>
                  <label htmlFor="contact-message" className="text-xs font-mono text-slate-300 block mb-1.5">Project Brief or Idea</label>
                  <textarea
                    id="contact-message"
                    name="projectMessage"
                    rows={4}
                    required
                    placeholder="Tell me about your product, visual references, timeline expectations..."
                    value={projectMessage}
                    onChange={(e) => setProjectMessage(e.target.value)}
                    className="w-full bg-studio-surface border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-indigo resize-none"
                  />
                </div>

                {/* Form Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-mono font-semibold shadow-electric-glow transition-all transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Project Email</span>
                  </button>

                  <a
                    href={contraConfig.behanceUrl || "https://www.behance.net/mayankkarn3"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-slate-400 hover:text-electric-blue transition-colors flex items-center gap-1.5 group cursor-pointer"
                  >
                    <span>Prefer viewing work on Behance?</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Verified Channels Section */}
        <div className="mt-16 pt-12 border-t border-white/[0.08]">
          <div className="text-center max-w-md mx-auto mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
              Official Channels & Portfolios
            </span>
            <p className="mt-1 text-xs text-studio-muted">
              Connect through your preferred freelance platform, review my verified portfolios, or reach out directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
            {contraConfig.socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target={social.url.startsWith('mailto:') ? '_self' : '_blank'}
                rel={social.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="flex-1 min-w-[240px] p-5 rounded-2xl bg-studio-surface hover:bg-studio-card border border-white/5 hover:border-electric-indigo/40 transition-all text-center group flex flex-col items-center justify-center gap-1.5 shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="text-sm font-heading font-semibold text-white group-hover:text-electric-blue transition-colors flex items-center gap-1.5 tracking-tight">
                  {social.name === 'Behance' ? (
                    <svg className="w-4 h-4 fill-current text-[#1769FF]" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.976 3-3.419 0-5.75-2.367-5.75-5.75 0-3.383 2.331-5.75 5.75-5.75 3.419 0 5.75 2.367 5.75 5.75 0 .239-.018.513-.042.75h-8.878c.096 1.691 1.401 2.95 3.327 2.95 1.546 0 2.502-.676 2.869-1.25h1.996zm-7.146-4.25h5.45c-.147-1.464-1.282-2.35-2.677-2.35-1.42 0-2.613.886-2.773 2.35zm-8.58 7.25h-8v-14h7.525c2.458 0 4.225.867 4.225 3.342 0 1.564-.858 2.55-1.925 2.992 1.475.483 2.275 1.708 2.275 3.408 0 2.75-2.025 4.258-4.1 4.258zm-5.4-8.3h4.625c1.175 0 2.1-.55 2.1-1.75 0-1.125-.875-1.625-2.05-1.625h-4.675v3.375zm0 5.85h4.825c1.375 0 2.25-.65 2.25-1.95 0-1.25-.9-1.9-2.325-1.9h-4.75v3.85z"/>
                    </svg>
                  ) : (
                    <Mail className="w-4 h-4 text-electric-blue" />
                  )}
                  <span>{social.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {social.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                  {social.badge}
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
