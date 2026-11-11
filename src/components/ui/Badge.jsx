import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({ children, variant = 'default', className, dot = false }) {
  const variants = {
    default: 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20',
    orange: 'bg-studio-orange/15 text-orange-300 border-studio-orange/40 shadow-[0_0_12px_rgba(255,107,0,0.25)]',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    indigo: 'bg-electric-indigo/10 text-indigo-300 border-electric-indigo/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    cyan: 'bg-electric-cyan/10 text-cyan-300 border-electric-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    violet: 'bg-electric-violet/10 text-violet-300 border-electric-violet/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium font-sans tracking-wide rounded-full border transition-colors',
        variants[variant] || variants.default,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {children}
    </span>
  );
}

