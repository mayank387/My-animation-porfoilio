import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Sparkles, Check } from 'lucide-react';
import { techStackCategories } from '../../data/techStack';

export default function TechStack() {
  return (
    <section id="tech-stack" className="py-24 sm:py-32 relative bg-studio-surface border-t border-white/[0.06] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-electric-cyan/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>Creative Tech Stack</span>
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Tools of the Trade
          </h2>
          <p className="mt-3 text-sm sm:text-base text-studio-muted font-normal leading-relaxed">
            Combining industry-standard 3D software with bleeding-edge AI models for rapid iterations, hyper-realism, and cinematic visual impact.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {techStackCategories.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-studio-card border border-white/[0.07] hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-cyan-300 pb-4 border-b border-white/5">
                <Terminal className="w-3.5 h-3.5" />
                <span>{group.category}</span>
              </div>

              <div className="mt-6 space-y-4">
                {group.tools.map((tool, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all group/item"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-heading font-semibold text-white tracking-tight group-hover/item:text-cyan-300 transition-colors">
                        {tool.name}
                      </span>
                      <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/5">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-studio-muted font-normal leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Guarantee */}
        <div className="mt-14 max-w-3xl mx-auto text-center space-y-2">
          <p className="text-xs font-sans text-slate-400">
            Master deliveries rendered in Apple ProRes 422HQ / 4444 or H.265 Master 4K with ACES color space alignment.
          </p>
        </div>

      </div>
    </section>
  );
}

