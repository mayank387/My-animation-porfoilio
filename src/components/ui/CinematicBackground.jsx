import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CinematicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle luminous dust & studio lighting motes
    const particleCount = Math.min(width < 768 ? 25 : 55, 60);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.2, // Drifting softly upwards
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.4 ? 'rgba(99, 102, 241,' : 'rgba(56, 189, 248,'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating cinematic particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Render particle with soft luminous aura (high performance, no shadowBlur overhead)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Dynamic Animated Gradient Mesh */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[650px] bg-gradient-to-tr from-electric-indigo/20 via-electric-violet/15 to-electric-blue/15 blur-[160px] rounded-full animate-pulse-slow" />
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-electric-blue/10 blur-[150px] rounded-full" />
      <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-electric-violet/12 blur-[170px] rounded-full" />

      {/* Subtle Studio Floor Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Floating 3D Geometric Objects (CSS 3D perspective transforms) */}
      <div className="absolute inset-0 perspective-[1000px] overflow-hidden">
        
        {/* Floating 3D Octahedron / Crystal Diamond (Top Left) */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotateX: [0, 360],
            rotateY: [0, 180, 360],
          }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 24, repeat: Infinity, ease: "linear" },
            rotateY: { duration: 18, repeat: Infinity, ease: "linear" },
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute top-[16%] left-[8%] sm:left-[12%] w-24 h-24 sm:w-32 sm:h-32 opacity-35 hover:opacity-70 transition-opacity"
        >
          <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-electric-blue fill-electric-indigo/10 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <polygon points="50,10 90,50 50,90 10,50" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="50" y1="10" x2="50" y2="90" strokeWidth="0.8" stroke="rgba(255,255,255,0.4)" />
              <line x1="10" y1="50" x2="90" y2="50" strokeWidth="0.8" stroke="rgba(255,255,255,0.4)" />
              <circle cx="50" cy="50" r="3" fill="#38bdf8" />
            </svg>
          </div>
        </motion.div>

        {/* Floating 3D Torus Ring (Top Right) */}
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotateZ: [0, 360],
            rotateX: [65, 55, 65],
          }}
          transition={{
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 32, repeat: Infinity, ease: "linear" },
            rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-[14%] right-[6%] sm:right-[10%] w-36 h-36 sm:w-48 sm:h-48 opacity-30"
        >
          <div className="w-full h-full rounded-full border border-dashed border-electric-violet/40 p-4 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-electric-blue/30 flex items-center justify-center">
              <div className="w-1/2 h-1/2 rounded-full border border-indigo-400/20" />
            </div>
          </div>
        </motion.div>

        {/* Floating 3D Prism / Cube (Mid-Left Background) */}
        <motion.div
          animate={{
            y: [-12, 18, -12],
            rotateX: [20, -20, 20],
            rotateY: [0, 360],
          }}
          transition={{
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 12, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 28, repeat: Infinity, ease: "linear" },
          }}
          className="absolute bottom-[24%] left-[4%] sm:left-[8%] w-20 h-20 sm:w-28 sm:h-28 opacity-25"
        >
          <div className="w-full h-full border border-electric-indigo/40 rounded-2xl bg-electric-indigo/[0.03] backdrop-blur-[2px] transform rotate-45 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.2)]">
            <div className="w-3/4 h-3/4 border border-dashed border-white/20 rounded-xl" />
          </div>
        </motion.div>

        {/* Floating Futuristic Gyro Ring (Bottom Right) */}
        <motion.div
          animate={{
            y: [15, -15, 15],
            rotateX: [45, 135, 45],
            rotateY: [0, 180, 360],
          }}
          transition={{
            y: { duration: 8.5, repeat: Infinity, ease: "easeInOut" },
            rotateX: { duration: 14, repeat: Infinity, ease: "easeInOut" },
            rotateY: { duration: 22, repeat: Infinity, ease: "linear" },
          }}
          className="absolute bottom-[20%] right-[4%] sm:right-[7%] w-28 h-28 sm:w-36 sm:h-36 opacity-30"
        >
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="w-3/4 h-3/4 rounded-full border border-dashed border-purple-400/40" />
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
          </div>
        </motion.div>

      </div>

      {/* HTML5 Canvas Particle Motes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

