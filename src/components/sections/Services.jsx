import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, ArrowRight, Box, 
  ShoppingBag, Film, Smartphone, Trees, Layers 
} from 'lucide-react';
import { services } from '../../data/services';
import { contraConfig } from '../../data/contraConfig';

export default function Services() {
  const getServiceIcon = (iconName) => {
    switch (iconName) {
      case 'Box':
        return <Box className="w-5 h-5 text-electric-blue" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-electric-violet" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-cyan-300" />;
      case 'Film':
        return <Film className="w-5 h-5 text-indigo-400" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-sky-400" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-electric-blue" />;
    }
  };

  return (
    <section id="services" className="py-24 sm:py-32 relative bg-studio-bg overflow-hidden">
      {/* Background Lighting Accents */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-electric-violet/6 blur-[170px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[550px] h-[550px] bg-electric-indigo/6 blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-medium text-electric-blue uppercase tracking-widest px-3.5 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creative Capabilities</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-white tracking-tight">
            Studio Services & Capabilities
          </h2>

          <p className="mt-3 text-sm sm:text-base text-studio-muted font-normal leading-relaxed max-w-2xl mx-auto">
            Turnkey visual production solutions combining 3D realism, generative AI power, and broadcast-grade post-production for brands worldwide.
          </p>
        </div>

        {/* 6 Premium Service Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group p-7 sm:p-8 rounded-3xl bg-studio-card border border-white/[0.08] hover:border-electric-indigo/40 transition-all duration-500 hover:shadow-[0_12px_40px_-10px_rgba(99,102,241,0.2)] flex flex-col justify-between relative overflow-hidden"
            >
              {/* Subtle Card Background Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.015] rounded-full blur-2xl group-hover:bg-electric-indigo/10 transition-colors pointer-events-none" />

              <div>
                {/* Header: Icon, Number & Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
                  <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-electric-indigo/30 group-hover:bg-electric-indigo/10 transition-all shadow-inner">
                    {getServiceIcon(service.iconName)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/5">
                      {service.badge}
                    </span>
                    <span className="text-xl font-heading font-bold text-white/20 group-hover:text-electric-blue transition-colors">
                      {service.number}
                    </span>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="mt-5 text-xl font-heading font-semibold text-white group-hover:text-electric-blue transition-colors duration-300 tracking-tight">
                  {service.title}
                </h3>

                {/* Concise Description */}
                <p className="mt-2 text-xs sm:text-sm text-studio-muted font-normal leading-relaxed">
                  {service.description}
                </p>

                {/* Key Deliverables */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-sans font-medium text-slate-400 block uppercase tracking-wider">
                    Deliverables:
                  </span>
                  <ul className="space-y-1.5">
                    {service.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="text-xs text-slate-300 font-normal flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-electric-indigo mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Software Tech Pills & Book Action */}
              <div className="mt-7 pt-5 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {service.software.slice(0, 2).map((sw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-white/[0.03] text-slate-300 border border-white/5"
                    >
                      {sw}
                    </span>
                  ))}
                  {service.software.length > 2 && (
                    <span className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded bg-white/[0.03] text-slate-400">
                      +{service.software.length - 2}
                    </span>
                  )}
                </div>

                <a
                  href="#contact"
                  aria-label={`Inquire about ${service.title} service`}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-electric-blue hover:text-white transition-colors flex-shrink-0 group/link cursor-pointer"
                >
                  <span>Inquire Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner Note */}
        <div className="mt-16 text-center">
          <p className="text-xs font-mono text-slate-400">
            All services include full commercial broadcast usage rights, milestone review loops, and escrow contract protection across all major freelance platforms.
          </p>
        </div>

      </div>
    </section>
  );
}
