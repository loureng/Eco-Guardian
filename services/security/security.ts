
/**
 * Sentinel Security Service
 * Centralized input validation and sanitization.
 */

/**
 * Sanitizes user input to prevent XSS and other injection attacks.
 * Strips HTML tags and limits length.
 */
export const sanitizeInput = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') return '';

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Remove dangerous HTML tags while preserving safe content.
  // React handles escaping for display, so we just want to remove script injection vectors.
  // This is a basic filter; for production, use a library like DOMPurify.
  clean = clean.replace(/<(\/?)(script|iframe|object|embed|applet|form|input|button)([^>]*?)>/ig, '');

  // Also handle javascript: pseudo-protocol in attributes if any remained (unlikely with just tag stripping, but safe)
  clean = clean.replace(/javascript:/gi, '');

  // 3. Limit length to prevent DoS
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

/**
 * Validates if a URL is safe (http/https/data) and not a script execution vector.
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return false;

  // Allow relative paths (starting with / or alphanumeric chars for subfolders)
  if (url.startsWith('/') || /^[a-zA-Z0-9_\-\.]/.test(url)) {
      // Check for dangerous protocol patterns even in relative-looking paths
      if (/^\s*(javascript|vbscript|data):/i.test(url)) {
          // Exception: data:image is allowed
          if (!/^\s*data:image\//i.test(url)) return false;
      }
      return true;
  }

  // Allow http, https, and data (images)
  // Reject javascript: vbscript: etc
  const protocolPattern = /^(https?|data):/i;

  // Check for javascript: explicitly
  if (url.toLowerCase().trim().startsWith('javascript:')) return false;
  if (url.toLowerCase().trim().startsWith('vbscript:')) return false;

  return protocolPattern.test(url);
};

/**
 * Validates image sources specifically
 */
export const isSafeSrc = (src: string): boolean => {
    return isSafeUrl(src);
}
