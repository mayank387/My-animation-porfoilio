import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, ArrowUpRight, CheckCircle2, Clock, 
  Sparkles, FileCheck, DollarSign, Send, HelpCircle 
} from 'lucide-react';
import { contraConfig } from '../../data/contraConfig';

export default function ContraBooking() {
  const [selectedType, setSelectedType] = useState('Cinematic Product Commercial');
  const [selectedRatio, setSelectedRatio] = useState('16:9 Cinema');
  const [timeline, setTimeline] = useState('Standard (7-10 Days)');
  const [clientEmail, setClientEmail] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    
    // Construct pre-formatted mailto or Contra inquiry
    const subject = encodeURIComponent(`Project Inquiry: ${selectedType} (${timeline})`);
    const body = encodeURIComponent(
      `Hello Mayank,\n\nI am interested in hiring you for a video project through Contra.\n\nProject Type: ${selectedType}\nAspect Ratio: ${selectedRatio}\nTimeline: ${timeline}\nClient Email: ${clientEmail}\n\nProject Details:\n${projectBrief}\n\nLooking forward to hearing from you via Contra!`
    );

    window.open(`mailto:${contraConfig.email}?subject=${subject}&body=${body}`, '_blank');
    setInquirySent(true);
    setTimeout(() => setInquirySent(false), 5000);
  };

  const contraBenefits = [
    {
      icon: ShieldCheck,
      title: "Escrow Milestone Protection",
      description: "Your budget is safely locked in escrow and only released when you approve each production milestone."
    },
    {
      icon: FileCheck,
      title: "IP Rights & Commercial Transfer",
      description: "Full broadcast and commercial visual usage rights are legally assigned to your company upon final delivery."
    },
    {
      icon: DollarSign,
      title: "Zero Hidden Fees for Clients",
      description: "Transparent, agreed-upon milestone payments with standard international business invoice receipts."
    },
    {
      icon: Clock,
      title: "Guaranteed Turnaround",
      description: "Milestones adhere to mutually agreed timelines with regular progress cutdowns and revision loops."
    }
  ];

  return (
    <section id="contra-packages" className="py-24 sm:py-32 relative bg-studio-bg overflow-hidden">
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-electric-indigo/10 blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-electric-blue uppercase tracking-widest px-3.5 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hire With Confidence</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Work With Mayank on Contra
          </h2>
          <p className="mt-3 text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
            All freelance commissions, milestone deliverables, contracts, and invoicing are handled through Contra for frictionless collaboration.
          </p>
        </div>

        {/* Contra Security & Trust Pillars */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contraBenefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-studio-surface border border-white/[0.06] hover:border-white/20 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center text-electric-blue">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-heading font-semibold text-white tracking-tight">{benefit.title}</h4>
                <p className="text-xs text-studio-muted font-normal leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Commission Packages Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {contraConfig.packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                pkg.badge === 'Most Popular'
                  ? 'bg-gradient-to-b from-studio-card to-studio-surface border-2 border-electric-indigo/50 shadow-electric-glow'
                  : 'bg-studio-card border border-white/[0.08] hover:border-white/20'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <span className={`text-xs font-sans font-medium px-2.5 py-0.5 rounded-full ${
                    pkg.badge === 'Most Popular'
                      ? 'bg-electric-indigo text-white font-semibold'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {pkg.badge}
                  </span>
                  <span className="text-xs font-sans text-studio-muted">
                    {pkg.duration}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="mt-5 text-xl font-heading font-semibold text-white tracking-tight">
                  {pkg.title}
                </h3>
                <p className="mt-2 text-xs text-studio-muted font-normal leading-relaxed">
                  {pkg.description}
                </p>

                {/* Specs */}
                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Aspect Ratio:</span>
                    <span className="text-white">{pkg.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-electric-blue">{pkg.idealFor}</span>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="mt-6 space-y-2.5">
                  <span className="text-xs font-mono text-slate-400 block uppercase tracking-wider">
                    Included Deliverables:
                  </span>
                  <ul className="space-y-2">
                    {pkg.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-electric-indigo mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                <a
                  href={contraConfig.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-xs font-semibold font-sans transition-all transform hover:-translate-y-0.5 cursor-pointer ${
                    pkg.badge === 'Most Popular'
                      ? 'bg-gradient-to-r from-electric-indigo to-electric-blue text-white shadow-electric-glow'
                      : 'bg-white/[0.05] hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <span>{pkg.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                <span className="block text-center text-[10px] font-sans text-studio-muted">
                  Protected milestone agreement on Contra
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Custom Project Inquiry Generator */}
        <div className="mt-20 max-w-4xl mx-auto rounded-3xl bg-studio-surface border border-white/[0.08] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-electric-indigo/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-mono text-electric-blue uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Production Request</span>
            </div>
            <h3 className="mt-2 text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Have a Specific Concept in Mind?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-studio-muted">
              Configure your requirements below. You can send this inquiry directly to Mayank to initiate a tailored Contra proposal.
            </p>

            <form onSubmit={handleInquirySubmit} className="mt-8 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-2">Project Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {[
                    'AI 3D Animation',
                    'Cinematic Product Commercial',
                    'Promotional Launch Video',
                    'Creative Reels Pack'
                  ].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-mono text-left transition-all border ${
                        selectedType === type
                          ? 'bg-electric-indigo/20 border-electric-indigo text-white'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-2">Format / Ratio</label>
                  <select
                    value={selectedRatio}
                    onChange={(e) => setSelectedRatio(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                  >
                    <option value="16:9 Cinema Widescreen">16:9 Cinema Widescreen (YouTube, Web, TV)</option>
                    <option value="9:16 Vertical Reel">9:16 Vertical Reel (Instagram, TikTok)</option>
                    <option value="Multi-Aspect Package (16:9 + 9:16 + 1:1)">Multi-Aspect Package (16:9 + 9:16 + 1:1)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-2">Desired Timeline</label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-indigo"
                  >
                    <option value="Standard (7-10 Days)">Standard (7-10 Business Days)</option>
                    <option value="Express (3-5 Days)">Express Priority (3-5 Days)</option>
                    <option value="Flexible / Exploration">Flexible / R&D Exploration</option>
                  </select>
                </div>
              </div>

              {/* Client Email & Brief */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-2">Your Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-electric-indigo"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-2">Project Brief & Concept Vision</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your product, target audience, reference style or visual vision..."
                    value={projectBrief}
                    onChange={(e) => setProjectBrief(e.target.value)}
                    className="w-full bg-studio-card border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-indigo resize-none"
                  />
                </div>
              </div>

              {/* Submit / Direct Contra CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-electric-indigo hover:bg-electric-indigo/90 text-white text-xs font-mono font-semibold shadow-electric-glow transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Project Inquiry</span>
                </button>

                <a
                  href={contraConfig.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-slate-400 hover:text-electric-blue transition-colors flex items-center gap-1.5"
                >
                  <span>Or message directly on Contra profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {inquirySent && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono text-center">
                  Inquiry email client opened! You can also chat directly on Contra.
                </div>
              )}
            </form>
          </div>
        </div>

      </div>
    </section>
  );
}

