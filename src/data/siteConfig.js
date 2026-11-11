/**
 * CENTRALIZED STUDIO & FREELANCE CONFIGURATION
 * 
 * All portfolio CTA buttons, email mailto links, and verified platform links across the website
 * dynamically read from this file.
 */

export const siteConfig = {
  // Official Portfolio Links
  behanceUrl: "https://www.behance.net/mayankkarn3",
  contraUrl: "https://contra.com/Mayankk4rn/work?r=Mayankk4rn",
  profileUrl: "https://contra.com/Mayankk4rn/work?r=Mayankk4rn",

  // Professional Business Email
  email: "mayankk3n@gmail.com",

  // Profile Picture for About section (leave null to show studio director monogram badge)
  profileImage: null,

  // Verified Channels
  socials: [
    {
      name: "Behance",
      url: "https://www.behance.net/mayankkarn3",
      label: "behance.net/mayankkarn3",
      badge: "Creative Portfolio"
    },
    {
      name: "Contra",
      url: "https://contra.com/Mayankk4rn/work?r=Mayankk4rn",
      label: "contra.com/Mayankk4rn",
      badge: "Verified Platform"
    },
    {
      name: "Direct Email",
      url: "mailto:mayankk3n@gmail.com",
      label: "mayankk3n@gmail.com",
      badge: "Direct Contact"
    }
  ],

  artistName: "Mayank",
  roleTitle: "Creative Video Producer & 3D AI Director",
  headline: "Crafting Hyper-Visual 3D & AI Cinematic Commercials for Visionary Brands",
  location: "Worldwide / Remote",
  availability: "Available for Commissions & Commercial Projects",
  responseTime: "Under 24 Hours",
  paymentProtection: "Contracts, Milestone Escrow & Invoicing available across all major freelance platforms & direct client agreements",

  stats: [
    { label: "Pipeline", value: "AI + 3D Hybrid" },
    { label: "Turnaround", value: "3 to 10 Days" },
    { label: "Resolution", value: "4K Cinema / 60 FPS" },
    { label: "Availability", value: "Worldwide / Open" },
  ],

  packages: [
    {
      id: "ai-product-ad",
      title: "Cinematic Product Commercial",
      badge: "Most Popular",
      duration: "15s - 30s",
      aspectRatio: "16:9 / 9:16 / 1:1",
      description: "Photorealistic 3D product rendering blended with dynamic AI camera moves, studio lighting simulations, and high-energy motion design.",
      deliverables: [
        "Concept development & creative storyboard",
        "Photorealistic 3D product simulation & texturing",
        "AI generative cinematic environmental backdrops",
        "Sound design, foley & bespoke soundtrack syncing",
        "Master delivery in 4K UHD + multi-aspect cutdowns"
      ],
      idealFor: "Hardware, Luxury, Tech, Cosmetics, Consumer Brands",
      ctaText: "Start Project"
    },
    {
      id: "ai-3d-narrative",
      title: "AI-Generated 3D Animation",
      badge: "High Concept",
      duration: "30s - 60s",
      aspectRatio: "16:9 Cinema 2.39:1",
      description: "Surreal visual storytelling, futuristic CGI worlds, and complex cinematic sequences generated with bleeding-edge AI models and 3D pipelines.",
      deliverables: [
        "Visual style exploration & moodboard direction",
        "Custom 3D character / environment synthesis",
        "Complex camera choreography & volumetric VFX",
        "Cinematic color grading & DaVinci master export",
        "Full commercial broadcasting rights included"
      ],
      idealFor: "Music Videos, Fashion Films, Web3, Game Teasers",
      ctaText: "Inquire Now"
    },
    {
      id: "viral-reels-pack",
      title: "Creative Viral Reels Pack",
      badge: "High Engagement",
      duration: "3x 10s - 15s",
      aspectRatio: "9:16 Vertical Video",
      description: "Thumb-stopping vertical content optimized for Instagram Reels, TikTok, and YouTube Shorts with rapid pacing and mind-bending visual hooks.",
      deliverables: [
        "3 high-impact vertical short-form edits",
        "Dynamic kinetic typography & visual hooks (first 2s)",
        "Sound effects & trending sonic alignment",
        "Mobile-optimized visual contrast & framing",
        "Ready-to-post deliverables with source project files"
      ],
      idealFor: "Founders, DTC Brands, E-commerce, Creators",
      ctaText: "Book Package"
    }
  ]
};

// Aliases for compatibility
export const freelanceConfig = siteConfig;
export const contraConfig = siteConfig;
