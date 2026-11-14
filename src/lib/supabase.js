import { createClient } from '@supabase/supabase-js';
import { projectCategories } from '../data/projects.js';
import { getOptimizedThumbnail, convertImageToWebP } from '../utils/imageOptimization.js';

// Read environment variables (supports Vite browser runtime & test environments)
const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '');
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '');

// Exact storage bucket names configured in Supabase
export const BUCKET_VIDEOS = 'videos';
export const BUCKET_THUMBNAILS = 'thumbnail';
export const VIDEO_BUCKETS = ['videos', 'portfolio-videos', 'video'];
export const THUMBNAIL_BUCKETS = ['thumbnail', 'thumbnails', 'images'];

// Check if credentials exist and are not placeholder strings
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project-id.supabase.co' && 
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('https://')
  );
};

// Initialize Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    })
  : null;

/* -------------------------------------------------------------------------- */
/* INDEXEDDB LOCAL STORAGE ENGINE (PERSISTENCE WHEN OFFLINE / BEFORE SUPABASE) */
/* -------------------------------------------------------------------------- */
// Provides full persistence for uploaded videos and images without touching
// localStorage or sessionStorage (which have 5MB limits and crash on binary files).

const DB_NAME = 'mayank_portfolio_db';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_MEDIA = 'media_blobs';
const STORE_SETTINGS = 'site_settings';

let idbPromise = null;

function openLocalDatabase() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => {
      console.warn('IndexedDB failed to open:', event.target.error);
      resolve(null);
    };
  });

  return idbPromise;
}

// Save binary blob (File/Blob) to IndexedDB
async function saveMediaBlob(id, blob, mimeType) {
  const db = await openLocalDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      store.put({ id, blob, mimeType, createdAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (err) {
      console.warn('Failed to save blob to IndexedDB:', err);
      resolve(false);
    }
  });
}

// Retrieve binary blob from IndexedDB
async function getMediaBlob(id) {
  const db = await openLocalDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Delete media blob from IndexedDB
async function deleteMediaBlob(id) {
  const db = await openLocalDatabase();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_MEDIA, 'readwrite');
    tx.objectStore(STORE_MEDIA).delete(id);
  } catch {}
}

// Save site setting in IndexedDB
async function saveLocalSetting(key, data) {
  const db = await openLocalDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key, ...data });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Get site setting from IndexedDB
async function getLocalSetting(key) {
  const db = await openLocalDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Delete site setting from IndexedDB
async function deleteLocalSetting(key) {
  const db = await openLocalDatabase();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    tx.objectStore(STORE_SETTINGS).delete(key);
  } catch {}
}

// Cache of active object URLs for local media blobs
const activeObjectUrls = new Map();

function getOrCreateObjectUrl(blobKey, blob) {
  if (!blob) return '';
  if (activeObjectUrls.has(blobKey)) {
    return activeObjectUrls.get(blobKey);
  }
  const url = URL.createObjectURL(blob);
  activeObjectUrls.set(blobKey, url);
  return url;
}

// Get all local projects from IndexedDB
async function getLocalProjects() {
  const db = await openLocalDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();

      req.onsuccess = async () => {
        const rawProjects = req.result || [];
        // Rehydrate blobs into valid object URLs
        const hydrated = await Promise.all(
          rawProjects.map(async (p) => {
            let finalVideoUrl = p.videoUrl;
            let finalThumbUrl = p.thumbnail;

            if (p.localVideoBlobId) {
              const vBlob = await getMediaBlob(p.localVideoBlobId);
              if (vBlob) {
                finalVideoUrl = getOrCreateObjectUrl(p.localVideoBlobId, vBlob);
              }
            }

            if (p.localThumbBlobId) {
              const tBlob = await getMediaBlob(p.localThumbBlobId);
              if (tBlob) {
                finalThumbUrl = getOrCreateObjectUrl(p.localThumbBlobId, tBlob);
              }
            }

            const optimizedThumb = getOptimizedThumbnail(finalThumbUrl, p.id, p.title);
            const activeThumb = optimizedThumb || finalThumbUrl;

            return {
              ...p,
              videoUrl: finalVideoUrl,
              thumbnail: activeThumb,
              thumbnailUrl: activeThumb,
              originalThumbnail: finalThumbUrl
            };
          })
        );
        resolve(hydrated);
      };

      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// Save project to IndexedDB
async function saveLocalProject(project) {
  const db = await openLocalDatabase();
  if (!db) return;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.put(project);
      tx.oncomplete = () => resolve(project);
      tx.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

// Delete project from IndexedDB
async function removeLocalProject(id) {
  const db = await openLocalDatabase();
  if (!db) return;

  try {
    const tx = db.transaction([STORE_PROJECTS, STORE_MEDIA], 'readwrite');
    const projectStore = tx.objectStore(STORE_PROJECTS);
    const mediaStore = tx.objectStore(STORE_MEDIA);

    const getReq = projectStore.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item?.localVideoBlobId) mediaStore.delete(item.localVideoBlobId);
      if (item?.localThumbBlobId) mediaStore.delete(item.localThumbBlobId);
      projectStore.delete(id);
    };
  } catch {}
}

/* -------------------------------------------------------------------------- */
/* MEDIA URL RESILIENCE & PLAYABILITY RESOLVER                                */
/* -------------------------------------------------------------------------- */

// In-memory + persistent localStorage cache for resolved media URLs to minimize network calls
const resolvedMediaCache = new Map();
const STORAGE_CACHE_PREFIX = 'mayank_signed_media_';

function getCachedSignedUrl(url) {
  if (resolvedMediaCache.has(url)) return resolvedMediaCache.get(url);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_CACHE_PREFIX + url);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Valid for up to 1 year before re-checking
        if (parsed.exp && parsed.exp > Date.now() && parsed.signedUrl) {
          resolvedMediaCache.set(url, parsed.signedUrl);
          return parsed.signedUrl;
        }
      }
    }
  } catch {}
  return null;
}

function setCachedSignedUrl(url, signedUrl) {
  if (!url || !signedUrl) return;
  resolvedMediaCache.set(url, signedUrl);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        STORAGE_CACHE_PREFIX + url,
        JSON.stringify({
          signedUrl,
          exp: Date.now() + 30 * 24 * 3600 * 1000 // 30-day client cache validity
        })
      );
    }
  } catch {}
}

/**
 * Resolves a Supabase Storage media URL into an immediately playable / viewable URL.
 * If the storage bucket is private (which causes 404/NoSuchBucket on unauthenticated CDN requests),
 * this function transparently requests a 10-year signed URL via the official Supabase Storage API.
 * This guarantees that uploaded videos and posters stream instantly in all browsers without permission errors.
 *
 * @param {string} url - Original media URL
 * @param {number} expiresIn - Expiry in seconds (defaults to 10 years = 315360000s)
 * @returns {Promise<string>} Playable URL
 */
export async function resolvePlayableUrl(url, expiresIn = 315360000) {
  if (!url || typeof url !== 'string') return url;
  if (!supabase) return url;

  // If already a local blob, data URL, or signed URL with active token, return immediately
  if (url.startsWith('blob:') || url.startsWith('data:') || url.includes('/storage/v1/object/sign/')) {
    return url;
  }

  // Return cached result if available
  const cached = getCachedSignedUrl(url);
  if (cached) {
    return cached;
  }

  // Match /storage/v1/object/(public|authenticated)?/<bucket>/<path>
  const match = url.match(/\/storage\/v1\/object\/(?:public|authenticated)?\/?([^/]+)\/(.+)$/);
  if (!match) {
    return url;
  }

  const bucket = match[1];
  const rawPath = match[2].split('?')[0].split('#')[0];
  const filePath = decodeURIComponent(rawPath);

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (!error && data?.signedUrl) {
      setCachedSignedUrl(url, data.signedUrl);
      return data.signedUrl;
    }
  } catch (err) {
    console.warn(`Could not create signed URL for ${bucket}/${filePath}:`, err);
  }

  // Fallback to original URL
  return url;
}

/* -------------------------------------------------------------------------- */
/* PROJECT RETRIEVAL (SUPABASE + LOCAL PERSISTENCE + DEFAULTS)                */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all projects.
 * @param {boolean} includeDrafts - If true, returns both published and draft projects (for admin).
 *                                  If false, returns only published projects (for public gallery).
 */
export async function getProjects(includeDrafts = false) {
  let cloudProjects = [];
  let localProjects = [];

  // 1. Fetch from Supabase Cloud if configured
  if (supabase) {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!includeDrafts) {
        query = query.or('status.eq.published,status.is.null');
      }

      let { data, error } = await query;

      // Graceful schema fallback: if display_order column doesn't exist yet in Supabase
      if (error && (error.code === '42703' || error.message?.includes('display_order'))) {
        console.warn('Column projects.display_order not found in Supabase schema. Falling back to created_at ordering. Please run the SQL migration script.');
        let fallbackQuery = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (!includeDrafts) {
          fallbackQuery = fallbackQuery.or('status.eq.published,status.is.null');
        }

        const fallbackRes = await fallbackQuery;
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && Array.isArray(data)) {
        const rawCloudProjects = data
          .filter((item) => item.category !== 'intro-showreel' && item.id !== 'creator-intro-showreel');

        cloudProjects = await Promise.all(
          rawCloudProjects.map(async (item) => {
            const resolvedVideoUrl = await resolvePlayableUrl(item.video_url);
            const resolvedThumbnail = await resolvePlayableUrl(item.thumbnail_url);
            const optimizedThumbnail = getOptimizedThumbnail(resolvedThumbnail || item.thumbnail_url, item.id, item.title);
            const activeThumbnail = optimizedThumbnail || resolvedThumbnail || '';
            return {
              id: item.id,
              title: item.title,
              description: item.description || item.tagline || item.concept || '',
              category: item.category,
              categoryLabel: item.category_label || item.category,
              specType: item.spec_type || 'Original Work',
              duration: item.duration || '0:20',
              aspectRatio: item.aspect_ratio || '16:9',
              featured: Boolean(item.featured),
              status: item.status || 'published',
              displayOrder: typeof item.display_order === 'number' 
                ? item.display_order 
                : (item.display_order ? parseInt(item.display_order, 10) : 999),
              thumbnail: activeThumbnail,
              thumbnailUrl: activeThumbnail,
              originalThumbnail: resolvedThumbnail || '',
              videoUrl: resolvedVideoUrl,
              tagline: item.tagline || item.description || '',
              concept: item.concept || item.description || '',
              tools: Array.isArray(item.tools) 
                ? item.tools 
                : (item.tools ? (typeof item.tools === 'string' ? JSON.parse(item.tools) : item.tools) : []),
              highlights: Array.isArray(item.highlights) 
                ? item.highlights 
                : (item.highlights ? (typeof item.highlights === 'string' ? JSON.parse(item.highlights) : item.highlights) : []),
              disclaimer: item.disclaimer || 'Original production work.',
              createdAt: item.created_at,
              isCloud: true
            };
          })
        );
      } else if (error) {
        console.warn('Supabase projects query returned error:', error.message);
      }
    } catch (err) {
      console.warn('Failed to fetch from Supabase:', err);
    }
  }

  // 2. Fetch from Local IndexedDB
  try {
    const rawLocal = await getLocalProjects();
    const filteredLocal = (includeDrafts 
      ? rawLocal 
      : rawLocal.filter(p => p.status === 'published' || !p.status)
    ).filter(p => p.category !== 'intro-showreel' && p.id !== 'creator-intro-showreel');
    localProjects = filteredLocal;
  } catch (err) {
    console.warn('Failed to read local IndexedDB projects:', err);
  }

  // 3. Only return original uploaded projects (Cloud + Local).
  // Zero fake or sample projects are injected.
  const userProjects = [...cloudProjects, ...localProjects];
  return userProjects;
}

/* -------------------------------------------------------------------------- */
/* FILE VALIDATION                                                            */
/* -------------------------------------------------------------------------- */

export function validateUploadFile(file, mediaKind = 'video') {
  if (!file) {
    throw new Error('No file selected.');
  }

  const isVideo = mediaKind === 'video' || mediaKind.includes('video');

  if (isVideo) {
    const validVideoTypes = [
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'
    ];
    const validExts = ['.mp4', '.webm', '.mov', '.mkv', '.ogv'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));
    const hasValidType = validVideoTypes.includes(file.type) || file.type.startsWith('video/');

    if (!hasValidExt && !hasValidType) {
      throw new Error(`Invalid video format (${file.type || 'unknown'}). Please upload an MP4, WebM, or MOV video file.`);
    }

    const maxVideoSize = 250 * 1024 * 1024; // 250MB
    if (file.size > maxVideoSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`Video file is too large (${sizeMb} MB). Maximum allowed size is 250 MB.`);
    }
  } else {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExts.some(ext => fileName.endsWith(ext));
    const hasValidType = validImageTypes.includes(file.type) || file.type.startsWith('image/');

    if (!hasValidExt && !hasValidType) {
      throw new Error(`Invalid image format (${file.type || 'unknown'}). Please upload a JPG, PNG, or WebP image.`);
    }

    const maxImageSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxImageSize) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`Thumbnail image is too large (${sizeMb} MB). Maximum allowed size is 25 MB.`);
    }
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* SUPABASE STORAGE UPLOADS (DIRECT STREAMING + PROGRESS TRACKING)             */
/* -------------------------------------------------------------------------- */

/**
 * Helper to detect bucket-not-found errors across both SDK and XHR responses.
 */
function isBucketNotFoundError(err) {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return (
    msg.includes('bucket not found') ||
    (msg.includes('not found') && msg.includes('bucket')) ||
    err.status === 404 ||
    err.statusCode === '404' ||
    err.statusCode === 404
  );
}

/**
 * Fallback upload using official @supabase/storage-js SDK.
 * Guaranteed to format requests exactly as Supabase Storage server expects.
 */
async function uploadViaSdk(file, bucketName, filePath, onProgress) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type || (filePath.endsWith('.webp') ? 'image/webp' : undefined),
      upsert: true
    });

  if (error) {
    const err = new Error(error.message || `Upload failed to bucket '${bucketName}' via Supabase Storage SDK.`);
    err.status = error.status || error.statusCode;
    err.original = error;
    throw err;
  }

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  let finalUrl = publicData.publicUrl;

  // Immediately generate 10-year signed URL to ensure instant playback even if bucket is private
  try {
    const { data: signData } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 315360000);
    if (signData?.signedUrl) {
      finalUrl = signData.signedUrl;
      setCachedSignedUrl(publicData.publicUrl, signData.signedUrl);
      setCachedSignedUrl(finalUrl, finalUrl);
    }
  } catch (signErr) {
    console.warn(`Could not create signed URL for ${bucketName}/${filePath}:`, signErr);
  }

  if (typeof onProgress === 'function') onProgress(100, file.size, file.size);
  return finalUrl;
}

/**
 * Standard streaming upload via XMLHttpRequest with real-time byte tracking.
 * Formats payload as multipart/form-data, matching Supabase Storage specifications.
 */
function uploadViaXhr(file, bucketName, filePath, token, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;

    xhr.open('POST', uploadUrl, true);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-upsert', 'true');
    // Note: Never set 'Content-Type' header manually when sending FormData;
    // the browser will automatically add 'multipart/form-data; boundary=...'.

    const formData = new FormData();
    formData.append('cacheControl', '3600');
    formData.append('', file, filePath);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        onProgress(percent, event.loaded, event.total);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        let finalUrl = data.publicUrl;

        // Immediately generate 10-year signed URL to guarantee instant playback in all browsers
        try {
          const { data: signData } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 315360000);
          if (signData?.signedUrl) {
            finalUrl = signData.signedUrl;
            setCachedSignedUrl(data.publicUrl, signData.signedUrl);
            setCachedSignedUrl(finalUrl, finalUrl);
          }
        } catch (signErr) {
          console.warn(`Could not create signed URL for ${bucketName}/${filePath}:`, signErr);
        }

        if (typeof onProgress === 'function') onProgress(100, file.size, file.size);
        resolve(finalUrl);
      } else {
        let msg = `Storage upload failed with HTTP status ${xhr.status}`;
        try {
          const errRes = JSON.parse(xhr.responseText);
          msg = errRes.message || errRes.error || msg;
        } catch {}
        const err = new Error(msg);
        err.status = xhr.status;
        reject(err);
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during media upload. Please check your Supabase connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Master Upload Function
 * Uploads media to the exact Supabase Storage buckets:
 *   - 'videos' for video files (MP4, WebM, MOV)
 *   - 'thumbnail' for poster images (JPG, PNG, WebP)
 * Includes intelligent multi-bucket fallback and clear error reporting.
 *
 * @param {File|Blob} file
 * @param {'video'|'thumbnail'} mediaKind
 * @param {function} onProgress - (percent, loadedBytes, totalBytes) => void
 * @returns {Promise<string>} Public CDN URL
 */
export async function uploadMedia(file, mediaKind = 'video', onProgress) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }

  // Permanent Automatic WebP Optimization for all thumbnail uploads
  let fileToUpload = file;
  if (mediaKind === 'thumbnail' || mediaKind.includes('thumb')) {
    try {
      fileToUpload = await convertImageToWebP(file, { quality: 0.85, maxWidth: 1920, maxHeight: 1080 });
    } catch (optErr) {
      console.warn('Automatic WebP optimization fallback to original file:', optErr);
      fileToUpload = file;
    }
  }

  // Validate format and size on the actual file to upload
  validateUploadFile(fileToUpload, mediaKind);

  // Exact bucket candidates with primary first
  const primaryBucket = mediaKind === 'video' ? BUCKET_VIDEOS : BUCKET_THUMBNAILS;
  const candidateBuckets = mediaKind === 'video'
    ? [BUCKET_VIDEOS, 'portfolio-videos', 'video']
    : [BUCKET_THUMBNAILS, 'thumbnails', 'images'];

  // Generate unique collision-free filename
  const cleanBase = (fileToUpload.name || `file_${Date.now()}`)
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
  const fileExt = cleanBase.split('.').pop() || (mediaKind === 'video' ? 'mp4' : 'webp');
  const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  // Get active session token
  let token = supabaseAnonKey;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      token = sessionData.session.access_token;
    }
  } catch (err) {
    console.warn('Could not read session token, using anon key:', err);
  }

  let lastError = null;

  for (const bucketName of candidateBuckets) {
    try {
      // 1. Attempt streaming XHR upload with progress tracking
      try {
        return await uploadViaXhr(fileToUpload, bucketName, filePath, token, onProgress);
      } catch (xhrErr) {
        if (isBucketNotFoundError(xhrErr)) {
          throw xhrErr;
        }
        console.warn(`XHR upload to bucket '${bucketName}' failed (${xhrErr.message}). Retrying via Supabase SDK...`);
        // 2. Reliable fallback: official Supabase Storage SDK upload
        return await uploadViaSdk(fileToUpload, bucketName, filePath, onProgress);
      }
    } catch (err) {
      lastError = err;
      if (isBucketNotFoundError(err)) {
        console.warn(`Bucket '${bucketName}' not found in Supabase Storage. Trying next bucket candidate...`);
        continue;
      }
      // If error is not "Bucket not found" (e.g. invalid file, RLS policy rejection, network), throw immediately
      throw err;
    }
  }

  // If all candidate buckets were not found
  throw new Error(
    `Bucket not found: Storage bucket '${primaryBucket}' does not exist in your Supabase project. Please open your Supabase SQL Editor and run the migration script provided in DATABASE_SETUP.md to automatically create the '${BUCKET_VIDEOS}' and '${BUCKET_THUMBNAILS}' buckets with public access.`
  );
}

/**
 * Remove file from Supabase storage if it was stored there.
 */
export async function deleteStorageFileIfOwned(url, mediaKind = 'video') {
  if (!supabase || !url) return;
  try {
    const bucketCandidates = mediaKind === 'video' 
      ? [BUCKET_VIDEOS, 'portfolio-videos', 'video'] 
      : [BUCKET_THUMBNAILS, 'thumbnails', 'images'];

    for (const bucket of bucketCandidates) {
      const prefixes = [
        `/storage/v1/object/public/${bucket}/`,
        `/storage/v1/object/sign/${bucket}/`,
        `/storage/v1/object/${bucket}/`
      ];

      for (const prefix of prefixes) {
        if (url.includes(prefix)) {
          const parts = url.split(prefix);
          if (parts[1]) {
            const rawPath = parts[1].split('?')[0]; // strip ?token=... query params
            const filePath = decodeURIComponent(rawPath);
            await supabase.storage.from(bucket).remove([filePath]);
            return;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Could not delete storage file ${url}:`, err);
  }
}

/* -------------------------------------------------------------------------- */
/* CRUD PROJECT OPERATIONS (CLOUD + LOCAL FALLBACK)                           */
/* -------------------------------------------------------------------------- */

/**
 * Create a new project.
 * If Supabase is configured, inserts into PostgreSQL public.projects table.
 * If offline / unconfigured, stores securely in IndexedDB with persistent binary blobs.
 */
export async function createProject(project, rawFiles = {}) {
  const { videoFile, thumbFile } = rawFiles;

  // Mode 1: Cloud Supabase Mode
  if (supabase) {
    let finalVideoUrl = project.videoUrl;
    let finalThumbUrl = project.thumbnail;

    if (!finalVideoUrl && videoFile) {
      finalVideoUrl = await uploadMedia(videoFile, 'video');
    }
    if (thumbFile && (!finalThumbUrl || finalThumbUrl.startsWith('blob:') || finalThumbUrl.startsWith('data:'))) {
      finalThumbUrl = await uploadMedia(thumbFile, 'thumbnail');
    }

    const safeDisplayOrder = Math.max(1, parseInt(project.displayOrder || project.display_order, 10) || 1);
    const payload = {
      title: project.title,
      description: project.description || project.tagline || '',
      category: project.category,
      category_label: project.categoryLabel || project.category,
      spec_type: project.specType || 'Portfolio Concept',
      duration: project.duration || '0:20',
      aspect_ratio: project.aspectRatio || '16:9',
      display_order: safeDisplayOrder,
      featured: Boolean(project.featured),
      status: project.status || 'published',
      thumbnail_url: finalThumbUrl || project.thumbnail,
      video_url: finalVideoUrl || project.videoUrl,
      tagline: project.tagline || project.description || '',
      concept: project.concept || project.description || '',
      tools: Array.isArray(project.tools) ? project.tools : [],
      highlights: Array.isArray(project.highlights) ? project.highlights : [],
      disclaimer: project.disclaimer || 'Portfolio concept demonstration.'
    };

    let { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();

    // Fallback if display_order column does not exist yet in Supabase
    if (error && (error.code === '42703' || error.message?.includes('display_order'))) {
      console.warn('display_order column missing in Supabase, retrying insert without display_order...');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.display_order;
      const retry = await supabase
        .from('projects')
        .insert([fallbackPayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Mode 2: Local Persistent Mode (IndexedDB)
  const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  let localVideoBlobId = null;
  let localThumbBlobId = null;
  let persistentVideoUrl = project.videoUrl;
  let persistentThumbUrl = project.thumbnail;

  if (videoFile) {
    localVideoBlobId = `video-${localId}`;
    await saveMediaBlob(localVideoBlobId, videoFile, videoFile.type || 'video/mp4');
    persistentVideoUrl = getOrCreateObjectUrl(localVideoBlobId, videoFile);
  }

  if (thumbFile) {
    localThumbBlobId = `thumb-${localId}`;
    await saveMediaBlob(localThumbBlobId, thumbFile, thumbFile.type || 'image/jpeg');
    persistentThumbUrl = getOrCreateObjectUrl(localThumbBlobId, thumbFile);
  }

  const safeDisplayOrder = Math.max(1, parseInt(project.displayOrder || project.display_order, 10) || 1);
  const localProject = {
    ...project,
    id: localId,
    displayOrder: safeDisplayOrder,
    videoUrl: persistentVideoUrl,
    thumbnail: persistentThumbUrl,
    localVideoBlobId,
    localThumbBlobId,
    status: project.status || 'published',
    createdAt: new Date().toISOString(),
    isLocal: true
  };

  await saveLocalProject(localProject);
  return localProject;
}

/**
 * Update an existing project in cloud database or local IndexedDB.
 */
export async function updateProject(id, project, rawFiles = {}) {
  const { videoFile, thumbFile } = rawFiles;

  // Cloud update
  if (supabase && !id.startsWith('local-')) {
    let finalVideoUrl = project.videoUrl || project.video_url;
    let finalThumbUrl = project.thumbnail || project.thumbnail_url;

    if (videoFile && (!finalVideoUrl || finalVideoUrl.startsWith('blob:') || finalVideoUrl.startsWith('data:'))) {
      finalVideoUrl = await uploadMedia(videoFile, 'video');
    }
    if (thumbFile && (!finalThumbUrl || finalThumbUrl.startsWith('blob:') || finalThumbUrl.startsWith('data:'))) {
      finalThumbUrl = await uploadMedia(thumbFile, 'thumbnail');
    }

    const safeDisplayOrder = Math.max(1, parseInt(project.displayOrder || project.display_order, 10) || 1);
    const payload = {
      title: project.title,
      description: project.description || project.tagline || '',
      category: project.category,
      category_label: project.categoryLabel || project.category_label || project.category,
      spec_type: project.specType || project.spec_type || 'Original Work',
      duration: project.duration || '0:20',
      aspect_ratio: project.aspectRatio || project.aspect_ratio || '16:9',
      display_order: safeDisplayOrder,
      featured: Boolean(project.featured),
      status: project.status || 'published',
      thumbnail_url: finalThumbUrl || project.thumbnail || project.thumbnail_url,
      video_url: finalVideoUrl || project.videoUrl || project.video_url,
      tagline: project.tagline || project.description || '',
      concept: project.concept || project.description || '',
      tools: Array.isArray(project.tools)
        ? project.tools
        : (typeof project.tools === 'string'
          ? (project.tools.trim().startsWith('[') ? JSON.parse(project.tools) : project.tools.split(',').map(s => s.trim()).filter(Boolean))
          : []),
      highlights: Array.isArray(project.highlights)
        ? project.highlights
        : (typeof project.highlights === 'string'
          ? (project.highlights.trim().startsWith('[') ? JSON.parse(project.highlights) : project.highlights.split(',').map(s => s.trim()).filter(Boolean))
          : []),
      disclaimer: project.disclaimer || 'Portfolio showcase project.'
    };

    let { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    // Fallback if display_order column does not exist yet in Supabase
    if (error && (error.code === '42703' || error.message?.includes('display_order'))) {
      console.warn('display_order column missing in Supabase, retrying update without display_order...');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.display_order;
      const retry = await supabase
        .from('projects')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  // Local update
  let updatedVideoUrl = project.videoUrl;
  let updatedThumbUrl = project.thumbnail;

  if (videoFile) {
    const videoBlobId = project.localVideoBlobId || `video-${id}`;
    await saveMediaBlob(videoBlobId, videoFile, videoFile.type || 'video/mp4');
    updatedVideoUrl = getOrCreateObjectUrl(videoBlobId, videoFile);
  }

  if (thumbFile) {
    const thumbBlobId = project.localThumbBlobId || `thumb-${id}`;
    await saveMediaBlob(thumbBlobId, thumbFile, thumbFile.type || 'image/jpeg');
    updatedThumbUrl = getOrCreateObjectUrl(thumbBlobId, thumbFile);
  }

  const safeDisplayOrder = Math.max(1, parseInt(project.displayOrder || project.display_order, 10) || 1);
  const updatedRecord = {
    ...project,
    id,
    displayOrder: safeDisplayOrder,
    videoUrl: updatedVideoUrl,
    thumbnail: updatedThumbUrl,
    status: project.status || 'published',
    updatedAt: new Date().toISOString()
  };

  await saveLocalProject(updatedRecord);
  return updatedRecord;
}

/**
 * Fast Update for Video Display Order (Cloud Supabase + Local IndexedDB)
 * Allows instantly setting project order (e.g. Video C = 1, Video A = 2).
 */
export async function updateProjectDisplayOrder(id, newOrder) {
  const safeOrder = Math.max(1, parseInt(newOrder, 10) || 1);

  if (supabase && !String(id).startsWith('local-')) {
    const { error } = await supabase
      .from('projects')
      .update({ display_order: safeOrder })
      .eq('id', id);

    if (error) {
      if (error.code === '42703' || error.message?.includes('display_order')) {
        console.warn('Cannot update display_order because column does not exist yet in Supabase. Please run the SQL migration script.');
        return false;
      }
      throw new Error(`Failed to update display index: ${error.message}`);
    }
    return true;
  }

  // Local IndexedDB update
  const db = await openLocalDatabase();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.get(id);

      req.onsuccess = () => {
        const item = req.result;
        if (item) {
          item.displayOrder = safeOrder;
          item.updatedAt = new Date().toISOString();
          store.put(item);
          resolve(true);
        } else {
          resolve(false);
        }
      };

      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Delete a project. Removes database record and cleans up cloud/local media.
 */
export async function deleteProject(id, media = {}) {
  // Cloud delete
  if (supabase && !id.startsWith('local-')) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Delete error: ${error.message}`);
    }

    if (media?.videoUrl) {
      deleteStorageFileIfOwned(media.videoUrl, 'video');
    }
    if (media?.thumbnail) {
      deleteStorageFileIfOwned(media.thumbnail, 'thumbnail');
    }

    return true;
  }

  // Local delete
  await removeLocalProject(id);
  return true;
}

/* -------------------------------------------------------------------------- */
/* CREATOR INTRO SHOWREEL MANAGEMENT                                         */
/* -------------------------------------------------------------------------- */

export async function getIntroVideo() {
  // 1. Supabase Cloud Check
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or('id.eq.creator-intro-showreel,category.eq.intro-showreel')
        .order('created_at', { ascending: false })
        .limit(1);

      const record = Array.isArray(data) ? data[0] : null;

      if (!error && record && record.video_url) {
        const resolvedVideoUrl = await resolvePlayableUrl(record.video_url);
        const resolvedThumbnail = await resolvePlayableUrl(record.thumbnail_url);
        const optimizedThumbnail = getOptimizedThumbnail(resolvedThumbnail || record.thumbnail_url, 'creator-intro-showreel', record.title) || '/thumbnails/intro_showreel_poster.webp';
        const activeThumbnail = optimizedThumbnail || '/thumbnails/intro_showreel_poster.webp';
        return {
          id: record.id,
          title: record.title || 'A GLIMPSE INTO MY CREATIVE WORLD.',
          description: record.description || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.',
          aspectRatio: record.aspect_ratio || '16:9',
          duration: record.duration || '0:30',
          videoUrl: resolvedVideoUrl,
          thumbnail: activeThumbnail,
          thumbnailUrl: activeThumbnail,
          originalThumbnail: resolvedThumbnail || '',
          updatedAt: record.created_at,
          isCloud: true
        };
      }
    } catch (err) {
      console.warn('Failed to query intro showreel from Supabase:', err);
    }
  }

  // 2. Local IndexedDB Fallback Check
  try {
    const local = await getLocalSetting('intro_video');
    if (local && (local.videoUrl || local.localVideoBlobId)) {
      let finalVideoUrl = local.videoUrl;
      let finalThumbUrl = local.thumbnail;

      if (local.localVideoBlobId) {
        const vBlob = await getMediaBlob(local.localVideoBlobId);
        if (vBlob) {
          finalVideoUrl = getOrCreateObjectUrl(local.localVideoBlobId, vBlob);
        }
      }

      if (local.localThumbBlobId) {
        const tBlob = await getMediaBlob(local.localThumbBlobId);
        if (tBlob) {
          finalThumbUrl = getOrCreateObjectUrl(local.localThumbBlobId, tBlob);
        }
      }

      return {
        ...local,
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbUrl,
        thumbnailUrl: finalThumbUrl,
        isLocal: true
      };
    }
  } catch (err) {
    console.warn('Failed to read local intro video:', err);
  }

  return null;
}

export async function saveIntroVideo(metadata, rawFiles = {}, onProgress) {
  const { videoFile, thumbFile } = rawFiles;
  let finalVideoUrl = metadata.videoUrl || '';
  let finalThumbUrl = metadata.thumbnail || '';

  // Mode 1: Supabase Cloud Storage
  if (supabase) {
    if (videoFile) {
      finalVideoUrl = await uploadMedia(videoFile, 'video', (pct, loaded, total) => {
        if (onProgress) onProgress(Math.round(pct * 0.75), loaded, total);
      });
    }

    if (thumbFile) {
      finalThumbUrl = await uploadMedia(thumbFile, 'thumbnail', (pct, loaded, total) => {
        if (onProgress) onProgress(75 + Math.round(pct * 0.2), loaded, total);
      });
    }

    if (onProgress) onProgress(98, 0, 0);

    const payload = {
      id: 'creator-intro-showreel',
      title: metadata.title || 'A GLIMPSE INTO MY CREATIVE WORLD.',
      description: metadata.description || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.',
      category: 'intro-showreel',
      category_label: 'Creator Showreel',
      spec_type: 'Showreel',
      duration: metadata.duration || '0:30',
      aspect_ratio: metadata.aspectRatio || '16:9',
      display_order: 0,
      status: 'published',
      featured: true,
      video_url: finalVideoUrl,
      thumbnail_url: finalThumbUrl,
      tools: [],
      highlights: [],
      created_at: new Date().toISOString()
    };

    let { data, error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    // Fallback if display_order column does not exist yet in Supabase
    if (error && (error.code === '42703' || error.message?.includes('display_order'))) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.display_order;
      const retry = await supabase
        .from('projects')
        .upsert(fallbackPayload, { onConflict: 'id' })
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(`Database error saving intro video: ${error.message}`);
    }

    if (onProgress) onProgress(100, 0, 0);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      aspectRatio: data.aspect_ratio,
      videoUrl: data.video_url,
      thumbnail: data.thumbnail_url,
      thumbnailUrl: data.thumbnail_url,
      isCloud: true
    };
  }

  // Mode 2: Local Persistent Mode (IndexedDB)
  let localVideoBlobId = metadata.localVideoBlobId || null;
  let localThumbBlobId = metadata.localThumbBlobId || null;

  if (videoFile) {
    localVideoBlobId = `video-intro-${Date.now()}`;
    await saveMediaBlob(localVideoBlobId, videoFile, videoFile.type || 'video/mp4');
    finalVideoUrl = getOrCreateObjectUrl(localVideoBlobId, videoFile);
  }

  if (thumbFile) {
    localThumbBlobId = `thumb-intro-${Date.now()}`;
    await saveMediaBlob(localThumbBlobId, thumbFile, thumbFile.type || 'image/jpeg');
    finalThumbUrl = getOrCreateObjectUrl(localThumbBlobId, thumbFile);
  }

  const record = {
    key: 'intro_video',
    id: 'creator-intro-showreel',
    title: metadata.title || 'A GLIMPSE INTO MY CREATIVE WORLD.',
    description: metadata.description || 'Explore my creativity through cinematic visuals, 3D animations and product advertisements.',
    aspectRatio: metadata.aspectRatio || '16:9',
    duration: metadata.duration || '0:30',
    videoUrl: finalVideoUrl,
    thumbnail: finalThumbUrl,
    thumbnailUrl: finalThumbUrl,
    localVideoBlobId,
    localThumbBlobId,
    updatedAt: new Date().toISOString(),
    isLocal: true
  };

  await saveLocalSetting('intro_video', record);
  if (onProgress) onProgress(100, 0, 0);
  return record;
}

export async function deleteIntroVideo() {
  if (supabase) {
    const existing = await getIntroVideo();
    if (existing?.videoUrl) {
      deleteStorageFileIfOwned(existing.videoUrl, 'video');
    }
    if (existing?.thumbnail) {
      deleteStorageFileIfOwned(existing.thumbnail, 'thumbnail');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', 'creator-intro-showreel');

    if (error) {
      throw new Error(`Delete intro video failed: ${error.message}`);
    }
    return true;
  }

  const local = await getLocalSetting('intro_video');
  if (local?.localVideoBlobId) await deleteMediaBlob(local.localVideoBlobId);
  if (local?.localThumbBlobId) await deleteMediaBlob(local.localThumbBlobId);
  await deleteLocalSetting('intro_video');
  return true;
}

/* -------------------------------------------------------------------------- */
/* ADMIN AUTHENTICATION HELPERS                                               */
/* -------------------------------------------------------------------------- */

export async function signInAdmin(email, password) {
  if (!supabase) {
    // If Supabase credentials are not set, allow demo local login for preview
    if (email === 'admin@mayank.studio' && password === 'mayank2026') {
      const demoUser = { email, role: 'admin', isDemo: true };
      sessionStorage.setItem('mayank_admin_auth', JSON.stringify(demoUser));
      return { user: demoUser, session: null, error: null };
    }
    return { 
      user: null, 
      session: null,
      error: { message: 'Supabase credentials not configured in .env. Click "Fill Demo Credentials" to preview the dashboard, or connect your Supabase project.' } 
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { user: data?.user, session: data?.session, error };
}

export async function signOutAdmin() {
  sessionStorage.removeItem('mayank_admin_auth');
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getAdminSession() {
  if (!supabase) {
    const demo = sessionStorage.getItem('mayank_admin_auth');
    return demo ? JSON.parse(demo) : null;
  }

  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}
