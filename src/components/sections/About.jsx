import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ShieldCheck, ArrowUpRight, Film, 
  Cpu, Box 
} from 'lucide-react';
import { contraConfig } from '../../data/contraConfig';

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32 relative bg-studio-surface border-t border-b border-white/[0.08] overflow-hidden">
      {/* Background Lighting Accents */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-electric-indigo/8 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[550px] h-[550px] bg-electric-blue/8 blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          {/* Section Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-electric-blue uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Me</span>
          </div>

          {/* Section Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Creativity Meets{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-electric-indigo to-electric-purple">
              Technology.
            </span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl mx-auto">
            I am a creative video producer specializing in AI-generated animations, cinematic visuals, 3D-inspired product advertisements, and engaging promotional content. My goal is to transform ordinary ideas into visually powerful stories that capture attention.
          </p>

          {/* Core Creative Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 text-left max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:border-electric-indigo/30 transition-colors">
              <div className="flex items-center gap-2.5 text-sm font-heading font-semibold text-electric-blue">
                <Box className="w-4 h-4" />
                <span>3D Motion & Simulation</span>
              </div>
              <p className="text-xs text-studio-muted font-normal leading-relaxed">
                Physically accurate lighting, caustics, macro materials, and fluid physics for tactile commercial realism.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5 hover:border-electric-indigo/30 transition-colors">
              <div className="flex items-center gap-2.5 text-sm font-heading font-semibold text-electric-violet">
                <Cpu className="w-4 h-4" />
                <span>Generative AI Pipelines</span>
              </div>
              <p className="text-xs text-studio-muted font-normal leading-relaxed">
                Harnessing bleeding-edge diffusion models for rapid aesthetic exploration and impossible camera moves.
              </p>
            </div>
          </div>

          {/* Action Row: Hire on Contra & Portfolio Link */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href={contraConfig.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hire Mayank on Contra for AI and 3D Video Production"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-xs font-semibold font-sans bg-gradient-to-r from-electric-indigo via-electric-violet to-electric-blue text-white shadow-electric-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Hire Me on Contra</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#showcase"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-xs font-semibold font-sans bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition-all cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-electric-blue" />
              <span>View Selected Work</span>
            </a>
          </div>

        </motion.div>

      </div>
    </section>
  );
}