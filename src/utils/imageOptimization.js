/**
 * Image Delivery & Optimization Helper
 * 
 * Provides:
 * 1. Automatic client-side WebP conversion & optimization for all future video uploads.
 * 2. Automatic video frame extraction as optimized WebP poster.
 * 3. High-performance local WebP delivery for the 6 foundational showcase projects.
 * 4. Resilient multi-layer fallback to original JPG/PNG if conversion fails.
 * 5. Layout shift (CLS = 0) dimensions metadata.
 */

export const OPTIMIZED_PROJECT_IMAGES = [
  {
    webpPath: '/thumbnails/intro_showreel_poster.webp',
    ids: ['creator-intro-showreel', 'intro-showreel'],
    titleKeywords: ['intro', 'showreel', 'introduction', 'creative world', 'glimpse'],
    signatures: ['1793961085457', 'px2e4o', 'showreel_frame', 'captured_showreel']
  },
  {
    webpPath: '/thumbnails/luxury_perfume.webp',
    ids: ['58afc2c5-221f-4abd-8427-8497b6492037'],
    titleKeywords: ['perfume', 'essence of elegance'],
    signatures: ['1793961055579', '3n40mt']
  },
  {
    webpPath: '/thumbnails/luxury_jewellery.webp',
    ids: ['e42ec56e-ae9d-40dd-b20d-38b6ef1131e0'],
    titleKeywords: ['jewellery', 'jewelry', 'elegance in every detail'],
    signatures: ['1793960780838', 'pxms7l']
  },
  {
    webpPath: '/thumbnails/rainy_serenity.webp',
    ids: ['5ccfbbc0-f9d3-460f-a066-9623360157c4'],
    titleKeywords: ['rainy serenity', 'rainy', 'beauty of rain', 'nature animation'],
    signatures: ['1793960709158', 'ip6yh4']
  },
  {
    webpPath: '/thumbnails/meta_glasses.webp',
    ids: ['e229a50b-8170-45ca-8b9a-bf0e9bf6c37e'],
    titleKeywords: ['meta glasses', 'smart vision'],
    signatures: ['1793960536575', 'rvur5p']
  },
  {
    webpPath: '/thumbnails/boat_nirvana.webp',
    ids: ['dbbc5d37-e7de-4608-b236-4a9996d48cea'],
    titleKeywords: ['nirvana', 'boat', 'next-level audio'],
    signatures: ['1793960635207', 'ramddl']
  },
  {
    webpPath: '/thumbnails/sneaker_fight.webp',
    ids: ['a1a37843-488e-46c3-9de2-7a8149b45415'],
    titleKeywords: ['sneaker', 'fight', 'power of every step'],
    signatures: ['1794315569687', 'rnuiud']
  }
];

/**
 * Returns optimized WebP thumbnail URL if available, otherwise original URL.
 * 
 * Works for:
 * 1. The 6 foundational portfolio projects (resolving to local WebP).
 * 2. All future uploaded projects (served from Supabase Storage as WebP or original).
 * 
 * @param {string|object} source - Original URL or full project object
 * @param {string} [id=''] - Project identifier
 * @param {string} [title=''] - Project title
 * @returns {string} The optimized local WebP URL or the original URL
 */
export function getOptimizedThumbnail(source, id = '', title = '') {
  let originalUrl = '';
  let targetId = id;
  let targetTitle = title;

  if (typeof source === 'object' && source !== null) {
    originalUrl = source.thumbnail || source.thumbnail_url || source.thumbnailUrl || '';
    targetId = targetId || source.id || '';
    targetTitle = targetTitle || source.title || '';
  } else if (typeof source === 'string') {
    originalUrl = source;
  }

  // 1. Match foundational projects by Project ID
  if (targetId) {
    const byId = OPTIMIZED_PROJECT_IMAGES.find(item => item.ids.includes(targetId));
    if (byId) return byId.webpPath;
  }

  // 2. Match foundational projects by Title keywords
  if (targetTitle) {
    const lowerTitle = targetTitle.toLowerCase();
    const byTitle = OPTIMIZED_PROJECT_IMAGES.find(item => 
      item.titleKeywords.some(kw => lowerTitle.includes(kw))
    );
    if (byTitle) return byTitle.webpPath;
  }

  // 3. Match foundational projects by URL file signature
  if (originalUrl && typeof originalUrl === 'string') {
    const lowerUrl = originalUrl.toLowerCase();
    const bySig = OPTIMIZED_PROJECT_IMAGES.find(item =>
      item.signatures.some(sig => lowerUrl.includes(sig.toLowerCase()))
    );
    if (bySig) return bySig.webpPath;
  }

  // 4. For all future projects: return the URL directly (already WebP from automatic upload pipeline)
  return originalUrl || '';
}

/**
 * Automatically converts an image (File, Blob, or URL) to an optimized WebP File in the browser.
 * Preserves aspect ratio, resizes to high-performance standard bounds, and applies WebP compression.
 * 
 * @param {File|Blob|string} imageSource - The source file, blob, or object URL
 * @param {object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width for 1080p/4K poster displays
 * @param {number} [options.maxHeight=1080] - Maximum height
 * @param {number} [options.quality=0.85] - WebP visual compression quality (0.85 = crisp visual fidelity, ~80% size reduction)
 * @param {string} [options.filename] - Custom output filename
 * @returns {Promise<File|Blob>} Optimized WebP File object (or original file as fallback if conversion fails)
 */
export async function convertImageToWebP(imageSource, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    filename = null
  } = options;

  // SSR / Node environment safeguard
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return imageSource;
  }

  if (!imageSource) return imageSource;

  // If already WebP and size is reasonable (< 350 KB), no re-compression needed
  if (imageSource instanceof File || imageSource instanceof Blob) {
    if (imageSource.type === 'image/webp' && imageSource.size < 350 * 1024) {
      return imageSource;
    }
  }

  try {
    let objectUrl = '';
    let shouldRevoke = false;

    if (imageSource instanceof File || imageSource instanceof Blob) {
      objectUrl = URL.createObjectURL(imageSource);
      shouldRevoke = true;
    } else if (typeof imageSource === 'string') {
      objectUrl = imageSource;
    } else {
      return imageSource;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load for WebP optimization'));
      img.src = objectUrl;
    });

    if (shouldRevoke) {
      URL.revokeObjectURL(objectUrl);
    }

    let { naturalWidth: width, naturalHeight: height } = img;
    if (!width || !height) {
      return imageSource;
    }

    // Downscale only if exceeding maximum dimensions (preserving original aspect ratio)
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) return imageSource;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Export as WebP Blob
    const webpBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
    });

    if (!webpBlob || webpBlob.size === 0) {
      console.warn('Canvas toBlob(image/webp) produced empty result, preserving original file.');
      return imageSource;
    }

    const originalName = (imageSource instanceof File && imageSource.name)
      ? imageSource.name
      : 'thumbnail';
    const cleanBase = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFilename = filename || `${cleanBase}_${Date.now()}.webp`;

    const webpFile = new File([webpBlob], finalFilename, {
      type: 'image/webp',
      lastModified: Date.now()
    });

    return webpFile;
  } catch (err) {
    console.warn('Automatic WebP optimization fallback to original file:', err);
    return imageSource;
  }
}

/**
 * Automatically extracts a representative, high-resolution frame from a video file
 * and converts it directly to an optimized WebP File.
 * 
 * @param {File|Blob} videoFile - Video file object
 * @param {number} [timeFraction=0.15] - Timestamp fraction into video (default: 15% to skip black title cards)
 * @param {object} [options]
 * @returns {Promise<File|null>}
 */
export async function extractVideoThumbnailAsWebP(videoFile, timeFraction = 0.15, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85
  } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  if (!videoFile) return null;

  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const tempUrl = URL.createObjectURL(videoFile);
      video.src = tempUrl;

      const cleanup = () => {
        URL.revokeObjectURL(tempUrl);
        video.src = '';
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, 10000); // 10s timeout safeguard

      video.onloadedmetadata = () => {
        const dur = video.duration || 5;
        const targetTime = Math.max(0.1, Math.min(dur - 0.1, dur * timeFraction));

        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          clearTimeout(timer);
          try {
            let width = video.videoWidth || 1280;
            let height = video.videoHeight || 720;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: true });
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(video, 0, 0, width, height);

            canvas.toBlob((blob) => {
              cleanup();
              if (blob && blob.size > 0) {
                const cleanBase = (videoFile.name || 'video')
                  .replace(/\.[^.]+$/, '')
                  .replace(/[^a-zA-Z0-9_-]/g, '_');
                const file = new File([blob], `${cleanBase}_poster_${Date.now()}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                resolve(file);
              } else {
                resolve(null);
              }
            }, 'image/webp', quality);
          } catch (e) {
            cleanup();
            resolve(null);
          }
        };

        video.addEventListener('seeked', onSeeked);
        video.currentTime = targetTime;
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

/**
 * Checks if a file or URL string is a WebP image.
 */
export function isWebPFile(fileOrUrl) {
  if (!fileOrUrl) return false;
  if (typeof fileOrUrl === 'string') {
    return fileOrUrl.toLowerCase().split('?')[0].endsWith('.webp');
  }
  if (typeof fileOrUrl === 'object') {
    const type = fileOrUrl.type || '';
    const name = fileOrUrl.name || '';
    return type === 'image/webp' || name.toLowerCase().endsWith('.webp');
  }
  return false;
}

/**
 * Dimensions metadata for layout shift (CLS = 0) prevention
 */
export const THUMBNAIL_DIMENSIONS = {
  width: 1376,
  height: 768,
  aspectRatio: '16 / 9'
};
