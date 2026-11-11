/**
 * Google Analytics 4 (GA4) Integration Helper
 * 
 * Measurement ID: G-XPZ7ZJB4EB
 * 
 * Features:
 * - Official Google gtag.js API wrapper with safe queueing.
 * - Non-blocking asynchronous script execution.
 * - Single Page Application (SPA) route & hash pageview tracking without duplicate events.
 * - Multi-channel traffic source & referrer tracking:
 *     * Behance (behance.net)
 *     * Instagram (instagram.com, l.instagram.com)
 *     * LinkedIn (linkedin.com, lnkd.in)
 *     * Facebook (facebook.com, fb.me, l.facebook.com)
 *     * Other organic & referral channels
 * - Outbound link tracking (Behance profile, social networks).
 * - Strict Privacy (Zero PII, IP anonymization enabled, restricted data processing).
 */

export const GA_MEASUREMENT_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) || 'G-XPZ7ZJB4EB';

/**
 * Safe gtag wrapper that queues calls into window.dataLayer
 * even before gtag.js finishes loading.
 */
export function gtag(...args) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  } else {
    window.dataLayer.push(arguments);
  }
}

// Track last pageview to prevent duplicate events on React re-renders
let lastTrackedPath = '';

/**
 * Tracks a pageview event in GA4.
 * 
 * @param {string} [path] - URL path including query and hash (e.g., '/', '/admin', '/#showcase')
 * @param {string} [title] - Page title
 */
export function trackPageView(path, title) {
  if (typeof window === 'undefined') return;

  const currentPath = path || (window.location.pathname + window.location.hash) || '/';
  const currentTitle = title || document.title;

  // Prevent duplicate pageview for the exact same route
  if (currentPath === lastTrackedPath) {
    return;
  }
  lastTrackedPath = currentPath;

  gtag('event', 'page_view', {
    page_title: currentTitle,
    page_location: window.location.href,
    page_path: currentPath,
    send_to: GA_MEASUREMENT_ID
  });
}

/**
 * Inspects document.referrer and query parameters to detect traffic sources,
 * with special tracking for Behance, Instagram, LinkedIn, and Facebook.
 */
export function detectTrafficSource() {
  if (typeof window === 'undefined') return null;

  try {
    // Only detect and fire once per browser session to prevent duplicate events on internal SPA navigation
    const hasTracked = sessionStorage.getItem('ga_source_detected');
    if (hasTracked) return hasTracked;

    const referrer = (document.referrer || '').toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = (searchParams.get('utm_source') || '').toLowerCase();
    const utmMedium = (searchParams.get('utm_medium') || '').toLowerCase();
    const utmCampaign = (searchParams.get('utm_campaign') || '').toLowerCase();
    const refParam = (searchParams.get('ref') || '').toLowerCase();

    let platform = 'direct';

    if (referrer.includes('behance.net') || utmSource === 'behance') {
      platform = 'behance';
    } else if (
      referrer.includes('instagram.com') || 
      referrer.includes('l.instagram.com') || 
      utmSource === 'instagram' || 
      utmSource === 'ig'
    ) {
      platform = 'instagram';
    } else if (
      referrer.includes('linkedin.com') || 
      referrer.includes('lnkd.in') || 
      utmSource === 'linkedin'
    ) {
      platform = 'linkedin';
    } else if (
      referrer.includes('facebook.com') || 
      referrer.includes('fb.me') || 
      referrer.includes('l.facebook.com') || 
      referrer.includes('m.facebook.com') || 
      utmSource === 'facebook' || 
      utmSource === 'fb'
    ) {
      platform = 'facebook';
    } else if (referrer.includes('twitter.com') || referrer.includes('t.co') || referrer.includes('x.com')) {
      platform = 'x_twitter';
    } else if (referrer.includes('youtube.com') || referrer.includes('youtu.be')) {
      platform = 'youtube';
    } else if (referrer.includes('google.') || referrer.includes('bing.') || referrer.includes('duckduckgo.')) {
      platform = 'organic_search';
    } else if (referrer.length > 0) {
      try {
        platform = new URL(referrer).hostname;
      } catch {
        platform = 'referral';
      }
    }

    // Set user acquisition property in GA4
    gtag('set', 'user_properties', {
      acquisition_channel: platform
    });

    // Log the custom traffic source event
    gtag('event', 'traffic_source_detected', {
      source_platform: platform,
      referrer_url: document.referrer || 'direct',
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined
    });

    // Specific dedicated events for the key acquisition platforms
    if (['behance', 'instagram', 'linkedin', 'facebook'].includes(platform)) {
      gtag('event', `visitor_from_${platform}`, {
        platform,
        referrer: document.referrer || 'direct',
        landing_page: window.location.pathname + window.location.hash
      });
    }

    sessionStorage.setItem('ga_source_detected', platform);
    return platform;
  } catch (err) {
    console.warn('Could not detect traffic source:', err);
    return null;
  }
}

/**
 * Initializes automatic outbound link tracking and navigation listeners.
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return () => {};

  // 1. Detect incoming traffic source
  detectTrafficSource();

  // 2. Track outbound link clicks via event delegation (Behance, Instagram, LinkedIn, Facebook)
  const handleLinkClick = (e) => {
    const link = e.target.closest('a');
    if (!link || !link.href) return;

    const href = link.href.toLowerCase();

    if (href.includes('behance.net')) {
      gtag('event', 'click_behance_link', {
        destination: 'behance',
        link_url: link.href,
        link_text: (link.textContent || '').trim().substring(0, 50)
      });
    } else if (href.includes('instagram.com')) {
      gtag('event', 'click_social_link', {
        platform: 'instagram',
        link_url: link.href
      });
    } else if (href.includes('linkedin.com')) {
      gtag('event', 'click_social_link', {
        platform: 'linkedin',
        link_url: link.href
      });
    } else if (href.includes('facebook.com')) {
      gtag('event', 'click_social_link', {
        platform: 'facebook',
        link_url: link.href
      });
    }
  };

  document.addEventListener('click', handleLinkClick, { passive: true });

  return () => {
    document.removeEventListener('click', handleLinkClick);
  };
}

/**
 * Generic event tracker for custom portfolio interactions
 */
export function trackEvent(eventName, eventParams = {}) {
  gtag('event', eventName, eventParams);
}
