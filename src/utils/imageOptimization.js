/**
 * Image Delivery & Optimization Helper
 * 
 * Provides high-performance WebP delivery for portfolio showcase thumbnails
 * and director showreel poster, reducing network payloads by ~80% while
 * preserving visual quality and 16:9 / 9:16 aspect ratios.
 * 
 * Gracefully falls back to original Supabase storage URLs for new uploads.
 */

// Mapping of project IDs and thumbnail signatures to pre-optimized WebP assets
const OPTIMIZED_THUMBNAILS = {
  // Intro Showreel
  'creator-intro-showreel': '/thumbnails/intro_showreel_poster.webp',
  '1793961085457_px2e4o': '/thumbnails/intro_showreel_poster.webp',

  // Luxury Perfume 3D Animation
  '58afc2c5-221f-4abd-8427-8497b6492037': '/thumbnails/luxury_perfume.webp',
  '1793961055579_3n40mt': '/thumbnails/luxury_perfume.webp',

  // Luxury Jewellery 3D Animation
  'e42ec56e-ae9d-40dd-b20d-38b6ef1131e0': '/thumbnails/luxury_jewellery.webp',
  '1793960780838_pxms7l': '/thumbnails/luxury_jewellery.webp',

  // Rainy Serenity 3D Nature Animation
  '5ccfbbc0-f9d3-460f-a066-9623360157c4': '/thumbnails/rainy_serenity.webp',
  '1793960709158_ip6yh4': '/thumbnails/rainy_serenity.webp',

  // Meta Glasses 3D Cinematic Commercial (9:16 Vertical Reel)
  'e229a50b-8170-45ca-8b9a-bf0e9bf6c37e': '/thumbnails/meta_glasses.webp',
  '1793960536575_rvur5p': '/thumbnails/meta_glasses.webp',

  // BoAt Nirvana Ion ANC 3D Commercial (9:16 Vertical Reel)
  'dbbc5d37-e7de-4608-b236-4a9996d48cea': '/thumbnails/boat_nirvana.webp',
  '1793960635207_ramddl': '/thumbnails/boat_nirvana.webp',
};

/**
 * Returns optimized WebP thumbnail URL if available, otherwise original URL.
 * 
 * @param {string} originalUrl - The remote Supabase URL or local blob URL
 * @param {string} projectId - Project identifier (optional)
 * @returns {string} The optimized image URL
 */
export function getOptimizedThumbnail(originalUrl, projectId = '') {
  if (!originalUrl && !projectId) return '';

  // Check by project ID first
  if (projectId && OPTIMIZED_THUMBNAILS[projectId]) {
    return OPTIMIZED_THUMBNAILS[projectId];
  }

  // Check by filename signature in URL
  if (typeof originalUrl === 'string') {
    for (const [key, optimizedPath] of Object.entries(OPTIMIZED_THUMBNAILS)) {
      if (originalUrl.includes(key)) {
        return optimizedPath;
      }
    }
  }

  return originalUrl || '';
}

/**
 * Dimensions metadata for layout shift (CLS = 0) prevention
 */
export const THUMBNAIL_DIMENSIONS = {
  width: 1376,
  height: 768,
  aspectRatio: '16 / 9'
};
