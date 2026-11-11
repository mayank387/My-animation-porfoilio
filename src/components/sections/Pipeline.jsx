import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Clock, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import { pipelineSteps } from '../../data/pipeline';

export default function Pipeline() {
  return (
    <section id="pipeline" className="py-24 sm:py-32 relative bg-studio-bg overflow-hidden">
      {/* Subtle Grid Accent */}
      <div className="absolute inset-0 bg-subtle-grid pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-electric-blue uppercase tracking-widest px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Studio Workflow</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            From Script to Master Export
          </h2>
          <p className="mt-3 text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
            A battle-tested production pipeline combining 3D precision, generative AI acceleration, and cinematic post-production.
          </p>
        </div>

        {/* Pipeline Step Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipelineSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative rounded-2xl p-6 bg-studio-surface border border-white/[0.07] hover:border-electric-indigo/40 transition-all duration-300 hover:shadow-card-glow flex flex-col justify-between group"
            >
              <div>
                {/* Step Number & Duration */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <span className="text-2xl font-heading font-bold text-white/30 group-hover:text-electric-blue transition-colors">
                    {step.step}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-slate-300 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3 text-electric-indigo" />
                    {step.duration}
                  </span>
                </div>

                {/* Phase & Title */}
                <span className="mt-4 text-[11px] font-sans font-semibold uppercase tracking-wider text-electric-indigo block">
                  {step.phase}
                </span>
                <h3 className="mt-1 text-lg font-heading font-semibold text-white tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-xs text-studio-muted font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Tools Used in Phase */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <span className="text-[10px] font-sans font-medium text-slate-400 block mb-2 flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Phase Toolkit:
                </span>
                <div className="flex flex-wrap gap-1">
                  {step.tools.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Milestone Security Note */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl p-6 bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-center text-electric-indigo flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Milestone-Protected Freelance Production</h4>
              <p className="text-xs text-studio-muted mt-1 leading-relaxed">
                Every project is structured into clear milestone deliverables. Work with complete peace of mind through your preferred freelance platform (Upwork, Fiverr, Behance) or direct contract with escrow protection.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-indigo/20 hover:bg-electric-indigo/30 text-indigo-300 border border-electric-indigo/30 text-xs font-sans font-semibold transition-colors flex-shrink-0 cursor-pointer"
          >
            <span>Discuss Your Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
}

